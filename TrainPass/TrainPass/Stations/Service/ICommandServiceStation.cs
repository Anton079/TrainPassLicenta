using TrainPass.Stations.Dtos;

namespace TrainPass.Stations.Service
{
    public interface ICommandServiceStation
    {
        Task<StationResponse> CreateStation(StationRequest request);
    }
}
