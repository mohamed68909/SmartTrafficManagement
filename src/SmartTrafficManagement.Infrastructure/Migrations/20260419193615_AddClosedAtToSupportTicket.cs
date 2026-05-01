using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartTrafficManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddClosedAtToSupportTicket : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ClosedAt",
                table: "SupportTickets",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsOnline",
                table: "AspNetUsers",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ClosedAt",
                table: "SupportTickets");

            migrationBuilder.DropColumn(
                name: "IsOnline",
                table: "AspNetUsers");
        }
    }
}
