namespace SmartTrafficManagement.Core.Common;

public static class DomainErrors
{
    public static class Common
    {
        public static readonly Error Unauthorized = new("Common.Unauthorized", "User is not authorized");
        public static readonly Error Forbidden = new("Common.Forbidden", "You do not have permission to perform this action");
        public static readonly Error NotFound = new("Common.NotFound", "The requested resource was not found");
        public static readonly Error ServerError = new("Common.ServerError", "An unexpected server error occurred");

        public static Error Validation(string details)
            => new("Common.Validation", details);
    }

    public static class Auth
    {
        public static readonly Error InvalidCredentials        = new("Auth.InvalidCredentials",        "Invalid login credentials");
        public static readonly Error EmailAlreadyExists        = new("Auth.EmailAlreadyExists",        "Email is already in use");
        public static readonly Error IdentityOperationFailed   = new("Auth.IdentityOperationFailed",   "Identity operation failed");
        public static readonly Error InvalidGoogleToken        = new("Auth.InvalidGoogleToken",        "The provided Google ID token is invalid or has expired");
        public static readonly Error InvalidResetToken          = new("Auth.InvalidResetToken",          "Password reset token is invalid or has expired.");
        public static readonly Error InvalidRoleForRegistration =
            new("Auth.InvalidRoleForRegistration",
                "Invalid role. Web registration allows: Client, Provider, Seller.");
        public static readonly Error InvalidRole               = new("Auth.InvalidRole",               "Invalid role provided");
    }

    public static class Vehicles
    {
        public static readonly Error VehicleNotFound = new("Vehicles.NotFound", "Vehicle not found");
    }

    public static class Orders
    {
        public static readonly Error EmptyCart = new("Orders.EmptyCart", "Shopping cart is empty");
        public static readonly Error InvalidTotal = new("Orders.InvalidTotal", "Invalid order total");
    }

    public static class Payments
    {
        public static readonly Error PaymentCreationFailed = new("Payments.CreationFailed", "Failed to create payment");
        public static readonly Error InvalidWebhook = new("Payments.InvalidWebhook", "Invalid webhook signature");
        public static readonly Error OrderNotFound = new("Payments.OrderNotFound", "Associated order not found");
        public static readonly Error PaymentIntentRequired = new("Payments.PaymentIntentRequired", "Payment intent ID is required");
    }

    public static class Products
    {
        public static readonly Error ProductNotFound = new("Products.NotFound", "Product not found");
    }

    public static class Sos
    {
        public static readonly Error ActiveRequestExists = new("Sos.ActiveRequestExists", "An active SOS request already exists for this user");
        public static readonly Error RequestNotFound = new("Sos.RequestNotFound", "SOS request not found");
        public static readonly Error InvalidState = new("Sos.InvalidState", "The current request state does not allow this operation");
        public static readonly Error ProviderOnly = new("Sos.ProviderOnly", "This action is only allowed for service providers");
    }

    public static class Support
    {
        public static readonly Error TicketNotFound = new("Support.TicketNotFound", "Support ticket not found");
    }

    public static class Chat
    {
        public static readonly Error HistoryNotAllowed = new("Chat.HistoryNotAllowed", "You are not allowed to view chat history");
    }

    public static class Traffic
    {
        public static readonly Error SensorDataNotFound = new("Traffic.SensorDataNotFound", "No sensor data found for this vehicle");
    }

    public static class Ratings
    {
        public static readonly Error AlreadyRated = new("Ratings.AlreadyRated", "You have already rated this item");
        public static readonly Error InvalidStars = new("Ratings.InvalidStars", "Stars must be between 1 and 5");
        public static readonly Error TargetRequired = new("Ratings.TargetRequired", "Either ServiceRequestId or OrderId must be provided");
        public static readonly Error RatingNotFound = new("Ratings.NotFound", "Rating not found");
    }

    public static class Weather
    {
        public static readonly Error FetchFailed = new("Weather.FetchFailed", "Failed to fetch weather data");
        public static readonly Error ApiNotConfigured = new("Weather.ApiNotConfigured", "Weather API key is not configured");
    }

    public static class Map
    {
        public static readonly Error ServiceNotConfigured =
            new("Map.ServiceNotConfigured",
                "Map search service is not configured. Contact support.");
    }
}