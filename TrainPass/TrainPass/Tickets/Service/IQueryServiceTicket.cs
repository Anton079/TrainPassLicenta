using TrainPass.Tickets.Dtos;

namespace TrainPass.Tickets.Service
{
    public interface IQueryServiceTicket
    {
        Task<GetAllTicketsDto> GetAllTickets();
    }
}
