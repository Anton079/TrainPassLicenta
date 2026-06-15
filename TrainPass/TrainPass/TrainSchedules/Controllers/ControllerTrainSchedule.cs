using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TrainPass.TrainSchedules.Dtos;
using TrainPass.TrainSchedules.Exceptions;
using TrainPass.TrainSchedules.Service;

namespace TrainPass.TrainSchedules.Controllers
{
    [ApiController]
    [Route("api/v1/train-schedules")]
    public class ControllerTrainSchedule : ControllerBase
    {
        private readonly ICommandServiceTrainSchedule _command;
        private readonly IQueryServiceTrainSchedule _query;

        public ControllerTrainSchedule(ICommandServiceTrainSchedule command, IQueryServiceTrainSchedule query)
        {
            _command = command;
            _query = query;
        }

        [HttpGet("get")]
        [Authorize(Roles = "Admin,Customer")]
        public async Task<ActionResult<GetAllTrainSchedule>> AllTrainSchedule()
        {
            try
            {
                var trainSchedules = await _query.AllTrainSchedule();

                return Ok(trainSchedules);
            }
            catch (TrainScheduleNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpGet("search")]
        [Authorize(Roles = "Admin,Customer")]
        public async Task<ActionResult<GetAllTrainSchedule>> SearchTrainSchedules(
            [FromQuery] int departureStationId,
            [FromQuery] int arrivalStationId,
            [FromQuery] DateTime date)
        {
            try
            {
                var trainSchedules = await _query.SearchTrainSchedules(departureStationId, arrivalStationId, date);

                return Ok(trainSchedules);
            }
            catch (TrainScheduleNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpPost("create")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<TrainScheduleResponse>> CreateTrainSchedule([FromBody] TrainScheduleRequest request)
        {
            var trainSchedule = await _command.CreateTrainSchedule(request);

            return Ok(trainSchedule);
        }

        [HttpPut("update/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<TrainScheduleResponse>> UpdateTrainSchedule([FromRoute] int id, [FromBody] TrainScheduleRequest request)
        {
            try
            {
                var trainSchedule = await _command.UpdateTrainSchedule(id, request);

                return Ok(trainSchedule);
            }
            catch (TrainScheduleNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpDelete("delete/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeleteTrainSchedule([FromRoute] int id)
        {
            try
            {
                await _command.DeleteTrainSchedule(id);

                return Ok("Train schedule deleted.");
            }
            catch (TrainScheduleNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }
    }
}