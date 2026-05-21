using Microsoft.AspNetCore.Mvc;
using LessonPlanner.Api.Models;
using LessonPlanner.Api.Services;

namespace LessonPlanner.Api.Controllers;

[ApiController]
[Route("courses")]
public class CourseController : ControllerBase
{
    private readonly ICourseService _courseService;

    public CourseController(ICourseService courseService)
    {
        _courseService = courseService;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Course course)
    {
        var result = await _courseService.CreateAsync(course);
        return Ok(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _courseService.GetAllAsync();
        return Ok(result);
    }

    [HttpGet("active")]
    public async Task<IActionResult> GetActive()
    {
        var result = await _courseService.GetActiveCoursesAsync();
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _courseService.FindByIdAsync(id);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpGet("{id}/assignments")]
    public async Task<IActionResult> GetAssignments(int id)
    {
        var result = await _courseService.GetCourseAssignmentsAsync(id);
        return Ok(result);
    }

    [HttpPost("{id}/assignments")]
    public async Task<IActionResult> CreateAssignment(int id, [FromBody] Assignment assignment)
    {
        var result = await _courseService.CreateAssignmentAsync(id, assignment);
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Course course)
    {
        try
        {
            var result = await _courseService.UpdateAsync(id, course);
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
        await _courseService.DeleteAsync(id);
        return NoContent();
    }
}
