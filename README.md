# 🍷 Cantina

Web app *mobile first* per gestire la cantina di vini e birre, pensata per iPhone.
Si installa sulla schermata Home come un'app vera (PWA), funziona anche offline e non richiede account né server: i dati restano sul telefono.

## Funzioni

- **Cantina**: tutte le bottiglie con tipologia, produttore, annata, denominazione, vitigni, zona, gradazione, formato, prezzo, posizione, data e luogo d'acquisto, voto, note e foto. Ricerca, filtri per tipologia, ordinamento, valore totale.
- **Codice a barre**: scansione con la fotocamera (o da foto, o digitando il codice). Dati e immagine arrivano da [Open Food Facts](https://world.openfoodfacts.org). Se il codice è già in cantina propone di aggiungere una bottiglia.
- **Immagini da internet**: ricerca su Open Food Facts, Wikimedia Commons e Wikipedia, oppure link a un'immagine o foto scattata.
- **Compilazione automatica**: dal nome/denominazione riconosce oltre 100 denominazioni e 100 vitigni (tipologia, vitigni, regione, finestra di consumo).
- **Finestra di consumo**: "Pronto da bere", "Bevi presto", "Oltre il picco", con sezione "Da bere presto" in home.
- **Storico**: "Stappa" toglie una bottiglia e la registra con data, voto, piatto, occasione e note di degustazione.
- **Abbinamenti** (offline, motore a regole):
  - *Ho un piatto* → profilo ideale e bottiglie della tua cantina ordinate per compatibilità;
  - *Ho una bottiglia* → piatti consigliati, temperatura di servizio e bicchiere.
- **Backup**: esporta/importa un file JSON (consigliato salvarlo su iCloud Drive).
- Modalità chiara/scura automatica.

## Pubblicazione (serve HTTPS per fotocamera e installazione)

È un sito statico: basta pubblicare la cartella così com'è.

**GitHub Pages**
1. Crea un repository su GitHub e carica questi file.
2. *Settings › Pages › Build and deployment*: Source "Deploy from a branch", branch `main`, cartella `/ (root)`.
3. Dopo un minuto l'app è su `https://<utente>.github.io/<repo>/`.

**In alternativa**: trascina la cartella su [Netlify Drop](https://app.netlify.com/drop) o Cloudflare Pages.

## Installazione su iPhone

1. Apri l'indirizzo in **Safari**.
2. Tocca **Condividi** › **Aggiungi alla schermata Home**.
3. Apri Cantina dall'icona: parte a tutto schermo. Al primo uso dello scanner consenti l'accesso alla fotocamera.

## Note

- I dati sono salvati in IndexedDB sul dispositivo: non si sincronizzano tra telefoni. Usa *Altro › Esporta backup*.
- Dopo una modifica al codice, aumenta `VERSION` in `sw.js` per aggiornare la cache offline.

## Struttura

```
index.html            shell dell'app
manifest.webmanifest  manifest PWA
sw.js                 service worker (offline)
css/app.css           stile
js/app.js             router e schermate
js/kb.js              base di conoscenza (tipologie, vitigni, denominazioni, birre, piatti)
js/pairing.js         motore di abbinamento
js/lookup.js          barcode (Open Food Facts) e ricerca immagini
js/scanner.js         lettore barcode (BarcodeDetector / ZXing)
js/db.js              archivio IndexedDB, backup
js/ui.js              componenti UI
vendor/zxing.min.js   libreria ZXing per la lettura dei codici
icons/                icone app
```
