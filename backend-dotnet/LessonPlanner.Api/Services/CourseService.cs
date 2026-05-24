using Microsoft.EntityFrameworkCore;
using LessonPlanner.Api.Data;
using LessonPlanner.Api.Models;

namespace LessonPlanner.Api.Services;

public class CourseService : ICourseService
{
    private readonly AppDbContext _db;
    private readonly IUserService _userService;
    private readonly IStudentService _studentService;

    public CourseService(AppDbContext db, IUserService userService, IStudentService studentService)
    {
        _db = db;
        _userService = userService;
        _studentService = studentService;
    }

    public async Task<Course> CreateAsync(Course course)
    {
        _db.Courses.Add(course);
        await _db.SaveChangesAsync();
        return course;
    }

    public async Task<List<Course>> GetAllAsync()
    {
        return await _db.Courses
            .Include(c => c.Assignments)
            .ThenInclude(a => a.Attachments)
            .Include(c => c.StudentCourses)
            .ThenInclude(sc => sc.Student)
            .ToListAsync();
    }

    public async Task<Course?> FindByIdAsync(int id)
    {
        return await _db.Courses
            .Include(c => c.Assignments)
            .ThenInclude(a => a.Attachments)
            .Include(c => c.StudentCourses)
            .ThenInclude(sc => sc.Student)
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<List<Course>> GetActiveCoursesAsync()
    {
        return await _db.Courses
            .Where(c => c.Status == "active")
            .Include(c => c.Assignments)
            .ToListAsync();
    }

    public async Task<Course> UpdateAsync(int id, Course course)
    {
        var existing = await _db.Courses.FindAsync(id)
            ?? throw new KeyNotFoundException("Course not found");

        if (course.Title != null) existing.Title = course.Title;
        if (course.Description != null) existing.Description = course.Description;
        if (course.CourseCode != null) existing.CourseCode = course.CourseCode;
        if (course.Credits != 0) existing.Credits = course.Credits;
        if (course.Instructor != null) existing.Instructor = course.Instructor;
        if (course.Status != null) existing.Status = course.Status;
        if (course.StartDate != default) existing.StartDate = course.StartDate;
        if (course.EndDate != default) existing.EndDate = course.EndDate;
        existing.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return (await FindByIdAsync(id))!;
    }

    public async Task DeleteAsync(int id)
    {
        var course = await _db.Courses.FindAsync(id);
        if (course != null)
        {
            _db.Courses.Remove(course);
            await _db.SaveChangesAsync();
        }
    }

    public async Task<List<Assignment>> GetCourseAssignmentsAsync(int courseId)
    {
        return await _db.Assignments
            .Where(a => a.CourseId == courseId)
            .Include(a => a.Submissions)
            .Include(a => a.Attachments)
            .OrderBy(a => a.AssignmentDate)
            .ToListAsync();
    }

    public async Task<Assignment> CreateAssignmentAsync(int courseId, Assignment assignment)
    {
        assignment.CourseId = courseId;
        _db.Assignments.Add(assignment);
        await _db.SaveChangesAsync();
        return assignment;
    }

    public async Task<List<Assignment>> CreateDailyAssignmentSeriesAsync(int courseId, DateTime startDate, int days, Assignment baseTemplate)
    {
        var created = new List<Assignment>();
        for (int i = 0; i < days; i++)
        {
            var date = startDate.AddDays(i);
            var assignment = new Assignment
            {
                CourseId = courseId,
                Title = $"{baseTemplate.Title ?? "تکلیف روز"} {i + 1}",
                Description = $"{baseTemplate.Description ?? "شرح تکلیف روز"} {i + 1}",
                Type = baseTemplate.Type ?? "homework",
                MaxScore = baseTemplate.MaxScore > 0 ? baseTemplate.MaxScore : 100,
                AssignmentDate = date,
                Status = "active",
                Instructions = baseTemplate.Instructions ?? "طبق دستورالعمل، تکلیف روز را انجام دهید",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _db.Assignments.Add(assignment);
            created.Add(assignment);
        }
        await _db.SaveChangesAsync();
        return created;
    }

    public async Task<Assignment?> GetAssignmentByIdAsync(int id)
    {
        return await _db.Assignments
            .Include(a => a.Attachments)
            .Include(a => a.Submissions)
            .FirstOrDefaultAsync(a => a.Id == id);
    }

    public async Task<Assignment> UpdateAssignmentAsync(int id, Assignment assignment)
    {
        var existing = await _db.Assignments.FindAsync(id)
            ?? throw new KeyNotFoundException("Assignment not found");

        if (assignment.Title != null) existing.Title = assignment.Title;
        if (assignment.Description != null) existing.Description = assignment.Description;
        if (assignment.Type != null) existing.Type = assignment.Type;
        if (assignment.MaxScore > 0) existing.MaxScore = assignment.MaxScore;
        if (assignment.AssignmentDate != default) existing.AssignmentDate = assignment.AssignmentDate;
        if (assignment.Status != null) existing.Status = assignment.Status;
        if (assignment.Instructions != null) existing.Instructions = assignment.Instructions;
        existing.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return (await GetAssignmentByIdAsync(id))!;
    }

    public async Task DeleteAssignmentAsync(int id)
    {
        var assignment = await _db.Assignments.FindAsync(id);
        if (assignment != null)
        {
            _db.Assignments.Remove(assignment);
            await _db.SaveChangesAsync();
        }
    }

    public async Task<List<AssignmentAttachment>> GetAssignmentAttachmentsAsync(int assignmentId)
    {
        return await _db.AssignmentAttachments
            .Where(a => a.AssignmentId == assignmentId)
            .OrderBy(a => a.DisplayOrder)
            .ToListAsync();
    }

    public async Task<AssignmentAttachment> CreateAttachmentAsync(int assignmentId, AssignmentAttachment attachment)
    {
        attachment.AssignmentId = assignmentId;
        _db.AssignmentAttachments.Add(attachment);
        await _db.SaveChangesAsync();
        return attachment;
    }

    public async Task<AssignmentAttachment> UpdateAttachmentAsync(int id, AssignmentAttachment attachment)
    {
        var existing = await _db.AssignmentAttachments.FindAsync(id)
            ?? throw new KeyNotFoundException("Attachment not found");

        if (attachment.Title != null) existing.Title = attachment.Title;
        if (attachment.Description != null) existing.Description = attachment.Description;
        if (attachment.Kind != null) existing.Kind = attachment.Kind;
        if (attachment.Url != null) existing.Url = attachment.Url;
        existing.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return existing;
    }

    public async Task DeleteAttachmentAsync(int id)
    {
        var attachment = await _db.AssignmentAttachments.FindAsync(id);
        if (attachment != null)
        {
            _db.AssignmentAttachments.Remove(attachment);
            await _db.SaveChangesAsync();
        }
    }

    public async Task<object> GetSystemStatisticsAsync()
    {
        return new
        {
            TotalCourses = await _db.Courses.CountAsync(),
            TotalAssignments = await _db.Assignments.CountAsync(),
            TotalAttachments = await _db.AssignmentAttachments.CountAsync(),
            ActiveCourses = await _db.Courses.CountAsync(c => c.Status == "active"),
            TotalUsers = await _db.Users.CountAsync(),
            ApprovedUsers = await _db.Users.CountAsync(u => u.ApprovalStatus == "approved"),
            PendingUsers = await _db.Users.CountAsync(u => u.ApprovalStatus == "pending")
        };
    }

    public async Task<object> GetCourseStatisticsAsync(int courseId)
    {
        var course = await FindByIdAsync(courseId)
            ?? throw new KeyNotFoundException("Course not found");
        var assignments = await GetCourseAssignmentsAsync(courseId);

        return new
        {
            Course = course,
            TotalAssignments = assignments.Count,
            TotalAttachments = assignments.Sum(a => a.Attachments?.Count ?? 0),
            AssignmentsWithAttachments = assignments.Count(a => a.Attachments?.Count > 0)
        };
    }

    public async Task<List<Course>> SearchCoursesAsync(string query)
    {
        return await _db.Courses
            .Where(c => c.Title.Contains(query) || c.Description!.Contains(query) || c.CourseCode.Contains(query))
            .Include(c => c.Assignments)
            .ToListAsync();
    }

    public async Task<List<Course>> FilterCoursesByStatusAsync(string status)
    {
        return await _db.Courses
            .Where(c => c.Status == status)
            .Include(c => c.Assignments)
            .ToListAsync();
    }

    public async Task<object> ApproveUserAndCreateStudentAsync(int userId, string firstName, string lastName, string email, string phoneNumber, string studentId, int[] courseIds)
    {
        var student = await _studentService.CreateAsync(firstName, lastName, email, phoneNumber, studentId);
        await _userService.ApproveUserAsync(userId, firstName, lastName, email, phoneNumber, studentId);

        foreach (var courseId in courseIds)
        {
            var enrollment = new StudentCourse
            {
                StudentId = student.Id,
                CourseId = courseId,
                EnrollmentDate = DateTime.UtcNow,
                Status = "active",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _db.StudentCourses.Add(enrollment);
        }
        await _db.SaveChangesAsync();

        return new
        {
            Message = "کاربر با موفقیت تایید شد و دانش‌آموز ایجاد شد",
            Student = student,
            EnrolledCourses = courseIds.Length
        };
    }

    public async Task<object> RejectUserAsync(int userId)
    {
        await _userService.RejectUserAsync(userId);
        return new { Message = "کاربر رد شد" };
    }

    public async Task<List<User>> GetPendingUsersAsync()
    {
        return await _userService.GetPendingUsersAsync();
    }
}
