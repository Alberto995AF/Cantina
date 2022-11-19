using Cantina.Data;
using Microsoft.EntityFrameworkCore;  

namespace Cantina.Persistence
{
    public class CantinaContext : DbContext
    {
        public CantinaContext(DbContextOptions<CantinaContext> options)
           : base(options)
        {
        }
        public DbSet<Vino> Vino { get; set; }
        public DbSet<AziendaVinicola> AziendaVinicola { get; set; }
        public DbSet<MovimentiVino> MovimentiVino { get; set; }
        public DbSet<Nazione> Nazione { get; set; }
        public DbSet<RegioniItaliane> RegioniItaliane { get; set; }
        public DbSet<tipoVino> tipoVino { get; set; }
        public DbSet<Denominazione> Denominazione { get; set; }
        public DbSet<Uva> Uva { get; set; }
    }
}

