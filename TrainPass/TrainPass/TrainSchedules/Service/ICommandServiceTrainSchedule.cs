using TrainPass.TrainSchedules.Dtos;

namespace TrainPass.TrainSchedules.Service
{
    public interface ICommandServiceTrainSchedule
    {
        Task<TrainScheduleResponse> CreateTrainSchedule(TrainScheduleRequest request);
        Task<TrainScheduleResponse> UpdateTrainSchedule(int id, TrainScheduleRequest request);
        Task DeleteTrainSchedule(int id);
    }
}