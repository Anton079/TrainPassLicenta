using AutoMapper;
using Microsoft.EntityFrameworkCore;
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
            var trainSchedules = await _db.TrainSchedules.ToListAsync();

            var mappedTrainSchedules = _mapper.Map<List<TrainScheduleResponse>>(trainSchedules);

            return new GetAllTrainSchedule
            {
                listTrainSchedule = mappedTrainSchedules
            };
        }

        public async Task<GetAllTrainSchedule> SearchTrainSchedules(int departureStationId, int arrivalStationId, DateTime date)
        {
            var startDate = date.Date;
            var endDate = startDate.AddDays(1);

            var trainSchedules = await _db.TrainSchedules
                .Where(trainSchedule =>
                    trainSchedule.DepartureStationId == departureStationId &&
                    trainSchedule.ArrivalStationId == arrivalStationId &&
                    trainSchedule.DepartureTime >= startDate &&
                    trainSchedule.DepartureTime < endDate)
                .ToListAsync();

            var mappedTrainSchedules = _mapper.Map<List<TrainScheduleResponse>>(trainSchedules);

            return new GetAllTrainSchedule
            {
                listTrainSchedule = mappedTrainSchedules
            };
        }

        public async Task<TrainSchedule> CreateTrainSchedule(TrainSchedule trainSchedule)
        {
            _db.TrainSchedules.Add(trainSchedule);

            await _db.SaveChangesAsync();

            return trainSchedule;
        }

        public async Task<TrainSchedule?> UpdateTrainSchedule(int id, TrainSchedule trainSchedule)
        {
            var existingTrainSchedule = await _db.TrainSchedules
                .FirstOrDefaultAsync(trainSchedule => trainSchedule.Id == id);

            if (existingTrainSchedule == null)
            {
                return null;
            }

            existingTrainSchedule.TrainId = trainSchedule.TrainId;
            existingTrainSchedule.DepartureStationId = trainSchedule.DepartureStationId;
            existingTrainSchedule.ArrivalStationId = trainSchedule.ArrivalStationId;
            existingTrainSchedule.DepartureTime = trainSchedule.DepartureTime;
            existingTrainSchedule.ArrivalTime = trainSchedule.ArrivalTime;
            existingTrainSchedule.Price = trainSchedule.Price;

            await _db.SaveChangesAsync();

            return existingTrainSchedule;
        }


        public async Task<bool> DeleteTrainSchedule(int id)
        {
            var trainSchedule = await _db.TrainSchedules
                .FirstOrDefaultAsync(trainSchedule => trainSchedule.Id == id);

            if (trainSchedule == null)
            {
                return false;
            }

            _db.TrainSchedules.Remove(trainSchedule);

            await _db.SaveChangesAsync();

            return true;
        }

        public async Task<bool> TrainScheduleExists(int trainScheduleId)
        {
            return await _db.TrainSchedules
                .AnyAsync(trainSchedule => trainSchedule.Id == trainScheduleId);
        }
    }
}