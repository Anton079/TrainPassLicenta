using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
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
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<GetAllTicketsDto>> GetAllTickets()
        {
            try
            {
                var tickets = await _query.GetAllTickets();

                return Ok(tickets);
            }
            catch (TicketNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpGet("my-tickets")]
        [Authorize(Roles = "Customer")]
        public async Task<ActionResult<GetAllTicketsDto>> GetMyTickets()
        {
            try
            {
                var customerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrWhiteSpace(customerId))
                {
                    return Unauthorized();
                }

                var tickets = await _query.GetMyTickets(customerId);

                return Ok(tickets);
            }
            catch (TicketNotFoundException ex)
            {
                return NotFound(ex.Message);
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

        [HttpPut("cancelTicket/{ticketId}")]
        [Authorize(Roles = "Customer")]
        public async Task<ActionResult<TicketResponse>> CancelTicket(int ticketId)
        {
            try
            {
                var response = await _command.CancelTicket(ticketId);
                return Ok(response);
            }
            catch (TicketNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }
    }
}