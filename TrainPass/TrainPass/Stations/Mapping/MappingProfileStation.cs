using AutoMapper;
using TrainPass.Stations.Dtos;
using TrainPass.Stations.Models;

namespace TrainPass.Stations.Mappings
{
    public class MappingProfileStation : Profile
    {
        public MappingProfileStation()
        {
            CreateMap<StationRequest, Station>();
            CreateMap<Station, StationResponse>();
        }
    }
}