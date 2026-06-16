using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Metadata;
using TrainPass.Stations.Dtos;
using TrainPass.Stations.Exceptions;
using TrainPass.Stations.Service;

namespace TrainPass.Stations.Controllers
{
    public class ControllerStation
    {
        [ApiController]
        [Route("api/v1/admin/stations")]
        public class StationController : ControllerBase
        {
            private readonly IQueryServiceStation _querry;
            private readonly ICommandServiceStation _command;
            
            public StationController(IQueryServiceStation querry, ICommandServiceStation command)
            {
                _querry = querry;
                _command = command;
            }

            [HttpGet("getStations")]
            [Authorize(Roles = "Customer, Admin")]
            public async Task<ActionResult<GetAllStationsDto>> GetAllStations()
            {
                try
                {
                    var stations = await _querry.GetAllStation();
                    return Ok(stations);
                }catch(StationNotFoundException ex)
                {
                    return BadRequest(ex.Message);
                }
            }

            [HttpPost("createStation")]
            [Authorize(Roles = "Admin")]
            public async Task<ActionResult<StationRequest>> CreateStation(StationRequest request)
            {
                try
                {
                    var station = await _command.CreateStation(request);
                    return Ok(station);
                }catch(StationAlreadyExistException ex)
                {
                    return BadRequest(ex.Message);
                }
            }

            
        }
    }
}
