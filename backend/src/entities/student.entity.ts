import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { StudentCourse } from './student-course.entity';
import { AssignmentSubmission } from './assignment-submission.entity';

/**
 * مدل «دانش‌آموز» برای نگهداری اطلاعات هویتی و ارتباط با دوره‌ها و ارسال‌ها
 * شامل اطلاعات پایه، وضعیت تحصیلی و ارتباطات با ثبت‌نام در درس‌ها و ارسال تکالیف.
 */
@Entity('students')
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  studentId: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phoneNumber: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  /**
   * وضعیت دانش‌آموز: active | inactive | graduated
   */
  @Column({ type: 'varchar', length: 50, default: 'active' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * روابط ثبت‌نام دانش‌آموز در دوره‌ها (پل ارتباطی دانش‌آموز-دوره)
   */
  @OneToMany(() => StudentCourse, studentCourse => studentCourse.student)
  studentCourses: StudentCourse[];

  /**
   * همه ارسال‌های روزانه/تکلیف‌های این دانش‌آموز
   */
  @OneToMany(() => AssignmentSubmission, submission => submission.student)
  submissions: AssignmentSubmission[];
} 