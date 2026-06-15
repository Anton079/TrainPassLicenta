using TrainPass.System;

namespace TrainPass.Tickets.Exceptions
{
    public class SeatAlreadyTakenException : Exception
    {
        public SeatAlreadyTakenException()
            : base(ExceptionsMessage.SeatAlreadyTakenException)
        {
        }
    }
}
