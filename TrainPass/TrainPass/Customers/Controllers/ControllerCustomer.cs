using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TrainPass.Customers.Exceptions;
using TrainPass.Customers.Models;
using TrainPass.Customers.Services;

namespace TrainPass.Customers.Controllers
{
    [ApiController]
    [Route("api/v1/customers")]
    public class ControllerCustomer : ControllerBase
    {
        private IQueryServiceCustomer _query;

        public ControllerCustomer(IQueryServiceCustomer query)
        {
            _query = query;
        }

        [HttpGet("allCustomers")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<List<Customer>>> GetCustomers()
        {
            try
            {
                var customer = await _query.GetAllCustomersAsync();

                return Ok(customer);
            }catch(CustomerNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }
    }
}
