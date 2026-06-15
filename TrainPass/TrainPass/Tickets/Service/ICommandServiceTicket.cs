using TrainPass.Tickets.Dtos;

namespace TrainPass.Tickets.Service
{
    public interface ICommandServiceTicket
    {
        Task<TicketResponse> CreateTicket(TicketRequest request);
        Task<TicketResponse> CancelTicket(int ticketId);
    }
}
