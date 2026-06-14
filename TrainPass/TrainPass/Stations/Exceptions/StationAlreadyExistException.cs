using TrainPass.System;

namespace TrainPass.Stations.Exceptions
{
    public class StationAlreadyExistException:Exception
    {
        public StationAlreadyExistException() : base(ExceptionsMessage.StationAlreadyExistException) { }
    }
}
