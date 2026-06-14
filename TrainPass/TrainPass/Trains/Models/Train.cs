using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TrainPass.Trains.Models
{
    [Table("trains")]
    public class Train
    {

        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("name")]
        public string Name { get; set; }

        [Required]
        [Column("trainNumber")]
        public string TrainNumber { get; set; }

        [Required]
        [Column("totalSeats")]
        public int TotalSeats { get; set; }
    }
}
