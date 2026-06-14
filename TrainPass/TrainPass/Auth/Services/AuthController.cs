using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TrainPass.Auth.Dtos;
using TrainPass.Auth.Services;
using TrainPass.Customers.Models;
using TrainPass.Data;

namespace TrainPass.Auth.Controllers
{
    [ApiController]
    [Route("api/v1/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly JwtService _jwtService;

        public AuthController(AppDbContext context, JwtService jwtService)
        {
            _context = context;
            _jwtService = jwtService;
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.FirstName))
            {
                return BadRequest("First name is required.");
            }

            if (string.IsNullOrWhiteSpace(request.LastName))
            {
                return BadRequest("Last name is required.");
            }

            if (string.IsNullOrWhiteSpace(request.Email))
            {
                return BadRequest("Email is required.");
            }

            if (string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest("Password is required.");
            }

            var existingCustomer = await _context.Customers
                .FirstOrDefaultAsync(customer => customer.Email == request.Email);

            if (existingCustomer != null)
            {
                return BadRequest("Email is already used.");
            }

            PasswordHasher.CreatePasswordHash(
                request.Password,
                out string passwordHash,
                out string passwordSalt
            );

            var customer = new Customer
            {
                Id = Guid.NewGuid().ToString(),
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                Role = "Customer",
                PasswordHash = passwordHash,
                PasswordSalt = passwordSalt,
                CreatedAt = DateTime.UtcNow
            };

            _context.Customers.Add(customer);

            await _context.SaveChangesAsync();

            var token = _jwtService.GenerateCustomerToken(customer);

            return Ok(new AuthResponse
            {
                Id = customer.Id,
                FirstName = customer.FirstName,
                LastName = customer.LastName,
                Email = customer.Email,
                Role = "Customer",
                Token = token
            });
        }

        [HttpPost("login-customer")]
        public async Task<ActionResult<AuthResponse>> LoginCustomer(LoginRequest request)
        {
            var customer = await _context.Customers
                .FirstOrDefaultAsync(customer => customer.Email == request.Email);

            if (customer == null)
            {
                return BadRequest("Invalid email or password.");
            }

            if (string.IsNullOrWhiteSpace(customer.PasswordHash) ||
                string.IsNullOrWhiteSpace(customer.PasswordSalt))
            {
                return BadRequest("Invalid email or password.");
            }

            var passwordIsValid = PasswordHasher.VerifyPassword(
                request.Password,
                customer.PasswordHash,
                customer.PasswordSalt
            );

            if (!passwordIsValid)
            {
                return BadRequest("Invalid email or password.");
            }

            var token = _jwtService.GenerateCustomerToken(customer);

            return Ok(new AuthResponse
            {
                Id = customer.Id,
                FirstName = customer.FirstName,
                LastName = customer.LastName,
                Email = customer.Email,
                Role = "Customer",
                Token = token
            });
        }

        [HttpPost("login-admin")]
        public async Task<ActionResult<AuthResponse>> LoginAdmin(LoginRequest request)
        {
            var admin = await _context.Admins
                .FirstOrDefaultAsync(admin => admin.Email == request.Email);

            if (admin == null)
            {
                return BadRequest("Invalid email or password.");
            }

            if (string.IsNullOrWhiteSpace(admin.PasswordHash) ||
                string.IsNullOrWhiteSpace(admin.PasswordSalt))
            {
                return BadRequest("Invalid email or password.");
            }

            var passwordIsValid = PasswordHasher.VerifyPassword(
                request.Password,
                admin.PasswordHash,
                admin.PasswordSalt
            );

            if (!passwordIsValid)
            {
                return BadRequest("Invalid email or password.");
            }

            var token = _jwtService.GenerateAdminToken(admin);

            return Ok(new AuthResponse
            {
                Id = admin.Id,
                FirstName = admin.FirstName,
                LastName = admin.LastName,
                Email = admin.Email,
                Role = "Admin",
                Token = token
            });
        }
    }
}