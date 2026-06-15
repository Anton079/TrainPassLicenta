using TrainPass.System;

namespace TrainPass.Trains.Exceptions
{
    public class TrainNotFoundException : Exception
    {
        public TrainNotFoundException() : base(ExceptionsMessage.TrainNotFoundException) { }
    }
}
