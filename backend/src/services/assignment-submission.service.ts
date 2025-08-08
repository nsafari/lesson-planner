import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssignmentSubmission } from '../entities/assignment-submission.entity';
import { Assignment } from '../entities/assignment.entity';
import { Student } from '../entities/student.entity';

/**
 * سرویس «ارسال تکلیف/کار روزانه» برای مدیریت ارسال‌های روزانه دانش‌آموزان
 * شامل ثبت/به‌روزرسانی ارسال روزانه و محاسبه پیشرفت.
 */
@Injectable()
export class AssignmentSubmissionService {
  constructor(
    @InjectRepository(AssignmentSubmission)
    private submissionRepository: Repository<AssignmentSubmission>,
    @InjectRepository(Assignment)
    private assignmentRepository: Repository<Assignment>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
  ) {}

  /** ایجاد رکورد ارسال */
  async create(submissionData: Partial<AssignmentSubmission>): Promise<AssignmentSubmission> {
    const submission = this.submissionRepository.create(submissionData);
    return await this.submissionRepository.save(submission);
  }

  /**
   * ثبت کار روزانه دانش‌آموز برای یک تکلیف مشخص.
   * اگر برای همان روز رکوردی وجود داشته باشد، به‌روزرسانی می‌شود.
   */
  async submitDailyWork(
    studentId: number,
    assignmentId: number,
    submissionData: Partial<AssignmentSubmission>
  ): Promise<AssignmentSubmission> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // بررسی وجود ارسال قبلی در همان روز
    const existingSubmission = await this.submissionRepository.findOne({
      where: {
        studentId,
        assignmentId,
        submissionDate: today,
      },
    });

    if (existingSubmission) {
      await this.submissionRepository.update(existingSubmission.id, submissionData);
      return await this.findById(existingSubmission.id);
    } else {
      const submission = this.submissionRepository.create({
        ...submissionData,
        studentId,
        assignmentId,
        submissionDate: today,
      });
      return await this.submissionRepository.save(submission);
    }
  }

  /** دریافت ارسال با شناسه */
  async findById(id: number): Promise<AssignmentSubmission> {
    return await this.submissionRepository.findOne({
      where: { id },
      relations: ['student', 'assignment', 'assignment.attachments'],
    });
  }

  /** دریافت همه ارسال‌های یک دانش‌آموز (اختیاری: فیلتر بر اساس تکلیف) */
  async getStudentSubmissions(studentId: number, assignmentId?: number): Promise<AssignmentSubmission[]> {
    const whereClause: any = { studentId };
    if (assignmentId) {
      whereClause.assignmentId = assignmentId;
    }

    return await this.submissionRepository.find({
      where: whereClause,
      relations: ['assignment', 'assignment.attachments'],
      order: { submissionDate: 'DESC' },
    });
  }

  /** دریافت همه ارسال‌های یک تکلیف */
  async getAssignmentSubmissions(assignmentId: number): Promise<AssignmentSubmission[]> {
    return await this.submissionRepository.find({
      where: { assignmentId },
      relations: ['student'],
      order: { submissionDate: 'DESC' },
    });
  }

  /** به‌روزرسانی ارسال */
  async update(id: number, submissionData: Partial<AssignmentSubmission>): Promise<AssignmentSubmission> {
    await this.submissionRepository.update(id, submissionData);
    return await this.findById(id);
  }

  /** حذف ارسال */
  async delete(id: number): Promise<void> {
    await this.submissionRepository.delete(id);
  }

  /**
   * محاسبه پیشرفت دانش‌آموز در یک تکلیف: امتیاز کل، روزهای تکمیل‌شده، درصد پیشرفت و میانگین نمره روزانه.
   */
  async getStudentProgress(studentId: number, assignmentId: number): Promise<any> {
    const submissions = await this.submissionRepository.find({
      where: { studentId, assignmentId },
      relations: ['assignment', 'assignment.attachments'],
      order: { submissionDate: 'ASC' },
    });

    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId },
      relations: ['attachments'],
    });

    if (!assignment) {
      throw new Error('Assignment not found');
    }

    const totalScore = submissions.reduce((sum, sub) => sum + sub.cumulativeScore, 0);
    const completedDays = submissions.filter(sub => sub.isCompleted).length;
    const totalDays = 1; // تکلیف روزانه است

    return {
      assignment,
      submissions,
      totalScore,
      completedDays,
      totalDays,
      progressPercentage: (completedDays / totalDays) * 100,
      averageDailyScore: submissions.length > 0 ? totalScore / submissions.length : 0,
    };
  }

  /** دریافت ارسال روزانه در تاریخ مشخص */
  async getDailySubmission(studentId: number, assignmentId: number, date: Date): Promise<AssignmentSubmission | null> {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    return await this.submissionRepository.findOne({
      where: {
        studentId,
        assignmentId,
        submissionDate: targetDate,
      },
      relations: ['assignment', 'assignment.attachments'],
    });
  }
} 