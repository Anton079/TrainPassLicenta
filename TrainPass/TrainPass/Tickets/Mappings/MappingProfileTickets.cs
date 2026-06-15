using AutoMapper;
using TrainPass.Tickets.Dtos;
using TrainPass.Tickets.Models;

namespace TrainPass.Tickets.Mappings
{
    public class MappingProfileTickets:Profile
    {
        public MappingProfileTickets()
        {
            CreateMap<TicketRequest, Ticket>();
            CreateMap<Ticket, TicketResponse>();
        }
    }
}
