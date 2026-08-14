using FluentAssertions;
using SmartTrafficManagement.Core.Common;
using Xunit;

namespace SmartTrafficManagement.Tests.Unit.Core;

public class ResultTests
{
    [Fact]
    public void Success_WithValidData_ReturnsSuccessResult()
    {
        // Arrange
        var data = "test-payload";

        // Act
        var result = Result<string>.Success(data, 200);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Data.Should().Be(data);
        result.StatusCode.Should().Be(200);
        result.Error.Should().BeNull();
    }

    [Fact]
    public void Failure_WithError_ReturnsFailureResult()
    {
        // Arrange
        var error = "ERROR_CODE";
        var errorMessage = "Something went wrong.";

        // Act
        var result = Result<string>.Failure(error, errorMessage, 400);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(400);
        result.Error.Should().NotBeNull();
        result.Error!.Code.Should().Be(error);
        result.Error.Message.Should().Be(errorMessage);
    }
}
