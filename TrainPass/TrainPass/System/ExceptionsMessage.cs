namespace TrainPass.System
{
    public class ExceptionsMessage
    {
        //Customer
        public const string CustomerNotFoundException = "Customer/s nu a putut fi gasit!";

        //Station
        public const string StationNotFoundException = "Station/s nu a putut fi gasit!";
        public const string StationAlreadyExistException = "Station deja exista!";

        //Tickets
        public const string SeatAlreadyTakenException = "Locul selectat este deja ocupat pentru aceasta cursa.";
        public const string NoAvailableSeatsException = "Nu mai exista locuri disponibile pentru aceasta cursa.";
        public const string TicketNotFoundException = "Biletele nu au fost gasite.";

        //Train
        public const string TrainNotFoundException = "Train/s nu a putut fi gasit sau nu exista!";

        //TrainSchedule
        public const string TrainScheduleNotFoundException = "Cursa selectata nu a fost gasita.";
    }
}
