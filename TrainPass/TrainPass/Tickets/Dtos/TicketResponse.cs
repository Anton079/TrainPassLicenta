using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace TrainPass.Tickets.Dtos
{
    public class TicketResponse
    {
        public int Id { get; set; }

        public string CustomerId { get; set; }

        public int TrainScheduleId { get; set; }

        public int SeatNumber { get; set; }

        public DateTime PurchaseDate { get; set; }

        public string Status { get; set; }
    }
}
