using TrainPass.System;

namespace TrainPass.Tickets.Exceptions
{
    public class TrainScheduleNotFoundException : Exception
    {
        public TrainScheduleNotFoundException()
            : base(ExceptionsMessage.TrainScheduleNotFoundException)
        {
        }
    }
}
