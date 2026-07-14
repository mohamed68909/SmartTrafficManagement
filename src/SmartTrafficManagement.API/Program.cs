using System.Text.Json.Serialization;
using SmartTrafficManagement.API.Middlewares;
using Microsoft.EntityFrameworkCore;
using SmartTrafficManagement.Application;
using SmartTrafficManagement.Infrastructure;
using SmartTrafficManagement.Infrastructure.Persistence.Seeding;
using SmartTrafficManagement.Infrastructure.Seeding;
using SmartTrafficManagement.Infrastructure.Realtime;
using Microsoft.OpenApi.Models;


var builder = WebApplication.CreateBuilder(args);

// Ensure wwwroot exists for file uploads and static files
var wwwrootPath = Path.Combine(builder.Environment.ContentRootPath, "wwwroot");
if (!Directory.Exists(wwwrootPath))
{
    Directory.CreateDirectory(wwwrootPath);
}

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });
builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 30 * 1024 * 1024; // 30 MB max form body
});
builder.Services.AddSignalR();
builder.Services.AddCors(options =>
{
    // ── Web browsers & SignalR (requires explicit origins + credentials) ──
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

    // ── Mobile apps & REST clients (Flutter, Postman, native apps) ────────
    // Since native clients do not enforce CORS, this policy is for general API access.
    // AllowCredentials() is removed to prevent insecure configuration with wildcard origins.
    options.AddPolicy("AllowAll", policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
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

using (var scope = app.Services.CreateScope())
{
    var databaseSeeder = scope.ServiceProvider.GetRequiredService<IDatabaseSeeder>();
    await databaseSeeder.SeedAsync(CancellationToken.None);

    // Seed Expert System decision tree (idempotent — skips if already seeded)
    await DiagnosticsSeeder.SeedAsync(scope.ServiceProvider);
}

app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "SmartTrafficManagement API v1");
    options.RoutePrefix = "swagger";
});

// Redirect root URL to Swagger UI
app.MapGet("/", () => Results.Redirect("/swagger"));

app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseStaticFiles();   // serves wwwroot (including /uploads/*)
app.UseHttpsRedirection();
// AllowAll  → all REST controllers (mobile + web + Postman)
// AllowFrontend → SignalR hub only (needs credential-aware CORS)
app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers(); // Apply to all endpoints
app.MapHub<TrafficHub>("/hubs/traffic")
   .RequireCors("AllowFrontend");

app.Run();
