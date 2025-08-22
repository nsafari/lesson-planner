import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { StudentService } from '../services/student.service';
import { AssignmentSubmissionService } from '../services/assignment-submission.service';
import { AuthGuard } from '../auth.guard';
import { Student } from '../entities/student.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

/**
 * کنترلر «دانش‌آموز» برای مدیریت APIهای مربوط به دانش‌آموزان و پیشرفت آن‌ها.
 */
@Controller('students')
@UseGuards(AuthGuard)
export class StudentController {
  constructor(
    private readonly studentService: StudentService,
    private readonly submissionService: AssignmentSubmissionService,
  ) { }

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

  @Post('findByEmail_Phone')
  async getStudentByEmail_Phone(
    @Body('email') email: string,
    @Body('phoneNumber') phoneNumber: string,
  ): Promise<Student | null> {
    const Mail = await this.studentService.findByEmail(email);
    if (!Mail) return null;  // اگر ایمیل پیدا نشد
    return Mail.phoneNumber === phoneNumber ? Mail : null;
  }

  /** دریافت اطلاعات دانش‌آموز */
  @Get(':id')
  async findById(@Param('id') id: number) {
    return await this.studentService.findById(id);
  }

  /** دریافت اطلاعات دانش‌آموز جاری (بر اساس توکن) */
  @Get('me/profile')
  async getCurrentStudentProfile(@Body('username') username: string) {
    // این متد نیاز به استخراج username از توکن دارد
    // فعلاً از body دریافت می‌کنیم، در آینده از JWT استخراج می‌شود
    return await this.studentService.findByUsername(username);
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

  /** ثبت کار روزانه برای یک تکلیف (با آپلود فایل) */
  @Post(':id/assignments/:assignmentId/submit')
  @UseInterceptors(FileInterceptor('audioFile', {
    storage: diskStorage({
      destination: './public/uploads/submissions',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        return cb(null, `${randomName}${extname(file.originalname)}`);
      }
    }),
    fileFilter: (req, file, cb) => {
      // بررسی نوع فایل مجاز برای ارسال دانش‌آموز
      const allowedMimeTypes = [
        'audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/ogg', // فایل‌های صوتی
        'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // مستندات
        'image/jpeg', 'image/png', 'image/gif', // تصاویر
        'text/plain' // فایل‌های متنی
      ];
      
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new BadRequestException('نوع فایل مجاز نیست'), false);
      }
    },
    limits: {
      fileSize: 10 * 1024 * 1024, // حداکثر 10 مگابایت
    }
  }))
  async submitDailyWork(
    @Param('id') studentId: number,
    @Param('assignmentId') assignmentId: number,
    @Body() submissionData: any,
    @UploadedFile() audioFile: Express.Multer.File,
  ) {
    // اگر فایل آپلود شده، URL آن را تنظیم کن
    if (audioFile) {
      submissionData.audioFileUrl = `/uploads/submissions/${audioFile.filename}`;
    }
    
    return await this.submissionService.submitDailyWork(studentId, assignmentId, submissionData);
  }

  /** آپلود فایل برای ارسال موجود */
  @Post(':id/submissions/:submissionId/upload')
  @UseInterceptors(FileInterceptor('audioFile', {
    storage: diskStorage({
      destination: './public/uploads/submissions',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        return cb(null, `${randomName}${extname(file.originalname)}`);
      }
    }),
    fileFilter: (req, file, cb) => {
      const allowedMimeTypes = [
        'audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/ogg',
        'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg', 'image/png', 'image/gif',
        'text/plain'
      ];
      
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new BadRequestException('نوع فایل مجاز نیست'), false);
      }
    },
    limits: {
      fileSize: 10 * 1024 * 1024, // حداکثر 10 مگابایت
    }
  }))
  async uploadSubmissionFile(
    @Param('id') studentId: number,
    @Param('submissionId') submissionId: number,
    @UploadedFile() audioFile: Express.Multer.File,
  ) {
    if (!audioFile) {
      throw new BadRequestException('فایل آپلود نشده است');
    }

    const fileUrl = `/uploads/submissions/${audioFile.filename}`;
    
    return await this.submissionService.updateSubmissionFile(submissionId, fileUrl);
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