import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../entities/student.entity';
import { Course } from '../entities/course.entity';
import { Assignment } from '../entities/assignment.entity';
import { StudentCourse } from '../entities/student-course.entity';
import { AssignmentSubmission } from '../entities/assignment-submission.entity';
import { AssignmentAttachment } from '../entities/assignment-attachment.entity';

/**
 * سرویس «نمونه داده‌های نمونه» برای ایجاد داده‌های اولیه جهت تست و توسعه.
 */
@Injectable()
export class SampleDataSeeder {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Assignment)
    private assignmentRepository: Repository<Assignment>,
    @InjectRepository(StudentCourse)
    private studentCourseRepository: Repository<StudentCourse>,
    @InjectRepository(AssignmentSubmission)
    private submissionRepository: Repository<AssignmentSubmission>,
    @InjectRepository(AssignmentAttachment)
    private attachmentRepository: Repository<AssignmentAttachment>,
  ) { }

  /** اجرای فرآیند نمونه داده‌ها */
  async seed() {
    console.log('🌱 Starting to seed sample data...');

    // ایجاد دانش‌آموزان نمونه
    const students = await this.createStudents();
    console.log(`✅ Created ${students.length} students`);

    // ایجاد دوره‌های نمونه
    const courses = await this.createCourses();
    console.log(`✅ Created ${courses.length} courses`);

    // ایجاد تکالیف روزانه نمونه (۱۲ روز برای هر دوره)
    const assignments = await this.createDailyAssignmentsForCourses(courses, 36);
    console.log(`✅ Created ${assignments.length} daily assignments`);

    // ثبت‌نام دانش‌آموزان در دوره‌ها
    await this.enrollStudents(students, courses);
    console.log('✅ Enrolled students in courses');

    // ایجاد ارسال‌های نمونه
    await this.createSampleSubmissions(students, assignments);
    console.log('✅ Created sample submissions');

    console.log('🎉 Sample data seeding completed!');
  }

  /** ایجاد لیست دانش‌آموزان نمونه */
  private async createStudents(): Promise<Student[]> {
    const studentData = [
      {
        firstName: 'علی',
        lastName: 'احمدی',
        email: 'ali.ahmadi@example.com',
        studentId: 'ST001',
        phoneNumber: '09123456789',
        address: 'تهران، خیابان ولیعصر',
        dateOfBirth: new Date('2005-03-15'),
        status: 'active',
      },
      {
        firstName: 'فاطمه',
        lastName: 'محمدی',
        email: 'fateme.mohammadi@example.com',
        studentId: 'ST002',
        phoneNumber: '09123456790',
        address: 'تهران، خیابان انقلاب',
        dateOfBirth: new Date('2005-07-22'),
        status: 'active',
      },
      {
        firstName: 'محمد',
        lastName: 'رضایی',
        email: 'mohammad.rezaei@example.com',
        studentId: 'ST003',
        phoneNumber: '09123456791',
        address: 'تهران، خیابان آزادی',
        dateOfBirth: new Date('2005-11-08'),
        status: 'active',
      },
    ];

    const students = [];
    for (const data of studentData) {
      const student = this.studentRepository.create(data);
      students.push(await this.studentRepository.save(student));
    }

    return students;
  }

  /** ایجاد لیست دوره‌های نمونه */
  private async createCourses(): Promise<Course[]> {
    const courseData = [
      {
        title: 'قرآن پایه دهم',
        description: 'درس قرآن برای پایه دهم با تمرکز بر تلاوت و ضبط صدا',
        courseCode: 'QUR101',
        credits: 1,
        instructor: 'استاد قرآنی',
        status: 'active',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2024-12-31'),
        maxStudents: 30,
      },
      {
        title: 'ریاضی پایه دهم',
        description: 'درس ریاضی برای پایه دهم شامل جبر، هندسه و مثلثات',
        courseCode: 'MATH101',
        credits: 3,
        instructor: 'دکتر محمدی',
        status: 'active',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2024-12-31'),
        maxStudents: 30,
      },
    ];

    const courses = [];
    for (const data of courseData) {
      const course = this.courseRepository.create(data);
      courses.push(await this.courseRepository.save(course));
    }

    return courses;
  }

  /** ایجاد تکالیف روزانه (۱۲ روز) برای هر دوره + افزودن ضمیمه‌ها برای روز اول */
  private async createDailyAssignmentsForCourses(courses: Course[], days: number): Promise<Assignment[]> {
    const created: Assignment[] = [];
    const startBase = new Date('2024-09-01');

    for (const course of courses) {
      for (let i = 0; i < days; i++) {
        const date = new Date(startBase);
        date.setDate(startBase.getDate() + i);

        const assignment = this.assignmentRepository.create({
          courseId: course.id,
          title: `تکلیف روز ${i + 1} ${course.title}`,
          description: i === 0
            ? 'گوش کن و ضبط کن: صوت روز اول را ۳ بار گوش کن؛ سپس صدای خود را ضبط و ارسال کن'
            : `تمرین روز ${i + 1} را مطابق دستورالعمل انجام دهید`,
          type: 'homework',
          maxScore: 100,
          assignmentDate: date,
          status: 'active',
          instructions: i === 0
            ? '۱) ۳ بار گوش کن ۲) سپس ضبط کن و ارسال کن'
            : 'مطابق دستورالعمل اعلام‌شده در کلاس انجام شود',
        });
        const saved = await this.assignmentRepository.save(assignment);
        created.push(saved);

        if (i === 0) {
          // روز اول: ضمیمه‌های نمونه
          const attachments = [
            this.attachmentRepository.create({
              assignmentId: saved.id,
              title: 'صوت روز اول (نسخه ۱)',
              description: 'فایل صوتی راهنما - بار اول',
              kind: 'audio',
              url: 'assets/audio/day1_guide_1.mp3',
              displayOrder: 1,
            }),
            this.attachmentRepository.create({
              assignmentId: saved.id,
              title: 'صوت روز اول (نسخه ۲)',
              description: 'فایل صوتی راهنما - بار دوم',
              kind: 'audio',
              url: 'assets/audio/day1_guide_2.mp3',
              displayOrder: 2,
            }),
            this.attachmentRepository.create({
              assignmentId: saved.id,
              title: 'صوت روز اول (نسخه ۳)',
              description: 'فایل صوتی راهنما - بار سوم',
              kind: 'audio',
              url: 'assets/audio/day1_guide_3.mp3',
              displayOrder: 3,
            }),
          ];
          await this.attachmentRepository.save(attachments);
        }
      }
    }

    return created;
  }

  /** ثبت‌نام همه دانش‌آموزان در همه دوره‌های نمونه */
  private async enrollStudents(students: Student[], courses: Course[]) {
    for (const student of students) {
      for (const course of courses) {
        const enrollment = this.studentCourseRepository.create({
          studentId: student.id,
          courseId: course.id,
          enrollmentDate: new Date(),
          status: 'enrolled',
        });
        await this.studentCourseRepository.save(enrollment);
      }
    }
  }

  /** ایجاد ارسال‌های نمونه روزانه برای ۷ روز گذشته (فقط برای روزهای موجود) */
  private async createSampleSubmissions(students: Student[], assignments: Assignment[]) {
    const today = new Date();

    for (const student of students) {
      for (const assignment of assignments) {
        // فقط برای تکالیفی که تاریخ آن قبل از امروز است، ارسال ایجاد می‌کنیم
        if (new Date(assignment.assignmentDate) > today) continue;

        // ارسال برای همان روز انجام تکلیف
        const submissionDate = new Date(assignment.assignmentDate);
        const dailyScore = Math.floor(Math.random() * 30) + 70; // 70-100
        const isCompleted = Math.random() > 0.2; // 80%

        const submission = this.submissionRepository.create({
          studentId: student.id,
          assignmentId: assignment.id,
          submissionDate,
          dailyScore,
          cumulativeScore: dailyScore, // چون تکلیف روزانه است
          status: isCompleted ? 'submitted' : 'pending',
          isCompleted,
          timeSpent: isCompleted ? Math.floor(Math.random() * 60) + 30 : 0,
          notes: isCompleted ? 'تمرین روزانه تکمیل شد' : null,
          audioFileUrl: isCompleted ? `uploads/audio/${student.id}_${assignment.id}.mp3` : null,
        });

        await this.submissionRepository.save(submission);
      }
    }
  }
} 