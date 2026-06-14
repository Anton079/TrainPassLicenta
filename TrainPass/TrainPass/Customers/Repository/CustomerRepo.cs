using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TrainPass.Customers.Dtos;
using TrainPass.Data;

namespace TrainPass.Customers.Repository
{
    public class CustomerRepo:ICustomerRepo
    {
        private readonly IMapper _mapper;
        private readonly AppDbContext _context;

        public CustomerRepo(IMapper mapper, AppDbContext context)
        {
            _mapper = mapper;
            _context = context;
        }

        public async Task<GetAllCustomersDto> GetAllCustomers()
        {
            var customers = await _context.Customers.ToListAsync();
            var map = _mapper.Map<List<CustomerResponse>>(customers);

            return new GetAllCustomersDto
            {
                customerList = map
            };
        }

        
    }
}
