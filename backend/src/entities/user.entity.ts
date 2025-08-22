import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Student } from './student.entity';

/**
 * مدل «کاربر» برای احراز هویت در سیستم
 * شامل نام‌کاربری، هش رمزعبور و آدرس تصویر پروفایل.
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  /** نام‌کاربری (یکتا) */
  @Column({ type: 'varchar', length: 100, unique: true })
  username: string;

  /** هش رمزعبور */
  @Column({ type: 'varchar', length: 255, nullable: true })
  passwordHash: string | null;

  /** آدرس تصویر پروفایل (اختیاری) */
  @Column({ type: 'varchar', length: 255, nullable: true })
  imageUrl: string | null;

  /** شناسه دانش‌آموز مرتبط (اختیاری) */
  @Column({ type: 'int', nullable: true })
  studentId: number | null;

  /**
   * وضعیت تایید کاربر: pending | approved | rejected
   */
  @Column({ type: 'varchar', length: 50, default: 'pending' })
  approvalStatus: string;

  /**
   * نوع کاربر: student | admin
   */
  @Column({ type: 'varchar', length: 50, default: 'student' })
  userType: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * رابطه با دانش‌آموز (هر کاربر می‌تواند یک دانش‌آموز باشد)
   */
  @ManyToOne(() => Student, { nullable: true })
  @JoinColumn({ name: 'studentId' })
  student: Student;
} 