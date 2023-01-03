using System.Collections.Generic;
using System.Linq;
using Cantina.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Serilog;
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

        // ****** GET VINI DTO ***********************
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
                listVinoDto.Add(new VinoDTO() { ID = vino.ID, Nome = vino.Nome, AziendaVinicolaId = vino.AziendaVinicolaId, AziendaVinicola = vino.AziendaVinicola.Nome, tipoVino = vino.tipoVino.Tipo, Barcode = vino.Barcode, QuantitàBottiglePossedute = numBottigleViste, inCantina = inCant, bottglieInCantina = numBottigleCantina, bottiglieBevute = numBottiglieBevute, linkImmagine = vino.linkImmagine });
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
            items = _context.Vino.Where(x => x.AziendaVinicolaId == idAzienda && x.ID != idVino).ToList();

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

        // ****** GET TIPO VINO ID***********************
        public Task<tipoVino> GetTipVinoId(int id)
        {
            var items = _context.tipoVino.Where(x => x.ID == id).FirstOrDefault();
            return Task.FromResult(items);
        }
        //*********************************************

        public Task<List<AziendaVinicola>> GetAziende()
        {
            var items = _context.AziendaVinicola.ToList();
            return Task.FromResult(items);
        }

        public Task<AziendaVinicola> GetAziendeId(int id)
        {
            var items = _context.AziendaVinicola.Where(x => x.ID == id).FirstOrDefault();
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

            //recuper la denominazione del vino se presente
            Denominazione denominazione = null;
            if (items.FirstOrDefault().DenominazioneVinoId != null)
                denominazione = _context.Denominazione.Where(a => a.ID == items.FirstOrDefault().DenominazioneVinoId).FirstOrDefault();

            //recupero le uve del vino se sono presenti
            var listaUve = _context.UvaVino.Where(a => a.VinoId == items.FirstOrDefault().ID);
            List<String> uvaList = new();
            foreach (var uvaVino in listaUve)
            {
                var uva = _context.Uva.Where(a => a.ID == uvaVino.UvaId).FirstOrDefault();
                uvaList.Add(uva.Nome.ToString());
            }

            //calcoliamo il prezzo medio del vino su tutte le annate considerando solo i movimenti di acquisto
            decimal avgPrice = 0;
            int num = 0;
            foreach(var movItem in movList)
            {
                if(movItem.Movimento>0)
                {
                    avgPrice += (decimal)movItem.Prezzo;
                    num++;
                }
            }
            if(num > 0)
                avgPrice = avgPrice / num;

            var movListGroupByYear = movList.GroupBy(x => x.Annata).ToList();
            List<int> annate = new();
            List<decimal> prezzi = new();

            List<annataPrezzo> annataPrezzo = new();
            int sumAnnate = 0;
            int numPrezzi = 0;
            decimal mediaPrezzi = 0;
            foreach (var mov in movListGroupByYear)
            {
                foreach (var item2 in mov)
                {
                    sumAnnate += item2.Movimento;
                    if (item2.Prezzo > 0)
                        numPrezzi++;
                    mediaPrezzi += (decimal)item2.Prezzo;
                }
                if (sumAnnate > 0)
                {
                    if(numPrezzi > 0)
                        mediaPrezzi = mediaPrezzi / numPrezzi;
                    annataPrezzo newAnPr = new();
                    newAnPr.annata = mov.First().Annata;
                    newAnPr.prezzo = mediaPrezzi;
                    annataPrezzo.Add(newAnPr);
                }
                sumAnnate = 0;
                numPrezzi = 0;
                mediaPrezzi = 0;
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
            if (denominazione != null)
            {
                VinoDto.Denominazione = denominazione.Nome;
            }
            VinoDto.Uva = uvaList;
            VinoDto.bottglieInCantina = numBottigleCantina;
            VinoDto.QuantitàBottiglePossedute = numBottigleViste;
            VinoDto.bottiglieBevute = numBottiglieBevute;
            VinoDto.Preferito = items.FirstOrDefault().Preferito;
            VinoDto.linkImmagine = items.FirstOrDefault().linkImmagine;
            VinoDto.annoPrezzo = annataPrezzo;
            VinoDto.avgPrice = avgPrice;

            return Task.FromResult(VinoDto);
        }

        /// <summary>
        /// GET VINI PREFERITI
        /// </summary>
        /// <returns></returns>
        public Task<List<VinoDTO>> GetFavoriteVini()
        {
            List<VinoDTO> listVinoDto = new List<VinoDTO>();
            var items = _context.Vino.Include(a => a.AziendaVinicola).ToList();
            items = _context.Vino.Include(a => a.tipoVino).ToList();
            items = _context.Vino.Include(a => a.Denominazione).ToList();
            items = _context.Vino.Where(a => a.Preferito == true).ToList();

            foreach (var vino in items)
            {
                int numBottigleViste = _context.MovimentiVino.Where(x => x.VinoId == vino.ID && x.Movimento > 0).Count();
                int numBottigleCantina = _context.MovimentiVino.Where(x => (x.VinoId == vino.ID)).Sum(x => x.Movimento);
                int numBottiglieBevute = _context.MovimentiVino.Where(x => x.VinoId == vino.ID && x.Movimento < 0).Count();
                bool inCant = numBottigleCantina > 0 ? true : false;
                listVinoDto.Add(new VinoDTO() { ID = vino.ID, Nome = vino.Nome, AziendaVinicolaId = vino.AziendaVinicolaId, AziendaVinicola = vino.AziendaVinicola.Nome, tipoVino = vino.tipoVino.Tipo, Barcode = vino.Barcode, QuantitàBottiglePossedute = numBottigleViste, inCantina = inCant, bottglieInCantina = numBottigleCantina, bottiglieBevute = numBottiglieBevute, linkImmagine = vino.linkImmagine });
            }

            return Task.FromResult(listVinoDto);
        }

        public Task<List<Uva>> GetUvaVinoId(int id)
        {
            //recupero le uve del vino se sono presenti
            var listaUve = _context.UvaVino.Where(a => a.VinoId == id);
            List<Uva> uvaList = new();
            foreach (var uvaVino in listaUve)
            {
                var uva = _context.Uva.Where(a => a.ID == uvaVino.UvaId).FirstOrDefault();
                uvaList.Add(uva);
            }
            return Task.FromResult(uvaList);
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
                int numeroCasuale = random.Next(from, to_maxID + 1);
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

        /// <summary>
        /// funzione per aggiungere un nuovo vino
        /// </summary>
        /// <param name="vino"> vino da aggiungere </param>
        /// <returns></returns>
        public async Task AddVino(Vino vino)
        {
            try
            {
                _context.Vino.Add(vino);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Log.Error("ERROR in AddVino: " + ex.Message);
                return;
            }
        }

        /// <summary>
        /// Funzione per aggiungere  l'associazione fra un vino e l'uva di cui è composto
        /// </summary>
        /// <param name="uvaVinoList">lista di record da inserire</param>
        /// <returns></returns>
        public async Task AddUvaVino(List<UvaVino> uvaVinoList)
        {
            foreach (var items in uvaVinoList)
            {
                _context.UvaVino.Add(items);
                await _context.SaveChangesAsync();
            }
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

            if (numBottiglie > 0)
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
        public Task<List<MovimentiVino>> GetMovimenti()
        {
            List<MovimentiVino> listMovimentiDto = new List<MovimentiVino>();

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
        /// Get movimenti positivi
        /// </summary>
        /// <returns></returns>
        public Task<List<MovimentiVino>> GetMovimentiPositivi()
        {
            var items = _context.MovimentiVino.Where(a => a.Movimento > 0).ToList();
            var result = items.GroupBy(a => a.Data?.Date).Select(t => new MovimentiVino { Data = t.First().Data?.Date, Movimento = t.Sum(a => a.Movimento) }).OrderBy(x => x.Data?.Date).ToList();

            return Task.FromResult(result);

        }

        /// <summary>
        /// Get movimenti negativi
        /// </summary>
        /// <returns></returns>
        public Task<List<MovimentiVino>> GetMovimentiNegativi()
        {
            var items = _context.MovimentiVino.Where(a => a.Movimento < 0).ToList();
            var result = items.GroupBy(a => a.Data?.Date).Select(t => new MovimentiVino { Data = t.First().Data?.Date, Movimento = t.Sum(a => a.Movimento) }).OrderBy(x => x.Data?.Date).ToList();

            return Task.FromResult(result);

        }

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


        /// <summary>
        /// GET AZIENDE IN FUNZIONE DELLA RICERCA
        /// </summary>
        /// <param name="value"> stringa scritta nel campo di ricerca</param>
        /// <returns>ritarna una lista di Aziende di tipi AziendaVinicola</returns>
        public Task<List<AziendaVinicola>> GetAziendeSearch(string value)
        {
            List<AziendaVinicola> listAziende = new();
            var item = _context.AziendaVinicola;

            foreach(var azd in item)
            {
                if(azd.Nome.Contains(value))
                {
                    listAziende.Add(azd);
                }
            }
            return Task.FromResult(listAziende);
        }


        /// <summary>
        /// GET TIPO VINO IN FUNZIONE DELLA RICERCA
        /// </summary>
        /// <param name="value"> stringa scritta nel campo di ricerca</param>
        /// <returns>ritarna una lista di tipi di vino</returns>
        public Task<List<tipoVino>> GetTipoVinoSearch(string value)
        {
            List<tipoVino> tipoVino = new();
            var item = _context.tipoVino;

            foreach (var azd in item)
            {
                if (azd.Tipo.Contains(value))
                {
                    tipoVino.Add(azd);
                }
            }
            return Task.FromResult(tipoVino);
        }


        /// <summary>
        /// GET DENOMINAZIONE IN FUNZIONE DELLA RICERCA
        /// </summary>
        /// <param name="value"> stringa scritta nel campo di ricerca</param>
        /// <returns>ritorna una lista di tipi di denomiazioni</returns>
        public Task<List<Denominazione>> GetDenominazioneSearch(string value)
        {
            List<Denominazione> denominazioneVino = new();
            var item = _context.Denominazione;

            foreach (var azd in item)
            {
                if (azd.Nome.Contains(value))
                {
                    denominazioneVino.Add(azd);
                }
            }
            return Task.FromResult(denominazioneVino);
        }


        /// <summary>
        /// GET UVA 
        /// </summary>
        /// <returns>ritorna una lista di uve</returns>
        public Task<List<Uva>> GetUvaSearch()
        {
            var item = _context.Uva.ToList();

            return Task.FromResult(item);
        }


        /// <summary>
        /// GET DENOMINAZIONE ID 
        /// </summary>
        /// <returns>ritorna la denominazione del vino</returns>
        public Task<Denominazione> GetDenominazioneId(int id)
        {
            var item = _context.Denominazione.Where(x => x.ID == id).FirstOrDefault();
            return Task.FromResult(item);
        }


        //funzione per aggiungere una nuova Azienda Vinicola
        public async Task AddAziendaVinicola(AziendaVinicola azienda)
        {
            _context.AziendaVinicola.Add(azienda);
            await _context.SaveChangesAsync();
        }

        /// <summary>
        /// funzione per aggiungere una nuova denominazione
        /// </summary>
        /// <param name="den"></param>
        /// <returns></returns>
        public async Task AddDenominazione(Denominazione den)
        {
            _context.Denominazione.Add(den);
            await _context.SaveChangesAsync();
        }

        /// <summary>
        /// funzione per aggiungere un tipo di uva
        /// </summary>
        /// <param name="uva"></param>
        /// <returns></returns>
        public async Task AddUva(Uva uva)
        {
            _context.Uva.Add(uva);
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


        public async Task ChangeFavorite(int vinoId, bool pref)
        {
            var vino = _context.Vino.Where(x => x.ID == vinoId).FirstOrDefault();
            vino.Preferito = pref;
            await _context.SaveChangesAsync();
        }

        /// <summary>
        /// GET NAZIONE IN FUNZIONE DELLA RICERCA
        /// </summary>
        /// <param name="value"> stringa scritta nel campo di ricerca</param>
        /// <returns>ritarna una lista di Nazioni di tipi Nazione</returns>
        public Task<List<Nazione>> GetNazioneSearch(string value)
        {
            List<Nazione> listNazione = new();
            var item = _context.Nazione;

            foreach (var naz in item)
            {
                if (naz.Nome.Contains(value))
                {
                    listNazione.Add(naz);
                }
            }
            return Task.FromResult(listNazione);
        }

        /// <summary>
        /// GET REGIONE IN FUNZIONE DELLA RICERCA
        /// </summary>
        /// <param name="value"> stringa scritta nel campo di ricerca</param>
        /// <returns>ritarna una lista di REgioni di tipi RegioniItaliane</returns>
        public Task<List<RegioniItaliane>> GetRegioneSearch(string value)
        {
            List<RegioniItaliane> listRegioni = new();
            var item = _context.RegioniItaliane;

            foreach (var reg in item)
            {
                if (reg.Nome.Contains(value))
                {
                    listRegioni.Add(reg);
                }
            }
            return Task.FromResult(listRegioni);
        }

        ///// <summary>
        ///// GET VALORE CANTINA ATTUALE
        ///// </summary>
        ///// <param name="value"></param>
        ///// <returns></returns>
        //public Task<decimal> GetValoreCantina()
        //{

        //    var item = _context.MovimentiVino.Where(a => a.Movimento > 0).Sum(a => (double)a.Prezzo);
        //    return Task.FromResult((decimal)item);
        //}
    }
}
