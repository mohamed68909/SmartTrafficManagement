using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartTrafficManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddExpertSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DiagnosticQuestions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Text = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Order = table.Column<int>(type: "int", nullable: false),
                    IsRoot = table.Column<bool>(type: "bit", nullable: false),
                    CreatedOnUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedOnUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DiagnosticQuestions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DiagnosticResults",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    RecommendedServiceType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Urgency = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "Medium"),
                    Tip = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedOnUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedOnUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DiagnosticResults", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DiagnosticAnswers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    QuestionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Text = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    NextQuestionId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ResultId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedOnUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedOnUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DiagnosticAnswers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DiagnosticAnswers_DiagnosticQuestions_NextQuestionId",
                        column: x => x.NextQuestionId,
                        principalTable: "DiagnosticQuestions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DiagnosticAnswers_DiagnosticQuestions_QuestionId",
                        column: x => x.QuestionId,
                        principalTable: "DiagnosticQuestions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DiagnosticAnswers_DiagnosticResults_ResultId",
                        column: x => x.ResultId,
                        principalTable: "DiagnosticResults",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DiagnosticAnswers_NextQuestionId",
                table: "DiagnosticAnswers",
                column: "NextQuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_DiagnosticAnswers_QuestionId",
                table: "DiagnosticAnswers",
                column: "QuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_DiagnosticAnswers_ResultId",
                table: "DiagnosticAnswers",
                column: "ResultId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DiagnosticAnswers");

            migrationBuilder.DropTable(
                name: "DiagnosticQuestions");

            migrationBuilder.DropTable(
                name: "DiagnosticResults");
        }
    }
}
