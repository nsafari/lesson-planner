namespace LessonPlanner.Api.DTOs;

public record ApproveUserRequest(
    string FirstName,
    string LastName,
    string Email,
    string PhoneNumber,
    string StudentId,
    int[] CourseIds
);

public record ApproveUserResponse(string Message, object Student, int EnrolledCourses);

public record RejectUserResponse(string Message);

public record SystemStatisticsResponse(
    int TotalCourses,
    int TotalAssignments,
    int TotalAttachments,
    int ActiveCourses
);

public record AttachmentData(
    string? Title,
    string? Description,
    string? Kind,
    string? Url,
    int? DisplayOrder
);
