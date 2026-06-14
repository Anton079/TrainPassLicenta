using TrainPass.System;

namespace TrainPass.Customers.Exceptions
{
    public class CustomerNotFoundException:Exception
    {
        public CustomerNotFoundException() : base(ExceptionsMessage.CustomerNotFoundException) { }
    }
}
