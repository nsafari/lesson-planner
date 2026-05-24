using Microsoft.AspNetCore.Mvc;
using LessonPlanner.Api.DTOs;
using LessonPlanner.Api.Services;

namespace LessonPlanner.Api.Controllers;

[ApiController]
[Route("auth")]
public class AuthController : ControllerBase
{
    private readonly IUserService _userService;

    public AuthController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpPost("signin")]
    public async Task<IActionResult> SignIn([FromBody] LoginRequest request)
    {
        var isValid = await _userService.ValidateUserAsync(request.Username, request.Password);
        if (!isValid)
            return BadRequest(new { message = "Invalid credentials" });

        var user = await _userService.FindUserAsync(request.Username);
        if (user == null)
            return BadRequest(new { message = "User not found" });

        if (user.ApprovalStatus == "pending")
            return BadRequest(new { message = "حساب کاربری شما در انتظار تایید مدیر سیستم است" });

        if (user.ApprovalStatus == "rejected")
            return BadRequest(new { message = "حساب کاربری شما رد شده است. لطفاً با مدیر سیستم تماس بگیرید" });

        if (user.UserType == "student" && user.Student != null)
        {
            return Ok(new AuthResponse(
                "Sign-in successful",
                user.Username,
                user.ImageUrl,
                "student",
                user.Student.Id,
                new StudentInfo(
                    user.Student.FirstName,
                    user.Student.LastName,
                    user.Student.Email,
                    user.Student.StudentId,
                    user.Student.PhoneNumber
                )
            ));
        }

        if (user.UserType == "admin")
        {
            return Ok(new AuthResponse(
                "Sign-in successful",
                user.Username,
                user.ImageUrl,
                "admin"
            ));
        }

        return Ok(new AuthResponse(
            "Sign-in successful",
            user.Username,
            user.ImageUrl,
            "student",
            ApprovalStatus: user.ApprovalStatus
        ));
    }

    [HttpPost("signup")]
    public async Task<IActionResult> SignUp([FromBody] SignupRequest request)
    {
        if (request.Password != request.RetryPassword)
            return BadRequest(new { message = "پسوردها یکسان نیستند" });

        try
        {
            await _userService.CreatePendingUserAsync(
                request.Username,
                request.Password,
                request.ImageUrl,
                request.FirstName,
                request.LastName,
                request.Email,
                request.PhoneNumber
            );
            return Ok(new SignupResponse(
                "ثبت نام با موفقیت انجام شد. در انتظار تایید مدیر سیستم هستید.",
                "pending"
            ));
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = $"خطا در ثبت نام: {ex.Message}" });
        }
    }
}
