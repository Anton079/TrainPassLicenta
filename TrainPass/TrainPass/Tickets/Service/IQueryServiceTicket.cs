using TrainPass.Tickets.Dtos;

namespace TrainPass.Tickets.Service
{
    public interface IQueryServiceTicket
    {
        Task<GetAllTicketsDto> GetAllTickets();
        Task<GetAllTicketsDto> GetMyTickets(string customerId);
        Task<SeatsInfoDto> GetSeatsInfo(int trainScheduleId, int numberOfSeats);
    }
}