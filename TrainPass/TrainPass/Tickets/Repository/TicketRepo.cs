using AutoMapper;
using System.Data.Entity;
using TrainPass.Data;
using TrainPass.Tickets.Dtos;
using TrainPass.Tickets.Models;

namespace TrainPass.Tickets.Repository
{
    public class TicketRepo: ITicketRepo
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
            var ticket = await _db.Tickets.ToListAsync();
            var map = _mapper.Map<List<TicketResponse>>(ticket);

            return new GetAllTicketsDto
            {
                ticketList = map
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
                .AnyAsync(t => 
                t.Id == trainScheduleId);
        }

        public async Task<bool> SeatAlreadyTaken(int trainScheduleId, int seatNumber)
        {
            return await _db.Tickets
                .AnyAsync(t =>
                t.TrainScheduleId == trainScheduleId &&
                t.SeatNumber == seatNumber &&
                t.Status != "Cancelled");
        }

        public async Task<bool> HasAvailableSeats(int trainScheduleId)
        {
            var schedule = await _db.TrainSchedules
                .FirstOrDefaultAsync(t => t.Id == trainScheduleId);

            if (schedule == null)
                return false;

            var train = await _db.Trains
                .FirstOrDefaultAsync(t => t.Id == schedule.TrainId);

            if (train == null)
                return false;

            var soldSeats = await _db.Tickets
                .CountAsync(t =>
                    t.TrainScheduleId == trainScheduleId &&
                    t.Status != "Cancelled");

            return soldSeats < train.TotalSeats;
        }

        public async Task<List<TicketResponse>> GetOccupiedTickets(int trainScheduleId)
        {
            var tickets = await _db.Tickets
                .Where(t => t.TrainScheduleId == trainScheduleId && t.Status != "Cancelled")
                .ToListAsync();

            return _mapper.Map<List<TicketResponse>>(tickets);
        }

        public async Task<List<int>> GetFreeSeats(int trainScheduleId)
        {
            var freeSeats = new List<int>();

            var schedule = await _db.TrainSchedules
                .FirstOrDefaultAsync(t => t.Id == trainScheduleId);

            if (schedule == null)
                return freeSeats;

            var train = await _db.Trains
                .FirstOrDefaultAsync(t => t.Id == schedule.TrainId);

            if (train == null)
                return freeSeats;

            var occupiedSeats = await _db.Tickets
                .Where(t => t.TrainScheduleId == trainScheduleId && t.Status != "Cancelled")
                .Select(t => t.SeatNumber)
                .ToListAsync();

            for (int seat = 1; seat <= train.TotalSeats; seat++)
            {
                if (!occupiedSeats.Contains(seat))
                    freeSeats.Add(seat);
            }

            return freeSeats;
        }
    }
}
