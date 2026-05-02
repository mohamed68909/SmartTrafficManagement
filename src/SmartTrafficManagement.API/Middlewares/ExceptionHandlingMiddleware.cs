using System.Text.Json;
using SmartTrafficManagement.Core.Common;

namespace SmartTrafficManagement.API.Middlewares;

public sealed class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception occurred.");
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            context.Response.ContentType = "application/json";

            var result = Result<bool>.Failure(
                new Error("System.InternalError", $"An internal server error occurred: {ex.Message}"),
                StatusCodes.Status500InternalServerError);
            await context.Response.WriteAsync(JsonSerializer.Serialize(result));
        }
    }
}
