using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartTrafficManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUserAddress : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Address column was already added in the preceding migration
            // (AddPasswordResetFields). No additional schema change required here.
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Address column rollback is handled in AddPasswordResetFields.Down().
        }
    }
}
