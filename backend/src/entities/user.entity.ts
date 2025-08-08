import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 