using TrainPass.TrainSchedules.Dtos;
using TrainPass.TrainSchedules.Exceptions;
using TrainPass.TrainSchedules.Repository;

namespace TrainPass.TrainSchedules.Service
{
    public class QueryServiceTrainSchedule : IQueryServiceTrainSchedule
    {
        private readonly ITrainScheduleRepo _repo;

        public QueryServiceTrainSchedule(ITrainScheduleRepo repo)
        {
            _repo = repo;
        }

        public async Task<GetAllTrainSchedule> AllTrainSchedule()
        {
            var trainSchedules = await _repo.AllTrainSchedule();

            if (trainSchedules == null || trainSchedules.listTrainSchedule == null || !trainSchedules.listTrainSchedule.Any())
            {
                throw new TrainScheduleNotFoundException();
            }

            return trainSchedules;
        }

        public async Task<GetAllTrainSchedule> SearchTrainSchedules(int departureStationId, int arrivalStationId, DateTime date)
        {
            var trainSchedules = await _repo.SearchTrainSchedules(departureStationId, arrivalStationId, date);

            if (trainSchedules == null || trainSchedules.listTrainSchedule == null || !trainSchedules.listTrainSchedule.Any())
            {
                throw new TrainScheduleNotFoundException();
            }

            return trainSchedules;
        }

        public async Task<bool> TrainScheduleExists(int trainScheduleId)
        {
            var exists = await _repo.TrainScheduleExists(trainScheduleId);

            if (!exists)
            {
                throw new TrainScheduleNotFoundException();
            }

            return exists;
        }
    }
}