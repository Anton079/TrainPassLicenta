using TrainPass.Tickets.Dtos;

namespace TrainPass.Tickets.Service
{
    public interface ICommandServiceTicket
    {
        Task<TicketResponse> CreateTicket(TicketRequest request);
        Task<GetAllTicketsDto> CreateTickets(BuyTicketsRequest request);
        Task<TicketResponse> CancelTicket(int ticketId);
    }
}