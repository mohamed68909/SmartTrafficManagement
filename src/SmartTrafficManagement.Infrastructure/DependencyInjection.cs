using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using SmartTrafficManagement.Core.Modules.Garage.Domain.Interfaces;
using SmartTrafficManagement.Core.Modules.Traffic.Domain.Interfaces;
using SmartTrafficManagement.Infrastructure.Modules.Garage.Infrastructure.Persistence.Repositories;
using SmartTrafficManagement.Infrastructure.Modules.Traffic.Infrastructure.Persistence.Repositories;
using SmartTrafficManagement.Infrastructure.Persistence.Seeding;
using SmartTrafficManagement.Infrastructure.Persistence.Repositories;
using SmartTrafficManagement.Infrastructure.Services;
using Stripe;

namespace SmartTrafficManagement.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("DefaultConnection is not configured.");

        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(
                connectionString,
                sqlServerOptions => sqlServerOptions.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)));

        services.AddIdentity<ApplicationUser, IdentityRole>()
            .AddEntityFrameworkStores<ApplicationDbContext>()
            .AddDefaultTokenProviders();

        var jwtKey = configuration["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key is not configured.");
        var issuer = configuration["Jwt:Issuer"] ?? "SmartTrafficManagement";
        var audience = configuration["Jwt:Audience"] ?? "SmartTrafficManagementClient";

        services.AddAuthentication(options =>
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
                    ValidateIssuerSigningKey = true,
                    ValidateLifetime = true,
                    ValidIssuer = issuer,
                    ValidAudience = audience,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
                };
                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var accessToken = context.Request.Query["access_token"];
                        var path = context.HttpContext.Request.Path;
                        if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                        {
                            context.Token = accessToken;
                        }
                        return Task.CompletedTask;
                    }
                };
            });

        services.AddAuthorization();

        services.AddOptions<SeedOptions>()
            .Bind(configuration.GetSection(SeedOptions.SectionName));
        services.AddScoped<IDatabaseSeeder, DatabaseSeeder>();
        services.AddScoped<IDataSeeder, IdentitySeeder>();
        services.AddScoped<IDataSeeder, ApplicationDataSeeder>();
        services.AddScoped<IDataSeeder, BulkDataSeeder>();

        StripeConfiguration.ApiKey = configuration["Stripe:SecretKey"];
        services.AddScoped<PaymentIntentService>();
        services.AddScoped<IPaymentService, PaymentService>();
        services.AddScoped<IPaymentManagementService, PaymentManagementService>();
        services.AddScoped<INotificationService, NotificationService>();

        services.AddHttpClient("GoogleMaps", client =>
        {
            client.DefaultRequestHeaders.Add("Accept", "application/json");
            client.Timeout = TimeSpan.FromSeconds(10);
        });
        services.AddScoped<IMapSearchService, MapSearchService>();

        services.AddHttpClient("OpenWeather", client =>
        {
            client.DefaultRequestHeaders.Add("Accept", "application/json");
            client.Timeout = TimeSpan.FromSeconds(10);
        });
        services.AddScoped<IWeatherService, WeatherService>();
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IAuthRepository, AuthRepository>();
        services.AddScoped<IGarageRepository, GarageRepository>();
        services.AddScoped<ITrafficIncidentRepository, TrafficIncidentRepository>();
        services.AddScoped<IServiceRequestRepository, ServiceRequestRepository>();
        services.AddScoped<IStoreRepository, StoreRepository>();
        services.AddScoped<ITrafficIntelligenceRepository, TrafficIntelligenceRepository>();
        services.AddScoped<ITrafficModuleRepository, TrafficModuleRepository>();
        services.AddScoped<ISupportRepository, SupportRepository>();
        services.AddScoped<IGoogleTokenVerifier, GoogleTokenVerifier>();

        return services;
    }
}
