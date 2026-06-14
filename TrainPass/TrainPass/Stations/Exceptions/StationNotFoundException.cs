using TrainPass.System;

namespace TrainPass.Stations.Exceptions
{
    public class StationNotFoundException:Exception
    {
        public StationNotFoundException() :base(ExceptionsMessage.StationNotFoundException) { }
    }
}
