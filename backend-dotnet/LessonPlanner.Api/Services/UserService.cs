using Microsoft.EntityFrameworkCore;
using LessonPlanner.Api.Data;
using LessonPlanner.Api.Models;

namespace LessonPlanner.Api.Services;

public class UserService : IUserService
{
    private readonly AppDbContext _db;

    public UserService(AppDbContext db)
    {
        _db = db;
    }

    public async Task CreateUserAsync(string username, string password, string? imageUrl, int? studentId, string userType, string? firstName = null, string? lastName = null, string? email = null, string? phoneNumber = null)
    {
        var hash = BCrypt.Net.BCrypt.HashPassword(password);
        var user = new User
        {
            Username = username,
            PasswordHash = hash,
            FirstName = firstName,
            LastName = lastName,
            Email = email,
            PhoneNumber = phoneNumber,
            ImageUrl = imageUrl,
            StudentId = studentId,
            ApprovalStatus = "approved",
            UserType = userType,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();
    }

    public async Task CreatePendingUserAsync(string username, string password, string? imageUrl, string? firstName = null, string? lastName = null, string? email = null, string? phoneNumber = null)
    {
        var hash = BCrypt.Net.BCrypt.HashPassword(password);
        var user = new User
        {
            Username = username,
            PasswordHash = hash,
            FirstName = firstName,
            LastName = lastName,
            Email = email,
            PhoneNumber = phoneNumber,
            ImageUrl = imageUrl,
            ApprovalStatus = "pending",
            UserType = "student",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();
    }

    public async Task<List<User>> GetPendingUsersAsync()
    {
        return await _db.Users
            .Where(u => u.ApprovalStatus == "pending")
            .Include(u => u.Student)
            .ToListAsync();
    }

    public async Task ApproveUserAsync(int userId, string firstName, string lastName, string email, string phoneNumber, string studentId)
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
        _db.Students.Add(student);
        await _db.SaveChangesAsync();

        var user = await _db.Users.FindAsync(userId);
        if (user != null)
        {
            user.ApprovalStatus = "approved";
            user.StudentId = student.Id;
            user.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }
    }

    public async Task RejectUserAsync(int userId)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user != null)
        {
            user.ApprovalStatus = "rejected";
            user.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }
    }

    public async Task<User?> FindUserAsync(string username)
    {
        return await _db.Users
            .Include(u => u.Student)
            .FirstOrDefaultAsync(u => u.Username == username);
    }

    public async Task<User?> FindUserByStudentIdAsync(int studentId)
    {
        return await _db.Users
            .Include(u => u.Student)
            .FirstOrDefaultAsync(u => u.StudentId == studentId);
    }

    public async Task<bool> ValidateUserAsync(string username, string password)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == username);
        if (user?.PasswordHash == null) return false;
        return BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);
    }

    public async Task UpdateUserProfileAsync(string username, string imageUrl)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == username);
        if (user != null)
        {
            user.ImageUrl = imageUrl;
            user.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }
    }
}
