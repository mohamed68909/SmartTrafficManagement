namespace SmartTrafficManagement.Core.Enums;

/// <summary>
/// Type of emergency service requested.
/// Mobile app must send the exact enum name as a string in the "serviceType" field.
/// </summary>
public enum ServiceType
{
    /// <summary>Send as: "Maintenance"</summary>
    Maintenance = 1,
    /// <summary>Send as: "Inspection"</summary>
    Inspection  = 2,
    /// <summary>General emergency. Send as: "Emergency"</summary>
    Emergency   = 3,
    /// <summary>Towing / Winch service. Send as: "Towing"</summary>
    Towing      = 4,
    /// <summary>Fuel delivery. Send as: "FuelDelivery"</summary>
    FuelDelivery = 5,
    /// <summary>Remote video support. Send as: "VideoSupport"</summary>
    VideoSupport = 6
}

public enum OrderStatus
{
    Pending = 1,
    Processing = 2,
    Shipped = 3,
    Delivered = 4,
    Cancelled = 5
}

public enum PaymentStatus
{
    Pending = 1,
    Paid = 2,
    Failed = 3,
    Refunded = 4
}

public enum TransactionType
{
    ServicePayment = 1,
    ProductPurchase = 2,
    WalletTopUp = 3,
    Refund = 4
}

public enum PaymentMethod
{
    Card = 1,
    Wallet = 2,
    Cash = 3
}

public enum TicketStatus
{
    Open = 1,
    InProgress = 2,
    Resolved = 3,
    Closed = 4
}

public enum TicketPriority
{
    Low = 1,
    Medium = 2,
    High = 3,
    Urgent = 4
}

public enum ChatMessageType
{
    Text = 1,
    Image = 2,
    System = 3
}

public enum VehicleType
{
    Car = 1,
    Motorcycle = 2,
    Truck = 3,
    Bus = 4
}
