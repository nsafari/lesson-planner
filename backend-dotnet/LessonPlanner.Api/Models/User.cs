using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LessonPlanner.Api.Models;

[Table("users")]
public class User
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Column(TypeName = "varchar(100)")]
    public string Username { get; set; } = string.Empty;

    [Column(TypeName = "varchar(255)")]
    public string? PasswordHash { get; set; }

    [Column(TypeName = "varchar(100)")]
    public string? FirstName { get; set; }

    [Column(TypeName = "varchar(100)")]
    public string? LastName { get; set; }

    [Column(TypeName = "varchar(100)")]
    public string? Email { get; set; }

    [Column(TypeName = "varchar(20)")]
    public string? PhoneNumber { get; set; }

    [Column(TypeName = "varchar(255)")]
    public string? ImageUrl { get; set; }

    public int? StudentId { get; set; }

    [Column(TypeName = "varchar(50)")]
    public string ApprovalStatus { get; set; } = "pending";

    [Column(TypeName = "varchar(50)")]
    public string UserType { get; set; } = "student";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(StudentId))]
    public Student? Student { get; set; }
}
