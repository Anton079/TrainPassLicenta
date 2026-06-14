using AutoMapper;
using TrainPass.Stations.Dtos;
using TrainPass.Stations.Exceptions;
using TrainPass.Stations.Models;
using TrainPass.Stations.Repository;

namespace TrainPass.Stations.Service
{
    public class CommandServiceStation : ICommandServiceStation
    {
        private readonly IStationRepo _repo;
        private readonly IMapper _mapper;

        public CommandServiceStation(IStationRepo repo, IMapper mapper)
        {
            _repo = repo;
            _mapper = mapper;
        }

        public async Task<StationResponse> CreateStation(StationRequest request)
        {
            var existingStation = await _repo.FindStationByNameCity(request.Name, request.City);

            if (existingStation != null)
                throw new StationAlreadyExistException();

            var station = _mapper.Map<Station>(request);
            
            var savedStation = await _repo.CreateStation(station);

            return _mapper.Map<StationResponse>(savedStation);
        }

    }
}
