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
            if (string.IsNullOrWhiteSpace(request.CustomerId))
            {
                throw new Exception("Clientul nu este valid.");
            }

            if (!await _repo.TrainScheduleExists(request.TrainScheduleId))
            {
                throw new TrainScheduleNotFoundException();
            }

            if (await _repo.SeatAlreadyTaken(request.TrainScheduleId, request.SeatNumber))
            {
                throw new SeatAlreadyTakenException();
            }

            if (!await _repo.HasAvailableSeats(request.TrainScheduleId))
            {
                throw new NoAvailableSeatsException();
            }

            var ticket = _mapper.Map<Ticket>(request);
            ticket.CustomerId = request.CustomerId;
            ticket.PurchaseDate = DateTime.Now;
            ticket.Status = "Active";

            var savedTicket = await _repo.CreateTicket(ticket);

            return _mapper.Map<TicketResponse>(savedTicket);
        }

        public async Task<GetAllTicketsDto> CreateTickets(BuyTicketsRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.CustomerId))
            {
                throw new Exception("Clientul nu este valid.");
            }

            if (!await _repo.TrainScheduleExists(request.TrainScheduleId))
            {
                throw new TrainScheduleNotFoundException();
            }

            if (request.SeatNumbers == null || request.SeatNumbers.Count == 0)
            {
                throw new Exception("Alege cel puțin un loc.");
            }

            var seats = request.SeatNumbers
                .Distinct()
                .OrderBy(seat => seat)
                .ToList();

            var seatsInfo = await _repo.GetSeatsInfo(request.TrainScheduleId, seats.Count);

            if (seatsInfo == null)
            {
                throw new TrainScheduleNotFoundException();
            }

            foreach (var seat in seats)
            {
                if (!seatsInfo.AvailableSeats.Contains(seat))
                {
                    throw new SeatAlreadyTakenException();
                }
            }

            var tickets = seats.Select(seat => new Ticket
            {
                CustomerId = request.CustomerId,
                TrainScheduleId = request.TrainScheduleId,
                SeatNumber = seat,
                PurchaseDate = DateTime.Now,
                Status = "Active"
            }).ToList();

            return await _repo.CreateTickets(tickets);
        }

        public async Task<TicketResponse> CancelTicket(int ticketId)
        {
            var ticket = await _repo.GetTicketById(ticketId);

            if (ticket == null)
            {
                throw new TicketNotFoundException();
            }

            ticket.Status = "Cancelled";

            var updatedTicket = await _repo.UpdateTicket(ticket);

            return _mapper.Map<TicketResponse>(updatedTicket);
        }
    }
}