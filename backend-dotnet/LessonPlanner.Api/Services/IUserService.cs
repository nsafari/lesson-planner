using LessonPlanner.Api.Models;

namespace LessonPlanner.Api.Services;

public interface IUserService
{
    Task CreateUserAsync(string username, string password, string? imageUrl, int? studentId, string userType, string? firstName = null, string? lastName = null, string? email = null, string? phoneNumber = null);
    Task CreatePendingUserAsync(string username, string password, string? imageUrl, string? firstName = null, string? lastName = null, string? email = null, string? phoneNumber = null);
    Task<List<User>> GetPendingUsersAsync();
    Task ApproveUserAsync(int userId, string firstName, string lastName, string email, string phoneNumber, string studentId);
    Task RejectUserAsync(int userId);
    Task<User?> FindUserAsync(string username);
    Task<User?> FindUserByStudentIdAsync(int studentId);
    Task<bool> ValidateUserAsync(string username, string password);
    Task UpdateUserProfileAsync(string username, string imageUrl);
}
