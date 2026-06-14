using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace TrainPass.Trains.Dtos
{
    public class TrainRequest
    {
        public string Name { get; set; }

        public string TrainNumber { get; set; }

        public int TotalSeats { get; set; }
    }
}
