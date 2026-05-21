namespace LessonPlanner.Api.DTOs;

public record CreateStudentRequest(
    string FirstName,
    string LastName,
    string Email,
    string StudentId,
    string? PhoneNumber,
    string? Address,
    DateTime? DateOfBirth
);

public record UpdateStudentRequest(
    string? FirstName,
    string? LastName,
    string? Email,
    string? PhoneNumber,
    string? Address,
    DateTime? DateOfBirth,
    string? Status
);

public record StudentProgressResponse(
    object Student,
    object Courses,
    object Submissions
);

public record FindByEmailPhoneRequest(string Email, string PhoneNumber);

public record SubmissionData(
    int? DailyScore,
    int? CumulativeScore,
    string? Status,
    string? Feedback,
    string? Notes,
    bool? IsCompleted,
    int? TimeSpent
);
