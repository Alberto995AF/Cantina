using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Cantina.Migrations
{
    public partial class InitialCreate1 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Denominazione",
                columns: table => new
                {
                    ID = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Nome = table.Column<string>(type: "TEXT", nullable: false),
                    AreaGeografica = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Denominazione", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "Nazione",
                columns: table => new
                {
                    ID = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Nome = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Nazione", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "RegioniItaliane",
                columns: table => new
                {
                    ID = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Nome = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RegioniItaliane", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "tipoVino",
                columns: table => new
                {
                    ID = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Tipo = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tipoVino", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "Uva",
                columns: table => new
                {
                    ID = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Nome = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Uva", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "AziendaVinicola",
                columns: table => new
                {
                    ID = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Nome = table.Column<string>(type: "TEXT", nullable: false),
                    RegioneId = table.Column<int>(type: "INTEGER", nullable: false),
                    Indirizzo = table.Column<string>(type: "TEXT", nullable: false),
                    NazioneId = table.Column<int>(type: "INTEGER", nullable: false),
                    Descrizione = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AziendaVinicola", x => x.ID);
                    table.ForeignKey(
                        name: "FK_AziendaVinicola_Nazione_NazioneId",
                        column: x => x.NazioneId,
                        principalTable: "Nazione",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AziendaVinicola_RegioniItaliane_RegioneId",
                        column: x => x.RegioneId,
                        principalTable: "RegioniItaliane",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Vino",
                columns: table => new
                {
                    ID = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Nome = table.Column<string>(type: "TEXT", nullable: false),
                    Annata = table.Column<int>(type: "INTEGER", nullable: false),
                    tipoVinoId = table.Column<int>(type: "INTEGER", nullable: false),
                    AziendaVinicolaId = table.Column<int>(type: "INTEGER", nullable: false),
                    UvaId = table.Column<int>(type: "INTEGER", nullable: true),
                    DenominazioneVinoId = table.Column<int>(type: "INTEGER", nullable: true),
                    DenominazioneID = table.Column<int>(type: "INTEGER", nullable: true),
                    Barcode = table.Column<int>(type: "INTEGER", nullable: false),
                    linkAppVivino = table.Column<string>(type: "TEXT", nullable: true),
                    linkAppTannico = table.Column<string>(type: "TEXT", nullable: true),
                    linkImmagine = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Vino", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Vino_AziendaVinicola_AziendaVinicolaId",
                        column: x => x.AziendaVinicolaId,
                        principalTable: "AziendaVinicola",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Vino_Denominazione_DenominazioneID",
                        column: x => x.DenominazioneID,
                        principalTable: "Denominazione",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_Vino_tipoVino_tipoVinoId",
                        column: x => x.tipoVinoId,
                        principalTable: "tipoVino",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Vino_Uva_UvaId",
                        column: x => x.UvaId,
                        principalTable: "Uva",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "MovimentiVino",
                columns: table => new
                {
                    ID = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    VinoId = table.Column<int>(type: "INTEGER", nullable: false),
                    Movimento = table.Column<int>(type: "INTEGER", nullable: false),
                    Data = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Prezzo = table.Column<decimal>(type: "TEXT", nullable: true),
                    Note = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MovimentiVino", x => x.ID);
                    table.ForeignKey(
                        name: "FK_MovimentiVino_Vino_VinoId",
                        column: x => x.VinoId,
                        principalTable: "Vino",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AziendaVinicola_NazioneId",
                table: "AziendaVinicola",
                column: "NazioneId");

            migrationBuilder.CreateIndex(
                name: "IX_AziendaVinicola_RegioneId",
                table: "AziendaVinicola",
                column: "RegioneId");

            migrationBuilder.CreateIndex(
                name: "IX_MovimentiVino_VinoId",
                table: "MovimentiVino",
                column: "VinoId");

            migrationBuilder.CreateIndex(
                name: "IX_Vino_AziendaVinicolaId",
                table: "Vino",
                column: "AziendaVinicolaId");

            migrationBuilder.CreateIndex(
                name: "IX_Vino_DenominazioneID",
                table: "Vino",
                column: "DenominazioneID");

            migrationBuilder.CreateIndex(
                name: "IX_Vino_tipoVinoId",
                table: "Vino",
                column: "tipoVinoId");

            migrationBuilder.CreateIndex(
                name: "IX_Vino_UvaId",
                table: "Vino",
                column: "UvaId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MovimentiVino");

            migrationBuilder.DropTable(
                name: "Vino");

            migrationBuilder.DropTable(
                name: "AziendaVinicola");

            migrationBuilder.DropTable(
                name: "Denominazione");

            migrationBuilder.DropTable(
                name: "tipoVino");

            migrationBuilder.DropTable(
                name: "Uva");

            migrationBuilder.DropTable(
                name: "Nazione");

            migrationBuilder.DropTable(
                name: "RegioniItaliane");
        }
    }
}
