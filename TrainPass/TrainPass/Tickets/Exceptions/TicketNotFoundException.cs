using TrainPass.System;

namespace TrainPass.Tickets.Exceptions
{
    public class TicketNotFoundException : Exception
    {
        public TicketNotFoundException() :base(ExceptionsMessage.TicketNotFoundException) { }
    }
}
