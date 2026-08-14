using FluentAssertions;
using FluentValidation;
using FluentValidation.Results;
using Microsoft.AspNetCore.Identity;
using Moq;
using SmartTrafficManagement.Application.DTOs;
using SmartTrafficManagement.Application.Features.Store.Checkout;
using SmartTrafficManagement.Core.Entities;
using SmartTrafficManagement.Core.Enums;
using SmartTrafficManagement.Core.Interfaces;
using Xunit;

namespace SmartTrafficManagement.Tests.Unit.Application.Orders;

public class CheckoutCommandHandlerTests
{
    private readonly Mock<IStoreRepository> _storeRepoMock = new();
    private readonly Mock<IPaymentService> _paymentServiceMock = new();
    private readonly Mock<IUserStore<ApplicationUser>> _userStoreMock = new();
    private readonly Mock<UserManager<ApplicationUser>> _userManagerMock;
    private readonly Mock<IValidator<CheckoutCommand>> _validatorMock = new();
    private readonly CheckoutCommandHandler _handler;

    public CheckoutCommandHandlerTests()
    {
        _userManagerMock = new Mock<UserManager<ApplicationUser>>(
            _userStoreMock.Object, null, null, null, null, null, null, null, null);

        _handler = new CheckoutCommandHandler(
            _storeRepoMock.Object,
            _paymentServiceMock.Object,
            _userManagerMock.Object,
            _validatorMock.Object);
    }

    [Fact]
    public async Task HandleAsync_WithEmptyUserId_ReturnsUnauthorized()
    {
        // Act
        var result = await _handler.HandleAsync("", new CheckoutCommand());

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(401);
    }

    [Fact]
    public async Task HandleAsync_WithInvalidCommand_ReturnsValidationError()
    {
        // Arrange
        var command = new CheckoutCommand();
        var validationFailure = new ValidationResult(new[] { new ValidationFailure("Currency", "Currency is required") });
        _validatorMock.Setup(v => v.ValidateAsync(command, It.IsAny<CancellationToken>()))
            .ReturnsAsync(validationFailure);

        // Act
        var result = await _handler.HandleAsync("user-id", command);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(400);
        result.Error!.Code.Should().Be("Common.Validation");
    }

    [Fact]
    public async Task HandleAsync_WhenCartIsEmpty_ReturnsEmptyCartError()
    {
        // Arrange
        var command = new CheckoutCommand { Currency = "egp" };
        var user = new ApplicationUser { Id = "user-id" };

        _validatorMock.Setup(v => v.ValidateAsync(command, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ValidationResult());
        _userManagerMock.Setup(u => u.FindByIdAsync("user-id"))
            .ReturnsAsync(user);
        _storeRepoMock.Setup(r => r.GetCartItemsAsync("user-id", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<CartItem>());

        // Act
        var result = await _handler.HandleAsync("user-id", command);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(400);
        result.Error!.Code.Should().Be("Orders.EmptyCart");
    }

    [Fact]
    public async Task HandleAsync_WhenWalletMethodChosenWithInsufficientFunds_ReturnsInsufficientFunds()
    {
        // Arrange
        var command = new CheckoutCommand { Currency = "egp", PaymentMethod = PaymentMethod.Wallet };
        var user = new ApplicationUser { Id = "user-id", Points = 50 }; // 50 points = 0.50 EGP
        var cartItem = new CartItem { ProductId = Guid.NewGuid(), Quantity = 1, UnitPrice = 10m }; // Needs 1000 points

        _validatorMock.Setup(v => v.ValidateAsync(command, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ValidationResult());
        _userManagerMock.Setup(u => u.FindByIdAsync("user-id"))
            .ReturnsAsync(user);
        _storeRepoMock.Setup(r => r.GetCartItemsAsync("user-id", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<CartItem> { cartItem });

        // Act
        var result = await _handler.HandleAsync("user-id", command);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(400);
        result.Error!.Code.Should().Be("INSUFFICIENT_FUNDS");
    }

    [Fact]
    public async Task HandleAsync_WithValidWalletCheckout_SubtractsPointsAndSavesOrder()
    {
        // Arrange
        var command = new CheckoutCommand { Currency = "egp", PaymentMethod = PaymentMethod.Wallet };
        var user = new ApplicationUser { Id = "user-id", Points = 1500 }; // 15 EGP
        var cartItem = new CartItem { ProductId = Guid.NewGuid(), Quantity = 1, UnitPrice = 10m }; // Needs 1000 points

        _validatorMock.Setup(v => v.ValidateAsync(command, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ValidationResult());
        _userManagerMock.Setup(u => u.FindByIdAsync("user-id"))
            .ReturnsAsync(user);
        _storeRepoMock.Setup(r => r.GetCartItemsAsync("user-id", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<CartItem> { cartItem });

        // Act
        var result = await _handler.HandleAsync("user-id", command);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.StatusCode.Should().Be(200);
        result.Data.Should().NotBeNull();
        result.Data!.OrderId.Should().NotBeEmpty();
        result.Data.TotalAmount.Should().Be(10m);

        user.Points.Should().Be(500); // 1500 - 1000 = 500 points remaining
        _userManagerMock.Verify(u => u.UpdateAsync(user), Times.Once);
        _storeRepoMock.Verify(r => r.AddOrderAsync(It.IsAny<Order>(), It.IsAny<CancellationToken>()), Times.Once);
        _storeRepoMock.Verify(r => r.RemoveCartItems(It.IsAny<IReadOnlyList<CartItem>>()), Times.Once);
        _storeRepoMock.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
