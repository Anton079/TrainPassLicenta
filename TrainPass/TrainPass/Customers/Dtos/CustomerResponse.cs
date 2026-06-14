namespace TrainPass.Customers.Dtos
{
    public class CustomerResponse
    {
        public string Id { get; set; } = string.Empty;

        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string? Role { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}