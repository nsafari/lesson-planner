using LessonPlanner.Api.Models;

namespace LessonPlanner.Api.Services;

public interface ICourseService
{
    Task<Course> CreateAsync(Course course);
    Task<List<Course>> GetAllAsync();
    Task<Course?> FindByIdAsync(int id);
    Task<List<Course>> GetActiveCoursesAsync();
    Task<Course> UpdateAsync(int id, Course course);
    Task DeleteAsync(int id);
    Task<List<Assignment>> GetCourseAssignmentsAsync(int courseId);
    Task<Assignment> CreateAssignmentAsync(int courseId, Assignment assignment);
    Task<List<Assignment>> CreateDailyAssignmentSeriesAsync(int courseId, DateTime startDate, int days, Assignment baseTemplate);
    Task<Assignment?> GetAssignmentByIdAsync(int id);
    Task<Assignment> UpdateAssignmentAsync(int id, Assignment assignment);
    Task DeleteAssignmentAsync(int id);
    Task<List<AssignmentAttachment>> GetAssignmentAttachmentsAsync(int assignmentId);
    Task<AssignmentAttachment> CreateAttachmentAsync(int assignmentId, AssignmentAttachment attachment);
    Task<AssignmentAttachment> UpdateAttachmentAsync(int id, AssignmentAttachment attachment);
    Task DeleteAttachmentAsync(int id);
    Task<object> GetSystemStatisticsAsync();
    Task<object> GetCourseStatisticsAsync(int courseId);
    Task<List<Course>> SearchCoursesAsync(string query);
    Task<List<Course>> FilterCoursesByStatusAsync(string status);
    Task<object> ApproveUserAndCreateStudentAsync(int userId, string firstName, string lastName, string email, string phoneNumber, string studentId, int[] courseIds);
    Task<object> RejectUserAsync(int userId);
    Task<List<User>> GetPendingUsersAsync();
}
