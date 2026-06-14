using TrainPass.Customers.Dtos;
using TrainPass.Customers.Repository;
using TrainPass.Customers.Exceptions;

namespace TrainPass.Customers.Services
{
    public class QueryServiceCustomer:IQueryServiceCustomer
    {
        private readonly ICustomerRepo _repo;

        public QueryServiceCustomer(ICustomerRepo repo)
        {
            _repo = repo;
        }

        public async Task<GetAllCustomersDto> GetAllCustomersAsync()
        {
            GetAllCustomersDto response = await _repo.GetAllCustomers();

            if(response != null)
            {
                return response;
            }
            throw new CustomerNotFoundException();
        }
    }
}
