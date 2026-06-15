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

        public async Task<bool> TrainScheduleExists(string trainScheduleId)
        {
            return await _db.TrainSchedules
                .AnyAsync(t => t.Id == trainScheduleId);
        }
    }
}
