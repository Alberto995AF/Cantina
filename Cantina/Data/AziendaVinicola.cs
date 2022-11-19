namespace Cantina.Data
{
    public class AziendaVinicola
    {
        public int ID { get; set; }
        public string Nome { get; set; }
        public int RegioneId { get; set; }
        public RegioniItaliane? Regione { get; set; }
        public string Indirizzo { get; set; }
        public int NazioneId { get; set; }
        public Nazione? Nazione { get; set; }
        public string? Descrizione { get; set; }
    }
}