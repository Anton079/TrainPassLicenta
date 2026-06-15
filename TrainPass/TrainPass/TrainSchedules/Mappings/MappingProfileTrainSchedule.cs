using AutoMapper;
using TrainPass.TrainSchedules.Dtos;
using TrainPass.TrainSchedules.Models;

namespace TrainPass.TrainSchedules.Mappings
{
    public class MappingProfileTrainSchedule : Profile
    {
        public MappingProfileTrainSchedule()
        {
            CreateMap<TrainSchedule, TrainScheduleResponse>();
            CreateMap<TrainScheduleRequest, TrainSchedule>();
        }
    }
}