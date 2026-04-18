namespace SmartTrafficManagement.Core.Common;

public record Error(string Code, string Message);

public class Result<T>
{
    private Result(bool isSuccess, T? data, Error? error, int statusCode)
    {
        IsSuccess = isSuccess;
        Data = data;
        Error = error;
        StatusCode = statusCode;
    }

    public bool IsSuccess { get; }

    public T? Data { get; }

    public Error? Error { get; }

    public int StatusCode { get; }

    public static Result<T> Success(T data, int statusCode = 200)
        => new(true, data, null, statusCode);

    public static Result<T> Failure(
        string code,
        string message,
        int statusCode = 400)
        => new(false, default, new Error(code, message), statusCode);

    public static Result<T> Failure(Error error, int statusCode = 400)
        => new(false, default, error, statusCode);
}
