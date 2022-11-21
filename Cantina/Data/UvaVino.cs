namespace Cantina.Data
{
    public class UvaVino
    {
        public int ID { get; set; }

        public int VinoId { get; set; }
        public Vino? Vino { get; set; }

        public int UvaId { get; set; }
        public Uva? Uva { get; set; }

        public int Percentuale { get; set; }
    }
}