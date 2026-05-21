using LessonPlanner.Api.Models;

namespace LessonPlanner.Api.Services;

public interface IAssignmentSubmissionService
{
    Task<AssignmentSubmission> CreateAsync(AssignmentSubmission submission);
    Task<AssignmentSubmission> SubmitDailyWorkAsync(int studentId, int assignmentId, AssignmentSubmission submissionData);
    Task<AssignmentSubmission?> FindByIdAsync(int id);
    Task<List<AssignmentSubmission>> GetStudentSubmissionsAsync(int studentId, int? assignmentId);
    Task<List<AssignmentSubmission>> GetAssignmentSubmissionsAsync(int assignmentId);
    Task<AssignmentSubmission> UpdateAsync(int id, AssignmentSubmission submission);
    Task<AssignmentSubmission> UpdateSubmissionFileAsync(int submissionId, string fileUrl);
    Task DeleteAsync(int id);
    Task<object> GetStudentProgressAsync(int studentId, int assignmentId);
    Task<AssignmentSubmission?> GetDailySubmissionAsync(int studentId, int assignmentId, DateTime date);
}
