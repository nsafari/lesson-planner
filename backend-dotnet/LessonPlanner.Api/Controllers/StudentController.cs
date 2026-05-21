using Microsoft.AspNetCore.Mvc;
using LessonPlanner.Api.DTOs;
using LessonPlanner.Api.Models;
using LessonPlanner.Api.Services;

namespace LessonPlanner.Api.Controllers;

[ApiController]
[Route("students")]
public class StudentController : ControllerBase
{
    private readonly IStudentService _studentService;
    private readonly IAssignmentSubmissionService _submissionService;

    public StudentController(IStudentService studentService, IAssignmentSubmissionService submissionService)
    {
        _studentService = studentService;
        _submissionService = submissionService;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Student student)
    {
        var result = await _studentService.CreateAsync(student);
        return Ok(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _studentService.GetAllAsync();
        return Ok(result);
    }

    [HttpPost("findByEmail_Phone")]
    public async Task<IActionResult> FindByEmailPhone([FromBody] FindByEmailPhoneRequest request)
    {
        var student = await _studentService.FindByEmailAsync(request.Email);
        if (student == null) return Ok(null);
        if (student.PhoneNumber == request.PhoneNumber) return Ok(student);
        return Ok(null);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _studentService.FindByIdAsync(id);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpGet("me/profile")]
    public async Task<IActionResult> GetCurrentProfile([FromBody] string username)
    {
        try
        {
            var result = await _studentService.FindByUsernameAsync(username);
            if (result == null) return NotFound(new { message = "Student not found for this user" });
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{id}/progress")]
    public async Task<IActionResult> GetProgress(int id)
    {
        try
        {
            var result = await _studentService.GetStudentProgressAsync(id);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpGet("{id}/assignments/{assignmentId}/progress")]
    public async Task<IActionResult> GetAssignmentProgress(int id, int assignmentId)
    {
        try
        {
            var result = await _submissionService.GetStudentProgressAsync(id, assignmentId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpGet("{id}/submissions")]
    public async Task<IActionResult> GetSubmissions(int id, [FromQuery] int? assignmentId)
    {
        var result = await _submissionService.GetStudentSubmissionsAsync(id, assignmentId);
        return Ok(result);
    }

    [HttpPost("{id}/assignments/{assignmentId}/submit")]
    public async Task<IActionResult> SubmitDailyWork(
        int id,
        int assignmentId,
        [FromForm] SubmissionData submissionData,
        IFormFile? audioFile)
    {
        var submission = new AssignmentSubmission
        {
            DailyScore = submissionData.DailyScore ?? 0,
            CumulativeScore = submissionData.CumulativeScore ?? 0,
            Status = submissionData.Status ?? "pending",
            Notes = submissionData.Notes,
            IsCompleted = submissionData.IsCompleted ?? false,
            TimeSpent = submissionData.TimeSpent,
        };

        if (audioFile != null)
        {
            var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "public", "uploads", "submissions");
            Directory.CreateDirectory(uploadsDir);

            var ext = Path.GetExtension(audioFile.FileName);
            var fileName = $"{Guid.NewGuid():N}{ext}";
            var filePath = Path.Combine(uploadsDir, fileName);

            using var stream = new FileStream(filePath, FileMode.Create);
            await audioFile.CopyToAsync(stream);

            submission.AudioFileUrl = $"/uploads/submissions/{fileName}";
        }

        var result = await _submissionService.SubmitDailyWorkAsync(id, assignmentId, submission);
        return Ok(result);
    }

    [HttpPost("{id}/submissions/{submissionId}/upload")]
    public async Task<IActionResult> UploadSubmissionFile(int id, int submissionId, IFormFile audioFile)
    {
        if (audioFile == null)
            return BadRequest(new { message = "فایل آپلود نشده است" });

        var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "public", "uploads", "submissions");
        Directory.CreateDirectory(uploadsDir);

        var ext = Path.GetExtension(audioFile.FileName);
        var fileName = $"{Guid.NewGuid():N}{ext}";
        var filePath = Path.Combine(uploadsDir, fileName);

        using var stream = new FileStream(filePath, FileMode.Create);
        await audioFile.CopyToAsync(stream);

        var fileUrl = $"/uploads/submissions/{fileName}";
        var result = await _submissionService.UpdateSubmissionFileAsync(submissionId, fileUrl);
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Student student)
    {
        try
        {
            var result = await _studentService.UpdateAsync(id, student);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _studentService.DeleteAsync(id);
        return NoContent();
    }
}
