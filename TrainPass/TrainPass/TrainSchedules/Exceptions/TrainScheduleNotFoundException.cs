using TrainPass.System;

namespace TrainPass.TrainSchedules.Exceptions
{
    public class TrainScheduleNotFoundException : Exception
    {
        public TrainScheduleNotFoundException() : base(ExceptionsMessage.TrainScheduleNotFoundException) { }
    }
}
