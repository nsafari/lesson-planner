import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../entities/course.entity';
import { Assignment } from '../entities/assignment.entity';
import { AssignmentAttachment } from '../entities/assignment-attachment.entity';

/**
 * سرویس «درس» برای مدیریت عملیات مربوط به دوره‌ها و تکالیف آن‌ها.
 */
@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Assignment)
    private assignmentRepository: Repository<Assignment>,
    @InjectRepository(AssignmentAttachment)
    private attachmentRepository: Repository<AssignmentAttachment>,
  ) {}

  /** ایجاد دوره جدید */
  async create(courseData: Partial<Course>): Promise<Course> {
    const course = this.courseRepository.create(courseData);
    return await this.courseRepository.save(course);
  }

  /** دریافت همه دوره‌ها به‌همراه تکالیف و دانش‌آموزان ثبت‌نام‌شده */
  async findAll(): Promise<Course[]> {
    return await this.courseRepository.find({
      relations: ['assignments', 'assignments.attachments', 'studentCourses', 'studentCourses.student'],
    });
  }

  /** دریافت دوره با شناسه */
  async findById(id: number): Promise<Course> {
    return await this.courseRepository.findOne({
      where: { id },
      relations: ['assignments', 'assignments.attachments', 'studentCourses', 'studentCourses.student'],
    });
  }

  /** به‌روزرسانی دوره */
  async update(id: number, courseData: Partial<Course>): Promise<Course> {
    await this.courseRepository.update(id, courseData);
    return await this.findById(id);
  }

  /** حذف دوره */
  async delete(id: number): Promise<void> {
    await this.courseRepository.delete(id);
  }

  /** دریافت تکالیف یک دوره */
  async getCourseAssignments(courseId: number): Promise<Assignment[]> {
    return await this.assignmentRepository.find({
      where: { courseId },
      relations: ['submissions', 'attachments'],
      order: { assignmentDate: 'ASC' },
    });
  }

  /** ایجاد تکلیف جدید برای یک دوره (تکلیف روزانه) */
  async createAssignment(courseId: number, assignmentData: Partial<Assignment>): Promise<Assignment> {
    const assignment = this.assignmentRepository.create({
      ...assignmentData,
      courseId,
    });
    return await this.assignmentRepository.save(assignment);
  }

  /**
   * ایجاد چند تکلیف روزانه پیاپی برای یک دوره (مثلاً 12 روز)
   * از تاریخ شروع داده‌شده، به‌صورت خودکار عنوان و توضیحات نمونه تولید می‌شود.
   */
  async createDailyAssignmentSeries(
    courseId: number,
    startDate: Date,
    days: number = 12,
    base: { titlePrefix?: string; descriptionPrefix?: string; type?: string; maxScore?: number; instructions?: string }
  ): Promise<Assignment[]> {
    const created: Assignment[] = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const assignment = this.assignmentRepository.create({
        courseId,
        title: `${base.titlePrefix ?? 'تکلیف روز'} ${i + 1}`,
        description: `${base.descriptionPrefix ?? 'شرح تکلیف روز'} ${i + 1}`,
        type: base.type ?? 'homework',
        maxScore: base.maxScore ?? 100,
        assignmentDate: date,
        status: 'active',
        instructions: base.instructions ?? 'طبق دستورالعمل، تکلیف روز را انجام دهید',
      });
      const saved = await this.assignmentRepository.save(assignment);
      created.push(saved);
    }
    return created;
  }

  /** دریافت دوره‌های فعال */
  async getActiveCourses(): Promise<Course[]> {
    return await this.courseRepository.find({
      where: { status: 'active' },
      relations: ['assignments'],
    });
  }
} 