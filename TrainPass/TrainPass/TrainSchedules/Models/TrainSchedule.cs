using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TrainPass.TrainSchedules.Models
{
    [Table("trainSchedules")]
    public class TrainSchedule
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("trainId")]
        public int TrainId { get; set; }

        [Required]
        [Column("departureStationId")]
        public int DepartureStationId {  get; set; }

        [Required]
        [Column("arrivalStationId")]
        public int ArrivalStationId { get; set; }

        [Required]
        [Column("departureTime")] 
        public DateTime DepartureTime { get; set; }

        [Required]
        [Column("arrivalTime")]
        public DateTime ArrivalTime { get; set; }

        [Required]
        [Column("price")]
        public decimal Price { get; set; }

    }
}
