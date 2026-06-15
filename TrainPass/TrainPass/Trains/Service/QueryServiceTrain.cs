using AutoMapper;
using TrainPass.Trains.Dtos;
using TrainPass.Trains.Exceptions;
using TrainPass.Trains.Repository;

namespace TrainPass.Trains.Service
{
    public class QueryServiceTrain:IQueryServiceTrain
    {
        private readonly ITrainRepo _repo;

        public QueryServiceTrain(ITrainRepo repo)
        {
            _repo = repo;
        }

        public async Task<GetAllTrainsDto> GetAllTrains()
        {
            var result = await _repo.GetAllTrains();

            if (result == null)
                throw new TrainNotFoundException();

            return result;
        }
    }
}
