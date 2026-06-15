using TrainPass.TrainSchedules.Dtos;

namespace TrainPass.TrainSchedules.Service
{
    public interface IQueryServiceTrainSchedule
    {
        Task<GetAllTrainSchedule> AllTrainSchedule();
        Task<GetAllTrainSchedule> SearchTrainSchedules(int departureStationId, int arrivalStationId, DateTime date);
        Task<bool> TrainScheduleExists(int trainScheduleId);
    }
}