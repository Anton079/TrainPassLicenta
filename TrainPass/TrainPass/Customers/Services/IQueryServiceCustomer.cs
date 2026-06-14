using TrainPass.Customers.Dtos;

namespace TrainPass.Customers.Services
{
    public interface IQueryServiceCustomer
    {
        Task<GetAllCustomersDto> GetAllCustomersAsync();
    }
}
