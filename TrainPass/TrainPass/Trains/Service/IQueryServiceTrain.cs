using TrainPass.Trains.Dtos;

namespace TrainPass.Trains.Service
{
    public interface IQueryServiceTrain
    {
        Task<GetAllTrainsDto> GetAllTrains();
    }
}
