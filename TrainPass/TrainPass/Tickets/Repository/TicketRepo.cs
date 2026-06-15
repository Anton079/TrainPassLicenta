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
            var tickets = await _db.Tickets
                .OrderByDescending(ticket => ticket.Id)
                .ToListAsync();

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
                .OrderByDescending(ticket => ticket.Id)
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

        public async Task<GetAllTicketsDto> CreateTickets(List<Ticket> tickets)
        {
            await using var transaction = await _db.Database.BeginTransactionAsync();

            _db.Tickets.AddRange(tickets);
            await _db.SaveChangesAsync();
            await transaction.CommitAsync();

            var mappedTickets = _mapper.Map<List<TicketResponse>>(tickets);

            return new GetAllTicketsDto
            {
                ticketList = mappedTickets
            };
        }

        public async Task<bool> TrainScheduleExists(int trainScheduleId)
        {
            return await _db.TrainSchedules
                .AnyAsync(trainSchedule => trainSchedule.Id == trainScheduleId);
        }

        public async Task<bool> SeatAlreadyTaken(int trainScheduleId, int seatNumber)
        {
            return await _db.Tickets
                .AnyAsync(ticket =>
                    ticket.TrainScheduleId == trainScheduleId &&
                    ticket.SeatNumber == seatNumber &&
                    ticket.Status != "Cancelled");
        }

        public async Task<bool> HasAvailableSeats(int trainScheduleId)
        {
            var trainSchedule = await _db.TrainSchedules
                .FirstOrDefaultAsync(trainSchedule => trainSchedule.Id == trainScheduleId);

            if (trainSchedule == null)
            {
                return false;
            }

            var train = await _db.Trains
                .FirstOrDefaultAsync(train => train.Id == trainSchedule.TrainId);

            if (train == null)
            {
                return false;
            }

            var soldSeats = await _db.Tickets
                .CountAsync(ticket =>
                    ticket.TrainScheduleId == trainScheduleId &&
                    ticket.Status != "Cancelled");

            return soldSeats < train.TotalSeats;
        }

        public async Task<Ticket> GetTicketById(int ticketId)
        {
            return await _db.Tickets
                .FirstOrDefaultAsync(ticket => ticket.Id == ticketId);
        }

        public async Task<Ticket> UpdateTicket(Ticket ticket)
        {
            _db.Tickets.Update(ticket);
            await _db.SaveChangesAsync();
            return ticket;
        }

        public async Task<SeatsInfoDto?> GetSeatsInfo(int trainScheduleId, int numberOfSeats)
        {
            var trainSchedule = await _db.TrainSchedules
                .FirstOrDefaultAsync(trainSchedule => trainSchedule.Id == trainScheduleId);

            if (trainSchedule == null)
                return null;

            var train = await _db.Trains
                .FirstOrDefaultAsync(train => train.Id == trainSchedule.TrainId);

            if (train == null)
                return null;

            var occupiedSeats = await _db.Tickets
                .Where(ticket =>
                    ticket.TrainScheduleId == trainScheduleId &&
                    ticket.Status != "Cancelled")
                .Select(ticket => ticket.SeatNumber)
                .OrderBy(seat => seat)
                .ToListAsync();

            var availableSeats = Enumerable.Range(1, train.TotalSeats)
                .Where(seat => !occupiedSeats.Contains(seat))
                .ToList();

            var combinations = new List<SeatCombinationDto>();

            if (numberOfSeats < 1)
                numberOfSeats = 1;

            for (int i = 0; i <= availableSeats.Count - numberOfSeats; i++)
            {
                var group = availableSeats.Skip(i).Take(numberOfSeats).ToList();

                if (group.Count == numberOfSeats && IsAdjacent(group))
                {
                    combinations.Add(new SeatCombinationDto
                    {
                        Seats = group
                    });
                }
            }

            return new SeatsInfoDto
            {
                TrainScheduleId = trainScheduleId,
                TotalSeats = train.TotalSeats,
                OccupiedSeats = occupiedSeats,
                AvailableSeats = availableSeats,
                AdjacentCombinations = combinations
            };
        }

        private bool IsAdjacent(List<int> seats)
        {
            for (int i = 1; i < seats.Count; i++)
            {
                if (seats[i] != seats[i - 1] + 1)
                    return false;
            }

            return true;
        }
    }
}