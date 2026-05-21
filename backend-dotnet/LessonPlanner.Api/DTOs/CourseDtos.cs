namespace LessonPlanner.Api.DTOs;

public record CreateCourseRequest(
    string Title,
    string? Description,
    string CourseCode,
    int Credits,
    string Instructor,
    DateTime StartDate,
    DateTime EndDate,
    int? MaxStudents
);

public record UpdateCourseRequest(
    string? Title,
    string? Description,
    string? CourseCode,
    int? Credits,
    string? Instructor,
    string? Status,
    DateTime? StartDate,
    DateTime? EndDate,
    int? MaxStudents
);

public record CreateAssignmentRequest(
    string Title,
    string? Description,
    string Type,
    int MaxScore,
    DateTime AssignmentDate,
    string? Instructions
);

public record UpdateAssignmentRequest(
    string? Title,
    string? Description,
    string? Type,
    int? MaxScore,
    DateTime? AssignmentDate,
    string? Status,
    string? Instructions
);

public record CreateDailySeriesRequest(
    string StartDate,
    int Days,
    string? TitlePrefix,
    string? DescriptionPrefix,
    string? Type,
    int? MaxScore,
    string? Instructions
);
