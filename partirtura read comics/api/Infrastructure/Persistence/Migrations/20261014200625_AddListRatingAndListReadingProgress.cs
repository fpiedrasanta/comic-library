using System;
using Microsoft.EntityFrameworkCore.Migrations;
using MySql.EntityFrameworkCore.Metadata;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddListRatingAndListReadingProgress : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "AverageRating",
                table: "WorkLists",
                type: "double",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<int>(
                name: "RatingCount",
                table: "WorkLists",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "ListRatings",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    Stars = table.Column<int>(type: "int", nullable: false),
                    Review = table.Column<string>(type: "longtext", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    IsActive = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    UserId = table.Column<long>(type: "bigint", nullable: false),
                    WorkListId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ListRatings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ListRatings_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ListRatings_WorkLists_WorkListId",
                        column: x => x.WorkListId,
                        principalTable: "WorkLists",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "ListReadingProgresses",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    UserId = table.Column<long>(type: "bigint", nullable: false),
                    WorkListId = table.Column<long>(type: "bigint", nullable: false),
                    CurrentWorkId = table.Column<long>(type: "bigint", nullable: true),
                    LastReadAt = table.Column<DateTimeOffset>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ListReadingProgresses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ListReadingProgresses_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ListReadingProgresses_WorkLists_WorkListId",
                        column: x => x.WorkListId,
                        principalTable: "WorkLists",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ListReadingProgresses_Works_CurrentWorkId",
                        column: x => x.CurrentWorkId,
                        principalTable: "Works",
                        principalColumn: "Id");
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_ListRatings_UserId",
                table: "ListRatings",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ListRatings_WorkListId_UserId",
                table: "ListRatings",
                columns: new[] { "WorkListId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ListReadingProgresses_CurrentWorkId",
                table: "ListReadingProgresses",
                column: "CurrentWorkId");

            migrationBuilder.CreateIndex(
                name: "IX_ListReadingProgresses_UserId",
                table: "ListReadingProgresses",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ListReadingProgresses_WorkListId_UserId",
                table: "ListReadingProgresses",
                columns: new[] { "WorkListId", "UserId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ListRatings");

            migrationBuilder.DropTable(
                name: "ListReadingProgresses");

            migrationBuilder.DropColumn(
                name: "AverageRating",
                table: "WorkLists");

            migrationBuilder.DropColumn(
                name: "RatingCount",
                table: "WorkLists");
        }
    }
}
