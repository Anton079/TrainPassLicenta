using TrainPass.System;

namespace TrainPass.Tickets.Exceptions
{
    public class NoAvailableSeatsException : Exception
    {
        public NoAvailableSeatsException()
            : base(ExceptionsMessage.NoAvailableSeatsException)
        {
        }
    }
}
