using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddIAStateMachineToWork : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "IAResponse",
                table: "Works",
                newName: "IAResult");

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "IARequestedAt",
                table: "Works",
                type: "datetime",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "IAStatus",
                table: "Works",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IARequestedAt",
                table: "Works");

            migrationBuilder.DropColumn(
                name: "IAStatus",
                table: "Works");

            migrationBuilder.RenameColumn(
                name: "IAResult",
                table: "Works",
                newName: "IAResponse");
        }
    }
}
