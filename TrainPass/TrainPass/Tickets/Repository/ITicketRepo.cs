using TrainPass.Tickets.Dtos;
using TrainPass.Tickets.Models;

namespace TrainPass.Tickets.Repository
{
    public interface ITicketRepo
    {
        Task<GetAllTicketsDto> GetAllTickets();
        Task<GetAllTicketsDto> GetMyTickets(string customerId);
        Task<Ticket> CreateTicket(Ticket ticket);
        Task<GetAllTicketsDto> CreateTickets(List<Ticket> tickets);
        Task<bool> TrainScheduleExists(int trainScheduleId);
        Task<bool> SeatAlreadyTaken(int trainScheduleId, int seatNumber);
        Task<bool> HasAvailableSeats(int trainScheduleId);
        Task<Ticket> GetTicketById(int ticketId);
        Task<Ticket> UpdateTicket(Ticket ticket);
        Task<SeatsInfoDto?> GetSeatsInfo(int trainScheduleId, int numberOfSeats);
    }
}