using AutoMapper;
using FluentAssertions;
using FluentValidation;
using FluentValidation.Results;
using Moq;
using SmartTrafficManagement.Application.DTOs;
using SmartTrafficManagement.Application.Features.Sos.RequestSos;
using SmartTrafficManagement.Core.Entities;
using SmartTrafficManagement.Core.Enums;
using SmartTrafficManagement.Core.Interfaces;
using Xunit;

namespace SmartTrafficManagement.Tests.Unit.Application.SOS;

public class RequestSosCommandHandlerTests
{
    private readonly Mock<IServiceRequestRepository> _repoMock = new();
    private readonly Mock<IValidator<RequestSosCommand>> _validatorMock = new();
    private readonly Mock<IMapper> _mapperMock = new();
    private readonly RequestSosCommandHandler _handler;

    public RequestSosCommandHandlerTests()
    {
        _handler = new RequestSosCommandHandler(
            _repoMock.Object,
            _validatorMock.Object,
            _mapperMock.Object);
    }

    [Fact]
    public async Task HandleAsync_WithEmptyClientId_ReturnsUnauthorized()
    {
        // Act
        var result = await _handler.HandleAsync("", new RequestSosCommand());

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(401);
        result.Error!.Code.Should().Be("Common.Unauthorized");
    }

    [Fact]
    public async Task HandleAsync_WithInvalidRequest_ReturnsValidationError()
    {
        // Arrange
        var command = new RequestSosCommand();
        var validationFailure = new ValidationResult(new[] { new ValidationFailure("Lat", "Invalid latitude") });
        _validatorMock.Setup(v => v.ValidateAsync(command, It.IsAny<CancellationToken>()))
            .ReturnsAsync(validationFailure);

        // Act
        var result = await _handler.HandleAsync("client-id", command);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(400);
        result.Error!.Code.Should().Be("Common.Validation");
        result.Error.Message.Should().Contain("Invalid latitude");
    }

    [Fact]
    public async Task HandleAsync_WithValidRequest_CreatesSosRequestSuccessfully()
    {
        // Arrange
        var command = new RequestSosCommand
        {
            Lat = 30.0444m,
            Lng = 31.2357m,
            ServiceType = ServiceType.Towing,
            Notes = "Test notes"
        };
        _validatorMock.Setup(v => v.ValidateAsync(command, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ValidationResult());

        var requestDetailsDto = new RequestDetailsDto
        {
            ClientId = "client-id",
            Latitude = 30.0444m,
            Longitude = 31.2357m,
            ServiceType = ServiceType.Towing
        };

        _mapperMock.Setup(m => m.Map<RequestDetailsDto>(It.IsAny<ServiceRequest>()))
            .Returns(requestDetailsDto);

        // Act
        var result = await _handler.HandleAsync("client-id", command);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.StatusCode.Should().Be(201);
        result.Data.Should().NotBeNull();
        result.Data!.ClientId.Should().Be("client-id");
        result.Data.ServiceType.Should().Be(ServiceType.Towing);

        _repoMock.Verify(r => r.AddAsync(It.IsAny<ServiceRequest>(), It.IsAny<CancellationToken>()), Times.Once);
        _repoMock.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
