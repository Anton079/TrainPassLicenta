using AutoMapper;
using TrainPass.Stations.Dtos;
using TrainPass.Stations.Exceptions;
using TrainPass.Stations.Repository;

namespace TrainPass.Stations.Service
{
    public class QueryServiceStation:IQueryServiceStation
    {
        private readonly IStationRepo _repo;
        private readonly IMapper _mapper;

        public QueryServiceStation(IStationRepo repo, IMapper mapper)
        {
            _repo = repo;
            _mapper = mapper;
        }

        public async Task<GetAllStationsDto> GetAllStation()
        {
            var station = await _repo.GetAllStation();

            if(station != null)
                return station;

            throw new StationNotFoundException();
        }

        public async Task<StationResponse> FindStationByNameCity(StationRequest request)
        {
            var result = await _repo.FindStationByNameCity(request.Name, request.City);

            if(result != null)
                throw new StationAlreadyExistException();

            return _mapper.Map<StationResponse>(result);
        }

    }
}
