using Microsoft.AspNetCore.Mvc;
using SmartTrafficManagement.Core.Common;

namespace SmartTrafficManagement.API.Controllers;

[ApiController]
public abstract class BaseController : ControllerBase
{
    protected ActionResult ProcessResult<T>(Result<T> result)
    {
        if (result.IsSuccess)
        {
            var statusCode = result.StatusCode <= 0 ? StatusCodes.Status200OK : result.StatusCode;
            return StatusCode(statusCode, result);
        }

        return HandleFailure(result);
    }

    protected ActionResult HandleFailure<T>(Result<T> result)
    {
        return (result.StatusCode, result.Error?.Code) switch
        {
            (StatusCodes.Status400BadRequest, _) => BadRequest(result),
            (StatusCodes.Status401Unauthorized, _) => Unauthorized(result),
            (StatusCodes.Status403Forbidden, _) => StatusCode(StatusCodes.Status403Forbidden, result),
            (StatusCodes.Status404NotFound, _) => NotFound(result),
            (StatusCodes.Status409Conflict, _) => Conflict(result),
            (StatusCodes.Status422UnprocessableEntity, _) => UnprocessableEntity(result),
            (StatusCodes.Status500InternalServerError, _) => StatusCode(StatusCodes.Status500InternalServerError, result),
            (_, "Common.Unauthorized") => Unauthorized(result),
            (_, "Common.Forbidden") => StatusCode(StatusCodes.Status403Forbidden, result),
            (_, "Common.NotFound") => NotFound(result),
            _ => StatusCode(result.StatusCode <= 0 ? StatusCodes.Status400BadRequest : result.StatusCode, result)
        };
    }
}
