using LessonPlanner.Api.Models;

namespace LessonPlanner.Api.Services;

public interface IStudentService
{
    Task<Student> CreateAsync(string firstName, string lastName, string email, string phoneNumber, string studentId);
    Task<Student> CreateAsync(Student student);
    Task<List<Student>> GetAllAsync();
    Task<Student?> FindByIdAsync(int id);
    Task<Student?> FindByEmailAsync(string email);
    Task<Student?> FindByUsernameAsync(string username);
    Task<Student> UpdateAsync(int id, Student student);
    Task DeleteAsync(int id);
    Task<object> GetStudentProgressAsync(int studentId);
}
