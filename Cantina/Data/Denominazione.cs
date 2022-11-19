using System.ComponentModel.DataAnnotations;

namespace Cantina.Data
{
    public class Denominazione
    {
        [Required]
        public int ID { get; set; }

        [Required]
        public string Nome { get; set; }

        public string? AreaGeografica { get; set; }

    }
}