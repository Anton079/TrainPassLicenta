using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TrainPass.Tickets.Dtos;
using TrainPass.Tickets.Exceptions;
using TrainPass.Tickets.Service;

namespace TrainPass.Tickets.Controllers
{
    [ApiController]
    [Route("api/v1/tickets")]
    public class ControllerTicket : ControllerBase
    {
        private readonly IQueryServiceTicket _query;
        private readonly ICommandServiceTicket _command;

        public ControllerTicket(IQueryServiceTicket query, ICommandServiceTicket command)
        {
            _query = query;
            _command = command;
        }

        [HttpGet("allTickets")]
        [Authorize(Roles = "Customer, Admin")]
        public async Task<ActionResult<GetAllTicketsDto>> GetAllTickets()
        {
            try
            {
                var tickets = await _query.GetAllTickets();
                return Ok(tickets);
            }catch(TicketNotFoundException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("buyTicket")]
        [Authorize(Roles = "Customer")]
        public async Task<ActionResult<TicketResponse>> BuyTicket([FromBody] TicketRequest request)
        {
            try
            {
                var response = await _command.CreateTicket(request);
                return Ok(response);
            }
            catch (TrainScheduleNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (SeatAlreadyTakenException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (NoAvailableSeatsException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
