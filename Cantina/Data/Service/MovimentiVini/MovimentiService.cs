using System.Collections.Generic;
using System.Linq;
using Cantina.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Serilog;
using static MudBlazor.CategoryTypes;

namespace Cantina.Data
{
    public class MovimentiService
    {
        public Vino vino { get; set; } = default!;
        private CantinaContext _context;

        Cantina.Data.VinoService VinoService;

        public MovimentiService(CantinaContext context)
        {
            _context = context;
        }

        public async Task<List<MovimentiVino>> GetViniBevuti()
        {
            var items = _context.MovimentiVino.Where(x => x.Movimento<0).Include(x => x.Vino).OrderByDescending(x => x.Data).ToList();
            return items;
        }
    }
}
