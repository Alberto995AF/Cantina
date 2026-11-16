// Base di conoscenza: tipologie, vitigni, denominazioni, stili di birra, categorie di piatti.
// Tutto offline: niente servizi esterni per gli abbinamenti.

export const norm = s => (s || '').toString().toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[’'`´]/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim();

export const TYPES = {
  rosso:       { label: 'Rosso',       plural: 'Rossi',       color: 'var(--t-rosso)' },
  bianco:      { label: 'Bianco',      plural: 'Bianchi',     color: 'var(--t-bianco)' },
  rosato:      { label: 'Rosato',      plural: 'Rosati',      color: 'var(--t-rosato)' },
  bollicine:   { label: 'Bollicine',   plural: 'Bollicine',   color: 'var(--t-bollicine)' },
  dolce:       { label: 'Dolce/Passito', plural: 'Dolci',     color: 'var(--t-dolce)' },
  fortificato: { label: 'Fortificato', plural: 'Fortificati', color: 'var(--t-fortificato)' },
  birra:       { label: 'Birra',       plural: 'Birre',       color: 'var(--t-birra)' },
  altro:       { label: 'Altro',       plural: 'Altro',       color: 'var(--t-altro)' },
};
export const isBeer = it => it && it.type === 'birra';

// Stili "di abbinamento": la chiave che collega bottiglie e piatti.
export const STYLES = {
  'bollicine':          { label: 'Bollicine secche', ex: 'Franciacorta, Trento DOC, Champagne, Prosecco', temp: '6–8 °C', glass: 'Tulipano' },
  'bianco-fresco':      { label: 'Bianco fresco e sapido', ex: 'Vermentino, Verdicchio, Pinot Grigio, Soave', temp: '8–10 °C', glass: 'Calice da bianco' },
  'bianco-aromatico':   { label: 'Bianco aromatico', ex: 'Gewürztraminer, Riesling, Müller-Thurgau', temp: '8–10 °C', glass: 'Calice da bianco' },
  'bianco-strutturato': { label: 'Bianco strutturato', ex: 'Chardonnay affinato, Fiano, Greco di Tufo, Timorasso', temp: '10–13 °C', glass: 'Calice ampio da bianco' },
  'rosato':             { label: 'Rosato', ex: 'Chiaretto, Cerasuolo d’Abruzzo, Salento rosato', temp: '10–12 °C', glass: 'Calice da bianco' },
  'rosso-frizzante':    { label: 'Rosso frizzante', ex: 'Lambrusco, Gutturnio frizzante, Bonarda', temp: '12–14 °C', glass: 'Calice medio' },
  'rosso-leggero':      { label: 'Rosso leggero', ex: 'Pinot Nero, Dolcetto, Grignolino, Frappato', temp: '14–16 °C', glass: 'Ballon (Borgogna)' },
  'rosso-medio':        { label: 'Rosso di medio corpo', ex: 'Chianti Classico, Barbera, Valpolicella, Montepulciano', temp: '16–18 °C', glass: 'Calice da rosso' },
  'rosso-strutturato':  { label: 'Rosso strutturato', ex: 'Barolo, Brunello, Amarone, Taurasi, Sagrantino', temp: '18–20 °C', glass: 'Calice ampio (Bordeaux)' },
  'dolce':              { label: 'Vino dolce o passito', ex: 'Moscato d’Asti, Passito di Pantelleria, Sauternes, Recioto', temp: '8–12 °C', glass: 'Calice piccolo' },
  'fortificato':        { label: 'Vino fortificato', ex: 'Porto, Marsala, Sherry', temp: '12–16 °C', glass: 'Calice piccolo' },
  'birra-chiara':       { label: 'Birra chiara (Lager/Pils)', ex: 'Helles, Pils, Kölsch', temp: '4–7 °C', glass: 'Pinta o flûte da pils' },
  'birra-weiss':        { label: 'Birra di frumento', ex: 'Weizen, Blanche', temp: '6–8 °C', glass: 'Bicchiere da weizen' },
  'birra-ipa':          { label: 'Birra luppolata (IPA/APA)', ex: 'IPA, APA, Pale Ale', temp: '7–10 °C', glass: 'Teku o pinta' },
  'birra-ambrata':      { label: 'Birra ambrata', ex: 'Amber/Red Ale, Bock, Märzen, Bitter', temp: '8–12 °C', glass: 'Pinta' },
  'birra-belga':        { label: 'Birra belga/d’abbazia', ex: 'Tripel, Dubbel, Saison, Quadrupel', temp: '10–13 °C', glass: 'Calice/coppa' },
  'birra-scura':        { label: 'Birra scura (Stout/Porter)', ex: 'Stout, Porter, Imperial Stout', temp: '10–14 °C', glass: 'Snifter o pinta' },
  'birra-acida':        { label: 'Birra acida', ex: 'Lambic, Gose, Kriek, Sour', temp: '6–9 °C', glass: 'Calice' },
  'birra-affumicata':   { label: 'Birra affumicata', ex: 'Rauchbier', temp: '8–10 °C', glass: 'Pinta' },
};

// ---------- Vitigni ----------
// body: 1 leggero, 2 medio, 3 strutturato; aro = aromatico
export const GRAPES = [
  // rossi
  ['Nebbiolo', 'rosso', 3], ['Sangiovese', 'rosso', 2], ['Barbera', 'rosso', 2], ['Dolcetto', 'rosso', 1],
  ['Aglianico', 'rosso', 3], ['Nero d’Avola', 'rosso', 2], ['Primitivo', 'rosso', 3], ['Montepulciano', 'rosso', 2],
  ['Corvina', 'rosso', 2], ['Corvinone', 'rosso', 2], ['Rondinella', 'rosso', 2], ['Lagrein', 'rosso', 2], ['Teroldego', 'rosso', 2],
  ['Sagrantino', 'rosso', 3], ['Cannonau', 'rosso', 2], ['Grenache', 'rosso', 2], ['Cabernet Sauvignon', 'rosso', 3],
  ['Cabernet Franc', 'rosso', 2], ['Merlot', 'rosso', 2], ['Pinot Nero', 'rosso', 1], ['Syrah', 'rosso', 3],
  ['Lambrusco', 'rosso', 1], ['Refosco', 'rosso', 2], ['Schiava', 'rosso', 1], ['Frappato', 'rosso', 1],
  ['Nerello Mascalese', 'rosso', 2], ['Gaglioppo', 'rosso', 2], ['Negroamaro', 'rosso', 2], ['Freisa', 'rosso', 1],
  ['Grignolino', 'rosso', 1], ['Ruchè', 'rosso', 1], ['Malbec', 'rosso', 3], ['Tempranillo', 'rosso', 2],
  ['Zinfandel', 'rosso', 3], ['Croatina', 'rosso', 2], ['Pelaverga', 'rosso', 1], ['Ciliegiolo', 'rosso', 1],
  ['Carignano', 'rosso', 2], ['Bovale', 'rosso', 2], ['Susumaniello', 'rosso', 2], ['Uva di Troia', 'rosso', 2],
  ['Petit Verdot', 'rosso', 3], ['Marzemino', 'rosso', 1], ['Schioppettino', 'rosso', 2], ['Pignolo', 'rosso', 3],
  ['Gamay', 'rosso', 1], ['Mourvèdre', 'rosso', 3], ['Carménère', 'rosso', 2], ['Pinotage', 'rosso', 2],
  // bianchi
  ['Chardonnay', 'bianco', 2], ['Sauvignon Blanc', 'bianco', 1], ['Pinot Grigio', 'bianco', 1], ['Pinot Bianco', 'bianco', 1],
  ['Vermentino', 'bianco', 1], ['Verdicchio', 'bianco', 2], ['Fiano', 'bianco', 3], ['Greco', 'bianco', 3],
  ['Falanghina', 'bianco', 1], ['Garganega', 'bianco', 1], ['Trebbiano', 'bianco', 1], ['Ribolla Gialla', 'bianco', 1],
  ['Friulano', 'bianco', 2], ['Gewürztraminer', 'bianco', 2, true], ['Traminer', 'bianco', 2, true], ['Müller-Thurgau', 'bianco', 1, true],
  ['Riesling', 'bianco', 2, true], ['Kerner', 'bianco', 1, true], ['Arneis', 'bianco', 1], ['Cortese', 'bianco', 1],
  ['Timorasso', 'bianco', 3], ['Pecorino', 'bianco', 2], ['Passerina', 'bianco', 1], ['Grillo', 'bianco', 1],
  ['Catarratto', 'bianco', 1], ['Carricante', 'bianco', 2], ['Vernaccia', 'bianco', 1], ['Malvasia', 'bianco', 1, true],
  ['Moscato', 'bianco', 1, true], ['Glera', 'bianco', 1], ['Turbiana', 'bianco', 2], ['Viognier', 'bianco', 3, true],
  ['Chenin Blanc', 'bianco', 2], ['Albariño', 'bianco', 1], ['Grüner Veltliner', 'bianco', 1], ['Sylvaner', 'bianco', 1],
  ['Nosiola', 'bianco', 1], ['Erbaluce', 'bianco', 1], ['Nascetta', 'bianco', 2], ['Bombino', 'bianco', 1],
  ['Coda di Volpe', 'bianco', 2], ['Biancolella', 'bianco', 1], ['Inzolia', 'bianco', 1], ['Zibibbo', 'bianco', 1, true],
  ['Manzoni Bianco', 'bianco', 2], ['Lugana', 'bianco', 2], ['Semillon', 'bianco', 2], ['Marsanne', 'bianco', 3],
].map(([name, type, body, aro]) => ({ name, type, body, aro: !!aro, k: norm(name) }));

// ---------- Denominazioni e vini famosi ----------
// s: stile, g: vitigni, r: regione, c: paese, w: finestra di consumo [da, a] anni dalla vendemmia, d: abbinamenti classici
export const DENOMS = [
  { k: ['barolo'], t: 'rosso', s: 'rosso-strutturato', g: ['Nebbiolo'], r: 'Piemonte', w: [8, 25], d: ['Brasato al Barolo', 'Tajarin al tartufo bianco', 'Formaggi stagionati (Castelmagno)'] },
  { k: ['barbaresco'], t: 'rosso', s: 'rosso-strutturato', g: ['Nebbiolo'], r: 'Piemonte', w: [6, 20], d: ['Arrosto di vitello', 'Risotto al tartufo', 'Agnolotti del plin al sugo d’arrosto'] },
  { k: ['gattinara', 'ghemme', 'boca', 'lessona', 'bramaterra'], t: 'rosso', s: 'rosso-strutturato', g: ['Nebbiolo'], r: 'Piemonte', w: [6, 20], d: ['Brasato', 'Selvaggina', 'Formaggi stagionati'] },
  { k: ['roero rosso', 'langhe nebbiolo', 'nebbiolo d alba'], t: 'rosso', s: 'rosso-medio', g: ['Nebbiolo'], r: 'Piemonte', w: [3, 10], d: ['Vitello tonnato', 'Risotto ai funghi', 'Carne cruda all’albese'] },
  { k: ['valtellina', 'sforzato', 'sfursat', 'inferno', 'sassella', 'grumello'], t: 'rosso', s: 'rosso-strutturato', g: ['Nebbiolo'], r: 'Lombardia', w: [5, 18], d: ['Pizzoccheri', 'Bresaola', 'Selvaggina'] },
  { k: ['barbera d asti', 'barbera d alba', 'barbera del monferrato', 'nizza'], t: 'rosso', s: 'rosso-medio', g: ['Barbera'], r: 'Piemonte', w: [2, 8], d: ['Agnolotti al ragù', 'Bollito misto', 'Salumi piemontesi'] },
  { k: ['dolcetto', 'dogliani'], t: 'rosso', s: 'rosso-leggero', g: ['Dolcetto'], r: 'Piemonte', w: [1, 4], d: ['Antipasti piemontesi', 'Vitello tonnato', 'Salumi'] },
  { k: ['grignolino'], t: 'rosso', s: 'rosso-leggero', g: ['Grignolino'], r: 'Piemonte', w: [1, 3], d: ['Antipasti', 'Pesce in umido', 'Salumi'] },
  { k: ['ruche'], t: 'rosso', s: 'rosso-leggero', g: ['Ruchè'], r: 'Piemonte', w: [1, 5], d: ['Cucina speziata', 'Formaggi di media stagionatura'] },
  { k: ['gavi'], t: 'bianco', s: 'bianco-fresco', g: ['Cortese'], r: 'Piemonte', w: [0, 4], d: ['Antipasti di pesce', 'Risotto alle verdure', 'Pesce al forno'] },
  { k: ['roero arneis', 'arneis'], t: 'bianco', s: 'bianco-fresco', g: ['Arneis'], r: 'Piemonte', w: [0, 3], d: ['Antipasti di verdure', 'Pesce di lago', 'Tomini'] },
  { k: ['timorasso', 'derthona'], t: 'bianco', s: 'bianco-strutturato', g: ['Timorasso'], r: 'Piemonte', w: [2, 10], d: ['Pesce al forno', 'Formaggi semistagionati', 'Carni bianche'] },
  { k: ['moscato d asti'], t: 'dolce', s: 'dolce', g: ['Moscato'], r: 'Piemonte', w: [0, 2], d: ['Panettone', 'Crostata di frutta', 'Torta di nocciole'] },
  { k: ['asti spumante', 'asti docg'], t: 'dolce', s: 'dolce', g: ['Moscato'], r: 'Piemonte', w: [0, 2], d: ['Panettone e pandoro', 'Pasticceria secca'] },
  { k: ['brachetto'], t: 'dolce', s: 'dolce', g: ['Brachetto'], r: 'Piemonte', w: [0, 2], d: ['Fragole', 'Dolci ai frutti rossi', 'Crostata'] },
  { k: ['alta langa'], t: 'bollicine', s: 'bollicine', g: ['Pinot Nero', 'Chardonnay'], r: 'Piemonte', w: [0, 6], d: ['Aperitivo', 'Crudi di mare', 'Fritto misto'] },
  { k: ['brunello'], t: 'rosso', s: 'rosso-strutturato', g: ['Sangiovese'], r: 'Toscana', w: [8, 25], d: ['Bistecca alla fiorentina', 'Cinghiale in umido', 'Pecorino stagionato'] },
  { k: ['rosso di montalcino'], t: 'rosso', s: 'rosso-medio', g: ['Sangiovese'], r: 'Toscana', w: [2, 7], d: ['Pici al ragù', 'Arrosti', 'Salumi toscani'] },
  { k: ['chianti classico'], t: 'rosso', s: 'rosso-medio', g: ['Sangiovese'], r: 'Toscana', w: [3, 12], d: ['Pappardelle al cinghiale', 'Bistecca alla fiorentina', 'Crostini toscani'] },
  { k: ['chianti'], t: 'rosso', s: 'rosso-medio', g: ['Sangiovese'], r: 'Toscana', w: [1, 6], d: ['Pasta al ragù', 'Pizza', 'Salumi toscani'] },
  { k: ['vino nobile', 'nobile di montepulciano'], t: 'rosso', s: 'rosso-strutturato', g: ['Sangiovese'], r: 'Toscana', w: [5, 15], d: ['Arrosti di carne rossa', 'Selvaggina', 'Pecorino di Pienza'] },
  { k: ['morellino'], t: 'rosso', s: 'rosso-medio', g: ['Sangiovese'], r: 'Toscana', w: [1, 6], d: ['Acquacotta', 'Carni alla griglia', 'Salumi'] },
  { k: ['bolgheri', 'sassicaia', 'ornellaia', 'guado al tasso', 'grattamacco'], t: 'rosso', s: 'rosso-strutturato', g: ['Cabernet Sauvignon', 'Merlot', 'Cabernet Franc'], r: 'Toscana', w: [6, 25], d: ['Filetto al pepe verde', 'Costata alla brace', 'Agnello'] },
  { k: ['tignanello', 'solaia', 'masseto', 'flaccianello', 'supertuscan', 'super tuscan'], t: 'rosso', s: 'rosso-strutturato', g: ['Sangiovese', 'Cabernet Sauvignon'], r: 'Toscana', w: [6, 25], d: ['Tagliata', 'Selvaggina', 'Formaggi stagionati'] },
  { k: ['carmignano'], t: 'rosso', s: 'rosso-medio', g: ['Sangiovese', 'Cabernet Sauvignon'], r: 'Toscana', w: [4, 12], d: ['Arrosti', 'Fegatelli', 'Pecorino'] },
  { k: ['vernaccia di san gimignano'], t: 'bianco', s: 'bianco-fresco', g: ['Vernaccia'], r: 'Toscana', w: [0, 5], d: ['Zuppa di farro', 'Pesce alla griglia', 'Risotto ai porcini'] },
  { k: ['vin santo', 'vinsanto'], t: 'dolce', s: 'dolce', g: ['Trebbiano', 'Malvasia'], r: 'Toscana', w: [5, 30], d: ['Cantucci', 'Formaggi erborinati', 'Pasticceria secca'] },
  { k: ['amarone', 'amarone della valpolicella'], t: 'rosso', s: 'rosso-strutturato', g: ['Corvina', 'Corvinone', 'Rondinella'], r: 'Veneto', w: [5, 20], d: ['Brasato all’Amarone', 'Risotto all’Amarone', 'Monte Veronese stravecchio'] },
  { k: ['ripasso', 'valpolicella ripasso', 'valpolicella superiore ripasso'], t: 'rosso', s: 'rosso-medio', g: ['Corvina', 'Rondinella'], r: 'Veneto', w: [3, 8], d: ['Pastissada de caval', 'Bigoli al ragù d’anatra', 'Formaggi semistagionati'] },
  { k: ['valpolicella'], t: 'rosso', s: 'rosso-medio', g: ['Corvina', 'Rondinella'], r: 'Veneto', w: [1, 5], d: ['Pasta al ragù', 'Salumi', 'Pizza'] },
  { k: ['recioto', 'recioto della valpolicella', 'recioto di soave'], t: 'dolce', s: 'dolce', g: ['Corvina', 'Garganega'], r: 'Veneto', w: [3, 20], d: ['Pandoro', 'Dolci al cioccolato', 'Formaggi erborinati'] },
  { k: ['bardolino chiaretto', 'chiaretto'], t: 'rosato', s: 'rosato', g: ['Corvina', 'Rondinella'], r: 'Veneto', w: [0, 2], d: ['Pesce di lago', 'Antipasti', 'Pizza'] },
  { k: ['bardolino'], t: 'rosso', s: 'rosso-leggero', g: ['Corvina', 'Rondinella'], r: 'Veneto', w: [0, 3], d: ['Pesce di lago in umido', 'Salumi', 'Carni bianche'] },
  { k: ['soave'], t: 'bianco', s: 'bianco-fresco', g: ['Garganega'], r: 'Veneto', w: [0, 5], d: ['Risotto agli asparagi', 'Pesce al vapore', 'Baccalà mantecato'] },
  { k: ['lugana'], t: 'bianco', s: 'bianco-fresco', g: ['Turbiana'], r: 'Lombardia/Veneto', w: [0, 5], d: ['Pesce di lago', 'Risotto alle verdure', 'Antipasti di mare'] },
  { k: ['prosecco', 'valdobbiadene', 'conegliano', 'cartizze', 'asolo'], t: 'bollicine', s: 'bollicine', g: ['Glera'], r: 'Veneto', w: [0, 2], d: ['Aperitivo', 'Fritture leggere', 'Antipasti di pesce'] },
  { k: ['franciacorta'], t: 'bollicine', s: 'bollicine', g: ['Chardonnay', 'Pinot Nero'], r: 'Lombardia', w: [0, 8], d: ['Crudi di mare', 'Risotto alla milanese', 'Parmigiano Reggiano'] },
  { k: ['oltrepo', 'oltrepò'], t: 'bollicine', s: 'bollicine', g: ['Pinot Nero'], r: 'Lombardia', w: [0, 6], d: ['Salame di Varzi', 'Aperitivo', 'Risotti'] },
  { k: ['trento doc', 'trentodoc', 'ferrari'], t: 'bollicine', s: 'bollicine', g: ['Chardonnay', 'Pinot Nero'], r: 'Trentino', w: [0, 8], d: ['Aperitivo', 'Crostacei', 'Trota salmonata'] },
  { k: ['teroldego'], t: 'rosso', s: 'rosso-medio', g: ['Teroldego'], r: 'Trentino', w: [2, 8], d: ['Polenta e funghi', 'Carne salada', 'Selvaggina'] },
  { k: ['lagrein'], t: 'rosso', s: 'rosso-medio', g: ['Lagrein'], r: 'Alto Adige', w: [2, 8], d: ['Speck', 'Gulasch', 'Canederli'] },
  { k: ['santa maddalena', 'st magdalener', 'schiava', 'vernatsch'], t: 'rosso', s: 'rosso-leggero', g: ['Schiava'], r: 'Alto Adige', w: [0, 3], d: ['Speck', 'Canederli', 'Merenda tirolese'] },
  { k: ['gewurztraminer', 'traminer aromatico'], t: 'bianco', s: 'bianco-aromatico', g: ['Gewürztraminer'], r: 'Alto Adige', w: [1, 6], d: ['Cucina thai e speziata', 'Formaggi erborinati', 'Foie gras'] },
  { k: ['collio', 'friuli colli orientali', 'ribolla'], t: 'bianco', s: 'bianco-fresco', g: ['Friulano', 'Ribolla Gialla'], r: 'Friuli', w: [1, 6], d: ['Prosciutto di San Daniele', 'Frico', 'Pesce alla griglia'] },
  { k: ['lambrusco', 'sorbara', 'grasparossa', 'salamino'], t: 'rosso', s: 'rosso-frizzante', g: ['Lambrusco'], r: 'Emilia-Romagna', w: [0, 2], d: ['Tortellini in brodo', 'Gnocco fritto e salumi', 'Cotechino e zampone'] },
  { k: ['gutturnio', 'bonarda'], t: 'rosso', s: 'rosso-frizzante', g: ['Barbera', 'Croatina'], r: 'Emilia/Lombardia', w: [0, 3], d: ['Salumi piacentini', 'Pisarei e fasö', 'Bolliti'] },
  { k: ['sangiovese di romagna', 'romagna sangiovese'], t: 'rosso', s: 'rosso-medio', g: ['Sangiovese'], r: 'Emilia-Romagna', w: [1, 6], d: ['Piadina e salumi', 'Cappelletti al ragù', 'Grigliata mista'] },
  { k: ['albana'], t: 'bianco', s: 'bianco-strutturato', g: ['Albana'], r: 'Emilia-Romagna', w: [1, 5], d: ['Passatelli', 'Formaggi', 'Pesce al forno'] },
  { k: ['verdicchio', 'castelli di jesi', 'matelica'], t: 'bianco', s: 'bianco-fresco', g: ['Verdicchio'], r: 'Marche', w: [1, 8], d: ['Brodetto all’anconetana', 'Olive all’ascolana', 'Pesce alla griglia'] },
  { k: ['rosso conero', 'conero'], t: 'rosso', s: 'rosso-medio', g: ['Montepulciano'], r: 'Marche', w: [3, 10], d: ['Vincisgrassi', 'Coniglio in porchetta', 'Arrosti'] },
  { k: ['offida pecorino', 'pecorino'], t: 'bianco', s: 'bianco-fresco', g: ['Pecorino'], r: 'Marche/Abruzzo', w: [0, 5], d: ['Pesce al forno', 'Crostacei', 'Formaggi freschi'] },
  { k: ['montefalco', 'sagrantino'], t: 'rosso', s: 'rosso-strutturato', g: ['Sagrantino'], r: 'Umbria', w: [6, 20], d: ['Selvaggina', 'Agnello', 'Formaggi stagionati'] },
  { k: ['orvieto'], t: 'bianco', s: 'bianco-fresco', g: ['Grechetto', 'Trebbiano'], r: 'Umbria', w: [0, 3], d: ['Pesce di lago', 'Antipasti', 'Carni bianche'] },
  { k: ['cesanese'], t: 'rosso', s: 'rosso-medio', g: ['Cesanese'], r: 'Lazio', w: [2, 8], d: ['Abbacchio', 'Amatriciana', 'Carni alla brace'] },
  { k: ['frascati', 'est est est'], t: 'bianco', s: 'bianco-fresco', g: ['Malvasia', 'Trebbiano'], r: 'Lazio', w: [0, 2], d: ['Carciofi alla romana', 'Fritti', 'Porchetta'] },
  { k: ['montepulciano d abruzzo'], t: 'rosso', s: 'rosso-medio', g: ['Montepulciano'], r: 'Abruzzo', w: [2, 10], d: ['Arrosticini', 'Ragù di agnello', 'Pizza'] },
  { k: ['cerasuolo d abruzzo', 'montepulciano d abruzzo cerasuolo'], t: 'rosato', s: 'rosato', g: ['Montepulciano'], r: 'Abruzzo', w: [0, 3], d: ['Brodetto di pesce', 'Pizza', 'Salumi'] },
  { k: ['trebbiano d abruzzo'], t: 'bianco', s: 'bianco-fresco', g: ['Trebbiano'], r: 'Abruzzo', w: [0, 10], d: ['Pesce alla griglia', 'Pasta alle vongole', 'Formaggi freschi'] },
  { k: ['taurasi'], t: 'rosso', s: 'rosso-strutturato', g: ['Aglianico'], r: 'Campania', w: [6, 20], d: ['Agnello al forno', 'Ragù napoletano', 'Formaggi stagionati'] },
  { k: ['aglianico del vulture', 'aglianico del taburno', 'aglianico'], t: 'rosso', s: 'rosso-strutturato', g: ['Aglianico'], r: 'Basilicata/Campania', w: [4, 15], d: ['Agnello', 'Salsiccia lucanica', 'Formaggi stagionati'] },
  { k: ['fiano di avellino', 'fiano'], t: 'bianco', s: 'bianco-strutturato', g: ['Fiano'], r: 'Campania', w: [1, 10], d: ['Pesce al forno', 'Crostacei', 'Mozzarella di bufala'] },
  { k: ['greco di tufo', 'greco'], t: 'bianco', s: 'bianco-strutturato', g: ['Greco'], r: 'Campania', w: [1, 8], d: ['Zuppa di pesce', 'Pasta alle vongole', 'Carni bianche'] },
  { k: ['falanghina'], t: 'bianco', s: 'bianco-fresco', g: ['Falanghina'], r: 'Campania', w: [0, 3], d: ['Mozzarella di bufala', 'Frittura di pesce', 'Pizza'] },
  { k: ['lacryma christi'], t: 'bianco', s: 'bianco-fresco', g: ['Coda di Volpe'], r: 'Campania', w: [0, 3], d: ['Pesce', 'Pizza', 'Antipasti'] },
  { k: ['primitivo di manduria', 'primitivo', 'gioia del colle'], t: 'rosso', s: 'rosso-strutturato', g: ['Primitivo'], r: 'Puglia', w: [2, 10], d: ['Orecchiette al ragù', 'Bombette pugliesi', 'Barbecue'] },
  { k: ['salice salentino', 'negroamaro', 'squinzano', 'copertino'], t: 'rosso', s: 'rosso-medio', g: ['Negroamaro'], r: 'Puglia', w: [2, 8], d: ['Carni alla brace', 'Pasta al forno', 'Formaggi'] },
  { k: ['castel del monte', 'nero di troia'], t: 'rosso', s: 'rosso-medio', g: ['Uva di Troia'], r: 'Puglia', w: [2, 10], d: ['Agnello', 'Ragù', 'Caciocavallo'] },
  { k: ['ciro'], t: 'rosso', s: 'rosso-medio', g: ['Gaglioppo'], r: 'Calabria', w: [2, 8], d: ['’Nduja', 'Carni alla brace', 'Pasta al sugo'] },
  { k: ['etna rosso'], t: 'rosso', s: 'rosso-medio', g: ['Nerello Mascalese'], r: 'Sicilia', w: [2, 12], d: ['Tonno scottato', 'Pasta alla Norma', 'Carni alla brace'] },
  { k: ['etna bianco'], t: 'bianco', s: 'bianco-fresco', g: ['Carricante'], r: 'Sicilia', w: [1, 10], d: ['Crudi di pesce', 'Pesce spada', 'Risotto al limone'] },
  { k: ['etna rosato'], t: 'rosato', s: 'rosato', g: ['Nerello Mascalese'], r: 'Sicilia', w: [0, 3], d: ['Pesce', 'Antipasti', 'Couscous'] },
  { k: ['cerasuolo di vittoria'], t: 'rosso', s: 'rosso-leggero', g: ['Nero d’Avola', 'Frappato'], r: 'Sicilia', w: [1, 6], d: ['Tonno', 'Caponata', 'Pesce in umido'] },
  { k: ['nero d avola'], t: 'rosso', s: 'rosso-medio', g: ['Nero d’Avola'], r: 'Sicilia', w: [1, 8], d: ['Caponata', 'Involtini alla siciliana', 'Pasta al forno'] },
  { k: ['grillo'], t: 'bianco', s: 'bianco-fresco', g: ['Grillo'], r: 'Sicilia', w: [0, 3], d: ['Pasta con le sarde', 'Pesce spada', 'Arancine'] },
  { k: ['passito di pantelleria', 'pantelleria'], t: 'dolce', s: 'dolce', g: ['Zibibbo'], r: 'Sicilia', w: [2, 20], d: ['Cannoli siciliani', 'Cassata', 'Formaggi erborinati'] },
  { k: ['marsala'], t: 'fortificato', s: 'fortificato', g: ['Grillo', 'Catarratto'], r: 'Sicilia', w: [3, 40], d: ['Dolci di mandorle', 'Parmigiano stravecchio', 'Cioccolato'] },
  { k: ['malvasia delle lipari'], t: 'dolce', s: 'dolce', g: ['Malvasia'], r: 'Sicilia', w: [2, 15], d: ['Pasticceria secca', 'Formaggi erborinati'] },
  { k: ['vermentino di gallura', 'vermentino di sardegna', 'vermentino'], t: 'bianco', s: 'bianco-fresco', g: ['Vermentino'], r: 'Sardegna/Liguria/Toscana', w: [0, 4], d: ['Trofie al pesto', 'Spaghetti alle vongole', 'Pesce alla griglia'] },
  { k: ['cannonau'], t: 'rosso', s: 'rosso-medio', g: ['Cannonau'], r: 'Sardegna', w: [2, 10], d: ['Porceddu', 'Culurgiones', 'Pecorino sardo'] },
  { k: ['carignano del sulcis'], t: 'rosso', s: 'rosso-medio', g: ['Carignano'], r: 'Sardegna', w: [2, 10], d: ['Agnello', 'Carni alla brace', 'Pecorino'] },
  { k: ['champagne'], t: 'bollicine', s: 'bollicine', g: ['Chardonnay', 'Pinot Nero', 'Pinot Meunier'], r: 'Champagne', c: 'Francia', w: [0, 10], d: ['Ostriche', 'Caviale', 'Fritture'] },
  { k: ['cremant'], t: 'bollicine', s: 'bollicine', g: ['Chardonnay', 'Pinot Nero'], c: 'Francia', w: [0, 5], d: ['Aperitivo', 'Crudi', 'Formaggi freschi'] },
  { k: ['cava'], t: 'bollicine', s: 'bollicine', g: ['Macabeo', 'Xarel·lo', 'Parellada'], c: 'Spagna', w: [0, 4], d: ['Tapas', 'Jamón', 'Fritture'] },
  { k: ['chablis'], t: 'bianco', s: 'bianco-fresco', g: ['Chardonnay'], r: 'Borgogna', c: 'Francia', w: [1, 10], d: ['Ostriche', 'Crostacei', 'Formaggi di capra'] },
  { k: ['meursault', 'puligny', 'chassagne', 'montrachet'], t: 'bianco', s: 'bianco-strutturato', g: ['Chardonnay'], r: 'Borgogna', c: 'Francia', w: [3, 15], d: ['Astice', 'Pollo alla crema', 'Rombo al burro'] },
  { k: ['bourgogne', 'borgogna', 'gevrey', 'vosne', 'chambolle', 'nuits saint georges', 'pommard', 'volnay'], t: 'rosso', s: 'rosso-leggero', g: ['Pinot Nero'], r: 'Borgogna', c: 'Francia', w: [3, 15], d: ['Anatra', 'Coq au vin', 'Funghi'] },
  { k: ['beaujolais', 'morgon', 'fleurie'], t: 'rosso', s: 'rosso-leggero', g: ['Gamay'], r: 'Beaujolais', c: 'Francia', w: [0, 5], d: ['Charcuterie', 'Quiche', 'Pollo arrosto'] },
  { k: ['bordeaux', 'medoc', 'pauillac', 'margaux', 'saint emilion', 'pomerol', 'saint julien'], t: 'rosso', s: 'rosso-strutturato', g: ['Cabernet Sauvignon', 'Merlot'], r: 'Bordeaux', c: 'Francia', w: [5, 25], d: ['Agnello', 'Entrecôte', 'Formaggi stagionati'] },
  { k: ['sauternes', 'barsac'], t: 'dolce', s: 'dolce', g: ['Semillon', 'Sauvignon Blanc'], r: 'Bordeaux', c: 'Francia', w: [5, 40], d: ['Foie gras', 'Roquefort', 'Tarte tatin'] },
  { k: ['sancerre', 'pouilly fume'], t: 'bianco', s: 'bianco-fresco', g: ['Sauvignon Blanc'], r: 'Loira', c: 'Francia', w: [0, 6], d: ['Formaggi di capra', 'Asparagi', 'Pesce'] },
  { k: ['chateauneuf', 'cotes du rhone', 'gigondas', 'hermitage', 'cote rotie'], t: 'rosso', s: 'rosso-strutturato', g: ['Grenache', 'Syrah'], r: 'Rodano', c: 'Francia', w: [3, 20], d: ['Stufati', 'Agnello alle erbe', 'Selvaggina'] },
  { k: ['alsace', 'alsazia'], t: 'bianco', s: 'bianco-aromatico', g: ['Riesling', 'Gewürztraminer'], r: 'Alsazia', c: 'Francia', w: [1, 10], d: ['Choucroute', 'Cucina asiatica', 'Munster'] },
  { k: ['provence', 'provenza'], t: 'rosato', s: 'rosato', g: ['Grenache', 'Cinsault'], r: 'Provenza', c: 'Francia', w: [0, 2], d: ['Bouillabaisse', 'Insalata nizzarda', 'Aperitivo'] },
  { k: ['rioja', 'ribera del duero'], t: 'rosso', s: 'rosso-medio', g: ['Tempranillo'], c: 'Spagna', w: [3, 15], d: ['Agnello arrosto', 'Jamón ibérico', 'Chorizo'] },
  { k: ['priorat'], t: 'rosso', s: 'rosso-strutturato', g: ['Grenache', 'Carignano'], c: 'Spagna', w: [4, 15], d: ['Carni alla brace', 'Stufati'] },
  { k: ['rias baixas', 'albarino'], t: 'bianco', s: 'bianco-fresco', g: ['Albariño'], c: 'Spagna', w: [0, 3], d: ['Polpo alla gallega', 'Frutti di mare'] },
  { k: ['jerez', 'sherry', 'fino', 'manzanilla', 'oloroso', 'amontillado'], t: 'fortificato', s: 'fortificato', g: ['Palomino'], c: 'Spagna', w: [0, 30], d: ['Mandorle tostate', 'Jamón', 'Olive'] },
  { k: ['vinho do porto', 'porto tawny', 'porto ruby', 'port wine', 'tawny', 'ruby port', 'lbv'], t: 'fortificato', s: 'fortificato', g: ['Touriga Nacional'], c: 'Portogallo', w: [0, 40], d: ['Stilton e erborinati', 'Cioccolato fondente', 'Noci'] },
  { k: ['madeira'], t: 'fortificato', s: 'fortificato', c: 'Portogallo', w: [5, 60], d: ['Dolci secchi', 'Formaggi stagionati'] },
  { k: ['tokaji', 'tokaj'], t: 'dolce', s: 'dolce', g: ['Furmint'], c: 'Ungheria', w: [5, 50], d: ['Foie gras', 'Erborinati', 'Strudel'] },
  { k: ['mosel', 'mosella', 'rheingau', 'spatlese', 'kabinett'], t: 'bianco', s: 'bianco-aromatico', g: ['Riesling'], c: 'Germania', w: [2, 20], d: ['Cucina thai', 'Maiale', 'Sushi'] },
  { k: ['marlborough'], t: 'bianco', s: 'bianco-fresco', g: ['Sauvignon Blanc'], c: 'Nuova Zelanda', w: [0, 3], d: ['Asparagi', 'Caprino', 'Insalate'] },
];

// ---------- Stili di birra ----------
export const BEER_STYLES = [
  { id: 'lager', label: 'Lager / Helles', s: 'birra-chiara', k: ['lager', 'helles', 'hell', 'export', 'premium lager'], d: ['Pizza margherita', 'Fritture', 'Würstel'] },
  { id: 'pils', label: 'Pils', s: 'birra-chiara', k: ['pils', 'pilsner', 'pilsener'], d: ['Fritto di pesce', 'Salumi', 'Pizza'] },
  { id: 'kolsch', label: 'Kölsch / Golden Ale', s: 'birra-chiara', k: ['kolsch', 'golden ale', 'blonde ale', 'blond'], d: ['Insalate', 'Pesce alla griglia', 'Formaggi freschi'] },
  { id: 'weiss', label: 'Weizen / Weiss', s: 'birra-weiss', k: ['weiss', 'weizen', 'hefeweizen', 'weissbier', 'weisse'], d: ['Weisswurst e brezel', 'Insalate di mare', 'Formaggi freschi'] },
  { id: 'blanche', label: 'Blanche / Witbier', s: 'birra-weiss', k: ['blanche', 'witbier', 'wit', 'white ale'], d: ['Cozze', 'Sushi', 'Insalate con agrumi'] },
  { id: 'ipa', label: 'IPA', s: 'birra-ipa', k: ['ipa', 'india pale ale', 'neipa', 'double ipa', 'dipa', 'west coast'], d: ['Curry piccante', 'Hamburger', 'Tacos'] },
  { id: 'apa', label: 'APA / Pale Ale', s: 'birra-ipa', k: ['apa', 'pale ale', 'american pale'], d: ['Hamburger', 'Pollo fritto', 'Cheddar'] },
  { id: 'amber', label: 'Amber / Red Ale', s: 'birra-ambrata', k: ['amber', 'ambrata', 'red ale', 'rossa', 'irish red'], d: ['Grigliata di carne', 'Costine BBQ', 'Formaggi semistagionati'] },
  { id: 'bitter', label: 'Bitter / ESB', s: 'birra-ambrata', k: ['bitter', 'esb', 'english ale'], d: ['Fish & chips', 'Pie di carne', 'Cheddar'] },
  { id: 'bock', label: 'Bock / Doppelbock', s: 'birra-ambrata', k: ['bock', 'doppelbock', 'maibock'], d: ['Stinco di maiale', 'Selvaggina', 'Formaggi stagionati'] },
  { id: 'marzen', label: 'Märzen / Oktoberfest', s: 'birra-ambrata', k: ['marzen', 'oktoberfest', 'festbier', 'vienna'], d: ['Pollo arrosto', 'Salsicce', 'Brezel'] },
  { id: 'saison', label: 'Saison', s: 'birra-belga', k: ['saison', 'farmhouse'], d: ['Insalate', 'Formaggi di capra', 'Cucina vegetariana'] },
  { id: 'tripel', label: 'Tripel / Belgian Strong Golden', s: 'birra-belga', k: ['tripel', 'triple', 'belgian strong golden', 'duvel'], d: ['Formaggi stagionati', 'Pollo arrosto', 'Crostacei'] },
  { id: 'dubbel', label: 'Dubbel / Abbazia', s: 'birra-belga', k: ['dubbel', 'double', 'abbazia', 'abbey', 'trappist', 'trappista', 'leffe', 'chimay'], d: ['Carbonade flamande', 'Formaggi d’abbazia', 'Arrosti'] },
  { id: 'quad', label: 'Quadrupel / Belgian Strong Dark', s: 'birra-belga', k: ['quadrupel', 'quad', 'strong dark', 'grand cru'], d: ['Selvaggina', 'Formaggi erborinati', 'Dolci al caramello'] },
  { id: 'stout', label: 'Stout', s: 'birra-scura', k: ['stout', 'dry stout', 'milk stout', 'guinness'], d: ['Ostriche', 'Stufato di manzo', 'Dolci al cioccolato'] },
  { id: 'porter', label: 'Porter', s: 'birra-scura', k: ['porter', 'baltic porter'], d: ['Carne affumicata', 'BBQ', 'Tiramisù'] },
  { id: 'imperial', label: 'Imperial Stout', s: 'birra-scura', k: ['imperial stout', 'russian imperial', 'ris'], d: ['Cioccolato fondente', 'Erborinati', 'Dessert al caffè'] },
  { id: 'barleywine', label: 'Barley Wine', s: 'birra-belga', k: ['barley wine', 'barleywine', 'old ale'], d: ['Formaggi erborinati', 'Dolci secchi', 'Da meditazione'] },
  { id: 'sour', label: 'Sour / Gose / Berliner', s: 'birra-acida', k: ['sour', 'gose', 'berliner', 'acida', 'wild ale'], d: ['Formaggi freschi', 'Ceviche', 'Insalate'] },
  { id: 'lambic', label: 'Lambic / Gueuze / Kriek', s: 'birra-acida', k: ['lambic', 'gueuze', 'geuze', 'kriek', 'framboise'], d: ['Cozze', 'Formaggi di capra', 'Dessert ai frutti rossi'] },
  { id: 'rauch', label: 'Rauchbier', s: 'birra-affumicata', k: ['rauch', 'rauchbier', 'affumicata', 'smoked'], d: ['Speck', 'Salsicce affumicate', 'BBQ'] },
  { id: 'iga', label: 'Italian Grape Ale', s: 'birra-belga', k: ['iga', 'italian grape ale', 'grape ale'], d: ['Formaggi', 'Salumi', 'Risotti'] },
];

// ---------- Categorie di piatti ----------
// w: peso di ogni stile (3 = ideale, 2 = ottimo, 1 = possibile)
export const DISHES = [
  { id: 'aperitivo', label: 'Aperitivo e stuzzichini', em: '🫒', k: ['aperitivo', 'stuzzichini', 'tartine', 'olive', 'patatine', 'crostini', 'bruschett', 'finger food', 'tapas', 'antipasto'], w: { 'bollicine': 3, 'bianco-fresco': 2, 'rosato': 2, 'birra-chiara': 2, 'birra-weiss': 1, 'fortificato': 1 }, why: 'Le bollicine puliscono il palato e aprono l’appetito.' },
  { id: 'salumi', label: 'Salumi e taglieri', em: '🥓', k: ['salumi', 'salame', 'prosciutto', 'mortadella', 'culatello', 'tagliere', 'coppa', 'speck', 'bresaola', 'lardo', 'gnocco fritto', 'piadina', 'crescentina', 'tigelle'], w: { 'rosso-frizzante': 3, 'rosso-leggero': 3, 'bollicine': 2, 'rosato': 2, 'rosso-medio': 1, 'birra-ambrata': 2, 'birra-chiara': 1 }, why: 'Acidità e bollicina sgrassano la componente grassa dei salumi.' },
  { id: 'crudi', label: 'Crudi di mare, ostriche, sushi', em: '🍣', k: ['crudo', 'crudi', 'ostric', 'sushi', 'sashimi', 'tartare di pesce', 'tartare di tonno', 'tartare di salmone', 'carpaccio di pesce', 'ceviche', 'poke', 'scampi crudi', 'gamberi crudi', 'caviale'], w: { 'bollicine': 3, 'bianco-fresco': 3, 'rosato': 1, 'bianco-aromatico': 1, 'birra-weiss': 1, 'birra-chiara': 2, 'birra-acida': 1 }, why: 'Servono freschezza e mineralità, senza tannini che danno note metalliche.' },
  { id: 'fritto', label: 'Fritture', em: '🍤', k: ['fritto', 'fritti', 'frittura', 'fritta', 'tempura', 'calamari fritti', 'fish and chips', 'fish chips', 'arancin', 'suppl', 'olive ascolane', 'ascolana', 'cotoletta', 'milanese', 'impanat'], w: { 'bollicine': 3, 'bianco-fresco': 2, 'birra-chiara': 3, 'birra-weiss': 2, 'rosato': 1 }, why: 'La bollicina "sgrassa" e ripulisce dall’unto.' },
  { id: 'pesce-griglia', label: 'Pesce alla griglia o al forno', em: '🐟', k: ['pesce', 'branzino', 'spigola', 'orata', 'rombo', 'sogliola', 'dentice', 'merluzzo', 'nasello', 'pesce spada', 'trota', 'cernia', 'al cartoccio', 'all acqua pazza', 'grigliata di pesce', 'filetto di pesce'], w: { 'bianco-fresco': 3, 'bianco-strutturato': 2, 'rosato': 1, 'bollicine': 1, 'birra-weiss': 1, 'birra-chiara': 1 }, why: 'Un bianco sapido rispetta la delicatezza del pesce.' },
  { id: 'zuppa-pesce', label: 'Zuppe e guazzetti di pesce', em: '🥘', k: ['zuppa di pesce', 'cacciucco', 'brodetto', 'guazzetto', 'bouillabaisse', 'in umido', 'polpo', 'seppie', 'seppia', 'calamari in umido', 'baccala', 'stoccafisso', 'pesce in umido'], w: { 'rosato': 3, 'bianco-strutturato': 3, 'rosso-leggero': 2, 'bianco-fresco': 1, 'birra-belga': 1 }, why: 'Il pomodoro e la sapidità chiedono un vino con un po’ di corpo, anche un rosato o un rosso leggero.' },
  { id: 'crostacei', label: 'Crostacei', em: '🦞', k: ['aragosta', 'astice', 'gamber', 'scampi', 'mazzancolle', 'granchio', 'crostacei', 'canocchie', 'cicale'], w: { 'bollicine': 3, 'bianco-strutturato': 3, 'bianco-fresco': 2, 'rosato': 1, 'birra-belga': 1 }, why: 'La dolcezza dei crostacei sposa bianchi morbidi e bollicine.' },
  { id: 'pasta-mare', label: 'Primi di mare', em: '🍝', k: ['vongole', 'cozze', 'frutti di mare', 'allo scoglio', 'scoglio', 'alla pescatora', 'pescatora', 'risotto di mare', 'risotto ai frutti', 'bottarga', 'con le sarde', 'al nero di seppia', 'paella', 'linguine', 'spaghetti al'], w: { 'bianco-fresco': 3, 'bianco-strutturato': 2, 'bollicine': 1, 'rosato': 1, 'birra-weiss': 1 }, why: 'Iodio e sapidità chiedono un bianco fresco e minerale.' },
  { id: 'salmone-tonno', label: 'Salmone e tonno', em: '🍣', k: ['salmone', 'tonno', 'pesce azzurro', 'sgombro', 'alici', 'acciughe', 'sarde', 'tonno scottato'], w: { 'rosato': 3, 'bianco-strutturato': 2, 'rosso-leggero': 2, 'bollicine': 2, 'birra-weiss': 1, 'bianco-aromatico': 1 }, why: 'Pesci grassi e saporiti reggono rosati e persino rossi leggeri e freschi.' },
  { id: 'pomodoro', label: 'Pasta al pomodoro e sughi semplici', em: '🍅', k: ['pomodoro', 'sugo', 'arrabbiata', 'puttanesca', 'norma', 'parmigiana', 'caponata', 'marinara'], w: { 'rosso-medio': 2, 'rosso-leggero': 2, 'rosato': 3, 'birra-chiara': 1, 'rosso-frizzante': 1 }, why: 'L’acidità del pomodoro vuole un vino fresco e non troppo tannico.' },
  { id: 'pizza', label: 'Pizza', em: '🍕', k: ['pizza', 'calzone', 'focaccia', 'margherita'], w: { 'birra-chiara': 3, 'bollicine': 2, 'rosso-frizzante': 2, 'rosato': 2, 'rosso-leggero': 1, 'birra-ipa': 1, 'birra-weiss': 1 }, why: 'Classico: birra chiara o bollicine; un Lambrusco per le pizze con salumi.' },
  { id: 'ragu', label: 'Ragù, lasagne e paste ripiene', em: '🍝', k: ['ragu', 'bolognese', 'lasagn', 'tortellini', 'cappelletti', 'agnolotti', 'tortelli', 'pasta al forno', 'cannelloni', 'tagliatelle', 'pappardelle', 'ravioli', 'timballo', 'pasticcio', 'bigoli', 'pici', 'orecchiette'], w: { 'rosso-medio': 3, 'rosso-frizzante': 3, 'rosso-strutturato': 1, 'rosso-leggero': 1, 'birra-ambrata': 1 }, why: 'Rossi di medio corpo o un Lambrusco: freschezza contro la ricchezza del sugo.' },
  { id: 'funghi-tartufo', label: 'Funghi e tartufo', em: '🍄', k: ['funghi', 'porcini', 'tartufo', 'champignon', 'finferli', 'chiodini', 'ai funghi'], w: { 'rosso-strutturato': 3, 'rosso-medio': 2, 'rosso-leggero': 2, 'bianco-strutturato': 2 }, why: 'I profumi terrosi esaltano Nebbiolo e Pinot Nero.' },
  { id: 'carbonara', label: 'Carbonara, amatriciana, gricia', em: '🥚', k: ['carbonara', 'amatriciana', 'gricia', 'cacio e pepe', 'guanciale', 'pancetta'], w: { 'rosso-medio': 3, 'bianco-strutturato': 2, 'rosato': 2, 'bollicine': 1, 'birra-ambrata': 1 }, why: 'Sapidità e grassezza vogliono freschezza e un buon corpo.' },
  { id: 'verdure', label: 'Primi e piatti di verdure', em: '🥗', k: ['verdure', 'vegetarian', 'vegano', 'vegan', 'zucchine', 'melanzane', 'peperoni', 'insalata', 'minestrone', 'zuppa', 'vellutata', 'legumi', 'ceci', 'lenticchie', 'fagioli', 'orzo', 'farro', 'quinoa', 'risotto', 'primavera', 'zucca'], w: { 'bianco-fresco': 3, 'rosato': 2, 'rosso-leggero': 2, 'bianco-strutturato': 1, 'birra-weiss': 1, 'birra-belga': 1 }, why: 'Vini leggeri e fragranti non coprono i sapori vegetali.' },
  { id: 'pesto', label: 'Pesto ed erbe aromatiche', em: '🌿', k: ['pesto', 'basilico', 'trofie', 'genovese', 'erbe'], w: { 'bianco-fresco': 3, 'bianco-aromatico': 2, 'rosato': 1 }, why: 'Erbe e aromi trovano eco in bianchi sapidi come il Vermentino.' },
  { id: 'difficili', label: 'Asparagi, carciofi, uova', em: '🥚', k: ['asparagi', 'carciofi', 'uova', 'uovo', 'frittata', 'omelette', 'quiche', 'torta salata'], w: { 'bianco-fresco': 3, 'bollicine': 2, 'bianco-aromatico': 1, 'birra-weiss': 1 }, why: 'Ingredienti "difficili": serve un bianco erbaceo e fresco come un Sauvignon.' },
  { id: 'carne-rossa', label: 'Carne rossa alla griglia', em: '🥩', k: ['bistecca', 'fiorentina', 'tagliata', 'costata', 'entrecote', 'filetto', 'manzo', 'roast beef', 'scottona', 'carne alla griglia', 'carne alla brace', 'grigliata', 'fassona', 'controfiletto', 'carne rossa', 'picanha'], w: { 'rosso-strutturato': 3, 'rosso-medio': 3, 'birra-ambrata': 1, 'birra-ipa': 1 }, why: 'Tannini e struttura bilanciano succosità e proteine della carne.' },
  { id: 'brasati', label: 'Brasati, stufati, arrosti', em: '🍲', k: ['brasato', 'stufato', 'spezzatino', 'arrosto', 'ossobuco', 'stracotto', 'gulasch', 'goulash', 'bollito', 'peposo', 'polenta', 'guancia', 'guanciale di manzo', 'stinco', 'roast', 'carbonade', 'bourguignon'], w: { 'rosso-strutturato': 3, 'rosso-medio': 2, 'birra-scura': 1, 'birra-belga': 1, 'birra-ambrata': 1 }, why: 'Cotture lunghe e sughi ricchi vogliono rossi importanti e evoluti.' },
  { id: 'selvaggina', label: 'Selvaggina', em: '🦌', k: ['cinghiale', 'cervo', 'capriolo', 'lepre', 'fagiano', 'selvaggina', 'camoscio', 'daino', 'piccione', 'quaglia'], w: { 'rosso-strutturato': 3, 'rosso-medio': 2, 'birra-scura': 1, 'birra-belga': 2 }, why: 'Sapori intensi e selvatici chiedono rossi potenti e speziati.' },
  { id: 'agnello', label: 'Agnello', em: '🐑', k: ['agnello', 'abbacchio', 'capretto', 'arrosticini', 'montone', 'scottadito'], w: { 'rosso-strutturato': 3, 'rosso-medio': 3, 'rosato': 1 }, why: 'La carne aromatica dell’agnello sposa Aglianico, Cannonau, Bordeaux.' },
  { id: 'maiale', label: 'Maiale, salsicce, grigliata mista', em: '🍖', k: ['maiale', 'salsicc', 'costine', 'braciole', 'porchetta', 'cotechino', 'zampone', 'wurstel', 'arista', 'lonza', 'pulled pork', 'spare ribs', 'bombette', 'grigliata mista', 'porceddu', 'maialino'], w: { 'rosso-medio': 3, 'rosso-frizzante': 3, 'birra-ambrata': 3, 'birra-ipa': 1, 'rosato': 1, 'birra-affumicata': 2 }, why: 'La grassezza del maiale chiede freschezza: Lambrusco, Barbera o una ambrata.' },
  { id: 'bbq', label: 'Hamburger e barbecue', em: '🍔', k: ['hamburger', 'burger', 'barbecue', 'bbq', 'pulled', 'chili', 'tacos', 'burrito', 'nachos', 'kebab', 'hot dog'], w: { 'birra-ipa': 3, 'birra-ambrata': 3, 'rosso-medio': 2, 'rosso-strutturato': 2, 'birra-affumicata': 2 }, why: 'Una IPA o un rosso fruttato e caldo come il Primitivo reggono salse e affumicature.' },
  { id: 'carni-bianche', label: 'Pollo, tacchino, coniglio', em: '🍗', k: ['pollo', 'tacchino', 'coniglio', 'faraona', 'cappone', 'galletto', 'petto', 'carni bianche', 'vitello', 'scaloppine', 'saltimbocca', 'involtini', 'vitello tonnato', 'cordon bleu', 'pollo arrosto'], w: { 'bianco-strutturato': 3, 'rosso-leggero': 3, 'rosato': 2, 'rosso-medio': 1, 'birra-ambrata': 1, 'birra-belga': 1 }, why: 'Carni delicate: bianco di corpo o rosso leggero.' },
  { id: 'anatra', label: 'Anatra, oca, foie gras', em: '🦆', k: ['anatra', 'oca', 'foie gras', 'fegato grasso', 'patè', 'pate', 'magret'], w: { 'rosso-leggero': 3, 'rosso-medio': 2, 'dolce': 2, 'bianco-aromatico': 1 }, why: 'Pinot Nero per l’anatra; con il foie gras un vino dolce.' },
  { id: 'tartare-carne', label: 'Tartare e carpaccio di carne', em: '🥩', k: ['tartare', 'carpaccio', 'carne cruda', 'battuta al coltello', 'vitello crudo'], w: { 'rosso-leggero': 3, 'rosato': 2, 'bollicine': 2, 'rosso-medio': 1 }, why: 'Carne cruda: rossi giovani e poco tannici o bollicine rosé.' },
  { id: 'formaggi-freschi', label: 'Formaggi freschi', em: '🧀', k: ['mozzarella', 'burrata', 'ricotta', 'stracchino', 'caprino', 'squacquerone', 'robiola', 'primo sale', 'feta', 'formaggio fresco', 'formaggi freschi', 'stracciatella', 'bufala'], w: { 'bianco-fresco': 3, 'rosato': 2, 'bollicine': 2, 'birra-weiss': 2, 'birra-acida': 1 }, why: 'Delicatezza lattica: bianchi freschi o bollicine.' },
  { id: 'formaggi-stagionati', label: 'Formaggi stagionati', em: '🧀', k: ['parmigiano', 'grana', 'pecorino', 'stagionat', 'castelmagno', 'montasio', 'asiago', 'fontina', 'caciocavallo', 'provolone', 'comte', 'cheddar', 'formaggi', 'formaggio'], w: { 'rosso-strutturato': 3, 'rosso-medio': 2, 'bollicine': 1, 'fortificato': 1, 'birra-belga': 2, 'birra-ambrata': 1 }, why: 'Formaggi intensi e saporiti reggono rossi strutturati.' },
  { id: 'erborinati', label: 'Formaggi erborinati', em: '🧀', k: ['gorgonzola', 'erborinat', 'roquefort', 'stilton', 'blu', 'bleu', 'castelmagno erborinato'], w: { 'dolce': 3, 'fortificato': 3, 'birra-scura': 2, 'birra-belga': 2, 'bianco-aromatico': 1 }, why: 'Contrasto classico: dolcezza contro sapidità e piccantezza.' },
  { id: 'piccante', label: 'Cucina speziata, piccante, asiatica', em: '🌶️', k: ['piccant', 'spezie', 'speziat', 'curry', 'thai', 'indian', 'indiano', 'cinese', 'messican', 'peperoncino', 'nduja', 'kimchi', 'pad thai', 'ramen', 'wok', 'agrodolce', 'tikka', 'masala', 'sichuan', 'jalapeno', 'giapponese', 'coreano', 'vietnamit', 'etnico'], w: { 'bianco-aromatico': 3, 'birra-ipa': 3, 'birra-weiss': 2, 'rosato': 2, 'bollicine': 1, 'birra-chiara': 1, 'dolce': 1 }, why: 'Aromaticità e un filo di residuo zuccherino domano il piccante; evitare tannini e alcol alti.' },
  { id: 'salmone-affumicato', label: 'Affumicati', em: '🐟', k: ['affumicat', 'salmone affumicato', 'aringa', 'speck affumicato', 'scamorza'], w: { 'bollicine': 3, 'bianco-aromatico': 2, 'birra-affumicata': 3, 'birra-scura': 1 }, why: 'Le note fumé chiedono freschezza o un abbinamento per affinità.' },
  { id: 'dessert-crema', label: 'Dolci, creme, pasticceria', em: '🍰', k: ['dolce', 'dessert', 'torta', 'crostata', 'tiramisu', 'panna cotta', 'crema', 'pasticcin', 'panettone', 'pandoro', 'colomba', 'cannoli', 'cassata', 'sfogliat', 'millefoglie', 'zuppa inglese', 'strudel', 'babà', 'baba', 'semifreddo', 'gelato', 'cheesecake', 'crepes', 'tarte'], w: { 'dolce': 3, 'fortificato': 1, 'birra-scura': 1, 'birra-acida': 1 }, why: 'Regola d’oro: il vino dev’essere dolce almeno quanto il dessert.' },
  { id: 'cioccolato', label: 'Cioccolato', em: '🍫', k: ['cioccolat', 'cacao', 'sacher', 'brownie', 'tartufi al', 'fondente', 'mousse al cioccolato'], w: { 'fortificato': 3, 'dolce': 2, 'birra-scura': 3 }, why: 'Porto, passiti rossi o una Imperial Stout per il cioccolato.' },
  { id: 'frutta', label: 'Frutta e dolci alla frutta', em: '🍓', k: ['frutta', 'fragol', 'frutti di bosco', 'frutti rossi', 'macedonia', 'pesche', 'albicocche', 'mele', 'sorbetto'], w: { 'dolce': 3, 'bollicine': 1, 'birra-acida': 2 }, why: 'Moscato e Brachetto esaltano la frutta fresca.' },
  { id: 'secchi', label: 'Biscotti e pasticceria secca', em: '🍪', k: ['biscott', 'cantucci', 'amaretti', 'pasticceria secca', 'mandorle', 'torrone', 'panforte', 'ricciarelli', 'castagnole', 'chiacchiere', 'frappe', 'nocciole'], w: { 'dolce': 3, 'fortificato': 3, 'birra-belga': 1 }, why: 'Vin Santo e Marsala nascono per accompagnare la pasticceria secca.' },
];

export function beerStyleById(id) { return BEER_STYLES.find(b => b.id === id); }

// Trova la denominazione più specifica nel testo (chiavi più lunghe prima)
const DENOM_KEYS = DENOMS.flatMap(d => d.k.map(k => ({ k: norm(k), d }))).sort((a, b) => b.k.length - a.k.length);
export function findDenom(text) {
  const t = ' ' + norm(text) + ' ';
  for (const { k, d } of DENOM_KEYS) if (t.includes(' ' + k + ' ')) return d;
  return null;
}
export function findGrapes(text) {
  const t = ' ' + norm(text) + ' ';
  return GRAPES.filter(g => t.includes(' ' + g.k + ' '));
}
const BEER_KEYS = BEER_STYLES.flatMap(b => b.k.map(k => ({ k: norm(k), b }))).sort((a, b) => b.k.length - a.k.length);
export function findBeerStyle(text) {
  const t = ' ' + norm(text) + ' ';
  for (const { k, b } of BEER_KEYS) if (t.includes(' ' + k + ' ')) return b;
  return null;
}

// Deduce informazioni da nome/denominazione/vitigni scritti dall'utente o dal barcode
export function infer({ name = '', denomination = '', grapes = '', producer = '' }) {
  const text = [name, denomination, grapes].join(' ');
  const out = {};
  const d = findDenom(text);
  if (d) {
    out.type = d.t; out.style = d.s; out.region = d.r; out.country = d.c || 'Italia';
    if (d.g) out.grapes = d.g.join(', ');
    out.window = d.w; out.denom = d;
  }
  const gs = findGrapes(text);
  if (!out.type && gs.length) out.type = gs[0].type;
  if (!out.grapes && gs.length) out.grapes = gs.map(g => g.name).join(', ');
  const t = norm(text + ' ' + producer);
  if (/\b(spumante|brut|metodo classico|extra dry|pas dose|dosaggio zero|satèn|saten|millesimato|cuvee)\b/.test(t) && out.type !== 'dolce') out.type = 'bollicine';
  if (/\b(passito|vendemmia tardiva|late harvest|muffato|eiswein|icewine)\b/.test(t)) out.type = 'dolce';
  if (/\b(rosato|rose|chiaretto|cerasuolo d abruzzo|kretzer)\b/.test(t) && !/cerasuolo di vittoria/.test(t)) out.type = out.type === 'bollicine' ? 'bollicine' : 'rosato';
  if (/\b(birra|beer|bier|biere|ale|lager|ipa|stout|porter|weiss|weizen|pils|blanche|tripel|dubbel|saison)\b/.test(t)) out.type = 'birra';
  if (out.type === 'birra') { const b = findBeerStyle(text); if (b) out.beerStyle = b.id; }
  return out;
}

// Stile di abbinamento di una bottiglia in cantina
export function styleOf(it) {
  if (!it) return null;
  if (it.type === 'birra') {
    const b = beerStyleById(it.beerStyle) || findBeerStyle([it.name, it.beerStyleText].join(' '));
    return b ? b.s : 'birra-chiara';
  }
  if (it.type === 'bollicine') return 'bollicine';
  if (it.type === 'dolce') return 'dolce';
  if (it.type === 'fortificato') return 'fortificato';
  if (it.type === 'rosato') return 'rosato';
  const d = findDenom([it.name, it.denomination].join(' '));
  const gs = findGrapes([it.grapes, it.name].join(' '));
  const body = it.body ? ({ leggero: 1, medio: 2, pieno: 3 })[it.body] : null;
  if (it.type === 'bianco') {
    if (gs.some(g => g.aro) && !(d && d.s === 'bianco-strutturato')) return 'bianco-aromatico';
    if (body) return body >= 3 ? 'bianco-strutturato' : 'bianco-fresco';
    if (d && d.s.startsWith('bianco')) return d.s;
    const b = gs.length ? Math.max(...gs.map(g => g.body)) : 1;
    return b >= 3 ? 'bianco-strutturato' : 'bianco-fresco';
  }
  if (it.type === 'rosso') {
    const t = norm([it.name, it.denomination].join(' '));
    if (/frizzante|lambrusco/.test(t)) return 'rosso-frizzante';
    if (body) return ['rosso-leggero', 'rosso-medio', 'rosso-strutturato'][body - 1];
    if (d && d.s.startsWith('rosso')) return d.s;
    const b = gs.length ? Math.round(gs.reduce((a, g) => a + g.body, 0) / gs.length) : 2;
    return ['rosso-leggero', 'rosso-medio', 'rosso-strutturato'][b - 1];
  }
  return null;
}

// Finestra di consumo stimata quando non indicata
const STYLE_WINDOW = {
  'bollicine': [0, 4], 'bianco-fresco': [0, 3], 'bianco-aromatico': [1, 5], 'bianco-strutturato': [1, 8], 'rosato': [0, 2],
  'rosso-frizzante': [0, 2], 'rosso-leggero': [1, 5], 'rosso-medio': [2, 8], 'rosso-strutturato': [5, 18], 'dolce': [2, 15], 'fortificato': [0, 30],
};
export function drinkWindow(it) {
  if (it.drinkFrom || it.drinkTo) return { from: +it.drinkFrom || null, to: +it.drinkTo || null, estimated: false };
  if (!it.vintage || it.type === 'birra') return null;
  const d = findDenom([it.name, it.denomination].join(' '));
  const w = (d && d.w) || STYLE_WINDOW[styleOf(it)];
  if (!w) return null;
  return { from: +it.vintage + w[0], to: +it.vintage + w[1], estimated: true };
}
export function windowStatus(it) {
  const w = drinkWindow(it);
  if (!w) return null;
  const y = new Date().getFullYear();
  if (w.from && y < w.from) return { k: 'early', label: 'Da attendere', cls: '' };
  if (w.to && y > w.to) return { k: 'late', label: 'Oltre il picco', cls: 'warn' };
  if (w.to && y >= w.to - 1) return { k: 'now-last', label: 'Bevi presto', cls: 'warn' };
  return { k: 'now', label: 'Pronto da bere', cls: 'ok' };
}
