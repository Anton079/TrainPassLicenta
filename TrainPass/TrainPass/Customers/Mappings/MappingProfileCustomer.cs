using AutoMapper;
using TrainPass.Customers.Dtos;
using TrainPass.Customers.Models;

namespace TrainPass.Customers.Mappings
{
    public class MappingProfileCustomer:Profile
    {
        public MappingProfileCustomer()
        {
            CreateMap<CustomerRequest, Customer>();
            CreateMap<Customer, CustomerResponse>();
            CreateMap<CustomerRequest, CustomerResponse>();
            CreateMap<CustomerResponse, CustomerRequest>();
        }
    }
}
