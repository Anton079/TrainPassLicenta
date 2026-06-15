using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TrainPass.Data;
using TrainPass.Tickets.Dtos;
using TrainPass.Tickets.Models;

namespace TrainPass.Tickets.Repository
{
    public class TicketRepo : ITicketRepo
    {
        private readonly IMapper _mapper;
        private readonly AppDbContext _db;

        public TicketRepo(IMapper mapper, AppDbContext db)
        {
            _mapper = mapper;
            _db = db;
        }

        public async Task<GetAllTicketsDto> GetAllTickets()
        {
            var tickets = await _db.Tickets.ToListAsync();

            var mappedTickets = _mapper.Map<List<TicketResponse>>(tickets);

            return new GetAllTicketsDto
            {
                ticketList = mappedTickets
            };
        }

        public async Task<GetAllTicketsDto> GetMyTickets(string customerId)
        {
            var tickets = await _db.Tickets
                .Where(ticket => ticket.CustomerId == customerId)
                .ToListAsync();

            var mappedTickets = _mapper.Map<List<TicketResponse>>(tickets);

            return new GetAllTicketsDto
            {
                ticketList = mappedTickets
            };
        }

        public async Task<Ticket> CreateTicket(Ticket ticket)
        {
            _db.Tickets.Add(ticket);

            await _db.SaveChangesAsync();

            return ticket;
        }

        public async Task<bool> TrainScheduleExists(int trainScheduleId)
        {
            return await _db.TrainSchedules
                .AnyAsync(trainSchedule => trainSchedule.Id == trainScheduleId);
        }

        public async Task<bool> SeatAlreadyTaken(int trainScheduleId, int seatNumber)
        {
            return await _db.Tickets.AnyAsync(ticket =>
                ticket.TrainScheduleId == trainScheduleId &&
                ticket.SeatNumber == seatNumber);
        }

        public async Task<bool> HasAvailableSeats(int trainScheduleId)
        {
            var trainSchedule = await _db.TrainSchedules
                .FirstOrDefaultAsync(trainSchedule => trainSchedule.Id == trainScheduleId);

            if (trainSchedule == null)
                return false;

            var train = await _db.Trains
                .FirstOrDefaultAsync(train => train.Id == trainSchedule.TrainId);

            if (train == null)
                return false;

            var soldSeats = await _db.Tickets
                .CountAsync(ticket => ticket.TrainScheduleId == trainScheduleId);

            return soldSeats < train.TotalSeats;
        }
    }
}