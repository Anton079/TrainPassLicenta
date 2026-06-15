namespace TrainPass.Tickets.Dtos
{
    public class SeatsInfoDto
    {
        public int TrainScheduleId { get; set; }
        public int TotalSeats { get; set; }
        public List<int> OccupiedSeats { get; set; } = new List<int>();
        public List<int> AvailableSeats { get; set; } = new List<int>();
        public List<SeatCombinationDto> AdjacentCombinations { get; set; } = new List<SeatCombinationDto>();
    }
}