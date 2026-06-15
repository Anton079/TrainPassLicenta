using TrainPass.Trains.Dtos;

namespace TrainPass.Trains.Service
{
    public interface ICommandServiceTrain
    {
        Task<TrainResponse> CreateTrain(TrainRequest request);
    }
}
