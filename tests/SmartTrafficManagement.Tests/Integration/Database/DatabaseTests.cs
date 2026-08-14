using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using SmartTrafficManagement.Core.Entities;
using SmartTrafficManagement.Core.Enums;
using SmartTrafficManagement.Tests.Helpers;
using Xunit;

namespace SmartTrafficManagement.Tests.Integration.Database;

public class DatabaseTests : IDisposable
{
    private readonly SmartTrafficManagement.Infrastructure.Persistence.ApplicationDbContext _context;

    public DatabaseTests()
    {
        _context = TestDbContextFactory.CreateSqliteInMemory();
    }

    [Fact]
    public async Task Database_ShouldEnforceRequiredFields()
    {
        // Arrange
        var invalidReport = new TrafficReport
        {
            Description = null! // Description is required
        };

        // Act & Assert
        await _context.TrafficReports.AddAsync(invalidReport);
        Func<Task> saveAction = async () => await _context.SaveChangesAsync();
        await saveAction.Should().ThrowAsync<DbUpdateException>();
    }

    [Fact]
    public async Task Database_ShouldSaveAndRetrieveRelationships()
    {
        // Arrange
        var user = new ApplicationUser
        {
            Id = Guid.NewGuid().ToString(),
            UserName = "testdriver",
            Email = "testdriver@stms.com",
            FirstName = "Test",
            LastName = "Driver"
        };
        await _context.Users.AddAsync(user);

        var vehicle = new Vehicle
        {
            Id = Guid.NewGuid(),
            OwnerId = user.Id,
            Model = "Tesla Model 3",
            PlateNumber = "XYZ-789",
            Color = "White"
        };
        await _context.Vehicles.AddAsync(vehicle);

        var sosRequest = new ServiceRequest
        {
            Id = Guid.NewGuid(),
            ClientId = user.Id,
            VehicleId = vehicle.Id,
            ServiceType = ServiceType.Towing,
            Status = RequestStatus.Pending,
            Latitude = 30.0444m,
            Longitude = 31.2357m
        };
        await _context.ServiceRequests.AddAsync(sosRequest);
        await _context.SaveChangesAsync();

        // Act
        var savedRequest = await _context.ServiceRequests
            .Include(r => r.Client)
            .Include(r => r.Vehicle)
            .FirstOrDefaultAsync(r => r.Id == sosRequest.Id);

        // Assert
        savedRequest.Should().NotBeNull();
        savedRequest!.Client.Should().NotBeNull();
        savedRequest.Client!.FirstName.Should().Be("Test");
        savedRequest.Vehicle.Should().NotBeNull();
        savedRequest.Vehicle!.Model.Should().Be("Tesla Model 3");
    }

    [Fact]
    public void DatabaseModel_ShouldDefineExpectedIndexes()
    {
        // Act
        var model = _context.Model;
        var vehicleEntity = model.FindEntityType(typeof(Vehicle));
        var plateNumberIndex = vehicleEntity?.GetIndexes()
            .FirstOrDefault(i => i.Properties.Any(p => p.Name == nameof(Vehicle.PlateNumber)));

        // Assert
        vehicleEntity.Should().NotBeNull();
        plateNumberIndex.Should().NotBeNull();
        plateNumberIndex!.IsUnique.Should().BeTrue();
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }
}
