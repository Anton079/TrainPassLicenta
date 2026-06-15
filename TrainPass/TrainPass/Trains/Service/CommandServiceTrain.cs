using AutoMapper;
using TrainPass.Trains.Dtos;
using TrainPass.Trains.Models;
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

        public async Task<TrainResponse> CreateTrain(TrainRequest request)
        {
            var train = _mapper.Map<Train>(request);

            var createdTrain = await _repo.CreateTrain(train);

            var response = _mapper.Map<TrainResponse>(createdTrain);

            return response;
        }
    }
}
