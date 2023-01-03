using System.Collections.Generic;
using System.Linq;
using Cantina.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Serilog;
using static MudBlazor.CategoryTypes;

namespace Cantina.Data
{
    public class CostiVinoService
    {
        public Vino vino { get; set; } = default!;
        private CantinaContext _context;

        public CostiVinoService(CantinaContext context)
        {
            _context = context;
        }

        /// <summary>
        /// GET VALORE CANTINA ATTUALE
        /// </summary>
        /// <param name="value"></param>
        /// <returns></returns>
        public Task<int> GetValoreCantina()
        {
            int totValoreCantina = 0;
            var items = _context.MovimentiVino.GroupBy(a => new { a.VinoId, a.Annata }).Select(t => new MovimentiVino { Annata = t.First().Annata, VinoId = t.First().VinoId, Prezzo = t.Sum(a => (int)a.Prezzo), Movimento = t.Sum(a => a.Movimento), Data = t.First().Data }).ToList();
            foreach(var mov in items)
            {
                //se mov.Movimento è maggiore di zero vuol dire che quel vino è in cantina (mov positivi > mov negativi)
                if(mov.Movimento > 0)
                {
                    //devo ora calcolare il valore che quel vino ha nella mia cantina
                    //per fare questo conto prendo il valore di mov.Prezzo che comprende la somma di tutti i prezzi che abbiamo comprato
                    //compresi i vini che nel frattempo ho bevuto
                    //per calcolare il prezzo totale dei vini presenti prendo questo valore e lo diviso per il numero totale di movimenti positivi di questo vino per questa annata
                    var numMovPos = _context.MovimentiVino.Where(x => x.VinoId == mov.VinoId && x.Annata == mov.Annata && x.Movimento > 0).Count();
                    totValoreCantina += (int)(mov.Prezzo / numMovPos);
                }
            }
            return Task.FromResult((int)totValoreCantina);
        }

        /// <summary>
        /// Restituisce l valore totale di tutte le bottiglie di vino comprate
        /// </summary>
        /// <returns></returns>
        public Task<int> GetValoreTotaleSpesaVino()
        {
            var totValore = _context.MovimentiVino.Where(x => x.Movimento > 0).Sum(x => (int)x.Prezzo);
            return Task.FromResult((int)totValore);
        }

        /// <summary>
        /// Restituisce la spesa media a bottiglia
        /// </summary>
        /// <returns></returns>
        public Task<int> GetSpesaMediaBottiglia()
        {
            var totValore = _context.MovimentiVino.Where(x => x.Movimento > 0).Sum(x => (int)x.Prezzo);
            var numBottiglie = _context.MovimentiVino.Where(x => x.Movimento > 0).Count();
            int avgBottiglia = 0;
            if (numBottiglie > 0)
                avgBottiglia = (int)(totValore / numBottiglie);
            else
                avgBottiglia = 0;
            return Task.FromResult(avgBottiglia);
        }

    }
}
