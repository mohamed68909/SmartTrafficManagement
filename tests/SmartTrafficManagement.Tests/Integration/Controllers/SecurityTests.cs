using System.Net;
using System.Net.Http.Headers;
using FluentAssertions;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using SmartTrafficManagement.Core.Constants;
using SmartTrafficManagement.Core.Entities;
using SmartTrafficManagement.Core.Interfaces;
using SmartTrafficManagement.Infrastructure.Persistence;
using SmartTrafficManagement.Tests.Helpers;
using Xunit;

namespace SmartTrafficManagement.Tests.Integration.Controllers;

public class SecurityTests : IClassFixture<CustomWebApplicationFactory<Program>>
{
    private readonly CustomWebApplicationFactory<Program> _factory;

    public SecurityTests(CustomWebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task AnonymousUser_AttemptingToAccessProtectedEndpoint_ReturnsUnauthorized()
    {
        // Arrange
        var client = _factory.CreateClient();

        // Act
        var response = await client.GetAsync("/api/garage");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task AuthenticatedUser_WithWrongRole_ReturnsForbidden()
    {
        // Arrange
        var client = _factory.CreateClient();
        var token = await GenerateTestJwtToken("user-id", "testuser@stms.com", AppRoles.Provider); // Provider role instead of Client
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await client.GetAsync("/api/garage");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task AuthenticatedUser_AccessingOwnVehicle_ReturnsOk()
    {
        // Arrange
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var user = new ApplicationUser
        {
            Id = Guid.NewGuid().ToString(),
            UserName = "client1",
            Email = "client1@stms.com"
        };
        await db.Users.AddAsync(user);

        var vehicle = new Vehicle
        {
            Id = Guid.NewGuid(),
            OwnerId = user.Id,
            Model = "Model S",
            PlateNumber = "PLATE-123",
            Color = "Red"
        };
        await db.Vehicles.AddAsync(vehicle);
        await db.SaveChangesAsync();

        var client = _factory.CreateClient();
        var token = await GenerateTestJwtToken(user.Id, user.Email, AppRoles.Client);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await client.GetAsync($"/api/garage/{vehicle.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task AuthenticatedUser_AccessingOtherUsersVehicle_ReturnsNotFoundForBOLA()
    {
        // Arrange
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        // Owner User
        var owner = new ApplicationUser { Id = Guid.NewGuid().ToString(), UserName = "owner", Email = "owner@stms.com" };
        await db.Users.AddAsync(owner);

        // Attacker User
        var attacker = new ApplicationUser { Id = Guid.NewGuid().ToString(), UserName = "attacker", Email = "attacker@stms.com" };
        await db.Users.AddAsync(attacker);

        var vehicle = new Vehicle
        {
            Id = Guid.NewGuid(),
            OwnerId = owner.Id,
            Model = "Model X",
            PlateNumber = "PLATE-999",
            Color = "Black"
        };
        await db.Vehicles.AddAsync(vehicle);
        await db.SaveChangesAsync();

        var client = _factory.CreateClient();
        var token = await GenerateTestJwtToken(attacker.Id, attacker.Email, AppRoles.Client);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act - Attacker requests owner's vehicle
        var response = await client.GetAsync($"/api/garage/{vehicle.Id}");

        // Assert - API returns NotFound (404) to prevent resource disclosure (BOLA/IDOR protection)
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    private async Task<string> GenerateTestJwtToken(string userId, string email, string role)
    {
        using var scope = _factory.Services.CreateScope();
        var jwtService = scope.ServiceProvider.GetRequiredService<IJwtTokenService>();
        var user = new ApplicationUser { Id = userId, Email = email };
        return jwtService.GenerateAccessToken(user, new[] { role });
    }
}
