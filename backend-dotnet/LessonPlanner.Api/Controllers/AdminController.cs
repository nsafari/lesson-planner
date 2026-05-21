using Microsoft.AspNetCore.Mvc;
using LessonPlanner.Api.DTOs;
using LessonPlanner.Api.Models;
using LessonPlanner.Api.Services;

namespace LessonPlanner.Api.Controllers;

[ApiController]
[Route("admin")]
public class AdminController : ControllerBase
{
    private readonly ICourseService _courseService;

    public AdminController(ICourseService courseService)
    {
        _courseService = courseService;
    }

    // ==================== Courses ====================

    [HttpGet("courses")]
    public async Task<IActionResult> GetAllCourses()
    {
        return Ok(await _courseService.GetAllAsync());
    }

    [HttpGet("courses/search")]
    public async Task<IActionResult> SearchCourses([FromQuery] string q)
    {
        return Ok(await _courseService.SearchCoursesAsync(q));
    }

    [HttpGet("courses/filter")]
    public async Task<IActionResult> FilterCourses([FromQuery] string status)
    {
        return Ok(await _courseService.FilterCoursesByStatusAsync(status));
    }

    [HttpGet("courses/{id}")]
    public async Task<IActionResult> GetCourseById(int id)
    {
        var course = await _courseService.FindByIdAsync(id);
        if (course == null) return NotFound();
        return Ok(course);
    }

    [HttpPost("courses")]
    public async Task<IActionResult> CreateCourse([FromBody] Course course)
    {
        return Ok(await _courseService.CreateAsync(course));
    }

    [HttpPut("courses/{id}")]
    public async Task<IActionResult> UpdateCourse(int id, [FromBody] Course course)
    {
        try
        {
            return Ok(await _courseService.UpdateAsync(id, course));
        }
        catch (Exception ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpDelete("courses/{id}")]
    public async Task<IActionResult> DeleteCourse(int id)
    {
        await _courseService.DeleteAsync(id);
        return NoContent();
    }

    // ==================== Assignments ====================

    [HttpGet("courses/{courseId}/assignments")]
    public async Task<IActionResult> GetCourseAssignments(int courseId)
    {
        return Ok(await _courseService.GetCourseAssignmentsAsync(courseId));
    }

    [HttpGet("assignments/{id}")]
    public async Task<IActionResult> GetAssignmentById(int id)
    {
        var assignment = await _courseService.GetAssignmentByIdAsync(id);
        if (assignment == null) return NotFound();
        return Ok(assignment);
    }

    [HttpPost("courses/{courseId}/assignments")]
    public async Task<IActionResult> CreateAssignment(int courseId, [FromBody] Assignment assignment)
    {
        return Ok(await _courseService.CreateAssignmentAsync(courseId, assignment));
    }

    [HttpPut("assignments/{id}")]
    public async Task<IActionResult> UpdateAssignment(int id, [FromBody] Assignment assignment)
    {
        try
        {
            return Ok(await _courseService.UpdateAssignmentAsync(id, assignment));
        }
        catch (Exception ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpDelete("assignments/{id}")]
    public async Task<IActionResult> DeleteAssignment(int id)
    {
        await _courseService.DeleteAssignmentAsync(id);
        return NoContent();
    }

    [HttpPost("courses/{courseId}/assignments/daily-series")]
    public async Task<IActionResult> CreateDailySeries(int courseId, [FromBody] CreateDailySeriesRequest request)
    {
        var baseTemplate = new Assignment
        {
            Title = request.TitlePrefix ?? "تکلیف روز",
            Description = request.DescriptionPrefix ?? "شرح تکلیف روز",
            Type = request.Type ?? "homework",
            MaxScore = request.MaxScore ?? 100,
            Instructions = request.Instructions ?? "طبق دستورالعمل، تکلیف روز را انجام دهید"
        };

        var startDate = DateTime.Parse(request.StartDate);
        var result = await _courseService.CreateDailyAssignmentSeriesAsync(courseId, startDate, request.Days, baseTemplate);
        return Ok(result);
    }

    // ==================== Attachments ====================

    [HttpGet("assignments/{assignmentId}/attachments")]
    public async Task<IActionResult> GetAttachments(int assignmentId)
    {
        return Ok(await _courseService.GetAssignmentAttachmentsAsync(assignmentId));
    }

    [HttpPost("assignments/{assignmentId}/attachments")]
    public async Task<IActionResult> CreateAttachment(
        int assignmentId,
        [FromForm] AttachmentData attachmentData,
        IFormFile? file)
    {
        var attachment = new AssignmentAttachment
        {
            Title = attachmentData.Title,
            Description = attachmentData.Description,
            Kind = attachmentData.Kind ?? "other",
            DisplayOrder = attachmentData.DisplayOrder ?? 0
        };

        if (file != null)
        {
            var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "public", "uploads", "attachments");
            Directory.CreateDirectory(uploadsDir);

            var ext = Path.GetExtension(file.FileName);
            var fileName = $"{Guid.NewGuid():N}{ext}";
            var filePath = Path.Combine(uploadsDir, fileName);

            using var stream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(stream);

            attachment.Url = $"/uploads/attachments/{fileName}";
            attachment.Kind = DetermineFileKind(file.ContentType);
        }
        else
        {
            attachment.Url = attachmentData.Url ?? string.Empty;
        }

        return Ok(await _courseService.CreateAttachmentAsync(assignmentId, attachment));
    }

    [HttpPost("attachments/{id}/upload")]
    public async Task<IActionResult> UploadAttachmentFile(int id, IFormFile file)
    {
        if (file == null)
            return BadRequest(new { message = "فایل آپلود نشده است" });

        var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "public", "uploads", "attachments");
        Directory.CreateDirectory(uploadsDir);

        var ext = Path.GetExtension(file.FileName);
        var fileName = $"{Guid.NewGuid():N}{ext}";
        var filePath = Path.Combine(uploadsDir, fileName);

        using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        var fileUrl = $"/uploads/attachments/{fileName}";
        var fileKind = DetermineFileKind(file.ContentType);

        var attachment = new AssignmentAttachment { Url = fileUrl, Kind = fileKind };
        return Ok(await _courseService.UpdateAttachmentAsync(id, attachment));
    }

    [HttpPut("attachments/{id}")]
    public async Task<IActionResult> UpdateAttachment(int id, [FromBody] AssignmentAttachment attachment)
    {
        try
        {
            return Ok(await _courseService.UpdateAttachmentAsync(id, attachment));
        }
        catch (Exception ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpDelete("attachments/{id}")]
    public async Task<IActionResult> DeleteAttachment(int id)
    {
        await _courseService.DeleteAttachmentAsync(id);
        return NoContent();
    }

    // ==================== Statistics ====================

    [HttpGet("statistics")]
    public async Task<IActionResult> GetStatistics()
    {
        return Ok(await _courseService.GetSystemStatisticsAsync());
    }

    [HttpGet("courses/{courseId}/statistics")]
    public async Task<IActionResult> GetCourseStatistics(int courseId)
    {
        try
        {
            return Ok(await _courseService.GetCourseStatisticsAsync(courseId));
        }
        catch (Exception ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    // ==================== User Management ====================

    [HttpGet("users/pending")]
    public async Task<IActionResult> GetPendingUsers()
    {
        return Ok(await _courseService.GetPendingUsersAsync());
    }

    [HttpPost("users/{userId}/approve")]
    public async Task<IActionResult> ApproveUser(int userId, [FromBody] ApproveUserRequest request)
    {
        var result = await _courseService.ApproveUserAndCreateStudentAsync(
            userId,
            request.FirstName,
            request.LastName,
            request.Email,
            request.PhoneNumber,
            request.StudentId,
            request.CourseIds
        );
        return Ok(result);
    }

    [HttpPost("users/{userId}/reject")]
    public async Task<IActionResult> RejectUser(int userId)
    {
        return Ok(await _courseService.RejectUserAsync(userId));
    }

    // ==================== Helpers ====================

    private static string DetermineFileKind(string? mimeType)
    {
        if (mimeType == null) return "other";
        if (mimeType.StartsWith("audio/")) return "audio";
        if (mimeType.StartsWith("image/")) return "image";
        if (mimeType is "application/pdf" or "application/msword"
            or "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
            return "document";
        if (mimeType == "text/plain") return "text";
        return "other";
    }
}
