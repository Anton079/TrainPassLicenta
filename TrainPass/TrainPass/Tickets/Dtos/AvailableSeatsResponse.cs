namespace TrainPass.Tickets.Dtos
{
    public class AvailableSeatsResponse
    {
        public int TrainScheduleId { get; set; }
        public int TotalSeats { get; set; }
        public List<int> AvailableSeats { get; set; } = new List<int>();
        public List<int> OccupiedSeats { get; set; } = new List<int>();
    }
}