using AutoMapper;
using TrainPass.Customers.Dtos;
using TrainPass.Data;

namespace TrainPass.Admins.Repository
{
    public class AdminRepo : IAdminRepo
    {
        private readonly IMapper _mapper;
        private readonly AppDbContext _db;

        public AdminRepo(IMapper mapper, AppDbContext db)
        {
            _mapper = mapper;
            _db = db;
        }

    }
}
