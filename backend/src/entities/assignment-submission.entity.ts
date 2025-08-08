import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Student } from './student.entity';
import { Assignment } from './assignment.entity';

/**
 * مدل «ارسال تکلیف/کار روزانه» برای ثبت پیشرفت روزانه دانش‌آموز
 * شامل نمره روزانه، نمره تجمعی، وضعیت، بازخورد و فایل‌های ضمیمه.
 */
@Entity('assignment_submissions')
export class AssignmentSubmission {
  @PrimaryGeneratedColumn()
  id: number;

  /** تاریخ ثبت/ارسال مربوط به این روز */
  @Column({ type: 'date' })
  submissionDate: Date;

  /** نمره روزانه همین ارسال */
  @Column({ type: 'int', default: 0 })
  dailyScore: number;

  /** نمره تجمعی تا این روز برای تکلیف */
  @Column({ type: 'int', default: 0 })
  cumulativeScore: number;

  /** وضعیت: pending | submitted | graded | late */
  @Column({ type: 'varchar', length: 50, default: 'pending' })
  status: string;

  @Column({ type: 'text', nullable: true })
  feedback: string;

  /** آدرس فایل صوتی ضبط‌شده (در صورت وجود) */
  @Column({ type: 'varchar', length: 255, nullable: true })
  audioFileUrl: string;

  /** آدرس فایل مستندات (در صورت وجود) */
  @Column({ type: 'varchar', length: 255, nullable: true })
  documentUrl: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  /** آیا کار روزانه تکمیل شده است؟ */
  @Column({ type: 'boolean', default: false })
  isCompleted: boolean;

  /** زمان صرف‌شده (دقیقه) */
  @Column({ type: 'int', nullable: true })
  timeSpent: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /** مرجع دانش‌آموز */
  @ManyToOne(() => Student, student => student.submissions)
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column()
  studentId: number;

  /** مرجع تکلیف */
  @ManyToOne(() => Assignment, assignment => assignment.submissions)
  @JoinColumn({ name: 'assignmentId' })
  assignment: Assignment;

  @Column()
  assignmentId: number;
} 