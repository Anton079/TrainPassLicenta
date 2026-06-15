using AutoMapper;
using System.Data.Entity;
using TrainPass.Data;
using TrainPass.TrainSchedules.Dtos;

namespace TrainPass.TrainSchedules.Repository
{
    public class TrainScheduleRepo : ITrainScheduleRepo
    {
        private readonly IMapper _mapper;
        private readonly AppDbContext _db;

        public TrainScheduleRepo(IMapper mapper, AppDbContext db)
        {
            _mapper = mapper;
            _db = db;
        }

        public async Task<GetAllTrainSchedule> AllTrainSchedule()
        {
            var routes = await _db.TrainSchedules.ToListAsync();
            var map = _mapper.Map<List<TrainScheduleResponse>>(routes);

            return new GetAllTrainSchedule
            {
                listTrainSchedule = map
            };
        }

        public async Task<TrainScheduleRequest> CreateTrainSchedule()
        {

        }

        public async Task<TrainScheduleRequest> TrainScheduleExists()
        {

        }
    }
}
