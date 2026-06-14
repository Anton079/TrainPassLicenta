using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TrainPass.Tickets.Models
{
    [Table("tickets")]
    public class Ticket
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("id")]
        public int Id { get; set; }
        
        [Required]
        [Column("customerId")]
        public string CustomerId { get; set; }

        [Required]
        [Column("trainScheduleId")]
        public int TrainScheduleId { get; set; }

        [Required]
        [Column("seatNumber")]
        public int SeatNumber { get; set; }

        [Required]
        [Column("purchaseDate")]
        public DateTime PurchaseDate { get; set; }

        [Required]
        [Column("status")]
        public string Status { get; set; }
    }
}
