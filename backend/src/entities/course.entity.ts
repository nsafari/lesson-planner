import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { StudentCourse } from './student-course.entity';
import { Assignment } from './assignment.entity';

/**
 * مدل «درس» برای مدیریت اطلاعات دوره، زمان‌بندی و مدرس
 * و همچنین نگهداری ارتباط با تکالیف و ثبت‌نام دانش‌آموزان.
 */
@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 20 })
  courseCode: string;

  @Column({ type: 'int' })
  credits: number;

  @Column({ type: 'varchar', length: 50 })
  instructor: string;

  /**
   * وضعیت دوره: active | inactive | completed
   */
  @Column({ type: 'varchar', length: 50, default: 'active' })
  status: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'int', default: 0 })
  maxStudents: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * دانش‌آموزان ثبت‌نام‌شده در این دوره (از طریق جدول میانی)
   */
  @OneToMany(() => StudentCourse, studentCourse => studentCourse.course)
  studentCourses: StudentCourse[];

  /**
   * تکالیف تعریف‌شده برای این دوره
   */
  @OneToMany(() => Assignment, assignment => assignment.course)
  assignments: Assignment[];
} 