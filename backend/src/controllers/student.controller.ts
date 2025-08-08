import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { StudentService } from '../services/student.service';
import { AssignmentSubmissionService } from '../services/assignment-submission.service';
import { AuthGuard } from '../auth.guard';
import { Student } from '../entities/student.entity';

/**
 * کنترلر «دانش‌آموز» برای مدیریت APIهای مربوط به دانش‌آموزان و پیشرفت آن‌ها.
 */
@Controller('students')
@UseGuards(AuthGuard)
export class StudentController {
  constructor(
    private readonly studentService: StudentService,
    private readonly submissionService: AssignmentSubmissionService,
  ) {}

  /** ایجاد دانش‌آموز جدید */
  @Post()
  async create(@Body() studentData: Partial<Student>) {
    return await this.studentService.create(studentData);
  }

  /** دریافت فهرست دانش‌آموزان */
  @Get()
  async findAll() {
    return await this.studentService.findAll();
  }

  /** دریافت اطلاعات دانش‌آموز */
  @Get(':id')
  async findById(@Param('id') id: number) {
    return await this.studentService.findById(id);
  }

  /** دریافت داده‌های پیشرفت برای داشبورد */
  @Get(':id/progress')
  async getStudentProgress(@Param('id') id: number) {
    return await this.studentService.getStudentProgress(id);
  }

  /** دریافت پیشرفت دانش‌آموز در یک تکلیف مشخص */
  @Get(':id/assignments/:assignmentId/progress')
  async getAssignmentProgress(
    @Param('id') studentId: number,
    @Param('assignmentId') assignmentId: number,
  ) {
    return await this.submissionService.getStudentProgress(studentId, assignmentId);
  }

  /** دریافت همه ارسال‌های دانش‌آموز (اختیاری: فیلتر بر اساس تکلیف) */
  @Get(':id/submissions')
  async getStudentSubmissions(
    @Param('id') studentId: number,
    @Query('assignmentId') assignmentId?: number,
  ) {
    return await this.submissionService.getStudentSubmissions(studentId, assignmentId);
  }

  /** ثبت کار روزانه برای یک تکلیف */
  @Post(':id/assignments/:assignmentId/submit')
  async submitDailyWork(
    @Param('id') studentId: number,
    @Param('assignmentId') assignmentId: number,
    @Body() submissionData: any,
  ) {
    return await this.submissionService.submitDailyWork(studentId, assignmentId, submissionData);
  }

  /** به‌روزرسانی اطلاعات دانش‌آموز */
  @Put(':id')
  async update(@Param('id') id: number, @Body() studentData: Partial<Student>) {
    return await this.studentService.update(id, studentData);
  }

  /** حذف دانش‌آموز */
  @Delete(':id')
  async delete(@Param('id') id: number) {
    return await this.studentService.delete(id);
  }
} 