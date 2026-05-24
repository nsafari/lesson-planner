namespace LessonPlanner.Api.DTOs;

public record LoginRequest(string Username, string Password);

public record SignupRequest(
    string Username,
    string Password,
    string RetryPassword,
    string FirstName,
    string LastName,
    string Email,
    string PhoneNumber,
    string? ImageUrl = null
);

public record StudentInfo(
    string FirstName,
    string LastName,
    string Email,
    string StudentId,
    string? PhoneNumber = null
);

public record AuthResponse(
    string Message,
    string Username,
    string? ImageUrl,
    string UserType,
    int? StudentId = null,
    StudentInfo? StudentInfo = null,
    string? ApprovalStatus = null
);

public record SignupResponse(string Message, string Status);
