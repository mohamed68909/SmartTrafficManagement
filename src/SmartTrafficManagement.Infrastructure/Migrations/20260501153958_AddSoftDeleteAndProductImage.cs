using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartTrafficManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSoftDeleteAndProductImage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "UserCards",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Transactions",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "TrafficReports",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "TrafficIncidents",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "SupportTickets",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "ServiceRequests",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "SensorData",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "RefreshTokens",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Ratings",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "Products",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Products",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Orders",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "OrderItems",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Notifications",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "ChatMessages",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Categories",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "CartItems",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "UserCards");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Transactions");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "TrafficReports");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "TrafficIncidents");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "SupportTickets");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "ServiceRequests");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "SensorData");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "RefreshTokens");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Ratings");

            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "OrderItems");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "ChatMessages");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Categories");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "CartItems");
        }
    }
}
