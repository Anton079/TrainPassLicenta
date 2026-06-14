using AutoMapper;
using TrainPass.Trains.Dtos;
using TrainPass.Trains.Models;

namespace TrainPass.Trains.Mappings
{
    public class MappingProfileTrain : Profile
    {
        public MappingProfileTrain()
        {
            CreateMap<TrainRequest, Train>();

            CreateMap<Train, TrainResponse>();

            CreateMap<Train, GetAllTrainsDto>();
        }
    }
}