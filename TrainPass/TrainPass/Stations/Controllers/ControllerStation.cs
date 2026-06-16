using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TrainPass.Stations.Dtos;
using TrainPass.Stations.Exceptions;
using TrainPass.Stations.Service;

namespace TrainPass.Stations.Controllers
{
    [ApiController]
    [Route("api/v1/admin/stations")]
    public class StationController : ControllerBase
    {
        private readonly IQueryServiceStation _query;
        private readonly ICommandServiceStation _command;

        public StationController(IQueryServiceStation query, ICommandServiceStation command)
        {
            _query = query;
            _command = command;
        }

        [HttpGet("getStations")]
        [Authorize(Roles = "Admin,Customer")]
        public async Task<ActionResult<GetAllStationsDto>> GetAllStations()
        {
            try
            {
                var stations = await _query.GetAllStation();
                return Ok(stations);
            }
            catch (StationNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpPost("createStation")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<StationResponse>> CreateStation([FromBody] StationRequest request)
        {
            try
            {
                var station = await _command.CreateStation(request);
                return Ok(station);
            }
            catch (StationAlreadyExistException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}