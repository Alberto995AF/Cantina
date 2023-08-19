namespace Cantina.Data
{
    public class VinoDTO
    {
        public int ID { get; set; }

        public string Nome { get; set; }

        public string tipoVino { get; set; }

        public int TipoVinoId { get; set; }
        public int AziendaVinicolaId { get; set; }

        public string AziendaVinicola { get; set; }

        public string Nazione { get; set; }

        public string Regione { get; set; }

        public int DenominazioneId { get; set; }

        public string Denominazione { get; set; }

        public int QuantitàBottiglePossedute { get; set; }

        public bool inCantina { get; set; }

        public int bottglieInCantina { get; set; }

        public int bottiglieBevute { get; set; }

        public int? Barcode { get; set; }

        public bool Preferito { get; set; } = false;

        public List<String> Uva { get; set; }

        public List<int> UvaId { get; set; }

        public string? linkAppVivino { get; set; }

        public string? linkAppTannico { get; set; }

        public string? linkImmagine { get; set; }

        public List<annataPrezzo>? annoPrezzo { get; set; }

        public int? avgPrice { get; set; }
    }

    public struct annataPrezzo
    {
        public int annata;
        public decimal prezzo;
    };
}