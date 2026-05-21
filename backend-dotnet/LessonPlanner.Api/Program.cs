using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using LessonPlanner.Api.Data;
using LessonPlanner.Api.Services;
using LessonPlanner.Api.Seeders;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"))
           .EnableSensitiveDataLogging());

builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IStudentService, StudentService>();
builder.Services.AddScoped<ICourseService, CourseService>();
builder.Services.AddScoped<IAssignmentSubmissionService, AssignmentSubmissionService>();
builder.Services.AddScoped<SampleDataSeeder>();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

app.UseCors();
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), "public")),
    RequestPath = ""
});
app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();

    var userService = scope.ServiceProvider.GetRequiredService<IUserService>();
    var existingAdmin = await userService.FindUserAsync("test");
    if (existingAdmin == null)
    {
        try
        {
            await userService.CreateUserAsync("test", "password", null, null, "admin");
            Console.WriteLine("✅ کاربر پیش‌فرض (مدیر) ایجاد شد");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"⚠️ خطا در ایجاد کاربر پیش‌فرض: {ex.Message}");
        }
    }

    var seeder = scope.ServiceProvider.GetRequiredService<SampleDataSeeder>();
    try
    {
        Console.WriteLine("🌱 شروع ایجاد داده‌های نمونه در راه‌اندازی برنامه...");
        await seeder.SeedAsync();
        Console.WriteLine("🎉 ایجاد داده‌های نمونه با موفقیت انجام شد");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"⚠️ خطا در ایجاد داده‌های نمونه: {ex.Message}");
    }
}

app.Run();
