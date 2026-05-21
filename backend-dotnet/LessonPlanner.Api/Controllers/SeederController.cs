using Microsoft.AspNetCore.Mvc;
using LessonPlanner.Api.Seeders;

namespace LessonPlanner.Api.Controllers;

[ApiController]
[Route("seeder")]
public class SeederController : ControllerBase
{
    private readonly SampleDataSeeder _seeder;

    public SeederController(SampleDataSeeder seeder)
    {
        _seeder = seeder;
    }

    [HttpPost("seed")]
    public async Task<IActionResult> Seed()
    {
        try
        {
            await _seeder.SeedAsync();
            return Ok(new { message = "Sample data seeded successfully!" });
        }
        catch (Exception ex)
        {
            return Ok(new { error = "Failed to seed sample data", details = ex.Message });
        }
    }
}
