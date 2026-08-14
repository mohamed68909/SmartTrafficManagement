using FluentValidation.TestHelper;
using SmartTrafficManagement.Application.Features.Store.Checkout;
using Xunit;

namespace SmartTrafficManagement.Tests.Unit.Application.Validators;

public class CheckoutCommandValidatorTests
{
    private readonly CheckoutCommandValidator _validator = new();

    [Fact]
    public void Validate_WithValidCommand_ShouldHaveNoErrors()
    {
        // Arrange
        var command = new CheckoutCommand
        {
            Currency = "egp"
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_WithEmptyCurrency_ShouldHaveValidationError()
    {
        // Arrange
        var command = new CheckoutCommand
        {
            Currency = ""
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Currency);
    }

    [Theory]
    [InlineData("eg")]
    [InlineData("egpegyptegyptegyptegyptegypt")]
    public void Validate_WithInvalidCurrencyLength_ShouldHaveValidationError(string invalidCurrency)
    {
        // Arrange
        var command = new CheckoutCommand
        {
            Currency = invalidCurrency
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Currency);
    }
}
