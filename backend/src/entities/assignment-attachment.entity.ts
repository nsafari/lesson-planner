import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Assignment } from './assignment.entity';

/**
 * مدل «فایل/ضمیمه تکلیف» برای نگهداری فایل‌ها یا لینک‌های مرتبط با هر تکلیف.
 */
@Entity('assignment_attachments')
export class AssignmentAttachment {
  @PrimaryGeneratedColumn()
  id: number;

  /** عنوان/نام ضمیمه (اختیاری) */
  @Column({ type: 'varchar', length: 200, nullable: true })
  title: string | null;

  /** توضیح کوتاه (اختیاری) */
  @Column({ type: 'text', nullable: true })
  description: string | null;

  /** نوع ضمیمه: audio | document | link | other */
  @Column({ type: 'varchar', length: 20, default: 'other' })
  kind: string;

  /** مسیر/آدرس فایل یا لینک */
  @Column({ type: 'varchar', length: 255 })
  url: string;

  /** ترتیب نمایش */
  @Column({ type: 'int', default: 0 })
  displayOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /** مرجع تکلیف */
  @ManyToOne(() => Assignment, assignment => assignment.attachments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'assignmentId' })
  assignment: Assignment;

  @Column()
  assignmentId: number;
} 