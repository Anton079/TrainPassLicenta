using AutoMapper;
using TrainPass.Tickets.Dtos;
using TrainPass.Tickets.Exceptions;
using TrainPass.Tickets.Repository;

namespace TrainPass.Tickets.Service
{
    public class QueryServiceTicket : IQueryServiceTicket
    {
        private readonly IMapper _mapper;
        private readonly ITicketRepo _repo;

        public QueryServiceTicket(IMapper mapper, ITicketRepo repo)
        {
            _mapper = mapper;
            _repo = repo;
        }

        public async Task<GetAllTicketsDto> GetAllTickets()
        {
            GetAllTicketsDto ticket = await _repo.GetAllTickets();

            if (ticket == null)
                throw new TicketNotFoundException();

            return ticket;

        }
    }
}
