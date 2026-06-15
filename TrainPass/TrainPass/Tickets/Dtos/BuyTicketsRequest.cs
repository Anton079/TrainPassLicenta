namespace TrainPass.Tickets.Dtos
{
    public class BuyTicketsRequest
    {
        public string? CustomerId { get; set; }
        public int TrainScheduleId { get; set; }
        public List<int> SeatNumbers { get; set; } = new List<int>();
    }
}