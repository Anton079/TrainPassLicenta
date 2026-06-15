using AutoMapper;
using System.Data.Entity;
using TrainPass.Data;
using TrainPass.TrainSchedules.Dtos;
using TrainPass.TrainSchedules.Models;

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

        public async Task<TrainSchedule> CreateTrainSchedule(TrainSchedule trainSchedule)
        {
            _db.TrainSchedules.Add(trainSchedule);
            await _db.SaveChangesAsync();

            return trainSchedule;
        }

        public async Task<bool> TrainScheduleExists(int trainScheduleId)
        {
            return await _db.TrainSchedules.AnyAsync(t => trainScheduleId == t.Id);
        }

        
    }
}
