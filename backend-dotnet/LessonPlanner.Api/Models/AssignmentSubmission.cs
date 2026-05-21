using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LessonPlanner.Api.Models;

[Table("assignment_submissions")]
public class AssignmentSubmission
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Column(TypeName = "date")]
    public DateTime SubmissionDate { get; set; }

    public int DailyScore { get; set; } = 0;

    public int CumulativeScore { get; set; } = 0;

    [Column(TypeName = "varchar(50)")]
    public string Status { get; set; } = "pending";

    [Column(TypeName = "text")]
    public string? Feedback { get; set; }

    [Column(TypeName = "varchar(255)")]
    public string? AudioFileUrl { get; set; }

    [Column(TypeName = "varchar(255)")]
    public string? DocumentUrl { get; set; }

    [Column(TypeName = "text")]
    public string? Notes { get; set; }

    public bool IsCompleted { get; set; } = false;

    public int? TimeSpent { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public int StudentId { get; set; }

    [ForeignKey(nameof(StudentId))]
    public Student Student { get; set; } = null!;

    public int AssignmentId { get; set; }

    [ForeignKey(nameof(AssignmentId))]
    public Assignment Assignment { get; set; } = null!;
}
