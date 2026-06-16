using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TrainPass.Admins.Dtos;
using TrainPass.Customers.Dtos;
using TrainPass.Data;
using TrainPass.Stations.Dtos;
using TrainPass.Stations.Models;

namespace TrainPass.Stations.Repository
{
    public class StationRepo:IStationRepo
    {
        private readonly IMapper _mapper;
        private readonly AppDbContext _db;

        public StationRepo(IMapper mapper, AppDbContext db)
        {
            _mapper = mapper;
            _db = db;
        }

        public async Task<GetAllStationsDto> GetAllStation()
        {
            var stations = await _db.Stations.ToListAsync();
            var map = _mapper.Map<List<StationResponse>>(stations);

            return new GetAllStationsDto
            {
                stationList = map
            };
        }

        public async Task<Station> CreateStation(Station station)
        {
            _db.Stations.Add(station);
            await _db.SaveChangesAsync();
            return station;
        }

        public async Task<Station> FindStationByNameCity(string name, string city)
        {
            return await _db.Stations
                .FirstOrDefaultAsync(station =>
                station.Name == name &&
                station.City == city
                );
        }
    }
}
