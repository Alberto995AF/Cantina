using System.ComponentModel.DataAnnotations;

namespace Cantina.Data
{
    public class Vino
    {
        [Required]
        public int ID { get; set; }

        [Required]
        public string Nome { get; set; }

        public int? Annata { get; set; }

        [Required]
        public int tipoVinoId { get; set; }
        public tipoVino? tipoVino { get; set; }

        [Required]
        public int AziendaVinicolaId { get; set; }
        public AziendaVinicola? AziendaVinicola { get; set; }

        public int? UvaId { get; set; }
        public Uva? Uva { get; set; }

        public int? DenominazioneVinoId { get; set; }
        public Denominazione? Denominazione { get; set; }

        public int? Barcode { get; set; }

        public string? linkAppVivino { get; set; }

        public string? linkAppTannico { get; set; }

        public string? linkImmagine { get; set; }
    }
}