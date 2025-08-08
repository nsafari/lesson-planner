import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Student } from './student.entity';
import { Course } from './course.entity';

/**
 * مدل «ثبت‌نام دانش‌آموز در درس» (جدول میانی دانش‌آموز-دوره)
 * وضعیت ثبت‌نام، تاریخ شروع، نمره نهایی و یادداشت‌ها را نگهداری می‌کند.
 */
@Entity('student_courses')
export class StudentCourse {
  @PrimaryGeneratedColumn()
  id: number;

  /** تاریخ ثبت‌نام در دوره */
  @Column({ type: 'date' })
  enrollmentDate: Date;

  /** وضعیت: enrolled | completed | dropped | failed */
  @Column({ type: 'varchar', length: 50, default: 'enrolled' })
  status: string;

  /** نمره نهایی عددی */
  @Column({ type: 'int', nullable: true })
  finalGrade: number;

  /** نمره حروفی (A/B/C/D/F) */
  @Column({ type: 'varchar', length: 2, nullable: true })
  letterGrade: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /** مرجع دانش‌آموز */
  @ManyToOne(() => Student, student => student.studentCourses)
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column()
  studentId: number;

  /** مرجع دوره */
  @ManyToOne(() => Course, course => course.studentCourses)
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column()
  courseId: number;
} 