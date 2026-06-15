using TrainPass.Trains.Dtos;
using TrainPass.Trains.Models;

namespace TrainPass.Trains.Repository
{
    public interface ITrainRepo
    {
        Task<GetAllTrainsDto> GetAllTrains();
        Task<Train> CreateTrain(Train train);
    }
}
