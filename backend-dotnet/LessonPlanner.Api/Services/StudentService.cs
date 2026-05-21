using Microsoft.EntityFrameworkCore;
using LessonPlanner.Api.Data;
using LessonPlanner.Api.Models;

namespace LessonPlanner.Api.Services;

public class StudentService : IStudentService
{
    private readonly AppDbContext _db;

    public StudentService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<Student> CreateAsync(string firstName, string lastName, string email, string phoneNumber, string studentId)
    {
        var student = new Student
        {
            FirstName = firstName,
            LastName = lastName,
            Email = email,
            PhoneNumber = phoneNumber,
            StudentId = studentId,
            Status = "active",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        return await CreateAsync(student);
    }

    public async Task<Student> CreateAsync(Student student)
    {
        _db.Students.Add(student);
        await _db.SaveChangesAsync();
        return student;
    }

    public async Task<List<Student>> GetAllAsync()
    {
        return await _db.Students
            .Include(s => s.StudentCourses)
            .ThenInclude(sc => sc.Course)
            .ToListAsync();
    }

    public async Task<Student?> FindByIdAsync(int id)
    {
        return await _db.Students
            .Include(s => s.StudentCourses)
            .ThenInclude(sc => sc.Course)
            .Include(s => s.Submissions)
            .FirstOrDefaultAsync(s => s.Id == id);
    }

    public async Task<Student?> FindByEmailAsync(string email)
    {
        return await _db.Students
            .Include(s => s.StudentCourses)
            .ThenInclude(sc => sc.Course)
            .FirstOrDefaultAsync(s => s.Email == email);
    }

    public async Task<Student?> FindByUsernameAsync(string username)
    {
        var user = await _db.Users
            .Include(u => u.Student)
            .FirstOrDefaultAsync(u => u.Username == username);
        if (user?.Student == null) return null;
        return await FindByIdAsync(user.Student.Id);
    }

    public async Task<Student> UpdateAsync(int id, Student student)
    {
        var existing = await _db.Students.FindAsync(id);
        if (existing == null) throw new KeyNotFoundException("Student not found");

        if (student.FirstName != null) existing.FirstName = student.FirstName;
        if (student.LastName != null) existing.LastName = student.LastName;
        if (student.Email != null) existing.Email = student.Email;
        if (student.PhoneNumber != null) existing.PhoneNumber = student.PhoneNumber;
        if (student.Address != null) existing.Address = student.Address;
        if (student.DateOfBirth != null) existing.DateOfBirth = student.DateOfBirth;
        if (student.Status != null) existing.Status = student.Status;
        existing.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return (await FindByIdAsync(id))!;
    }

    public async Task DeleteAsync(int id)
    {
        var student = await _db.Students.FindAsync(id);
        if (student != null)
        {
            _db.Students.Remove(student);
            await _db.SaveChangesAsync();
        }
    }

    public async Task<object> GetStudentProgressAsync(int studentId)
    {
        var student = await _db.Students
            .Include(s => s.StudentCourses)
            .ThenInclude(sc => sc.Course)
            .Include(s => s.Submissions)
            .ThenInclude(sb => sb.Assignment)
            .FirstOrDefaultAsync(s => s.Id == studentId)
            ?? throw new KeyNotFoundException("Student not found");

        return new
        {
            Student = student,
            Courses = student.StudentCourses,
            Submissions = student.Submissions
        };
    }
}
