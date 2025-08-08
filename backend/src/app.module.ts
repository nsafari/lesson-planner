import { Module, OnModuleInit } from '@nestjs/common';
/**
 * ماژول اصلی برنامه که پیکربندی TypeORM، کنترلرها و سرویس‌ها را بارگذاری می‌کند.
 * پایگاه‌داده SQLite برای توسعه استفاده می‌شود و جداول به‌صورت خودکار همگام می‌شوند.
 */
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './controllers/auth.controller';
import { AuthGuard } from './auth.guard';
import { UserService } from './user.service';
import { StudentController } from './controllers/student.controller';
import { CourseController } from './controllers/course.controller';
import { SeederController } from './controllers/seeder.controller';
import { StudentService } from './services/student.service';
import { CourseService } from './services/course.service';
import { AssignmentSubmissionService } from './services/assignment-submission.service';
import { SampleDataSeeder } from './seeders/sample-data.seeder';
import { 
  Student, 
  Course, 
  Assignment, 
  AssignmentSubmission, 
  StudentCourse,
  AssignmentAttachment
} from './entities';
import { User } from './entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'lesson-planner.db', // Use file-based database instead of in-memory
      entities: [Student, Course, Assignment, AssignmentSubmission, StudentCourse, AssignmentAttachment, User],
      synchronize: true, // Automatically create tables
      logging: true, // Enable SQL logging for development
    }),
    TypeOrmModule.forFeature([Student, Course, Assignment, AssignmentSubmission, StudentCourse, AssignmentAttachment, User]),
  ],
  controllers: [AuthController, StudentController, CourseController, SeederController],
  providers: [UserService, AuthGuard, StudentService, CourseService, AssignmentSubmissionService, SampleDataSeeder],
})
export class AppModule implements OnModuleInit {
  constructor(
    private readonly userService: UserService,
    private readonly sampleDataSeeder: SampleDataSeeder,
  ) {}

  async onModuleInit() {
    // ایجاد کاربر پیش‌فرض برای تست
    try {
      await this.userService.createUser('test', 'password', null);
      console.log('✅ کاربر پیش‌فرض ایجاد شد');
    } catch (error) {
      console.error('⚠️ خطا در ایجاد کاربر پیش‌فرض:', error?.message ?? error);
    }

    // اجرای ایجاد داده‌ها در راه‌اندازی
    try {
      console.log('🌱 شروع ایجاد داده‌های نمونه در راه‌اندازی برنامه...');
      await this.sampleDataSeeder.seed();
      console.log('🎉 ایجاد داده‌های نمونه با موفقیت انجام شد');
    } catch (error) {
      console.error('⚠️ خطا در ایجاد داده‌های نمونه:', error?.message ?? error);
    }
  }
}
