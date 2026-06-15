using TrainPass.TrainSchedules.Dtos;
using TrainPass.TrainSchedules.Models;

namespace TrainPass.TrainSchedules.Repository
{
    public interface ITrainScheduleRepo
    {
        Task<GetAllTrainSchedule> AllTrainSchedule();
        Task<TrainSchedule> CreateTrainSchedule(TrainSchedule trainSchedule);
        Task<bool> TrainScheduleExists(int trainScheduleId);
    }
}
