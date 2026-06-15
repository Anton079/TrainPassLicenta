using TrainPass.TrainSchedules.Dtos;
using TrainPass.TrainSchedules.Models;

namespace TrainPass.TrainSchedules.Repository
{
    public interface ITrainScheduleRepo
    {
        Task<GetAllTrainSchedule> AllTrainSchedule();
        Task<GetAllTrainSchedule> SearchTrainSchedules(int departureStationId, int arrivalStationId, DateTime date);
        Task<TrainSchedule> CreateTrainSchedule(TrainSchedule trainSchedule);
        Task<TrainSchedule?> UpdateTrainSchedule(int id, TrainSchedule trainSchedule);
        Task<bool> DeleteTrainSchedule(int id);
        Task<bool> TrainScheduleExists(int trainScheduleId);
    }
}