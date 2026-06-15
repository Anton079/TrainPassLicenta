using TrainPass.Tickets.Dtos;
using TrainPass.Tickets.Exceptions;
using TrainPass.Tickets.Repository;

namespace TrainPass.Tickets.Service
{
    public class QueryServiceTicket : IQueryServiceTicket
    {
        private readonly ITicketRepo _repo;

        public QueryServiceTicket(ITicketRepo repo)
        {
            _repo = repo;
        }

        public async Task<GetAllTicketsDto> GetAllTickets()
        {
            var tickets = await _repo.GetAllTickets();

            if (tickets == null || tickets.ticketList == null || !tickets.ticketList.Any())
            {
                throw new TicketNotFoundException();
            }

            return tickets;
        }

        public async Task<GetAllTicketsDto> GetMyTickets(string customerId)
        {
            var tickets = await _repo.GetMyTickets(customerId);

            if (tickets == null || tickets.ticketList == null || !tickets.ticketList.Any())
            {
                throw new TicketNotFoundException();
            }

            return tickets;
        }

        public async Task<SeatsInfoDto> GetSeatsInfo(int trainScheduleId, int numberOfSeats)
        {
            var seatsInfo = await _repo.GetSeatsInfo(trainScheduleId, numberOfSeats);

            if (seatsInfo == null)
            {
                throw new TrainScheduleNotFoundException();
            }

            return seatsInfo;
        }
    }
}