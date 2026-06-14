using TrainPass.Trains.Dtos;

namespace TrainPass.Trains.Repository
{
    public interface ITrainRepo
    {
        Task<GetAllTrainsDto> GetAllTrains();
    }
}
