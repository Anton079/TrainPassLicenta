using TrainPass.Customers.Dtos;

namespace TrainPass.Customers.Repository
{
    public interface ICustomerRepo
    {
        Task<GetAllCustomersDto> GetAllCustomers();
    }
}
