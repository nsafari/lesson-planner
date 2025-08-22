import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { CourseService } from '../services/course.service';
import { AuthGuard } from '../auth.guard';
import { Course } from '../entities/course.entity';
import { Assignment } from '../entities/assignment.entity';
import { AssignmentAttachment } from '../entities/assignment-attachment.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

/**
 * کنترلر «مدیریت» برای مدیریت کامل دوره‌ها، تکالیف و ضمیمه‌ها توسط مدیر سیستم.
 */
@Controller('admin')
@UseGuards(AuthGuard)
export class AdminController {
  constructor(private readonly courseService: CourseService) {}

  // ==================== مدیریت دوره‌ها ====================

  /** دریافت همه دوره‌ها با جزئیات کامل */
  @Get('courses')
  async getAllCourses() {
    return await this.courseService.findAll();
  }

  /** دریافت دوره با شناسه و تمام جزئیات */
  @Get('courses/:id')
  async getCourseById(@Param('id') id: number) {
    return await this.courseService.findById(id);
  }

  /** ایجاد دوره جدید */
  @Post('courses')
  async createCourse(@Body() courseData: Partial<Course>) {
    return await this.courseService.create(courseData);
  }

  /** به‌روزرسانی دوره */
  @Put('courses/:id')
  async updateCourse(@Param('id') id: number, @Body() courseData: Partial<Course>) {
    return await this.courseService.update(id, courseData);
  }

  /** حذف دوره */
  @Delete('courses/:id')
  async deleteCourse(@Param('id') id: number) {
    return await this.courseService.delete(id);
  }

  // ==================== مدیریت تکالیف ====================

  /** دریافت همه تکالیف یک دوره */
  @Get('courses/:courseId/assignments')
  async getCourseAssignments(@Param('courseId') courseId: number) {
    return await this.courseService.getCourseAssignments(courseId);
  }

  /** دریافت تکلیف خاص با ضمیمه‌ها */
  @Get('assignments/:id')
  async getAssignmentById(@Param('id') id: number) {
    // این متد باید در CourseService اضافه شود
    return await this.courseService.getAssignmentById(id);
  }

  /** ایجاد تکلیف جدید برای دوره */
  @Post('courses/:courseId/assignments')
  async createAssignment(
    @Param('courseId') courseId: number,
    @Body() assignmentData: Partial<Assignment>,
  ) {
    return await this.courseService.createAssignment(courseId, assignmentData);
  }

  /** به‌روزرسانی تکلیف */
  @Put('assignments/:id')
  async updateAssignment(@Param('id') id: number, @Body() assignmentData: Partial<Assignment>) {
    return await this.courseService.updateAssignment(id, assignmentData);
  }

  /** حذف تکلیف */
  @Delete('assignments/:id')
  async deleteAssignment(@Param('id') id: number) {
    return await this.courseService.deleteAssignment(id);
  }

  /** ایجاد سری تکالیف روزانه برای دوره */
  @Post('courses/:courseId/assignments/daily-series')
  async createDailyAssignmentSeries(
    @Param('courseId') courseId: number,
    @Body() data: {
      startDate: string;
      days: number;
      titlePrefix?: string;
      descriptionPrefix?: string;
      type?: string;
      maxScore?: number;
      instructions?: string;
    },
  ) {
    return await this.courseService.createDailyAssignmentSeries(
      courseId,
      new Date(data.startDate),
      data.days,
      {
        titlePrefix: data.titlePrefix,
        descriptionPrefix: data.descriptionPrefix,
        type: data.type,
        maxScore: data.maxScore,
        instructions: data.instructions,
      },
    );
  }

  // ==================== مدیریت ضمیمه‌ها ====================

  /** دریافت همه ضمیمه‌های یک تکلیف */
  @Get('assignments/:assignmentId/attachments')
  async getAssignmentAttachments(@Param('assignmentId') assignmentId: number) {
    return await this.courseService.getAssignmentAttachments(assignmentId);
  }

  /** ایجاد ضمیمه جدید برای تکلیف (با فایل) */
  @Post('assignments/:assignmentId/attachments')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './public/uploads/attachments',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        return cb(null, `${randomName}${extname(file.originalname)}`);
      }
    }),
    fileFilter: (req, file, cb) => {
      // بررسی نوع فایل مجاز
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
  async createAttachment(
    @Param('assignmentId') assignmentId: number,
    @Body() attachmentData: Partial<AssignmentAttachment>,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // اگر فایل آپلود شده، URL آن را تنظیم کن
    if (file) {
      attachmentData.url = `/uploads/attachments/${file.filename}`;
      attachmentData.kind = this.determineFileKind(file.mimetype);
    }
    
    return await this.courseService.createAttachment(assignmentId, attachmentData);
  }

  /** آپلود فایل برای ضمیمه موجود */
  @Post('attachments/:id/upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './public/uploads/attachments',
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
  async uploadAttachmentFile(
    @Param('id') attachmentId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('فایل آپلود نشده است');
    }

    const fileUrl = `/uploads/attachments/${file.filename}`;
    const fileKind = this.determineFileKind(file.mimetype);
    
    return await this.courseService.updateAttachment(attachmentId, {
      url: fileUrl,
      kind: fileKind,
    });
  }

  /** به‌روزرسانی ضمیمه */
  @Put('attachments/:id')
  async updateAttachment(@Param('id') id: number, @Body() attachmentData: Partial<AssignmentAttachment>) {
    return await this.courseService.updateAttachment(id, attachmentData);
  }

  /** حذف ضمیمه */
  @Delete('attachments/:id')
  async deleteAttachment(@Param('id') id: number) {
    return await this.courseService.deleteAttachment(id);
  }

  // ==================== گزارش‌گیری ====================

  /** دریافت آمار کلی سیستم */
  @Get('statistics')
  async getSystemStatistics() {
    return await this.courseService.getSystemStatistics();
  }

  /** دریافت گزارش دوره خاص */
  @Get('courses/:courseId/statistics')
  async getCourseStatistics(@Param('courseId') courseId: number) {
    return await this.courseService.getCourseStatistics(courseId);
  }

  /** جستجوی دوره‌ها */
  @Get('courses/search')
  async searchCourses(@Query('q') query: string) {
    return await this.courseService.searchCourses(query);
  }

  /** فیلتر دوره‌ها بر اساس وضعیت */
  @Get('courses/filter')
  async filterCourses(@Query('status') status: string) {
    return await this.courseService.filterCoursesByStatus(status);
  }

  // ==================== مدیریت کاربران ====================

  /** دریافت کاربران در انتظار تایید */
  @Get('users/pending')
  async getPendingUsers() {
    return await this.courseService.getPendingUsers();
  }

  /** تایید کاربر و ایجاد دانش‌آموز */
  @Post('users/:userId/approve')
  async approveUser(
    @Param('userId') userId: number,
    @Body() data: {
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber: string;
      studentId: string;
      courseIds: number[];
    }
  ) {
    return await this.courseService.approveUserAndCreateStudent(userId, data);
  }

  /** رد کردن کاربر */
  @Post('users/:userId/reject')
  async rejectUser(@Param('userId') userId: number) {
    return await this.courseService.rejectUser(userId);
  }

  // ==================== متدهای کمکی ====================

  /**
   * تعیین نوع فایل بر اساس MIME type
   */
  private determineFileKind(mimeType: string): string {
    if (mimeType.startsWith('audio/')) {
      return 'audio';
    } else if (mimeType.startsWith('image/')) {
      return 'image';
    } else if (mimeType === 'application/pdf' || 
               mimeType === 'application/msword' || 
               mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return 'document';
    } else if (mimeType === 'text/plain') {
      return 'text';
    } else {
      return 'other';
    }
  }
} 