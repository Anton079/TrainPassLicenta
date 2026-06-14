using FluentMigrator.Runner;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using TrainPass.Admins.Models;
using TrainPass.Auth.Services;
using TrainPass.Customers.Mappings;
using TrainPass.Customers.Repository;
using TrainPass.Customers.Services;
using TrainPass.Data;

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
            .ScanIn(typeof(Program).Assembly).For.Migrations();
    })
    .AddLogging(logging =>
    {
        logging.AddFluentMigratorConsole();
    });

builder.Services.AddScoped<IQueryServiceCustomer, QueryServiceCustomer>();
builder.Services.AddScoped<ICustomerRepo, CustomerRepo>();

builder.Services.AddScoped<JwtService>();

builder.Services.AddAutoMapper(typeof(MappingProfileCustomer));

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
        )
    };
});

builder.Services.AddAuthorization();

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

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();