using AutoMapper;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using SmartTrafficManagement.Application.Features.Auth.Commands;
using SmartTrafficManagement.Application.Features.Auth.Queries;
using SmartTrafficManagement.Application.Features.Admin;
using SmartTrafficManagement.Application.Features.Cart;
using SmartTrafficManagement.Application.Features.Garage.Commands;
using SmartTrafficManagement.Application.Features.Garage.Queries;
using SmartTrafficManagement.Application.Features.Orders;
using SmartTrafficManagement.Application.Features.Provider;
using SmartTrafficManagement.Application.Features.Seller;
using SmartTrafficManagement.Application.Features.Sos;
using SmartTrafficManagement.Application.Features.Support.GetMyTickets;
using SmartTrafficManagement.Application.Features.Sos.AcceptSos;
using SmartTrafficManagement.Application.Features.Sos.GetSosStatus;
using SmartTrafficManagement.Application.Features.Sos.RequestSos;
using SmartTrafficManagement.Application.Features.Support.CloseTicket;
using SmartTrafficManagement.Application.Features.Support.OpenTicket;
using SmartTrafficManagement.Application.Features.Chat.GetHistory;
using SmartTrafficManagement.Application.Features.Store.AddToCart;
using SmartTrafficManagement.Application.Features.Store.Checkout;
using SmartTrafficManagement.Application.Features.Store.GetCart;
using SmartTrafficManagement.Application.Features.Store.GetProducts;
using SmartTrafficManagement.Application.Features.Store.Webhook;
using SmartTrafficManagement.Application.Modules.Traffic.Application.Incidents.Queries.GetActiveTrafficIncidents;
using SmartTrafficManagement.Application.Modules.Traffic.Application.Incidents.Queries.GetIncidentsByLocation;
using SmartTrafficManagement.Application.Modules.Traffic.Application.Reports.Commands.ReportTrafficIncident;
using SmartTrafficManagement.Application.Modules.Traffic.Application.Sensors.Queries.GetLatestVehicleEnvironment;

namespace SmartTrafficManagement.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddAutoMapper(typeof(DependencyInjection).Assembly);
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);

        services.AddScoped<RegisterCommandHandler>();
        services.AddScoped<LoginCommandHandler>();
        services.AddScoped<RefreshTokenCommandHandler>();
        services.AddScoped<LogoutCommandHandler>();
        services.AddScoped<VerifyOtpCommandHandler>();
        services.AddScoped<UpdateProfileCommandHandler>();
        services.AddScoped<ChangePasswordCommandHandler>();
        services.AddScoped<GoogleLoginCommandHandler>();
        services.AddScoped<GetProfileQueryHandler>();
        services.AddScoped<ForgotPasswordCommandHandler>();
        services.AddScoped<ResetPasswordCommandHandler>();

        services.AddScoped<AddVehicleCommandHandler>();
        services.AddScoped<UpdateVehicleCommandHandler>();
        services.AddScoped<DeleteVehicleCommandHandler>();
        services.AddScoped<GetMyVehiclesQueryHandler>();
        services.AddScoped<GetVehicleByIdQueryHandler>();

        services.AddScoped<RequestSosCommandHandler>();
        services.AddScoped<AcceptSosCommandHandler>();
        services.AddScoped<GetSosStatusQueryHandler>();
        services.AddScoped<GetSosHistoryQueryHandler>();
        services.AddScoped<CancelSosCommandHandler>();

        services.AddScoped<GetAvailableJobsQueryHandler>();
        services.AddScoped<GetProviderDashboardQueryHandler>();
        services.AddScoped<GetProviderHistoryQueryHandler>();
        services.AddScoped<AcceptJobCommandHandler>();
        services.AddScoped<UpdateJobStatusCommandHandler>();
        services.AddScoped<UpdateProviderLocationCommandHandler>();

        services.AddScoped<GetAdminDashboardSummaryQueryHandler>();
        services.AddScoped<GetMonthlyOrderAnalyticsQueryHandler>();
        services.AddScoped<GetAdminUsersQueryHandler>();
        services.AddScoped<GetRecentSupportTicketsQueryHandler>();
        services.AddScoped<GetRecentSosRequestsQueryHandler>();
        services.AddScoped<GetAdminProvidersQueryHandler>();

        services.AddScoped<GetMyOrdersQueryHandler>();
        services.AddScoped<GetOrderDetailsQueryHandler>();

        services.AddScoped<GetMyProductsQueryHandler>();
        services.AddScoped<AddMyProductCommandHandler>();
        services.AddScoped<UpdateMyProductCommandHandler>();
        services.AddScoped<DeleteMyProductCommandHandler>();
        services.AddScoped<GetMyOrdersAsSellerQueryHandler>();

        services.AddScoped<OpenTicketCommandHandler>();
        services.AddScoped<CloseTicketCommandHandler>();
        services.AddScoped<GetMyTicketsQueryHandler>();
        services.AddScoped<GetChatHistoryQueryHandler>();

        services.AddScoped<UpdateCartQuantityCommandHandler>();
        services.AddScoped<RemoveCartItemCommandHandler>();
        services.AddScoped<AddToCartCommandHandler>();
        services.AddScoped<GetCartQueryHandler>();
        services.AddScoped<GetProductsQueryHandler>();
        services.AddScoped<CheckoutCommandHandler>();
        services.AddScoped<UpdateOrderPaymentStatusCommandHandler>();

        services.AddScoped<ReportTrafficIncidentCommandHandler>();
        services.AddScoped<GetActiveTrafficIncidentsQueryHandler>();
        services.AddScoped<GetIncidentsByLocationQueryHandler>();
        services.AddScoped<GetLatestVehicleEnvironmentQueryHandler>();
        return services;
    }
}
