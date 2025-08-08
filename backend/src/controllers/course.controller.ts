import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CourseService } from '../services/course.service';
import { AuthGuard } from '../auth.guard';
import { Course } from '../entities/course.entity';
import { Assignment } from '../entities/assignment.entity';

/**
 * کنترلر «درس» برای مدیریت APIهای مربوط به دوره‌ها و تکالیف آن‌ها.
 */
@Controller('courses')
@UseGuards(AuthGuard)
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  /** ایجاد دوره جدید */
  @Post()
  async create(@Body() courseData: Partial<Course>) {
    return await this.courseService.create(courseData);
  }

  /** دریافت همه دوره‌ها */
  @Get()
  async findAll() {
    return await this.courseService.findAll();
  }

  /** دریافت دوره‌های فعال */
  @Get('active')
  async getActiveCourses() {
    return await this.courseService.getActiveCourses();
  }

  /** دریافت اطلاعات یک دوره */
  @Get(':id')
  async findById(@Param('id') id: number) {
    return await this.courseService.findById(id);
  }

  /** دریافت تکالیف یک دوره */
  @Get(':id/assignments')
  async getCourseAssignments(@Param('id') id: number) {
    return await this.courseService.getCourseAssignments(id);
  }

  /** ایجاد تکلیف برای دوره */
  @Post(':id/assignments')
  async createAssignment(
    @Param('id') courseId: number,
    @Body() assignmentData: Partial<Assignment>,
  ) {
    return await this.courseService.createAssignment(courseId, assignmentData);
  }

  /** به‌روزرسانی دوره */
  @Put(':id')
  async update(@Param('id') id: number, @Body() courseData: Partial<Course>) {
    return await this.courseService.update(id, courseData);
  }

  /** حذف دوره */
  @Delete(':id')
  async delete(@Param('id') id: number) {
    return await this.courseService.delete(id);
  }
} 