using FluentMigrator.Runner;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Security.Claims;
using System.Text;
using TrainPass.Admins.Models;
using TrainPass.Auth.Services;
using TrainPass.Customers.Mappings;
using TrainPass.Customers.Repository;
using TrainPass.Customers.Services;
using TrainPass.Data;
using TrainPass.Stations.Repository;
using TrainPass.Stations.Service;
using TrainPass.Tickets.Mappings;
using TrainPass.Tickets.Repository;
using TrainPass.Tickets.Service;
using TrainPass.Trains.Mappings;
using TrainPass.Trains.Repository;
using TrainPass.Trains.Service;
using TrainPass.TrainSchedules.Mappings;
using TrainPass.TrainSchedules.Repository;
using TrainPass.TrainSchedules.Service;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("Default");

if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new Exception("Connection string is missing.");
}

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter your JWT token."
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new List<string>()
        }
    });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseMySql(
        connectionString,
        ServerVersion.AutoDetect(connectionString)
    );
});

builder.Services.AddFluentMigratorCore()
    .ConfigureRunner(runner =>
    {
        runner.AddMySql5()
            .WithGlobalConnectionString(connectionString)
            .ScanIn(typeof(Program).Assembly)
            .For.Migrations();
    })
    .AddLogging(logging =>
    {
        logging.AddFluentMigratorConsole();
    });

builder.Services.AddScoped<ICustomerRepo, CustomerRepo>();
builder.Services.AddScoped<IQueryServiceCustomer, QueryServiceCustomer>();

builder.Services.AddScoped<ITicketRepo, TicketRepo>();
builder.Services.AddScoped<ICommandServiceTicket, CommandServiceTicket>();
builder.Services.AddScoped<IQueryServiceTicket, QueryServiceTicket>();

builder.Services.AddScoped<ITrainRepo, TrainRepo>();
builder.Services.AddScoped<ICommandServiceTrain, CommandServiceTrain>();
builder.Services.AddScoped<IQueryServiceTrain, QueryServiceTrain>();

builder.Services.AddScoped<ITrainScheduleRepo, TrainScheduleRepo>();
builder.Services.AddScoped<ICommandServiceTrainSchedule, CommandServiceTrainSchedule>();
builder.Services.AddScoped<IQueryServiceTrainSchedule, QueryServiceTrainSchedule>();

builder.Services.AddScoped<IStationRepo, StationRepo>();
builder.Services.AddScoped<ICommandServiceStation, CommandServiceStation>();
builder.Services.AddScoped<IQueryServiceStation, QueryServiceStation>();

builder.Services.AddScoped<JwtService>();

builder.Services.AddAutoMapper(
    typeof(MappingProfileCustomer),
    typeof(MappingProfileTickets),
    typeof(MappingProfileTrain),
    typeof(MappingProfileTrainSchedule)
);

var jwtKey = builder.Configuration["Jwt:Key"];

if (string.IsNullOrWhiteSpace(jwtKey))
{
    throw new Exception("JWT key is missing.");
}

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,

        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],

        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtKey)
        ),

        RoleClaimType = ClaimTypes.Role,
        NameClaimType = ClaimTypes.Email
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("Customer", policy =>
        policy.RequireRole("Customer"));

    options.AddPolicy("Admin", policy =>
        policy.RequireRole("Admin"));

    options.AddPolicy("CustomerOrAdmin", policy =>
        policy.RequireRole("Customer", "Admin"));
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var migrationRunner = scope.ServiceProvider.GetRequiredService<IMigrationRunner>();

    migrationRunner.MigrateUp();

    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    var adminExists = await context.Admins
        .AnyAsync(admin => admin.Email == "admin@trainpass.com");

    if (!adminExists)
    {
        PasswordHasher.CreatePasswordHash(
            "admin123",
            out string passwordHash,
            out string passwordSalt
        );

        var admin = new Admin
        {
            Id = Guid.NewGuid().ToString(),
            FirstName = "Admin",
            LastName = "TrainPass",
            Email = "admin@trainpass.com",
            PasswordHash = passwordHash,
            PasswordSalt = passwordSalt,
            CreatedAt = DateTime.UtcNow
        };

        context.Admins.Add(admin);

        await context.SaveChangesAsync();
    }
}

app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();