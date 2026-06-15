using AutoMapper;
using TrainPass.TrainSchedules.Dtos;
using TrainPass.TrainSchedules.Exceptions;
using TrainPass.TrainSchedules.Models;
using TrainPass.TrainSchedules.Repository;

namespace TrainPass.TrainSchedules.Service
{
    public class CommandServiceTrainSchedule : ICommandServiceTrainSchedule
    {
        private readonly IMapper _mapper;
        private readonly ITrainScheduleRepo _repo;

        public CommandServiceTrainSchedule(IMapper mapper, ITrainScheduleRepo repo)
        {
            _mapper = mapper;
            _repo = repo;
        }

        public async Task<TrainScheduleResponse> CreateTrainSchedule(TrainScheduleRequest request)
        {
            var trainSchedule = _mapper.Map<TrainSchedule>(request);

            var createdTrainSchedule = await _repo.CreateTrainSchedule(trainSchedule);

            return _mapper.Map<TrainScheduleResponse>(createdTrainSchedule);
        }

        public async Task<TrainScheduleResponse> UpdateTrainSchedule(int id, TrainScheduleRequest request)
        {
            var trainSchedule = _mapper.Map<TrainSchedule>(request);

            var updatedTrainSchedule = await _repo.UpdateTrainSchedule(id, trainSchedule);

            if (updatedTrainSchedule == null)
            {
                throw new TrainScheduleNotFoundException();
            }

            return _mapper.Map<TrainScheduleResponse>(updatedTrainSchedule);
        }

        public async Task DeleteTrainSchedule(int id)
        {
            var deleted = await _repo.DeleteTrainSchedule(id);

            if (!deleted)
            {
                throw new TrainScheduleNotFoundException();
            }
        }
    }
}