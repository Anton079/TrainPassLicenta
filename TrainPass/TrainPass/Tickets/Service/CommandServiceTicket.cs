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

        public async Task<GetAllTicketsDto> CreateTickets(BuyTicketsRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.CustomerId))
                throw new Exception("Clientul nu este valid.");

            if (!await _repo.TrainScheduleExists(request.TrainScheduleId))
                throw new TrainScheduleNotFoundException();

            if (request.SeatNumbers == null || request.SeatNumbers.Count == 0)
                throw new Exception("Alege cel puțin un loc.");

            var seats = request.SeatNumbers
                .Distinct()
                .OrderBy(seat => seat)
                .ToList();

            var seatsInfo = await _repo.GetSeatsInfo(request.TrainScheduleId, seats.Count);

            if (seatsInfo == null)
                throw new TrainScheduleNotFoundException();

            foreach (var seat in seats)
            {
                if (!seatsInfo.AvailableSeats.Contains(seat))
                    throw new SeatAlreadyTakenException();
            }

            var tickets = seats.Select(seat => new Ticket
            {
                CustomerId = request.CustomerId,
                TrainScheduleId = request.TrainScheduleId,
                SeatNumber = seat,
                PurchaseDate = DateTime.Now,
                Status = "Active"
            }).ToList();

            var savedTickets = await _repo.CreateTickets(tickets);

            var mappedTickets = _mapper.Map<List<TicketResponse>>(savedTickets);

            return new GetAllTicketsDto
            {
                ticketList = mappedTickets
            };
        }

        public async Task<TicketResponse> CancelTicket(int ticketId)
        {
            var ticket = await _repo.GetTicketById(ticketId);

            if (ticket == null)
                throw new TicketNotFoundException();

            ticket.Status = "Cancelled";

            var updatedTicket = await _repo.UpdateTicket(ticket);

            return _mapper.Map<TicketResponse>(updatedTicket);
        }
    }
}