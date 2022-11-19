using Cantina.Data;
using Microsoft.EntityFrameworkCore;

namespace Cantina.Persistence
{
    public class DbInitialiser
    {
        private readonly CantinaContext _context;

        public DbInitialiser(CantinaContext context)
        {
            _context = context;
        }

        public void Run()
        {
            // TODO: Add initialisation logic.
            _context.Database.EnsureCreated();
        }
    }
}
