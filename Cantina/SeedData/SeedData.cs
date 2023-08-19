using System;
using System.Diagnostics.Metrics;
using Cantina.Persistence;
using Microsoft.EntityFrameworkCore;
using Serilog;
using static System.Net.WebRequestMethods;

namespace Cantina.Data
{
    public static class SeedData
    {
        public static void Initialize(IServiceProvider serviceProvider)
        {
            using (var context = new CantinaContext(
                serviceProvider.GetRequiredService<
                    DbContextOptions<CantinaContext>>()))
            {
                if (context == null || context.Vino == null)
                {
                    throw new ArgumentNullException("Null RazorPagesMovieContext");
                }

                //context.Database.Migrate();

                //Look for any movies.
                if (context.Vino.Any())
                {
                    Log.Information("SeedData Ignored for Data already present...");
                    return;   // DB has been seeded
                }


                ///
                /// TIPO VINO *************************************************
                ///
                var tipo1 = new tipoVino
                {
                    ID = 1,
                    Tipo = "Rosso"
                };
                var tipo2 = new tipoVino
                {
                    ID = 2,
                    Tipo = "Bianco"
                };
                var tipo3 = new tipoVino
                {
                    ID = 3,
                    Tipo = "Bianco Frizzante"
                };
                var tipo4 = new tipoVino
                {
                    ID = 4,
                    Tipo = "Prosecco"
                };
                var tipo5 = new tipoVino
                {
                    ID = 5,
                    Tipo = "Champagne"
                };
                context.tipoVino.AddRange(tipo1);
                context.tipoVino.AddRange(tipo2);
                context.tipoVino.AddRange(tipo3);
                context.tipoVino.AddRange(tipo4);
                context.tipoVino.AddRange(tipo5);
                ///************************************************************
                ///

                ///
                /// TIPOLOGIA VINO *************************************************
                ///
                var tipologia1 = new Denominazione
                {
                    ID = 1,
                    Nome = "Bolgheri DOC rosso",
                    AreaGeografica = "Castagneto Carducci"
                };
                var tipologia2 = new Denominazione
                {
                    ID = 2,
                    Nome = "Chianti Classico DOCG",
                    AreaGeografica = "Firenze - Siena"
                };
                var tipologia3 = new Denominazione
                {
                    ID = 3,
                    Nome = "Prosecco DOC",
                    AreaGeografica = "Friuli-Venezia Giulia"
                };
                var tipologia4 = new Denominazione
                {
                    ID = 4,
                    Nome = "Barolo DOCG",
                    AreaGeografica = "Cuneo"
                };
                var tipologia5 = new Denominazione
                {
                    ID = 5,
                    Nome = "Rosso Di Montalcino DOC",
                    AreaGeografica = "Montalcino"
                };
                var tipologia6 = new Denominazione
                {
                    ID = 6,
                    Nome = "Vermentino IGT",
                    AreaGeografica = "Toscana, Liguria, Sardegna"
                };
                var tipologia7 = new Denominazione
                {
                    ID = 7,
                    Nome = "Valpolicella Superiore DOC",
                    AreaGeografica = "Veneto, Valpolicella"
                };
                var tipologia8 = new Denominazione
                {
                    ID = 8,
                    Nome = "Bolgheri Superiore DOC",
                    AreaGeografica = "Bolgheri, Castagneto Carducci"
                };
                var tipologia9 = new Denominazione
                {
                    ID = 9,
                    Nome = "Toscana Rosso IGT",
                    AreaGeografica = "Toscana"
                };
                var tipologia10 = new Denominazione
                {
                    ID = 10,
                    Nome = "Nebbiolo D'Alba DOC",
                    AreaGeografica = "Cuneo"
                };
                var tipologia11 = new Denominazione
                {
                    ID = 11,
                    Nome = "Barbaresco DOCG",
                    AreaGeografica = "Cuneo"
                };
                var tipologia12 = new Denominazione
                {
                    ID = 12,
                    Nome = "Chianti DOCG",
                    AreaGeografica = "Chianti"
                };
                var tipologia13 = new Denominazione
                {
                    ID = 13,
                    Nome = "Chianti Rufina DOCG",
                    AreaGeografica = "Sottozona Chianti"
                };
                var tipologia14 = new Denominazione
                {
                    ID = 14,
                    Nome = "Morellino Di Scansano DOCG",
                    AreaGeografica = "Maremma"
                };
                context.Denominazione.AddRange(tipologia1);
                context.Denominazione.AddRange(tipologia2);
                context.Denominazione.AddRange(tipologia3);
                context.Denominazione.AddRange(tipologia4);
                context.Denominazione.AddRange(tipologia5);
                context.Denominazione.AddRange(tipologia6);
                context.Denominazione.AddRange(tipologia7);
                context.Denominazione.AddRange(tipologia8);
                context.Denominazione.AddRange(tipologia9);
                context.Denominazione.AddRange(tipologia10);
                context.Denominazione.AddRange(tipologia11);
                context.Denominazione.AddRange(tipologia12);
                context.Denominazione.AddRange(tipologia13);
                context.Denominazione.AddRange(tipologia14);
                ///************************************************************
                ///

                ///
                /// NAZIONE VINO *************************************************
                ///
                var naz1 = new Nazione
                {
                    ID = 1,
                    Nome = "Italia"
                };
                var naz2 = new Nazione
                {
                    ID = 2,
                    Nome = "Francia"
                };
                context.Nazione.AddRange(naz1);
                context.Nazione.AddRange(naz2);
                ///************************************************************
                ///

                ///
                /// REGIONE VINO *************************************************
                ///
                var reg1 = new RegioniItaliane
                {
                    ID = 1,
                    Nome = "Toscana"
                };
                var reg2 = new RegioniItaliane
                {
                    ID = 2,
                    Nome = "Piemonte"
                };
                var reg3 = new RegioniItaliane
                {
                    ID = 3,
                    Nome = "Emilia Romagna"
                };
                var reg4 = new RegioniItaliane
                {
                    ID = 4,
                    Nome = "Abruzzo"
                };
                var reg5 = new RegioniItaliane
                {
                    ID = 5,
                    Nome = "Basilicata"
                };
                var reg6 = new RegioniItaliane
                {
                    ID = 6,
                    Nome = "Calabria"
                };
                var reg7 = new RegioniItaliane
                {
                    ID = 7,
                    Nome = "Friuli Venezia Giulia"
                };
                var reg8 = new RegioniItaliane
                {
                    ID = 8,
                    Nome = "Lazio"
                };
                var reg9 = new RegioniItaliane
                {
                    ID = 9,
                    Nome = "Liguria"
                };
                var reg10 = new RegioniItaliane
                {
                    ID = 10,
                    Nome = "Marche"
                };
                var reg11 = new RegioniItaliane
                {
                    ID = 11,
                    Nome = "Molise"
                };
                var reg12 = new RegioniItaliane
                {
                    ID = 12,
                    Nome = "Puglia"
                };
                var reg13 = new RegioniItaliane
                {
                    ID = 13,
                    Nome = "Sicilia"
                };
                var reg14 = new RegioniItaliane
                {
                    ID = 14,
                    Nome = "Trentino-Alto Adige"
                };
                var reg15 = new RegioniItaliane
                {
                    ID = 15,
                    Nome = "Umbria"
                };
                var reg16 = new RegioniItaliane
                {
                    ID = 16,
                    Nome = "Valle d'Aosta"
                };
                var reg17 = new RegioniItaliane
                {
                    ID = 17,
                    Nome = "Sardegna"
                };
                var reg18 = new RegioniItaliane
                {
                    ID = 18,
                    Nome = "Veneto"
                };
                var reg19 = new RegioniItaliane
                {
                    ID = 19,
                    Nome = "Lombardia"
                };
                context.RegioniItaliane.AddRange(reg1);
                context.RegioniItaliane.AddRange(reg2);
                context.RegioniItaliane.AddRange(reg3);
                context.RegioniItaliane.AddRange(reg4);
                context.RegioniItaliane.AddRange(reg5);
                context.RegioniItaliane.AddRange(reg6);
                context.RegioniItaliane.AddRange(reg7);
                context.RegioniItaliane.AddRange(reg8);
                context.RegioniItaliane.AddRange(reg9);
                context.RegioniItaliane.AddRange(reg10);
                context.RegioniItaliane.AddRange(reg11);
                context.RegioniItaliane.AddRange(reg12);
                context.RegioniItaliane.AddRange(reg13);
                context.RegioniItaliane.AddRange(reg14);
                context.RegioniItaliane.AddRange(reg15);
                context.RegioniItaliane.AddRange(reg16);
                context.RegioniItaliane.AddRange(reg17);
                context.RegioniItaliane.AddRange(reg18);
                context.RegioniItaliane.AddRange(reg19);
                ///************************************************************
                ///

                ///
                /// UVA VINO *************************************************
                ///
                var uva1 = new Uva
                {
                    ID = 1,
                    Nome = "Sangiovese"
                };
                context.Uva.AddRange(uva1);
                var uva2 = new Uva
                {
                    ID = 2,
                    Nome = "Merlot"
                };
                context.Uva.AddRange(uva2);
                var uva3 = new Uva
                {
                    ID = 3,
                    Nome = "Cabernet Sauvignon"
                };
                context.Uva.AddRange(uva3);
                var uva4 = new Uva
                {
                    ID = 4,
                    Nome = "Sauvignon"
                };
                context.Uva.AddRange(uva4);
                var uva5 = new Uva
                {
                    ID = 5,
                    Nome = "Chardonnay"
                };
                context.Uva.AddRange(uva5);
                var uva6 = new Uva
                {
                    ID = 6,
                    Nome = "Syrah"
                };
                context.Uva.AddRange(uva6);
                var uva7 = new Uva
                {
                    ID = 7,
                    Nome = "Blanc De Morgex"
                };
                context.Uva.AddRange(uva7);
                var uva8 = new Uva
                {
                    ID = 8,
                    Nome = "Barbera"
                };
                context.Uva.AddRange(uva8);
                var uva9 = new Uva
                {
                    ID = 9,
                    Nome = "Nebbiolo"
                };
                context.Uva.AddRange(uva9);
                var uva10 = new Uva
                {
                    ID = 10,
                    Nome = "Dolcetto"
                };
                context.Uva.AddRange(uva10);
                var uva11 = new Uva
                {
                    ID = 11,
                    Nome = "Pinot Nero"
                };
                context.Uva.AddRange(uva11);
                var uva12 = new Uva
                {
                    ID = 12,
                    Nome = "Cabernet Franc"
                };
                context.Uva.AddRange(uva12);
                var uva13 = new Uva
                {
                    ID = 13,
                    Nome = "Petit Verdot"
                };
                context.Uva.AddRange(uva13);
                var uva14 = new Uva
                {
                    ID = 14,
                    Nome = "Vermentino"
                };
                context.Uva.AddRange(uva14);

                ///************************************************************
                ///

                ///
                /// AZIENDA VINICOLA *************************************************
                ///
                var azV1 = new AziendaVinicola
                {
                    ID = 1,
                    Nome = "Tenuta Argentiera Bolgheri",
                    NazioneId = naz1.ID,
                    RegioneId = reg1.ID,
                    Indirizzo = "Castagneto Carducci",
                    Descrizione = "-"
                };
                var azV2 = new AziendaVinicola
                {
                    ID = 2,
                    Nome = "Badia di Morrona",
                    NazioneId = naz1.ID,
                    RegioneId = reg1.ID,
                    Indirizzo = "Morrona",
                    Descrizione = "-"
                };
                var azV3 = new AziendaVinicola
                {
                    ID = 3,
                    Nome = "Michele Mascarello",
                    NazioneId = naz1.ID,
                    RegioneId = reg2.ID,
                    Indirizzo = "La Morra CUNEO",
                    Descrizione = "-"
                };
                var azV4 = new AziendaVinicola
                {
                    ID = 4,
                    Nome = "Ferrari Trento",
                    NazioneId = naz1.ID,
                    RegioneId = reg14.ID,
                    Indirizzo = "Trento",
                    Descrizione = "-"
                };
                var azV5 = new AziendaVinicola
                {
                    ID = 5,
                    Nome = "Berlucchi",
                    NazioneId = naz1.ID,
                    RegioneId = reg19.ID,
                    Indirizzo = "Brescia",
                    Descrizione = "-"
                };
                var azV6 = new AziendaVinicola
                {
                    ID = 6,
                    Nome = "Campo al Mare",
                    NazioneId = naz1.ID,
                    RegioneId = reg1.ID,
                    Indirizzo = "Bolgheri",
                    Descrizione = "-"
                };
                var azV7 = new AziendaVinicola
                {
                    ID = 7,
                    Nome = "Le Chiantigiane",
                    NazioneId = naz1.ID,
                    RegioneId = reg1.ID,
                    Indirizzo = "Val De Pesa",
                    Descrizione = "-"
                };
                var azV8 = new AziendaVinicola
                {
                    ID = 8,
                    Nome = "Livio Felluga",
                    NazioneId = naz1.ID,
                    RegioneId = reg7.ID,
                    Indirizzo = "Colli Orientali del Friuli",
                    Descrizione = "-"
                };
                var azV9 = new AziendaVinicola
                {
                    ID = 9,
                    Nome = "Ciacci Piccolomini d'Aragona",
                    NazioneId = naz1.ID,
                    RegioneId = reg1.ID,
                    Indirizzo = "Montalcino",
                    Descrizione = "-"
                };
                var azV10 = new AziendaVinicola
                {
                    ID = 10,
                    Nome = "Tenimenti Civa",
                    NazioneId = naz1.ID,
                    RegioneId = reg7.ID,
                    Indirizzo = "Colli Orientali del Friuli",
                    Descrizione = "-"
                };
                var azV11 = new AziendaVinicola
                {
                    ID = 11,
                    Nome = "Cantina Produttori di Valdobbiadene - Ca'Val",
                    NazioneId = naz1.ID,
                    RegioneId = reg18.ID,
                    Indirizzo = "Conegliano-Valdobbiadene",
                    Descrizione = "-"
                };
                var azV12 = new AziendaVinicola
                {
                    ID = 12,
                    Nome = "Zonin",
                    NazioneId = naz1.ID,
                    RegioneId = reg18.ID,
                    Indirizzo = "Vicenza",
                    Descrizione = "-"
                };
                var azV13 = new AziendaVinicola
                {
                    ID = 13,
                    Nome = "Vigna del Greppo",
                    NazioneId = naz1.ID,
                    RegioneId = reg1.ID,
                    Indirizzo = "Montecarlo - Lucca",
                    Descrizione = "-"
                };
                var azV14 = new AziendaVinicola
                {
                    ID = 14,
                    Nome = "Avanzi",
                    NazioneId = naz1.ID,
                    RegioneId = reg19.ID,
                    Indirizzo = "Manerba del Garda",
                    Descrizione = "-"
                };
                var azV15 = new AziendaVinicola
                {
                    ID = 15,
                    Nome = "Castello di Meleto",
                    NazioneId = naz1.ID,
                    RegioneId = reg1.ID,
                    Indirizzo = "Gaiole in Chianti",
                    Descrizione = "-"
                };
                var azV16 = new AziendaVinicola
                {
                    ID = 16,
                    Nome = "Duca di Salaparuta",
                    NazioneId = naz1.ID,
                    RegioneId = reg13.ID,
                    Indirizzo = "Casteldaccia",
                    Descrizione = "-"
                };
                var azV17 = new AziendaVinicola
                {
                    ID = 17,
                    Nome = "Aia Vecchia",
                    NazioneId = naz1.ID,
                    RegioneId = reg1.ID,
                    Indirizzo = "Bolgheri",
                    Descrizione = "-"
                };
                var azV18 = new AziendaVinicola
                {
                    ID = 18,
                    Nome = "Leonardo da Vinci",
                    NazioneId = naz1.ID,
                    RegioneId = reg1.ID,
                    Indirizzo = "Montalcino",
                    Descrizione = "-"
                };
                var azV19 = new AziendaVinicola
                {
                    ID = 19,
                    Nome = "Nottola",
                    NazioneId = naz1.ID,
                    RegioneId = reg1.ID,
                    Indirizzo = "Montepulciano",
                    Descrizione = "-"
                };
                var azV20 = new AziendaVinicola
                {
                    ID = 20,
                    Nome = "Plani Arche",
                    NazioneId = naz1.ID,
                    RegioneId = reg15.ID,
                    Indirizzo = "Preugia",
                    Descrizione = "-"
                };
                var azV21 = new AziendaVinicola
                {
                    ID = 21,
                    Nome = "Santa Cristina",
                    NazioneId = naz1.ID,
                    RegioneId = reg1.ID,
                    Indirizzo = "Cortona (FI)",
                    Descrizione = "-"
                };
                var azV22 = new AziendaVinicola
                {
                    ID = 22,
                    Nome = "Geografico",
                    NazioneId = naz1.ID,
                    RegioneId = reg1.ID,
                    Indirizzo = "Toscana",
                    Descrizione = "-"
                };
                var azV23 = new AziendaVinicola
                {
                    ID = 23,
                    Nome = "Antinori",
                    NazioneId = naz1.ID,
                    RegioneId = reg1.ID,
                    Indirizzo = "Firenze",
                    Descrizione = "-"
                };
                var azV24 = new AziendaVinicola
                {
                    ID = 24,
                    Nome = "Banfi",
                    NazioneId = naz1.ID,
                    RegioneId = reg1.ID,
                    Indirizzo = "Poggio alle Mura, Montalcino",
                    Descrizione = "-"
                };
                var azV25 = new AziendaVinicola
                {
                    ID = 25,
                    Nome = "Musella",
                    NazioneId = naz1.ID,
                    RegioneId = reg18.ID,
                    Indirizzo = "San Martino Buon Albergo, VR",
                    Descrizione = "-"
                };
                var azV26 = new AziendaVinicola
                {
                    ID = 26,
                    Nome = "Poggio Al Tesoro",
                    NazioneId = naz1.ID,
                    RegioneId = reg1.ID,
                    Indirizzo = "Bolgheri",
                    Descrizione = "-"
                };
                var azV27 = new AziendaVinicola
                {
                    ID = 27,
                    Nome = "Michele Satta",
                    NazioneId = naz1.ID,
                    RegioneId = reg1.ID,
                    Indirizzo = "Bolgheri",
                    Descrizione = "-"
                };
                var azV28 = new AziendaVinicola
                {
                    ID = 28,
                    Nome = "Podere Guado al Melo",
                    NazioneId = naz1.ID,
                    RegioneId = reg1.ID,
                    Indirizzo = "Bolgheri",
                    Descrizione = "-"
                };
                var azV29 = new AziendaVinicola
                {
                    ID = 29,
                    Nome = "Fattoria di Doccia",
                    NazioneId = naz1.ID,
                    RegioneId = reg1.ID,
                    Indirizzo = "Chianti",
                    Descrizione = "-"
                };
                var azV30 = new AziendaVinicola
                {
                    ID = 30,
                    Nome = "Capua Winery",
                    NazioneId = naz1.ID,
                    RegioneId = reg1.ID,
                    Indirizzo = "Maremma",
                    Descrizione = "-"
                };
                context.AziendaVinicola.AddRange(azV1);
                context.AziendaVinicola.AddRange(azV2);
                context.AziendaVinicola.AddRange(azV3);
                context.AziendaVinicola.AddRange(azV4);
                context.AziendaVinicola.AddRange(azV5);
                context.AziendaVinicola.AddRange(azV6);
                context.AziendaVinicola.AddRange(azV7);
                context.AziendaVinicola.AddRange(azV8);
                context.AziendaVinicola.AddRange(azV9);
                context.AziendaVinicola.AddRange(azV10);
                context.AziendaVinicola.AddRange(azV11);
                context.AziendaVinicola.AddRange(azV12);
                context.AziendaVinicola.AddRange(azV13);
                context.AziendaVinicola.AddRange(azV14);
                context.AziendaVinicola.AddRange(azV15);
                context.AziendaVinicola.AddRange(azV16);
                context.AziendaVinicola.AddRange(azV17);
                context.AziendaVinicola.AddRange(azV18);
                context.AziendaVinicola.AddRange(azV19);
                context.AziendaVinicola.AddRange(azV20);
                context.AziendaVinicola.AddRange(azV21);
                context.AziendaVinicola.AddRange(azV22);
                context.AziendaVinicola.AddRange(azV23);
                context.AziendaVinicola.AddRange(azV24);
                context.AziendaVinicola.AddRange(azV25);
                context.AziendaVinicola.AddRange(azV26);
                context.AziendaVinicola.AddRange(azV27);
                context.AziendaVinicola.AddRange(azV28);
                context.AziendaVinicola.AddRange(azV29);
                context.AziendaVinicola.AddRange(azV30);
                ///************************************************************
                ///


                ///
                /// VINO *************************************************
                ///
                var vino1 = new Vino
                {
                    ID = 1,
                    Nome = "Barolo",
                    tipoVinoId = tipo1.ID,
                    AziendaVinicolaId = azV3.ID,
                    DenominazioneId = tipologia4.ID,
                    Barcode = 1000,
                    Preferito = false,
                    linkAppVivino = "https://www.vivino.com/wineries/it-mascarello-michele",
                    linkImmagine = "https://images.vivino.com/thumbs/PneHihhLTi2OkB0VehxNeg_pb_x960.png"
                };
                var vino2 = new Vino
                {
                    ID = 2,
                    Nome = "Poggio Ai Ginepri Rosso",
                    tipoVinoId = tipo1.ID,
                    AziendaVinicolaId = azV1.ID,
                    DenominazioneId = tipologia1.ID,
                    Barcode = 1001,
                    Preferito = false,
                    linkAppVivino = "https://www.vivino.com/IT/it/tenuta-argentiera-poggio-ai-ginepri-bolgheri/w/1768500",
                    linkImmagine = "https://images.vivino.com/thumbs/AXpJL5rDTpCa7GcuGObVow_pb_x960.png"
                };
                var vino3 = new Vino
                {
                    ID = 3,
                    Nome = "Felciaio",
                    tipoVinoId = tipo2.ID,
                    AziendaVinicolaId = azV2.ID,
                    DenominazioneId = tipologia6.ID,
                    Barcode = 1002,
                    Preferito = false,
                    linkAppVivino = "https://www.vivino.com/IT/it/badia-di-morrona-felciaio/w/2478006?ref=nav-search",
                    linkImmagine = "https://images.vivino.com/thumbs/dHuGvbrCQQS9zzOTfJjTOw_pb_x960.png"
                };
                var vino4 = new Vino
                {
                    ID = 4,
                    Nome = "Musella",
                    tipoVinoId = tipo1.ID,
                    AziendaVinicolaId = azV25.ID,
                    DenominazioneId = tipologia7.ID,
                    Preferito = false,
                    linkAppVivino = "https://www.vivino.com/IT/it/musella-valpolicella-superiore/w/15717?ref=nav-search",
                    linkAppTannico = "https://www.tannico.it/valpolicella-superiore-doc-2018-musella.html?_gl=1*nydluw*_up*MQ..&gclid=Cj0KCQiAnNacBhDvARIsABnDa69DVOOMZ3ZWgoWT4TEc8FLBvdA_PR5cn7VBJuunUSqgFlRbspmTpiYaAixOEALw_wcB",
                    linkImmagine = "https://images.vivino.com/thumbs/sSj8RNdYTHy2N87Ue83_kw_pb_x960.png"
                };
                var vino5 = new Vino
                {
                    ID = 5,
                    Nome = "Badia a Passignano Riserva",
                    tipoVinoId = tipo1.ID,
                    AziendaVinicolaId = azV23.ID,
                    DenominazioneId = tipologia2.ID,
                    Preferito = false,
                    linkAppVivino = "https://www.vivino.com/IT/it/antinori-tuscany-badia-a-passignano-gran-selezione-chianti-classico/w/1653?ref=nav-search",
                    linkAppTannico = "https://www.tannico.it/chianti-classico-gran-selezione-docg-badia-a-passignano-2001-antinori.html",
                    linkImmagine = "https://images.vivino.com/thumbs/hxzM5LQaQEmv24npsUIXfQ_pb_x960.png"
                };
                var vino6 = new Vino
                {
                    ID = 6,
                    Nome = "Sondraia Bolgheri Superiore",
                    tipoVinoId = tipo1.ID,
                    AziendaVinicolaId = azV26.ID,
                    DenominazioneId = tipologia8.ID,
                    Preferito = false,
                    linkAppVivino = "https://www.vivino.com/IT/it/poggio-al-tesoro-bolgheri-superiore-sondraia/w/1269657",
                    linkAppTannico = "https://www.tannico.it/bolgheri-superiore-doc-sondraia-2018-poggio-al-tesoro.html?_gl=1*q7gp0g*_up*MQ..&gclid=Cj0KCQiAnNacBhDvARIsABnDa69DVOOMZ3ZWgoWT4TEc8FLBvdA_PR5cn7VBJuunUSqgFlRbspmTpiYaAixOEALw_wcB",
                    linkImmagine = "https://images.vivino.com/thumbs/HAG04pizRbuBQ85_Sge4pw_pb_x960.png"
                };
                var vino7 = new Vino
                {
                    ID = 7,
                    Nome = "I Castagni Bolgheri Superiore",
                    tipoVinoId = tipo1.ID,
                    AziendaVinicolaId = azV27.ID,
                    DenominazioneId = tipologia8.ID,
                    Preferito = false,
                    linkAppVivino = "https://www.vivino.com/IT/it/michele-satta-i-castagni-bolgheri-superiore/w/1929051",
                    linkImmagine = "https://images.vivino.com/thumbs/PECSQcmlRb6yvKwyVWrK-A_pb_x960.png"
                };
                var vino8 = new Vino
                {
                    ID = 8,
                    Nome = "Jassarte",
                    tipoVinoId = tipo1.ID,
                    AziendaVinicolaId = azV28.ID,
                    DenominazioneId = tipologia9.ID,
                    Preferito = false,
                    linkAppVivino = "https://www.vivino.com/IT/it/it-guado-al-melo-jassarte/w/1219254?ref=nav-search",
                    linkAppTannico = "https://www.tannico.it/toscana-rosso-igt-jassarte-2011-podere-guado-al-melo-13523.html",
                    linkImmagine = "https://images.vivino.com/thumbs/Q62bdJnQS6OCxUxjgJK5bw_pb_x960.png"
                };
                var vino9 = new Vino
                {
                    ID = 9,
                    Nome = "Nebbiolo D'Alba",
                    tipoVinoId = tipo1.ID,
                    AziendaVinicolaId = azV3.ID,
                    DenominazioneId = tipologia10.ID,
                    Preferito = false,
                    linkAppVivino = "https://www.vivino.com/IT/it/it-mascarello-michele-nebbiolo-d-alba/w/1538679",
                    linkImmagine = "https://www.vivino.com/packs/f1b798fa2a2afa4f598391f35cba7e57.png"
                };
                var vino10 = new Vino
                {
                    ID = 10,
                    Nome = "Barbaresco",
                    tipoVinoId = tipo1.ID,
                    AziendaVinicolaId = azV3.ID,
                    DenominazioneId = tipologia11.ID,
                    Preferito = false,
                    linkImmagine = "https://www.vivino.com/packs/f1b798fa2a2afa4f598391f35cba7e57.png"
                };
                var vino11 = new Vino
                {
                    ID = 11,
                    Nome = "Chianti Colli Senesi",
                    tipoVinoId = tipo1.ID,
                    AziendaVinicolaId = azV22.ID,
                    DenominazioneId = tipologia12.ID,
                    Preferito = false,
                    linkAppVivino = "https://www.vivino.com/IT/it/geografico-chianti-colli-senesi/w/15339",
                    linkImmagine = "https://images.vivino.com/thumbs/ADsXD-vOSqK0qy5viOpDbA_pb_x960.png"
                };
                var vino12 = new Vino
                {
                    ID = 12,
                    Nome = "Fattoria di Doccia Chianti Rufina",
                    tipoVinoId = tipo1.ID,
                    AziendaVinicolaId = azV29.ID,
                    DenominazioneId = tipologia13.ID,
                    Preferito = false,
                    linkAppVivino = "https://www.vivino.com/IT/it/fattoria-di-doccia-chianti-rufina/w/1301281",
                    linkImmagine = "https://www.vivino.com/packs/f1b798fa2a2afa4f598391f35cba7e57.png"
                };
                var vino13 = new Vino
                {
                    ID = 13,
                    Nome = "L'anime a Rallegrar",
                    tipoVinoId = tipo1.ID,
                    AziendaVinicolaId = azV30.ID,
                    DenominazioneId = tipologia14.ID,
                    Preferito = false,
                    linkAppVivino = "https://www.vivino.com/IT/it/capua-winery-l-anime-a-rallegrar/w/7882714",
                    linkImmagine = "https://www.vivino.com/packs/f1b798fa2a2afa4f598391f35cba7e57.png"
                };
                context.Vino.AddRange(vino1);
                context.Vino.AddRange(vino2);
                context.Vino.AddRange(vino3);
                context.Vino.AddRange(vino4);
                context.Vino.AddRange(vino5);
                context.Vino.AddRange(vino6);
                context.Vino.AddRange(vino7);
                context.Vino.AddRange(vino8);
                context.Vino.AddRange(vino9);
                context.Vino.AddRange(vino10);
                context.Vino.AddRange(vino11);
                context.Vino.AddRange(vino12);
                context.Vino.AddRange(vino13);
                ///************************************************************
                ///


                ///
                /// MOVIMENI VINO *************************************************
                ///
                var mov1 = new MovimentiVino
                {
                    ID = 1,
                    VinoId = vino1.ID,
                    Annata = 2020,
                    Movimento = 1
                };
                context.MovimentiVino.AddRange(mov1);

                ///************************************************************
                ///


                ///
                /// UVA VINO *************************************************
                ///
                var uvaVino1 = new UvaVino
                {
                    ID = 1,
                    VinoId = vino1.ID,
                    UvaId = uva9.ID,
                    Percentuale = 100
                };
                context.UvaVino.AddRange(uvaVino1);
                var uvaVino2 = new UvaVino
                {
                    ID = 2,
                    VinoId = vino2.ID,
                    UvaId = uva3.ID,
                    Percentuale = 40
                };
                context.UvaVino.AddRange(uvaVino2);
                var uvaVino3 = new UvaVino
                {
                    ID = 3,
                    VinoId = vino2.ID,
                    UvaId = uva2.ID,
                    Percentuale = 30
                };
                context.UvaVino.AddRange(uvaVino3);
                var uvaVino4 = new UvaVino
                {
                    ID = 4,
                    VinoId = vino2.ID,
                    UvaId = uva12.ID,
                    Percentuale = 20
                };
                context.UvaVino.AddRange(uvaVino4);
                var uvaVino5 = new UvaVino
                {
                    ID = 5,
                    VinoId = vino2.ID,
                    UvaId = uva13.ID,
                    Percentuale = 10
                };
                context.UvaVino.AddRange(uvaVino5);
                var uvaVino6 = new UvaVino
                {
                    ID = 6,
                    VinoId = vino3.ID,
                    UvaId = uva14.ID,
                    Percentuale = 100
                };
                context.UvaVino.AddRange(uvaVino6);
                ///************************************************************
                ///


                context.SaveChanges();
            }
        }
    }
}
