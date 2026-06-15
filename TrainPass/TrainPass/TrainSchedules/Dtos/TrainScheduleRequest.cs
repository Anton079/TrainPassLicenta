namespace TrainPass.TrainSchedules.Dtos
{
    public class TrainScheduleRequest
    {
        public int TrainId { get; set; }

        public int DepartureStationId { get; set; }

        public int ArrivalStationId { get; set; }

        public DateTime DepartureTime { get; set; }

        public DateTime ArrivalTime { get; set; }

        public decimal Price { get; set; }
    }
}
