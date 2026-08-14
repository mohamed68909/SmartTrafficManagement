using System.Text;
using FluentAssertions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Moq;
using SmartTrafficManagement.API.Controllers;
using SmartTrafficManagement.Application.Features.Store.Webhook;
using SmartTrafficManagement.Core.Interfaces;
using Xunit;

namespace SmartTrafficManagement.Tests.Integration.Payments;

public class StripeWebhookTests
{
    private readonly Mock<IConfiguration> _configMock = new();
    private readonly Mock<IWebHostEnvironment> _envMock = new();
    private readonly UpdateOrderPaymentStatusCommandHandler _handler;
    private readonly PaymentsController _controller;

    public StripeWebhookTests()
    {
        var storeRepoMock = new Mock<IStoreRepository>();
        _handler = new UpdateOrderPaymentStatusCommandHandler(storeRepoMock.Object);
        _controller = new PaymentsController();
    }

    [Fact]
    public async Task StripeWebhook_WithMissingSecretInProduction_ReturnsBadRequest()
    {
        // Arrange
        _configMock.Setup(c => c["Stripe:WebhookSecret"]).Returns(string.Empty);
        _envMock.Setup(e => e.EnvironmentName).Returns("Production");

        var context = new DefaultHttpContext();
        context.Request.Headers["Stripe-Signature"] = "any-sig";
        context.Request.Body = new MemoryStream(Encoding.UTF8.GetBytes("{\"id\":\"evt_test\"}"));
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = context
        };

        // Act
        var result = await _controller.StripeWebhook(
            _configMock.Object,
            _envMock.Object,
            _handler,
            CancellationToken.None);

        // Assert
        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task StripeWebhook_WithMissingSignatureHeader_ReturnsBadRequest()
    {
        // Arrange
        _configMock.Setup(c => c["Stripe:WebhookSecret"]).Returns("whsec_secret");
        _envMock.Setup(e => e.EnvironmentName).Returns("Development");

        var context = new DefaultHttpContext();
        // Missing Stripe-Signature header
        context.Request.Body = new MemoryStream(Encoding.UTF8.GetBytes("{\"id\":\"evt_test\"}"));
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = context
        };

        // Act
        var result = await _controller.StripeWebhook(
            _configMock.Object,
            _envMock.Object,
            _handler,
            CancellationToken.None);

        // Assert
        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task StripeWebhook_WithInvalidSignatureValue_ReturnsBadRequest()
    {
        // Arrange
        _configMock.Setup(c => c["Stripe:WebhookSecret"]).Returns("whsec_secret");
        _envMock.Setup(e => e.EnvironmentName).Returns("Development");

        var context = new DefaultHttpContext();
        context.Request.Headers["Stripe-Signature"] = "t=123,v1=badsignature";
        context.Request.Body = new MemoryStream(Encoding.UTF8.GetBytes("{\"id\":\"evt_test\"}"));
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = context
        };

        // Act
        var result = await _controller.StripeWebhook(
            _configMock.Object,
            _envMock.Object,
            _handler,
            CancellationToken.None);

        // Assert
        result.Should().BeOfType<BadRequestObjectResult>();
    }
}
