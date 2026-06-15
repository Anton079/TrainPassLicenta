using TrainPass.Tickets.Dtos;
using TrainPass.Tickets.Models;

namespace TrainPass.Tickets.Repository
{
    public interface ITicketRepo
    {
        Task<GetAllTicketsDto> GetAllTickets();
        Task<Ticket> CreateTicket(Ticket ticket);
        Task<bool> TrainScheduleExists(string trainScheduleId);
    }
}
