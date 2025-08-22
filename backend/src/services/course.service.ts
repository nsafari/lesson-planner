import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../entities/course.entity';
import { Assignment } from '../entities/assignment.entity';
import { AssignmentAttachment } from '../entities/assignment-attachment.entity';
import { StudentCourse } from '../entities/student-course.entity';
import { UserService } from '../user.service';
import { StudentService } from './student.service';

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
    @InjectRepository(StudentCourse)
    private studentCourseRepository: Repository<StudentCourse>,
    private userService: UserService,
    private studentService: StudentService,
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

  // ==================== متدهای اضافی برای کنترلر مدیریت ====================

  /** دریافت تکلیف با شناسه و ضمیمه‌ها */
  async getAssignmentById(id: number): Promise<Assignment> {
    return await this.assignmentRepository.findOne({
      where: { id },
      relations: ['attachments', 'submissions'],
    });
  }

  /** به‌روزرسانی تکلیف */
  async updateAssignment(id: number, assignmentData: Partial<Assignment>): Promise<Assignment> {
    await this.assignmentRepository.update(id, assignmentData);
    return await this.getAssignmentById(id);
  }

  /** حذف تکلیف */
  async deleteAssignment(id: number): Promise<void> {
    await this.assignmentRepository.delete(id);
  }

  /** دریافت ضمیمه‌های یک تکلیف */
  async getAssignmentAttachments(assignmentId: number): Promise<AssignmentAttachment[]> {
    return await this.attachmentRepository.find({
      where: { assignmentId },
      order: { displayOrder: 'ASC' },
    });
  }

  /** ایجاد ضمیمه جدید برای تکلیف */
  async createAttachment(assignmentId: number, attachmentData: Partial<AssignmentAttachment>): Promise<AssignmentAttachment> {
    const attachment = this.attachmentRepository.create({
      ...attachmentData,
      assignmentId,
    });
    return await this.attachmentRepository.save(attachment);
  }

  /** به‌روزرسانی ضمیمه */
  async updateAttachment(id: number, attachmentData: Partial<AssignmentAttachment>): Promise<AssignmentAttachment> {
    await this.attachmentRepository.update(id, attachmentData);
    return await this.attachmentRepository.findOne({ where: { id } });
  }

  /** حذف ضمیمه */
  async deleteAttachment(id: number): Promise<void> {
    await this.attachmentRepository.delete(id);
  }

  /** دریافت آمار کلی سیستم */
  async getSystemStatistics() {
    const [totalCourses, totalAssignments, totalAttachments] = await Promise.all([
      this.courseRepository.count(),
      this.assignmentRepository.count(),
      this.attachmentRepository.count(),
    ]);

    return {
      totalCourses,
      totalAssignments,
      totalAttachments,
      activeCourses: await this.courseRepository.count({ where: { status: 'active' } }),
    };
  }

  /** دریافت آمار دوره خاص */
  async getCourseStatistics(courseId: number) {
    const course = await this.findById(courseId);
    const assignments = await this.getCourseAssignments(courseId);
    
    return {
      course,
      totalAssignments: assignments.length,
      totalAttachments: assignments.reduce((sum, assignment) => sum + assignment.attachments?.length || 0, 0),
      assignmentsWithAttachments: assignments.filter(a => a.attachments?.length > 0).length,
    };
  }

  /** جستجوی دوره‌ها */
  async searchCourses(query: string): Promise<Course[]> {
    return await this.courseRepository
      .createQueryBuilder('course')
      .where('course.title LIKE :query OR course.description LIKE :query OR course.courseCode LIKE :query', {
        query: `%${query}%`,
      })
      .getMany();
  }

  /** فیلتر دوره‌ها بر اساس وضعیت */
  async filterCoursesByStatus(status: string): Promise<Course[]> {
    return await this.courseRepository.find({
      where: { status },
      relations: ['assignments'],
    });
  }

  // ==================== مدیریت کاربران ====================

  /** دریافت کاربران در انتظار تایید */
  async getPendingUsers() {
    return await this.userService.getPendingUsers();
  }

  /** تایید کاربر و ایجاد دانش‌آموز */
  async approveUserAndCreateStudent(
    userId: number, 
    data: {
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber: string;
      studentId: string;
      courseIds: number[];
    }
  ) {
    // ایجاد دانش‌آموز
    const student = await this.studentService.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      studentId: data.studentId,
      status: 'active',
    });

    // تایید کاربر و مرتبط کردن با دانش‌آموز
    await this.userService.approveUser(userId, {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      studentId: data.studentId,
    });

    // ثبت‌نام در دوره‌های انتخاب شده
    for (const courseId of data.courseIds) {
      await this.enrollStudentInCourse(student.id, courseId);
    }

    return {
      message: 'کاربر با موفقیت تایید شد و دانش‌آموز ایجاد شد',
      student,
      enrolledCourses: data.courseIds.length
    };
  }

  /** رد کردن کاربر */
  async rejectUser(userId: number) {
    await this.userService.rejectUser(userId);
    return { message: 'کاربر رد شد' };
  }

  /** ثبت‌نام دانش‌آموز در دوره */
  private async enrollStudentInCourse(studentId: number, courseId: number) {
    const enrollment = this.studentCourseRepository.create({
      studentId,
      courseId,
      enrollmentDate: new Date(),
      status: 'active',
    });
    await this.studentCourseRepository.save(enrollment);
  }
} 