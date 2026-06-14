using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TrainPass.Admins.Models
{
    [Table("admins")]
    public class Admin
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        [Column("id")]
        public string Id { get; set; }

        [Required]
        [Column("firstName")]
        public string FirstName { get; set; }

        [Required]
        [Column("lastName")]
        public string LastName { get; set; }

        [Required]
        [Column("email")]
        public string Email { get; set; }

        [Column("passwordHash")]
        public string? PasswordHash { get; set; }

        [Column("passwordSalt")]
        public string? PasswordSalt { get; set; }

        [Column("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}