using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TrainPass.Trains.Dtos;
using TrainPass.Trains.Exceptions;
using TrainPass.Trains.Service;

namespace TrainPass.Trains.Controllers
{
    [ApiController]
    [Route("api/v1/trains")]
    public class ControllerTrain:ControllerBase
    {
        private readonly ICommandServiceTrain _command;
        private readonly IQueryServiceTrain _query;

        public ControllerTrain(ICommandServiceTrain command, IQueryServiceTrain query)
        {
            _command = command;
            _query = query;
        }

        [HttpGet("get")]
        [Authorize(Roles = "Admin,Customer")]
        public async Task<ActionResult<GetAllTrainsDto>> GetAllTrains()
        {
            try
            {
                var result = await _query.GetAllTrains();
                return Ok(result);
            }
            catch (TrainNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpPost("create")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<TrainResponse>> CreateTrain([FromBody] TrainRequest request)
        {
            var result = await _command.CreateTrain(request);
            return Ok(result);
        }
    }
}
