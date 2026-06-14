using TrainPass.Customers.Models;

namespace TrainPass.Auth.Services
{
    public interface IJwtService
    {
        string GenerateToken(Customer customer);
    }
}