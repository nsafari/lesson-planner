import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Course } from './course.entity';
import { AssignmentSubmission } from './assignment-submission.entity';
import { AssignmentAttachment } from './assignment-attachment.entity';

/**
 * مدل «تکلیف روزانه» برای مدیریت تکالیف یک‌روزه دوره‌ها
 * شامل مشخصات، امتیاز حداکثری، تاریخ انجام و دستورالعمل‌ها.
 */
@Entity('assignments')
export class Assignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  /**
   * نوع تکلیف: homework | quiz | project | exam
   */
  @Column({ type: 'varchar', length: 50 })
  type: string;

  @Column({ type: 'int' })
  maxScore: number;

  /** تاریخ انجام تکلیف (یک روزه) */
  @Column({ type: 'date' })
  assignmentDate: Date;

  /**
   * وضعیت تکلیف: active | inactive | completed
   */
  @Column({ type: 'varchar', length: 50, default: 'active' })
  status: string;

  @Column({ type: 'text', nullable: true })
  instructions: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /** مرجع دوره مربوط به این تکلیف */
  @ManyToOne(() => Course, course => course.assignments)
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column()
  courseId: number;

  /** همه ارسال‌های ثبت‌شده برای این تکلیف */
  @OneToMany(() => AssignmentSubmission, submission => submission.assignment)
  submissions: AssignmentSubmission[];

  /** ضمیمه‌های مربوط به این تکلیف (چندگانه) */
  @OneToMany(() => AssignmentAttachment, attachment => attachment.assignment, { cascade: true })
  attachments: AssignmentAttachment[];
} 