namespace Cantina.Data
{
    public class MovimentiVino
    {
        public int ID { get; set; }
        public int VinoId { get; set; }
        public Vino? Vino { get; set; }
        public int Movimento { get; set; }
        public DateTime Data { get; set; }
        public decimal? Prezzo { get; set; }
        public string? Note { get; set; }
    }
}