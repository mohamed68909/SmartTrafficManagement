using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartTrafficManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddGoogleAuthFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "GoogleProviderName",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GoogleSubject",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GoogleProviderName",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "GoogleSubject",
                table: "AspNetUsers");
        }
    }
}
