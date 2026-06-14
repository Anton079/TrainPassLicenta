using AutoMapper;
using System.Data.Entity;
using TrainPass.Customers.Dtos;
using TrainPass.Data;
using TrainPass.Trains.Dtos;

namespace TrainPass.Trains.Repository
{
    public class TrainRepo:ITrainRepo
    {
        private readonly IMapper _mapper;
        private readonly AppDbContext _db;

        public TrainRepo(IMapper mapper, AppDbContext db)
        {
            _mapper = mapper;
            _db = db;
        }

        public async Task<GetAllTrainsDto> GetAllTrains()
        {
            var trains = await _db.Trains.ToListAsync();
            var map = _mapper.Map<List<TrainResponse>>(trains);

            return new GetAllTrainsDto
            {
                trainList = map
            };
            
        }
    }
}
