using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace TrainPass.Tickets.Dtos
{
    public class TicketRequest
    {

        public string CustomerId { get; set; }

        public int TrainScheduleId { get; set; }

        public int SeatNumber { get; set; }

        public DateTime PurchaseDate { get; set; }

        public string Status { get; set; }
    }
}
