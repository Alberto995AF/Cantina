using System.Collections.Generic;
using System.Linq;
using Cantina.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Serilog;
using static MudBlazor.CategoryTypes;

namespace Cantina.Data
{
    public class FiltriService
    {
        public Vino vino { get; set; } = default!;
        private CantinaContext _context;

        Cantina.Data.VinoService VinoService;

        public FiltriService(CantinaContext context)
        {
            _context = context;
        }

        public async Task<List<VinoDTO>> GetViniCantinaPriceFilter(List<VinoDTO> listaVini, int min, int max)
        {
            List<VinoDTO> listVinoDto = new List<VinoDTO>();
            //var items = _context.Vino.Include(a => a.AziendaVinicola).ToList();
            //items = _context.Vino.Include(a => a.tipoVino).ToList();

            VinoDTO vinoSel = new();
            foreach (var vino in listaVini)
            {
                List<MovimentiVino> movList = _context.MovimentiVino.Where(x => x.VinoId == vino.ID).ToList();
                decimal avgPrice = 0;
                int num = 0;
                foreach (var movItem in movList)
                {
                    if (movItem.Movimento > 0)
                    {
                        avgPrice += (decimal)movItem.Prezzo;
                        num++;
                    }
                }
                if (num > 0)
                    avgPrice = avgPrice / num;


                if (avgPrice >= min && avgPrice <= max)
                {
                    int numBottigleViste = _context.MovimentiVino.Where(x => x.VinoId == vino.ID && x.Movimento > 0).Count();
                    int numBottigleCantina = _context.MovimentiVino.Where(x => (x.VinoId == vino.ID)).Sum(x => x.Movimento);
                    int numBottiglieBevute = _context.MovimentiVino.Where(x => x.VinoId == vino.ID && x.Movimento < 0).Count();
                    bool inCant = numBottigleCantina > 0 ? true : false;
                    if (inCant)
                        listVinoDto.Add(vino);
                        //listVinoDto.Add(new VinoDTO() { ID = vino.ID, Nome = vino.Nome, AziendaVinicola = vino.AziendaVinicola.Nome, tipoVino = vino.tipoVino.Tipo, Barcode = vino.Barcode, QuantitàBottiglePossedute = numBottigleViste, inCantina = inCant, bottglieInCantina = numBottigleCantina, bottiglieBevute = numBottiglieBevute, linkImmagine = vino.linkImmagine });

                }
            }
            return listVinoDto;
        }
    }
}
