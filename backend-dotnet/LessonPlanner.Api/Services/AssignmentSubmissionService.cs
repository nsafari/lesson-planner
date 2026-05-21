using Microsoft.EntityFrameworkCore;
using LessonPlanner.Api.Data;
using LessonPlanner.Api.Models;

namespace LessonPlanner.Api.Services;

public class AssignmentSubmissionService : IAssignmentSubmissionService
{
    private readonly AppDbContext _db;

    public AssignmentSubmissionService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<AssignmentSubmission> CreateAsync(AssignmentSubmission submission)
    {
        _db.AssignmentSubmissions.Add(submission);
        await _db.SaveChangesAsync();
        return submission;
    }

    public async Task<AssignmentSubmission> SubmitDailyWorkAsync(int studentId, int assignmentId, AssignmentSubmission submissionData)
    {
        var today = DateTime.UtcNow.Date;

        var existing = await _db.AssignmentSubmissions
            .FirstOrDefaultAsync(s => s.StudentId == studentId && s.AssignmentId == assignmentId && s.SubmissionDate == today);

        if (existing != null)
        {
            if (submissionData.DailyScore > 0) existing.DailyScore = submissionData.DailyScore;
            if (submissionData.CumulativeScore > 0) existing.CumulativeScore = submissionData.CumulativeScore;
            if (submissionData.Status != null) existing.Status = submissionData.Status;
            if (submissionData.Feedback != null) existing.Feedback = submissionData.Feedback;
            if (submissionData.AudioFileUrl != null) existing.AudioFileUrl = submissionData.AudioFileUrl;
            if (submissionData.DocumentUrl != null) existing.DocumentUrl = submissionData.DocumentUrl;
            if (submissionData.Notes != null) existing.Notes = submissionData.Notes;
            existing.IsCompleted = submissionData.IsCompleted;
            if (submissionData.TimeSpent.HasValue) existing.TimeSpent = submissionData.TimeSpent;
            existing.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return (await FindByIdAsync(existing.Id))!;
        }
        else
        {
            var submission = new AssignmentSubmission
            {
                StudentId = studentId,
                AssignmentId = assignmentId,
                SubmissionDate = today,
                DailyScore = submissionData.DailyScore,
                CumulativeScore = submissionData.CumulativeScore,
                Status = submissionData.Status ?? "pending",
                Feedback = submissionData.Feedback,
                AudioFileUrl = submissionData.AudioFileUrl,
                DocumentUrl = submissionData.DocumentUrl,
                Notes = submissionData.Notes,
                IsCompleted = submissionData.IsCompleted,
                TimeSpent = submissionData.TimeSpent,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _db.AssignmentSubmissions.Add(submission);
            await _db.SaveChangesAsync();
            return submission;
        }
    }

    public async Task<AssignmentSubmission?> FindByIdAsync(int id)
    {
        return await _db.AssignmentSubmissions
            .Include(s => s.Student)
            .Include(s => s.Assignment)
            .ThenInclude(a => a.Attachments)
            .FirstOrDefaultAsync(s => s.Id == id);
    }

    public async Task<List<AssignmentSubmission>> GetStudentSubmissionsAsync(int studentId, int? assignmentId)
    {
        var query = _db.AssignmentSubmissions
            .Include(s => s.Assignment)
            .ThenInclude(a => a.Attachments)
            .Where(s => s.StudentId == studentId);

        if (assignmentId.HasValue)
            query = query.Where(s => s.AssignmentId == assignmentId.Value);

        return await query.OrderByDescending(s => s.SubmissionDate).ToListAsync();
    }

    public async Task<List<AssignmentSubmission>> GetAssignmentSubmissionsAsync(int assignmentId)
    {
        return await _db.AssignmentSubmissions
            .Include(s => s.Student)
            .Where(s => s.AssignmentId == assignmentId)
            .OrderByDescending(s => s.SubmissionDate)
            .ToListAsync();
    }

    public async Task<AssignmentSubmission> UpdateAsync(int id, AssignmentSubmission submission)
    {
        var existing = await _db.AssignmentSubmissions.FindAsync(id)
            ?? throw new KeyNotFoundException("Submission not found");

        if (submission.DailyScore > 0) existing.DailyScore = submission.DailyScore;
        if (submission.CumulativeScore > 0) existing.CumulativeScore = submission.CumulativeScore;
        if (submission.Status != null) existing.Status = submission.Status;
        if (submission.Feedback != null) existing.Feedback = submission.Feedback;
        if (submission.AudioFileUrl != null) existing.AudioFileUrl = submission.AudioFileUrl;
        if (submission.DocumentUrl != null) existing.DocumentUrl = submission.DocumentUrl;
        if (submission.Notes != null) existing.Notes = submission.Notes;
        if (submission.TimeSpent.HasValue) existing.TimeSpent = submission.TimeSpent;
        existing.IsCompleted = submission.IsCompleted;
        existing.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return (await FindByIdAsync(id))!;
    }

    public async Task<AssignmentSubmission> UpdateSubmissionFileAsync(int submissionId, string fileUrl)
    {
        var existing = await _db.AssignmentSubmissions.FindAsync(submissionId)
            ?? throw new KeyNotFoundException("Submission not found");

        existing.AudioFileUrl = fileUrl;
        existing.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return (await FindByIdAsync(submissionId))!;
    }

    public async Task DeleteAsync(int id)
    {
        var submission = await _db.AssignmentSubmissions.FindAsync(id);
        if (submission != null)
        {
            _db.AssignmentSubmissions.Remove(submission);
            await _db.SaveChangesAsync();
        }
    }

    public async Task<object> GetStudentProgressAsync(int studentId, int assignmentId)
    {
        var submissions = await _db.AssignmentSubmissions
            .Include(s => s.Assignment)
            .ThenInclude(a => a.Attachments)
            .Where(s => s.StudentId == studentId && s.AssignmentId == assignmentId)
            .OrderBy(s => s.SubmissionDate)
            .ToListAsync();

        var assignment = await _db.Assignments
            .Include(a => a.Attachments)
            .FirstOrDefaultAsync(a => a.Id == assignmentId)
            ?? throw new KeyNotFoundException("Assignment not found");

        var totalScore = submissions.Sum(s => s.CumulativeScore);
        var completedDays = submissions.Count(s => s.IsCompleted);
        var totalDays = 1;

        return new
        {
            Assignment = assignment,
            Submissions = submissions,
            TotalScore = totalScore,
            CompletedDays = completedDays,
            TotalDays = totalDays,
            ProgressPercentage = totalDays > 0 ? (completedDays / (double)totalDays) * 100 : 0,
            AverageDailyScore = submissions.Count > 0 ? totalScore / (double)submissions.Count : 0
        };
    }

    public async Task<AssignmentSubmission?> GetDailySubmissionAsync(int studentId, int assignmentId, DateTime date)
    {
        var targetDate = date.Date;
        return await _db.AssignmentSubmissions
            .Include(s => s.Assignment)
            .ThenInclude(a => a.Attachments)
            .FirstOrDefaultAsync(s =>
                s.StudentId == studentId &&
                s.AssignmentId == assignmentId &&
                s.SubmissionDate == targetDate);
    }
}
