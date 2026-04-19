using SmartTrafficManagement.API.Middlewares;
using SmartTrafficManagement.Application;
using SmartTrafficManagement.Infrastructure;
using SmartTrafficManagement.Infrastructure.Persistence.Seeding;
using SmartTrafficManagement.Infrastructure.Realtime;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddSignalR();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        var allowedOrigins = builder.Configuration
            .GetSection("Cors:AllowedOrigins")
            .Get<string[]>()
            ?? [ "http://localhost:3000", "http://localhost:5173", "http://localhost:4200" ];

        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "SmartTrafficManagement API",
        Version = "v1"
    });

    var bearerScheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Description = "Enter JWT Bearer token only. Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Reference = new OpenApiReference
        {
            Type = ReferenceType.SecurityScheme,
            Id = "Bearer"
        }
    };

    options.AddSecurityDefinition("Bearer", bearerScheme);
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            bearerScheme,
            Array.Empty<string>()
        }
    });
});

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

var app = builder.Build();

// Run database seeding in background so Swagger loads immediately
_ = Task.Run(async () =>
{
    await Task.Delay(500); // wait for app to fully start
    await using var scope = app.Services.CreateAsyncScope();
    var databaseSeeder = scope.ServiceProvider.GetRequiredService<IDatabaseSeeder>();
    await databaseSeeder.SeedAsync(app.Lifetime.ApplicationStopping);
});

app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "SmartTrafficManagement API v1");
    options.RoutePrefix = "swagger";
});

// Redirect root URL to Swagger UI
app.MapGet("/", () => Results.Redirect("/swagger"));

app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseCors("AllowFrontend");
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHub<TrafficHub>("/hubs/traffic")
   .RequireCors("AllowFrontend");

app.Run();
