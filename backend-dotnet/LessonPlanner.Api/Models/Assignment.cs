using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LessonPlanner.Api.Models;

[Table("assignments")]
public class Assignment
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Column(TypeName = "varchar(200)")]
    public string Title { get; set; } = string.Empty;

    [Column(TypeName = "text")]
    public string Description { get; set; } = string.Empty;

    [Column(TypeName = "varchar(50)")]
    public string Type { get; set; } = string.Empty;

    public int MaxScore { get; set; }

    [Column(TypeName = "date")]
    public DateTime AssignmentDate { get; set; }

    [Column(TypeName = "varchar(50)")]
    public string Status { get; set; } = "active";

    [Column(TypeName = "text")]
    public string? Instructions { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public int CourseId { get; set; }

    [ForeignKey(nameof(CourseId))]
    public Course Course { get; set; } = null!;

    public ICollection<AssignmentSubmission> Submissions { get; set; } = new List<AssignmentSubmission>();
    public ICollection<AssignmentAttachment> Attachments { get; set; } = new List<AssignmentAttachment>();
}
