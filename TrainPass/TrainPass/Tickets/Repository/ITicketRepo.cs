using TrainPass.Tickets.Dtos;
using TrainPass.Tickets.Models;

namespace TrainPass.Tickets.Repository
{
    public interface ITicketRepo
    {
        Task<GetAllTicketsDto> GetAllTickets();
        Task<Ticket> CreateTicket(Ticket ticket);
        Task<bool> TrainScheduleExists(int trainScheduleId);
        Task<bool> SeatAlreadyTaken(int trainScheduleId, int seatNumber);
        Task<bool> HasAvailableSeats(int trainScheduleId);
        Task<List<TicketResponse>> GetOccupiedTickets(int trainScheduleId);
        Task<List<int>> GetFreeSeats(int trainScheduleId);
    }
}
