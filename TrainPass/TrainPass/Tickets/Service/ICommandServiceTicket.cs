using TrainPass.Tickets.Dtos;

namespace TrainPass.Tickets.Service
{
    public interface ICommandServiceTicket
    {
        Task<GetAllTicketsDto> CreateTickets(BuyTicketsRequest request);

        Task<TicketResponse> CancelTicket(int ticketId);
    }
}