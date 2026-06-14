using Microsoft.EntityFrameworkCore;
using TrainPass.Admins.Models;
using TrainPass.Customers.Models;
using TrainPass.Stations.Models;
using TrainPass.Tickets.Models;
using TrainPass.Trains.Models;
using TrainPass.TrainSchedules.Models;

namespace TrainPass.Data
{
    public class AppDbContext:DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { 
        }

        public DbSet<Customer> Customers { get; set; }
        public DbSet<Admin> Admins { get; set; }
        public DbSet<Station> Stations { get; set; }
        public DbSet<Train> Trains { get; set; }
        public DbSet<TrainSchedule> TrainSchedules { get; set; }
        public DbSet<Ticket> Tickets { get; set; }
    }
}
