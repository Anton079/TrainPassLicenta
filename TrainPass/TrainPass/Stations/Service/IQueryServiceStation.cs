using TrainPass.Stations.Dtos;

namespace TrainPass.Stations.Service
{
    public interface IQueryServiceStation
    {
        Task<GetAllStationsDto> GetAllStation();
        Task<StationResponse> FindStationByNameCity(StationRequest request);
    }
}
