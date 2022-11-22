using System.Linq;
using Cantina.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using static MudBlazor.CategoryTypes;

namespace Cantina.Data
{
    public class VinoService
    {
        public Vino vino { get; set; } = default!;
        private CantinaContext _context;

        public VinoService(CantinaContext context)
        {
            _context = context;
        }

        // ****** GET VINI ***********************
        public Task<List<VinoDTO>> GetVini()
        {
            List<VinoDTO> listVinoDto = new List<VinoDTO>();
            var items = _context.Vino.Include(a => a.AziendaVinicola).ToList();
            items = _context.Vino.Include(a => a.tipoVino).ToList();
            items = _context.Vino.Include(a => a.Denominazione).ToList();

            foreach (var vino in items)
            {
                int numBottigleViste = _context.MovimentiVino.Where(x => x.VinoId == vino.ID && x.Movimento > 0).Count();
                int numBottigleCantina = _context.MovimentiVino.Where(x => (x.VinoId == vino.ID)).Sum(x => x.Movimento);
                int numBottiglieBevute = _context.MovimentiVino.Where(x => x.VinoId == vino.ID && x.Movimento < 0).Count();
                bool inCant = numBottigleCantina > 0 ? true : false;
                listVinoDto.Add(new VinoDTO() {ID = vino.ID, Nome = vino.Nome, AziendaVinicolaId = vino.AziendaVinicolaId ,AziendaVinicola = vino.AziendaVinicola.Nome, tipoVino = vino.tipoVino.Tipo, Barcode = vino.Barcode, QuantitàBottiglePossedute = numBottigleViste, inCantina = inCant, bottglieInCantina = numBottigleCantina, bottiglieBevute = numBottiglieBevute, linkImmagine=vino.linkImmagine });
            }

            return Task.FromResult(listVinoDto);
        }
        //*******************************************


        /// <summary>
        /// GET VINI AZIENDA VINICOLA
        /// </summary>
        /// <returns></returns>
        public Task<List<VinoDTO>> GetViniAziendaVinicola(int idAzienda, int idVino)
        {
            List<VinoDTO> listVinoDto = new List<VinoDTO>();
            var items = _context.Vino.Include(a => a.AziendaVinicola).ToList();
            items = _context.Vino.Include(a => a.tipoVino).ToList();
            items = _context.Vino.Where(x => x.AziendaVinicolaId == idAzienda && x.ID !=idVino).ToList();

            foreach (var vino in items)
            {
                int numBottigleViste = _context.MovimentiVino.Where(x => x.VinoId == vino.ID && x.Movimento > 0).Count();
                int numBottigleCantina = _context.MovimentiVino.Where(x => (x.VinoId == vino.ID)).Sum(x => x.Movimento);
                int numBottiglieBevute = _context.MovimentiVino.Where(x => x.VinoId == vino.ID && x.Movimento < 0).Count();
                bool inCant = numBottigleCantina > 0 ? true : false;
                listVinoDto.Add(new VinoDTO() { ID = vino.ID, Nome = vino.Nome, AziendaVinicolaId = vino.AziendaVinicolaId, AziendaVinicola = vino.AziendaVinicola.Nome, tipoVino = vino.tipoVino.Tipo, Barcode = vino.Barcode, QuantitàBottiglePossedute = numBottigleViste, inCantina = inCant, bottglieInCantina = numBottigleCantina, bottiglieBevute = numBottiglieBevute, linkImmagine = vino.linkImmagine });
            }

            return Task.FromResult(listVinoDto.ToList());
        }



        // ****** GET TIPI VINO ***********************
        public Task<List<tipoVino>> GetTipiVino()
        {
            var items = _context.tipoVino.ToList();

            return Task.FromResult(items);
        }
        //*********************************************

        public Task<List<AziendaVinicola>> GetAziende()
        {
            var items = _context.AziendaVinicola.ToList();
            return Task.FromResult(items);
        }

        public Task<List<tipoVino>> GetTipoVino()
        {
            var items = _context.tipoVino.ToList();

            return Task.FromResult(items);
        }

        public Task<Vino> GetVinoID(int id)
        {
            var items = _context.Vino.Where(x => x.ID == id).FirstOrDefault();
            return Task.FromResult(items);
        }

        public Task<VinoDTO> GetVinoIDdto(int id)
        {
            VinoDTO VinoDto = new VinoDTO();
            var items = _context.Vino.Include(a => a.AziendaVinicola).ToList();
            items = _context.Vino.Include(a => a.tipoVino).ToList();
            items = _context.Vino.Include(a => a.AziendaVinicola.Nazione).ToList();
            items = _context.Vino.Include(a => a.AziendaVinicola.Regione).ToList();
            items = _context.Vino.Where(x => x.ID == id).ToList();

            int numBottigleViste = _context.MovimentiVino.Where(x => x.VinoId == items.FirstOrDefault().ID && x.Movimento > 0).Count();
            int numBottigleCantina = _context.MovimentiVino.Where(x => (x.VinoId == items.FirstOrDefault().ID)).Sum(x => x.Movimento);
            int numBottiglieBevute = _context.MovimentiVino.Where(x => x.VinoId == items.FirstOrDefault().ID && x.Movimento < 0).Count();
            List<MovimentiVino> movList = _context.MovimentiVino.Where(x => x.VinoId == items.FirstOrDefault().ID).ToList();

            var group = movList.GroupBy(x => x.Annata).ToList();
            List<int> annate = new();
            int sumAnnate = 0;
            foreach(var item in group)
            {
                foreach(var item2 in item)
                {
                    sumAnnate += item2.Movimento;
                }
                if (sumAnnate > 0)
                    annate.Add(item.First().Annata);

                sumAnnate = 0;
            }
            bool inCant = numBottigleCantina > 0 ? true : false;
            annate.Sort();
            VinoDto.ID = items.FirstOrDefault().ID;
            VinoDto.Nome = items.FirstOrDefault().Nome;
            VinoDto.AziendaVinicolaId = items.FirstOrDefault().AziendaVinicolaId;
            VinoDto.AziendaVinicola = items.FirstOrDefault().AziendaVinicola.Nome;
            VinoDto.Nazione = items.FirstOrDefault().AziendaVinicola.Nazione.Nome;
            VinoDto.Regione = items.FirstOrDefault().AziendaVinicola.Regione.Nome;
            VinoDto.Barcode = items.FirstOrDefault().Barcode;
            VinoDto.bottglieInCantina = numBottigleCantina;
            VinoDto.QuantitàBottiglePossedute = numBottigleViste;
            VinoDto.bottiglieBevute = numBottiglieBevute;
            VinoDto.Annata = annate;
            VinoDto.linkImmagine = items.FirstOrDefault().linkImmagine;

            return Task.FromResult(VinoDto);
        }



        public Task<List<VinoDTO>> GetViniCantina()
        {
            List<VinoDTO> listVinoDto = new List<VinoDTO>();
            var items = _context.Vino.Include(a => a.AziendaVinicola).ToList();
            items = _context.Vino.Include(a => a.tipoVino).ToList();

            foreach (var vino in items)
            {
                int numBottigleViste = _context.MovimentiVino.Where(x => x.VinoId == vino.ID && x.Movimento > 0).Count();
                int numBottigleCantina = _context.MovimentiVino.Where(x => (x.VinoId == vino.ID)).Sum(x => x.Movimento);
                int numBottiglieBevute = _context.MovimentiVino.Where(x => x.VinoId == vino.ID && x.Movimento < 0).Count();
                bool inCant = numBottigleCantina > 0 ? true : false;
                if (inCant)
                    listVinoDto.Add(new VinoDTO() { ID = vino.ID, Nome = vino.Nome, AziendaVinicola = vino.AziendaVinicola.Nome, tipoVino = vino.tipoVino.Tipo, Barcode = vino.Barcode, QuantitàBottiglePossedute = numBottigleViste, inCantina = inCant, bottglieInCantina = numBottigleCantina, bottiglieBevute = numBottiglieBevute, linkImmagine = vino.linkImmagine });
            }
            return Task.FromResult(listVinoDto);
        }


        // ********** GET VINO BARCODE *************************
        public Task<List<Vino>> GetVinoBarcode(int barcode)
        {
            List<Vino> listVino = new List<Vino>();
            listVino = _context.Vino.Where(x => x.Barcode == barcode).ToList();
            return Task.FromResult(listVino);
        }

        public Task<List<VinoDTO>> GetVinoBarcodeDTO(int barcode)
        {
            List<VinoDTO> listVinoDto = new List<VinoDTO>();
            var vinoBarcode = _context.Vino.Include(a => a.AziendaVinicola).ToList();
            vinoBarcode = _context.Vino.Include(a => a.tipoVino).ToList();
            vinoBarcode = _context.Vino.Where(x => x.Barcode == barcode).ToList();

            foreach (var vino in vinoBarcode)
            {
                int numBottigleViste = _context.MovimentiVino.Where(x => x.VinoId == vino.ID && x.Movimento > 0).Count();
                int numBottigleCantina = _context.MovimentiVino.Where(x => (x.VinoId == vino.ID)).Sum(x => x.Movimento);
                bool inCant = numBottigleCantina > 0 ? true : false;
                listVinoDto.Add(new VinoDTO() { ID = vino.ID, Nome = vino.Nome, AziendaVinicolaId = vino.AziendaVinicolaId, AziendaVinicola = vino.AziendaVinicola.Nome, tipoVino = vino.tipoVino.Tipo, Barcode = vino.Barcode, QuantitàBottiglePossedute = numBottigleViste, inCantina = inCant, bottglieInCantina = numBottigleCantina });
            }

            return Task.FromResult(listVinoDto);
        }
        // *****************************************************


        // ****** ADD VINO NEW ANNATA DA BARCODE ***************
        public async Task<int> AddVinoNewAnnata(int idVino, int annata)
        {
            Vino vino = new();
            Vino newVino = new();
            vino = await GetVinoID(idVino);
            newVino.AziendaVinicolaId = vino.AziendaVinicolaId;           
            //newVino.Annata = annata;
            newVino.Barcode = vino.Barcode;
            newVino.DenominazioneVinoId = vino.DenominazioneVinoId;
            newVino.linkAppVivino = vino.linkAppVivino;
            newVino.linkImmagine = vino.linkImmagine;
            newVino.tipoVinoId = vino.tipoVinoId;
            newVino.Nome = vino.Nome; 
            _context.Vino.Add(newVino);
            await _context.SaveChangesAsync();
            return newVino.ID;
        }
        // *****************************************************


        // *************** GET VINI RANDOM *********************
        public Task<List<VinoDTO>> GetViniRandom()
        {
            List<VinoDTO> listVinoDto = new List<VinoDTO>();
            int from = 1;
            int to_maxID = _context.Vino.Max(x => x.ID);

            int numViniRandom = 12;
            List<int> numeriRandom = new();

            for (int i = 0; i < numViniRandom; i++)
            {
                Random random = new Random();
                int numeroCasuale = random.Next(from, to_maxID+1);
                numeriRandom.Add(numeroCasuale);
            }

            var items = _context.Vino.Include(a => a.AziendaVinicola).ToList();
            items = _context.Vino.Include(a => a.tipoVino).ToList();
            items = _context.Vino.Where(x => numeriRandom.Contains(x.ID)).ToList();

            foreach (var vino in items)
            {
                int numBottigleViste = _context.MovimentiVino.Where(x => x.VinoId == vino.ID && x.Movimento > 0).Count();
                int numBottigleCantina = _context.MovimentiVino.Where(x => (x.VinoId == vino.ID)).Sum(x => x.Movimento);
                bool inCant = numBottigleCantina > 0 ? true : false;
                listVinoDto.Add(new VinoDTO() { ID = vino.ID, Nome = vino.Nome, AziendaVinicolaId = vino.AziendaVinicolaId, AziendaVinicola = vino.AziendaVinicola.Nome, tipoVino = vino.tipoVino.Tipo, Barcode = vino.Barcode, QuantitàBottiglePossedute = numBottigleViste, inCantina = inCant, bottglieInCantina = numBottigleCantina, linkImmagine = vino.linkImmagine });
            }
            return Task.FromResult(listVinoDto);
        }
        // *****************************************************


        // ************** GET INFO NUMERICHE *******************
        public Task<List<int>> GetInfoNumeriche()
        {
            var items = _context.Vino.Include(a => a.tipoVino).ToList();

            List<int> numeriBottiglie = new();
            int numBottiglieBevute = _context.MovimentiVino.Where(x => x.Movimento < 0).Count();
            int numBottiglieCantina = _context.MovimentiVino.Sum(x => x.Movimento);
            int numBottigleAcquistate = _context.MovimentiVino.Where(x => x.Movimento > 0).Count();

            int numViniRossi = 0;
            int numViniBianchi = 0;
            int numViniBinachiFrizzanti = 0;
            int numViniProsecchi = 0;
            int numViniChampagne = 0;
            foreach (var vino in items)
            {
                if (vino.tipoVino.Tipo == "Rosso")
                    numViniRossi++;

                if (vino.tipoVino.Tipo == "Bianco")
                    numViniBianchi++;

                if (vino.tipoVino.Tipo == "Bianco Frizzante")
                    numViniBinachiFrizzanti++;

                if (vino.tipoVino.Tipo == "Prosecco")
                    numViniProsecchi++;

                if (vino.tipoVino.Tipo == "Champagne")
                    numViniChampagne++;
            }

            numeriBottiglie.Add(numBottiglieBevute);
            numeriBottiglie.Add(numBottiglieCantina);
            numeriBottiglie.Add(numBottigleAcquistate);
            numeriBottiglie.Add(numViniRossi);
            numeriBottiglie.Add(numViniBianchi);
            numeriBottiglie.Add(numViniBinachiFrizzanti);
            numeriBottiglie.Add(numViniProsecchi);
            numeriBottiglie.Add(numViniChampagne);

            return Task.FromResult(numeriBottiglie);
        }
        // *****************************************************


        //public async Task<IActionResult> UpdateVinoBarcode(string nome, int annata, string aziendaVinicola, decimal price, int quantità, int inCantina, int barcode, string linkAppVino)
        //public async Task<IActionResult> UpdateVinoBarcode(Vino vino)
        public async Task UpdateVinoBarcode(Vino vino)
        {
            _context.Attach(vino).State = EntityState.Modified;
            await _context.SaveChangesAsync();

        }

        //funzione per aggiungere un nuovo vino
        public async Task AddVino(Vino vino)
        {
            _context.Vino.Add(vino);
            await _context.SaveChangesAsync();
        }


        // ****** ADD MOVIMENTO *****************
        public async Task AddMovimento(MovimentiVino movVino)
        {
            //devo controllare che non si stia rimuovendo un vino non presente in cantina
            //nel caso in cui si stia rimuovendo un vino che non è presente in cantina ci verrà notificato e richiesto se si vuole aggiungere il "doppio movimento"
            //di ingresso in cantina e di uscita dalla cantina
            int numBottigleCantina = _context.MovimentiVino.Where(x => (x.VinoId == movVino.VinoId && x.Annata == movVino.Annata)).Sum(x => x.Movimento);
            if (numBottigleCantina == 0 & movVino.Movimento < 0)
            {
                MovimentiVino newMov = new();
                newMov.Movimento = (-1) * movVino.Movimento;
                newMov.VinoId = movVino.VinoId;
                newMov.Data = movVino.Data;
                newMov.Prezzo = movVino.Prezzo;
                newMov.Note = movVino.Note;
                _context.MovimentiVino.Add(newMov);
            }

            _context.MovimentiVino.Add(movVino);
            await _context.SaveChangesAsync();
        }
        // **************************************

        // ****** CHECK MOVIMENTO *****************
        // controlliamo se il movimento negativo inserito è riferito ad un vino ed un'annata presenti in cantina
        public bool CheckMovimento(int idVino, int annata)
        {
            int numBottiglie = _context.MovimentiVino.Where(x => x.VinoId == idVino && x.Annata == annata).Sum(x => x.Movimento);

            if(numBottiglie > 0)
            {
                return true;
            }
            else
            {
                return false;
            }
        }
        // **************************************


        // ***************** GET MOVIMENTI *********************
        public Task<List<MovimentoDTO>> GetMovimenti()
        {
            List<MovimentoDTO> listMovimentiDto = new List<MovimentoDTO>();
            List<VinoDTO> listVinoDto = new List<VinoDTO>();

            var items = _context.MovimentiVino.Include(a => a.Vino).ToList();
            items.OrderBy(x => x.Data);

            foreach (var movimento in items)
            {
                //listMovimentiDto.Add(new MovimentoDTO() { ID = movimento.ID, Nome = movimento.Vino.Nome, Annata = (int)movimento.Vino.Annata, Movimento = movimento.Movimento, Data = movimento.Data});
            }

            return Task.FromResult(listMovimentiDto);
        }
        // ****************************************************

        /// <summary>
        /// GET VINI DTO IN FUNZIONE DELLA RICERCA
        /// </summary>
        /// <param name="value"> stringa scritta nel campo di ricerca</param>
        /// <returns>ritarna una lista di Vini di tipi VinoDTO</returns>
        public Task<List<VinoDTO>> GetVinoDTOSearch(string value)
        {
            List<VinoDTO> listVinoDto = new List<VinoDTO>();
            var items = _context.Vino.Include(a => a.AziendaVinicola).ToList();
            items = _context.Vino.Include(a => a.tipoVino).ToList();

            foreach (var vino in items)
            {
                if(vino.Nome.Contains(value) || vino.AziendaVinicola.Nome.Contains(value))
                {
                    int numBottigleViste = _context.MovimentiVino.Where(x => x.VinoId == vino.ID && x.Movimento > 0).Count();
                    int numBottigleCantina = _context.MovimentiVino.Where(x => (x.VinoId == vino.ID)).Sum(x => x.Movimento);
                    int numBottiglieBevute = _context.MovimentiVino.Where(x => x.VinoId == vino.ID && x.Movimento < 0).Count();
                    bool inCant = numBottigleCantina > 0 ? true : false;
                    listVinoDto.Add(new VinoDTO() { ID = vino.ID, Nome = vino.Nome, AziendaVinicolaId = vino.AziendaVinicolaId, AziendaVinicola = vino.AziendaVinicola.Nome, tipoVino = vino.tipoVino.Tipo, Barcode = vino.Barcode, QuantitàBottiglePossedute = numBottigleViste, inCantina = inCant, bottglieInCantina = numBottigleCantina, bottiglieBevute = numBottiglieBevute, linkImmagine = vino.linkImmagine });

                }
            }
            return Task.FromResult(listVinoDto);
        }
       


        //funzione per aggiungere una nuova Azienda Vinicola
        public async Task AddAziendaVinicola(AziendaVinicola azienda)
        {
            _context.AziendaVinicola.Add(azienda);
            await _context.SaveChangesAsync();
        }

        public Task<int> GetQuantitàVino(int vinoID)
        {
            int numMovimenti = _context.MovimentiVino.Where(x => x.VinoId == vinoID).Count();
            return Task.FromResult(numMovimenti);
        }

        private IActionResult RedirectToPage(string v)
        {
            throw new NotImplementedException();
        }
    }
}
