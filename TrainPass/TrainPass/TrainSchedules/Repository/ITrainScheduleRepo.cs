using TrainPass.TrainSchedules.Dtos;

namespace TrainPass.TrainSchedules.Repository
{
    public interface ITrainScheduleRepo
    {
        Task<GetAllTrainSchedule> AllTrainSchedule();
    }
}
