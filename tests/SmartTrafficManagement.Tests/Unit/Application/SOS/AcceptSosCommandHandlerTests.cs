using FluentAssertions;
using FluentValidation;
using FluentValidation.Results;
using Microsoft.AspNetCore.Identity;
using Moq;
using SmartTrafficManagement.Application.DTOs;
using SmartTrafficManagement.Application.Features.Sos.AcceptSos;
using SmartTrafficManagement.Core.Entities;
using SmartTrafficManagement.Core.Enums;
using SmartTrafficManagement.Core.Interfaces;
using Xunit;

namespace SmartTrafficManagement.Tests.Unit.Application.SOS;

public class AcceptSosCommandHandlerTests
{
    private readonly Mock<IServiceRequestRepository> _repoMock = new();
    private readonly Mock<IUserStore<ApplicationUser>> _userStoreMock = new();
    private readonly Mock<UserManager<ApplicationUser>> _userManagerMock;
    private readonly Mock<IValidator<AcceptSosCommand>> _validatorMock = new();
    private readonly AcceptSosCommandHandler _handler;

    public AcceptSosCommandHandlerTests()
    {
        _userManagerMock = new Mock<UserManager<ApplicationUser>>(
            _userStoreMock.Object, null, null, null, null, null, null, null, null);

        _handler = new AcceptSosCommandHandler(
            _repoMock.Object,
            _userManagerMock.Object,
            _validatorMock.Object);
    }

    [Fact]
    public async Task HandleAsync_WithEmptyProviderId_ReturnsUnauthorized()
    {
        // Act
        var result = await _handler.HandleAsync("", new AcceptSosCommand());

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(401);
    }

    [Fact]
    public async Task HandleAsync_WithInvalidCommand_ReturnsValidationError()
    {
        // Arrange
        var command = new AcceptSosCommand();
        var validationFailure = new ValidationResult(new[] { new ValidationFailure("RequestId", "Request ID is required") });
        _validatorMock.Setup(v => v.ValidateAsync(command, It.IsAny<CancellationToken>()))
            .ReturnsAsync(validationFailure);

        // Act
        var result = await _handler.HandleAsync("provider-id", command);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(400);
    }

    [Fact]
    public async Task HandleAsync_WhenUserIsNotProvider_ReturnsForbidden()
    {
        // Arrange
        var command = new AcceptSosCommand { RequestId = Guid.NewGuid() };
        var user = new ApplicationUser { Id = "provider-id" };

        _validatorMock.Setup(v => v.ValidateAsync(command, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ValidationResult());
        _userManagerMock.Setup(u => u.FindByIdAsync("provider-id"))
            .ReturnsAsync(user);
        _userManagerMock.Setup(u => u.IsInRoleAsync(user, "Provider"))
            .ReturnsAsync(false);

        // Act
        var result = await _handler.HandleAsync("provider-id", command);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(403);
    }

    [Fact]
    public async Task HandleAsync_WhenRequestDoesNotExist_ReturnsNotFound()
    {
        // Arrange
        var command = new AcceptSosCommand { RequestId = Guid.NewGuid() };
        var user = new ApplicationUser { Id = "provider-id" };

        _validatorMock.Setup(v => v.ValidateAsync(command, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ValidationResult());
        _userManagerMock.Setup(u => u.FindByIdAsync("provider-id"))
            .ReturnsAsync(user);
        _userManagerMock.Setup(u => u.IsInRoleAsync(user, "Provider"))
            .ReturnsAsync(true);
        _repoMock.Setup(r => r.GetByIdAsync(command.RequestId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((ServiceRequest?)null);

        // Act
        var result = await _handler.HandleAsync("provider-id", command);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(404);
    }

    [Fact]
    public async Task HandleAsync_WhenRequestIsNotPending_ReturnsConflict()
    {
        // Arrange
        var command = new AcceptSosCommand { RequestId = Guid.NewGuid() };
        var user = new ApplicationUser { Id = "provider-id" };
        var request = new ServiceRequest { Id = command.RequestId, Status = RequestStatus.Completed };

        _validatorMock.Setup(v => v.ValidateAsync(command, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ValidationResult());
        _userManagerMock.Setup(u => u.FindByIdAsync("provider-id"))
            .ReturnsAsync(user);
        _userManagerMock.Setup(u => u.IsInRoleAsync(user, "Provider"))
            .ReturnsAsync(true);
        _repoMock.Setup(r => r.GetByIdAsync(command.RequestId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(request);

        // Act
        var result = await _handler.HandleAsync("provider-id", command);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(409);
    }

    [Fact]
    public async Task HandleAsync_WithValidRequest_AcceptsRequestSuccessfully()
    {
        // Arrange
        var command = new AcceptSosCommand { RequestId = Guid.NewGuid() };
        var user = new ApplicationUser { Id = "provider-id" };
        var request = new ServiceRequest { Id = command.RequestId, Status = RequestStatus.Pending };

        _validatorMock.Setup(v => v.ValidateAsync(command, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ValidationResult());
        _userManagerMock.Setup(u => u.FindByIdAsync("provider-id"))
            .ReturnsAsync(user);
        _userManagerMock.Setup(u => u.IsInRoleAsync(user, "Provider"))
            .ReturnsAsync(true);
        _repoMock.Setup(r => r.GetByIdAsync(command.RequestId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(request);

        // Act
        var result = await _handler.HandleAsync("provider-id", command);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.StatusCode.Should().Be(200);
        result.Data.Should().NotBeNull();
        result.Data!.ProviderId.Should().Be("provider-id");
        result.Data.Status.Should().Be(RequestStatus.Accepted);

        _repoMock.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
