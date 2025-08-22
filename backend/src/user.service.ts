import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { StudentService } from './services/student.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private studentService: StudentService,
  ) {}

  async createUser(username: string, password: string, imageUrl: string | null = null, studentId: number | null = null): Promise<void> {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      username,
      passwordHash,
      imageUrl,
      studentId,
      approvalStatus: 'approved', // کاربران موجود تایید شده هستند
      userType: 'student',
    });
    await this.userRepository.save(user);
  }

  async createPendingUser(
    username: string, 
    password: string, 
    imageUrl: string | null = null, 
    studentData: { firstName: string; lastName: string; email: string; phoneNumber: string }
  ): Promise<void> {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      username,
      passwordHash,
      imageUrl,
      approvalStatus: 'pending',
      userType: 'student',
    });
    await this.userRepository.save(user);
  }

  async getPendingUsers(): Promise<User[]> {
    return this.userRepository.find({
      where: { approvalStatus: 'pending' },
      relations: ['student']
    });
  }

  async approveUser(userId: number, studentData: { firstName: string; lastName: string; email: string; phoneNumber: string; studentId: string }): Promise<void> {
    // ابتدا دانش‌آموز را ایجاد کن
    const student = await this.studentService.create({
      ...studentData,
      status: 'active',
    });
    
    // سپس کاربر را تایید کن و به دانش‌آموز مرتبط کن
    await this.userRepository.update(userId, {
      approvalStatus: 'approved',
      studentId: student.id
    });
  }

  async rejectUser(userId: number): Promise<void> {
    await this.userRepository.update(userId, { approvalStatus: 'rejected' });
  }

  async linkUserToStudent(username: string, studentId: number): Promise<void> {
    await this.userRepository.update({ username }, { studentId });
  }

  async findUser(username: string): Promise<User | undefined> {
    return this.userRepository.findOne({ 
      where: { username },
      relations: ['student']
    });
  }

  async findUserByStudentId(studentId: number): Promise<User | undefined> {
    return this.userRepository.findOne({ 
      where: { studentId },
      relations: ['student']
    });
  }

  async findUserWithStudent(username: string): Promise<User | undefined> {
    return this.userRepository.findOne({ 
      where: { username },
      relations: ['student']
    });
  }

  async validateUser(username: string, password: string): Promise<boolean> {
    const user = await this.findUser(username);
    if (!user) {
      return false;
    }
    if (!user.passwordHash) {
      console.error('validateUser: passwordHash is null or undefined for user:', username);
      return false;
    }
    return bcrypt.compare(password, user.passwordHash);
  }

    async updateUserProfile(username: string, imageUrl: string): Promise<void> {
        await this.userRepository.update({ username }, { imageUrl });
    }
}
