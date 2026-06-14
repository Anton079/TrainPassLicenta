using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TrainPass.Customers.Models
{
    [Table("customers")]
    public class Customer
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        [Column("id")]
        public string Id { get; set; } = string.Empty;

        [Required]
        [Column("firstName")]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [Column("lastName")]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [Column("email")]
        public string Email { get; set; } = string.Empty;

        [Column("role")]
        public string? Role { get; set; }

        [Column("passwordHash")]
        public string? PasswordHash { get; set; }

        [Column("passwordSalt")]
        public string? PasswordSalt { get; set; }

        [Column("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}