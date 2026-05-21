using Microsoft.EntityFrameworkCore;
using LessonPlanner.Api.Data;
using LessonPlanner.Api.Models;
using LessonPlanner.Api.Services;

namespace LessonPlanner.Api.Seeders;

public class SampleDataSeeder
{
    private readonly AppDbContext _db;
    private readonly IUserService _userService;

    public SampleDataSeeder(AppDbContext db, IUserService userService)
    {
        _db = db;
        _userService = userService;
    }

    public async Task SeedAsync()
    {
        if (await _db.Students.AnyAsync())
        {
            Console.WriteLine("⚠️ داده‌های نمونه قبلاً ایجاد شده‌اند");
            return;
        }

        var students = await CreateStudentsAsync();
        await CreateUsersForStudentsAsync(students);
        var courses = await CreateCoursesAsync();
        var assignments = await CreateDailyAssignmentsForCoursesAsync(courses, 36);
        await EnrollStudentsAsync(students, courses);
        await CreateSampleSubmissionsAsync(students, assignments);
    }

    private async Task<List<Student>> CreateStudentsAsync()
    {
        var studentData = new[]
        {
            new { FirstName = "علی", LastName = "احمدی", Email = "ali.ahmadi@example.com", StudentId = "ST001", Phone = "09123456789", Address = "تهران، خیابان ولیعصر", DoB = new DateTime(2005, 3, 15) },
            new { FirstName = "فاطمه", LastName = "محمدی", Email = "fateme.mohammadi@example.com", StudentId = "ST002", Phone = "09123456790", Address = "تهران، خیابان انقلاب", DoB = new DateTime(2005, 7, 22) },
            new { FirstName = "محمد", LastName = "رضایی", Email = "mohammad.rezaei@example.com", StudentId = "ST003", Phone = "09123456791", Address = "تهران، خیابان آزادی", DoB = new DateTime(2005, 11, 8) }
        };

        var students = new List<Student>();
        foreach (var data in studentData)
        {
            var student = new Student
            {
                FirstName = data.FirstName,
                LastName = data.LastName,
                Email = data.Email,
                StudentId = data.StudentId,
                PhoneNumber = data.Phone,
                Address = data.Address,
                DateOfBirth = data.DoB,
                Status = "active",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _db.Students.Add(student);
            students.Add(student);
        }
        await _db.SaveChangesAsync();
        return students;
    }

    private async Task CreateUsersForStudentsAsync(List<Student> students)
    {
        var userData = new[]
        {
            new { Username = "ali.ahmadi", Password = "password123", StudentIndex = 0 },
            new { Username = "fateme.mohammadi", Password = "password123", StudentIndex = 1 },
            new { Username = "mohammad.rezaei", Password = "password123", StudentIndex = 2 }
        };

        foreach (var data in userData)
        {
            try
            {
                await _userService.CreateUserAsync(data.Username, data.Password, null, students[data.StudentIndex].Id, "student");
            }
            catch
            {
                // User may already exist
            }
        }
    }

    private async Task<List<Course>> CreateCoursesAsync()
    {

        var courseData = new[]
        {
            new { Title = "قرآن پایه دهم", Description = "درس قرآن برای پایه دهم با تمرکز بر تلاوت و ضبط صدا", Code = "QUR101", Credits = 1, Instructor = "استاد قرآنی", Start = new DateTime(2024, 9, 1), End = new DateTime(2024, 12, 31) },
            new { Title = "ریاضی پایه دهم", Description = "درس ریاضی برای پایه دهم شامل جبر، هندسه و مثلثات", Code = "MATH101", Credits = 3, Instructor = "دکتر محمدی", Start = new DateTime(2024, 9, 1), End = new DateTime(2024, 12, 31) }
        };

        var courses = new List<Course>();
        foreach (var data in courseData)
        {
            var course = new Course
            {
                Title = data.Title,
                Description = data.Description,
                CourseCode = data.Code,
                Credits = data.Credits,
                Instructor = data.Instructor,
                Status = "active",
                StartDate = data.Start,
                EndDate = data.End,
                MaxStudents = 30,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _db.Courses.Add(course);
            courses.Add(course);
        }
        await _db.SaveChangesAsync();
        return courses;
    }

    private async Task<List<Assignment>> CreateDailyAssignmentsForCoursesAsync(List<Course> courses, int days)
    {
        var created = new List<Assignment>();
        var startBase = new DateTime(2024, 9, 1);

        foreach (var course in courses)
        {
            for (int i = 0; i < days; i++)
            {
                var date = startBase.AddDays(i);
                var assignment = new Assignment
                {
                    CourseId = course.Id,
                    Title = $"تکلیف روز {i + 1} {course.Title}",
                    Description = i == 0
                        ? "گوش کن و ضبط کن: صوت روز اول را ۳ بار گوش کن؛ سپس صدای خود را ضبط و ارسال کن"
                        : $"تمرین روز {i + 1} را مطابق دستورالعمل انجام دهید",
                    Type = "homework",
                    MaxScore = 100,
                    AssignmentDate = date,
                    Status = "active",
                    Instructions = i == 0
                        ? "۱) ۳ بار گوش کن ۲) سپس ضبط کن و ارسال کن"
                        : "مطابق دستورالعمل اعلام‌شده در کلاس انجام شود",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _db.Assignments.Add(assignment);
                await _db.SaveChangesAsync();
                created.Add(assignment);

                if (i == 0)
                {
                    var attachments = new[]
                    {
                        new AssignmentAttachment { AssignmentId = assignment.Id, Title = "صوت روز اول (نسخه ۱)", Description = "فایل صوتی راهنما - بار اول", Kind = "audio", Url = "assets/audio/day1_guide_1.mp3", DisplayOrder = 1, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                        new AssignmentAttachment { AssignmentId = assignment.Id, Title = "صوت روز اول (نسخه ۲)", Description = "فایل صوتی راهنما - بار دوم", Kind = "audio", Url = "assets/audio/day1_guide_2.mp3", DisplayOrder = 2, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                        new AssignmentAttachment { AssignmentId = assignment.Id, Title = "صوت روز اول (نسخه ۳)", Description = "فایل صوتی راهنما - بار سوم", Kind = "audio", Url = "assets/audio/day1_guide_3.mp3", DisplayOrder = 3, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
                    };
                    _db.AssignmentAttachments.AddRange(attachments);
                    await _db.SaveChangesAsync();
                }
            }
        }
        return created;
    }

    private async Task EnrollStudentsAsync(List<Student> students, List<Course> courses)
    {
        foreach (var student in students)
        {
            foreach (var course in courses)
            {
                var enrollment = new StudentCourse
                {
                    StudentId = student.Id,
                    CourseId = course.Id,
                    EnrollmentDate = DateTime.UtcNow,
                    Status = "enrolled",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _db.StudentCourses.Add(enrollment);
            }
        }
        await _db.SaveChangesAsync();
    }

    private async Task CreateSampleSubmissionsAsync(List<Student> students, List<Assignment> assignments)
    {
        var today = DateTime.UtcNow;
        var rng = new Random();

        foreach (var student in students)
        {
            foreach (var assignment in assignments)
            {
                if (assignment.AssignmentDate > today) continue;

                var isCompleted = rng.NextDouble() > 0.2;
                var dailyScore = rng.Next(70, 101);

                var submission = new AssignmentSubmission
                {
                    StudentId = student.Id,
                    AssignmentId = assignment.Id,
                    SubmissionDate = assignment.AssignmentDate,
                    DailyScore = dailyScore,
                    CumulativeScore = dailyScore,
                    Status = isCompleted ? "submitted" : "pending",
                    IsCompleted = isCompleted,
                    TimeSpent = isCompleted ? rng.Next(30, 90) : 0,
                    Notes = isCompleted ? "تمرین روزانه تکمیل شد" : null,
                    AudioFileUrl = isCompleted ? $"uploads/audio/{student.Id}_{assignment.Id}.mp3" : null,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _db.AssignmentSubmissions.Add(submission);
            }
        }
        await _db.SaveChangesAsync();
    }
}
