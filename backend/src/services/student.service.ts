import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../entities/student.entity';
import { UserService } from '../user.service';

/**
 * سرویس «دانش‌آموز» برای مدیریت عملیات پایگاه‌داده و منطق تجاری مرتبط با دانش‌آموزان.
 */
@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    private userService: UserService,
  ) {}

  /** ایجاد دانش‌آموز جدید */
  async create(studentData: Partial<Student>): Promise<Student> {
    const student = this.studentRepository.create(studentData);
    return await this.studentRepository.save(student);
  }

  /** دریافت فهرست همه دانش‌آموزان (به‌همراه دوره‌های ثبت‌نام‌شده) */
  async findAll(): Promise<Student[]> {
    return await this.studentRepository.find({
      relations: ['studentCourses', 'studentCourses.course'],
    });
  }

  /** دریافت دانش‌آموز با شناسه */
  async findById(id: number): Promise<Student> {
    return await this.studentRepository.findOne({
      where: { id },
      relations: ['studentCourses', 'studentCourses.course', 'submissions'],
    });
  }

  /** دریافت دانش‌آموز با ایمیل */
  async findByEmail(email: string): Promise<Student> {
    return await this.studentRepository.findOne({
      where: { email },
      relations: ['studentCourses', 'studentCourses.course'],
    });
  }

  /** دریافت دانش‌آموز با نام‌کاربری */
  async findByUsername(username: string): Promise<Student> {
    const user = await this.userService.findUserWithStudent(username);
    if (!user || !user.student) {
      throw new Error('Student not found for this user');
    }
    return await this.findById(user.student.id);
  }

  /** به‌روزرسانی اطلاعات دانش‌آموز */
  async update(id: number, studentData: Partial<Student>): Promise<Student> {
    await this.studentRepository.update(id, studentData);
    return await this.findById(id);
  }

  /** حذف دانش‌آموز */
  async delete(id: number): Promise<void> {
    await this.studentRepository.delete(id);
  }

  /**
   * محاسبه و برگرداندن داده‌های پیشرفت دانش‌آموز برای داشبورد
   * شامل دوره‌های ثبت‌نام‌شده و ارسال‌های انجام‌شده
   */
  async getStudentProgress(studentId: number): Promise<any> {
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
      relations: [
        'studentCourses',
        'studentCourses.course',
        'submissions',
        'submissions.assignment',
      ],
    });

    if (!student) {
      throw new Error('Student not found');
    }

    return {
      student,
      courses: student.studentCourses,
      submissions: student.submissions,
    };
  }
} 