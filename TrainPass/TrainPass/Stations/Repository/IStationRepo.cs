using TrainPass.Stations.Dtos;
using TrainPass.Stations.Models;

namespace TrainPass.Stations.Repository
{
    public interface IStationRepo
    {
        Task<GetAllStationsDto> GetAllStation();

        Task<Station> CreateStation(Station station);

        Task<Station?> FindStationByNameCity(string name, string city);
    }
}