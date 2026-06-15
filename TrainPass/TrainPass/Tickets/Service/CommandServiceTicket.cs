using AutoMapper;
using TrainPass.Tickets.Dtos;
using TrainPass.Tickets.Exceptions;
using TrainPass.Tickets.Models;
using TrainPass.Tickets.Repository;

namespace TrainPass.Tickets.Service
{
    public class CommandServiceTicket : ICommandServiceTicket
    {
        private readonly IMapper _mapper;
        private readonly ITicketRepo _repo;

        public CommandServiceTicket(IMapper mapper, ITicketRepo repo)
        {
            _mapper = mapper;
            _repo = repo;
        }

        public async Task<TicketResponse> CreateTicket(TicketRequest request)
        {
            if (!await _repo.TrainScheduleExists(request.TrainScheduleId))
                throw new TrainScheduleNotFoundException();

            if (await _repo.SeatAlreadyTaken(request.TrainScheduleId, request.SeatNumber))
                throw new SeatAlreadyTakenException();

            if (!await _repo.HasAvailableSeats(request.TrainScheduleId))
                throw new NoAvailableSeatsException();

            var ticket = _mapper.Map<Ticket>(request);

            ticket.PurchaseDate = DateTime.Now;
            ticket.Status = "Active";

            var savedTicket = await _repo.CreateTicket(ticket);

            return _mapper.Map<TicketResponse>(savedTicket);
        }
    }
}
