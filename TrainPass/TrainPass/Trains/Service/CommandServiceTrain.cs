using AutoMapper;
using TrainPass.Trains.Repository;

namespace TrainPass.Trains.Service
{
    public class CommandServiceTrain : ICommandServiceTrain
    {
        private readonly IMapper _mapper;
        private readonly ITrainRepo _repo;

        public CommandServiceTrain(IMapper mapper, ITrainRepo repo)
        {
            _mapper = mapper;
            _repo = repo;
        }

        
    }
}
