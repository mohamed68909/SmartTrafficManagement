using FluentAssertions;
using FluentValidation;
using FluentValidation.Results;
using Microsoft.AspNetCore.Identity;
using Moq;
using SmartTrafficManagement.Application.DTOs;
using SmartTrafficManagement.Application.Features.Auth.RefreshToken;
using SmartTrafficManagement.Core.Entities;
using SmartTrafficManagement.Core.Interfaces;
using Xunit;

namespace SmartTrafficManagement.Tests.Unit.Application.Auth;

public class RefreshTokenCommandHandlerTests
{
    private readonly Mock<IAuthRepository> _authRepoMock = new();
    private readonly Mock<IUserStore<ApplicationUser>> _userStoreMock = new();
    private readonly Mock<UserManager<ApplicationUser>> _userManagerMock;
    private readonly Mock<IJwtTokenService> _jwtServiceMock = new();
    private readonly Mock<IValidator<RefreshTokenCommand>> _validatorMock = new();
    private readonly RefreshTokenCommandHandler _handler;

    public RefreshTokenCommandHandlerTests()
    {
        _userManagerMock = new Mock<UserManager<ApplicationUser>>(
            _userStoreMock.Object, null, null, null, null, null, null, null, null);

        _handler = new RefreshTokenCommandHandler(
            _authRepoMock.Object,
            _userManagerMock.Object,
            _jwtServiceMock.Object,
            _validatorMock.Object);
    }

    [Fact]
    public async Task HandleAsync_WithInvalidCommand_ReturnsValidationError()
    {
        // Arrange
        var command = new RefreshTokenCommand();
        var validationFailure = new ValidationResult(new[] { new ValidationFailure("RefreshToken", "Token is required") });
        _validatorMock.Setup(v => v.ValidateAsync(command, It.IsAny<CancellationToken>()))
            .ReturnsAsync(validationFailure);

        // Act
        var result = await _handler.HandleAsync(command);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(400);
    }

    [Fact]
    public async Task HandleAsync_WithInactiveOrMissingToken_ReturnsUnauthorized()
    {
        // Arrange
        var command = new RefreshTokenCommand { RefreshToken = "invalid-token" };
        _validatorMock.Setup(v => v.ValidateAsync(command, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ValidationResult());
        _authRepoMock.Setup(r => r.GetActiveRefreshTokenAsync(command.RefreshToken, It.IsAny<CancellationToken>()))
            .ReturnsAsync((RefreshToken?)null);

        // Act
        var result = await _handler.HandleAsync(command);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(401);
    }

    [Fact]
    public async Task HandleAsync_WithValidRefreshToken_RotatesTokenSuccessfully()
    {
        // Arrange
        var command = new RefreshTokenCommand { RefreshToken = "valid-old-token" };
        var user = new ApplicationUser { Id = "user-id", UserName = "testuser" };
        var activeOldToken = new RefreshToken
        {
            Token = "valid-old-token",
            UserId = "user-id",
            ExpiresOnUtc = DateTime.UtcNow.AddDays(1),
            User = user
        };
        var newRefreshToken = new RefreshToken
        {
            Token = "new-fresh-token",
            UserId = "user-id",
            ExpiresOnUtc = DateTime.UtcNow.AddDays(7),
            User = user
        };

        _validatorMock.Setup(v => v.ValidateAsync(command, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ValidationResult());
        _authRepoMock.Setup(r => r.GetActiveRefreshTokenAsync(command.RefreshToken, It.IsAny<CancellationToken>()))
            .ReturnsAsync(activeOldToken);
        _userManagerMock.Setup(u => u.FindByIdAsync("user-id"))
            .ReturnsAsync(user);
        _userManagerMock.Setup(u => u.GetRolesAsync(user))
            .ReturnsAsync(new List<string> { "Client" });
        _jwtServiceMock.Setup(j => j.GenerateAccessToken(user, It.IsAny<IList<string>>()))
            .Returns("new-access-token");
        _jwtServiceMock.Setup(j => j.GenerateRefreshToken("user-id"))
            .Returns(newRefreshToken);

        // Act
        var result = await _handler.HandleAsync(command);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.StatusCode.Should().Be(200);
        result.Data.Should().NotBeNull();
        result.Data!.Token.Should().Be("new-access-token");
        result.Data.RefreshToken.Should().Be("new-fresh-token");

        activeOldToken.RevokedOnUtc.Should().NotBeNull(); // Replaced token should be invalidated/revoked
        _authRepoMock.Verify(r => r.AddRefreshTokenAsync(newRefreshToken, It.IsAny<CancellationToken>()), Times.Once);
        _authRepoMock.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
