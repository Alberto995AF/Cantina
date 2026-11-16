// Cantina — app principale (router + schermate)
import { db, uid, exportAll, importAll, requestPersistence } from './db.js';
import { TYPES, STYLES, BEER_STYLES, beerStyleById, infer, styleOf, drinkWindow, windowStatus, norm } from './kb.js';
import { suggestForDish, dishesForItem, QUICK_DISHES } from './pairing.js';
import { lookupBarcode, searchImages, fileToDataURL } from './lookup.js';
import { scanBarcode } from './scanner.js';
import { PROVIDERS, getAI, setAI, aiReady, aiLabel, listModels, testConnection, aiPairDish, aiPairWine, aiReadLabel, aiChat } from './ai.js';
import { h, icon, thumb, typeTag, stars, toast, sheet, confirmSheet, fmtDate, dLocal, money, parseNum } from './ui.js';

const S = {
  items: [], history: [],
  filter: 'all', query: '', sort: 'recent', showEmpty: false,
  pairMode: 'dish', dishText: '', pickId: null,
  histQuery: '',
  chat: [], chatBusy: false,
  draft: null,          // dati precompilati per il form "nuovo"
  scroll: {},
};
const view = document.getElementById('view');

async function load() {
  [S.items, S.history] = await Promise.all([db.all('items'), db.all('history')]);
}
const byId = id => S.items.find(i => i.id === id);
const go = path => { location.hash = '#' + path; };
const totalBottles = () => S.items.reduce((a, i) => a + (+i.qty || 0), 0);

// ============ Router ============
const routes = [
  [/^\/$/, viewCellar, 'cellar'],
  [/^\/item\/(.+)$/, viewItem, 'cellar'],
  [/^\/add$/, viewAdd, 'add'],
  [/^\/new$/, () => viewForm(null), 'add'],
  [/^\/edit\/(.+)$/, id => viewForm(id), 'cellar'],
  [/^\/pairing$/, viewPairing, 'pairing'],
  [/^\/history$/, viewHistory, 'history'],
  [/^\/settings$/, viewSettings, 'settings'],
];
let current = null;
function render() {
  const path = (location.hash || '#/').slice(1) || '/';
  if (current) S.scroll[current] = window.scrollY;
  for (const [re, fn, tab] of routes) {
    const m = path.match(re);
    if (!m) continue;
    document.querySelectorAll('.tabbar a').forEach(a => a.classList.toggle('on', a.dataset.tab === tab));
    view.replaceChildren();
    view.style.animation = 'none'; void view.offsetWidth; view.style.animation = '';
    const out = fn(...m.slice(1).map(decodeURIComponent));
    if (out) view.append(...[].concat(out).flat(Infinity).filter(Boolean));
    current = path;
    requestAnimationFrame(() => window.scrollTo(0, S.scroll[path] || 0));
    return;
  }
  go('/');
}
window.addEventListener('hashchange', render);

// ============ Cantina ============
function cellarFiltered() {
  const q = norm(S.query);
  let list = S.items.filter(i => S.showEmpty ? true : (+i.qty || 0) > 0);
  if (S.filter !== 'all') list = list.filter(i => i.type === S.filter);
  if (q) list = list.filter(i => norm([i.name, i.producer, i.denomination, i.grapes, i.region, i.country, i.vintage, i.location, i.beerStyleText, (beerStyleById(i.beerStyle) || {}).label].join(' ')).includes(q));
  const cmp = {
    recent: (a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''),
    name: (a, b) => (a.name || '').localeCompare(b.name || '', 'it'),
    vintage: (a, b) => (+a.vintage || 9999) - (+b.vintage || 9999),
    qty: (a, b) => (+b.qty || 0) - (+a.qty || 0),
    rating: (a, b) => (+b.rating || 0) - (+a.rating || 0),
    price: (a, b) => (+b.price || 0) - (+a.price || 0),
  }[S.sort];
  return list.sort(cmp);
}

function itemCard(it) {
  const ws = windowStatus(it);
  const sub = [it.producer, it.vintage].filter(Boolean).join(' · ');
  const extra = it.type === 'birra' ? (beerStyleById(it.beerStyle) || {}).label || it.beerStyleText : (it.denomination || it.region);
  return h('div', { class: 'card' + ((+it.qty || 0) === 0 ? ' zero' : ''), onclick: () => go('/item/' + it.id) },
    thumb(it),
    h('div', { class: 'bd' },
      h('div', { class: 'nm' }, it.name || 'Senza nome'),
      sub ? h('div', { class: 'pr' }, sub) : null,
      h('div', { class: 'tags' }, typeTag(it.type), extra ? h('span', { class: 'tag' }, extra) : null, ws && ws.k !== 'early' ? h('span', { class: 'tag ' + ws.cls }, ws.label) : null)),
    h('div', { class: 'qty' }, h('div', {}, String(+it.qty || 0), h('small', {}, (+it.qty || 0) === 1 ? 'bott.' : 'bott.'))));
}

function viewCellar() {
  const bottles = totalBottles();
  const labels = S.items.filter(i => (+i.qty || 0) > 0).length;
  const value = S.items.reduce((a, i) => a + (+i.price || 0) * (+i.qty || 0), 0);

  if (!S.items.length) {
    return [
      h('div', { class: 'hdr' }, h('div', {}, h('h1', {}, 'Cantina'), h('div', { class: 'sub' }, 'Vini e birre, sempre a portata di mano'))),
      h('div', { class: 'empty' },
        h('div', { class: 'art', html: '<svg viewBox="0 0 24 24"><path d="M10 2h4v4c0 1 2 2.5 2 5.5V21a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-9.5C8 8.5 10 7 10 6z"/></svg>' }),
        h('h3', {}, 'La cantina è vuota'),
        h('p', {}, 'Scansiona il codice a barre di una bottiglia o aggiungila a mano.'),
        h('div', { style: 'display:grid;gap:10px;max-width:320px;margin:0 auto' },
          h('button', { class: 'btn primary block', onclick: startScan }, icon('barcode'), 'Scansiona una bottiglia'),
          h('button', { class: 'btn block', onclick: () => { S.draft = { type: 'rosso' }; go('/new'); } }, 'Aggiungi a mano'),
          h('button', { class: 'btn ghost block', onclick: loadDemo }, 'Prova con bottiglie di esempio'))),
      installTip(),
    ];
  }

  const drinkNow = S.items.filter(i => (+i.qty || 0) > 0).map(i => ({ i, ws: windowStatus(i) }))
    .filter(x => x.ws && (x.ws.k === 'now-last' || x.ws.k === 'late'))
    .sort((a, b) => (drinkWindow(a.i).to || 0) - (drinkWindow(b.i).to || 0)).slice(0, 10);

  const counts = {};
  S.items.forEach(i => { if ((+i.qty || 0) > 0 || S.showEmpty) counts[i.type] = (counts[i.type] || 0) + 1; });
  const chips = h('div', { class: 'chips' },
    h('button', { class: 'chip' + (S.filter === 'all' ? ' on' : ''), onclick: () => { S.filter = 'all'; render(); } }, 'Tutti'),
    Object.entries(TYPES).filter(([k]) => counts[k]).map(([k, t]) =>
      h('button', { class: 'chip' + (S.filter === k ? ' on' : ''), onclick: () => { S.filter = S.filter === k ? 'all' : k; render(); } },
        h('span', { class: 'dot', style: `background:${t.color}` }), t.plural, h('span', { class: 'n' }, counts[k]))));

  const listEl = h('div', { class: 'list' });
  const fill = () => {
    const list = cellarFiltered();
    listEl.replaceChildren(...(list.length ? list.map(itemCard) : [h('div', { class: 'empty', style: 'padding:30px' }, h('p', {}, 'Nessuna bottiglia trovata.'))]));
  };
  fill();

  const search = h('input', { type: 'search', placeholder: 'Cerca nome, produttore, vitigno…', value: S.query, enterkeyhint: 'search' });
  search.oninput = () => { S.query = search.value; fill(); };

  const sortSel = h('select', { 'aria-label': 'Ordina' },
    [['recent', 'Aggiunti di recente'], ['name', 'Nome'], ['vintage', 'Annata'], ['qty', 'Quantità'], ['rating', 'Valutazione'], ['price', 'Prezzo']]
      .map(([v, l]) => h('option', { value: v, selected: S.sort === v }, l)));
  sortSel.onchange = () => { S.sort = sortSel.value; fill(); };

  return [
    h('div', { class: 'hdr' },
      h('div', {}, h('h1', {}, 'Cantina'), h('div', { class: 'sub' }, greeting())),
      h('div', { class: 'hdr-actions' }, h('button', { class: 'icon-btn stroke', 'aria-label': 'Scansiona', onclick: startScan }, icon('barcode')))),
    h('div', { class: 'stats' },
      h('div', { class: 'stat accent' }, h('div', { class: 'v' }, bottles), h('div', { class: 'l' }, bottles === 1 ? 'bottiglia' : 'bottiglie')),
      h('div', { class: 'stat' }, h('div', { class: 'v' }, labels), h('div', { class: 'l' }, 'etichette')),
      h('div', { class: 'stat' }, h('div', { class: 'v', style: value >= 10000 ? 'font-size:20px' : '' }, value ? money(value) : '—'), h('div', { class: 'l' }, 'valore'))),
    drinkNow.length ? [
      h('div', { class: 'section-t' }, h('h2', {}, 'Da bere presto')),
      h('div', { class: 'hscroll' }, drinkNow.map(({ i, ws }) =>
        h('div', { class: 'mini', onclick: () => go('/item/' + i.id) }, thumb(i),
          h('div', { class: 'tx' }, h('div', { class: 'nm' }, i.name), h('div', { class: 'mt' }, [i.vintage, ws.label].filter(Boolean).join(' · '))))))
    ] : null,
    h('div', { class: 'section-t' }, h('h2', {}, 'Le mie bottiglie')),
    h('label', { class: 'search' }, icon('search'), search),
    chips,
    h('div', { class: 'sort-row' },
      h('label', { style: 'display:flex;align-items:center;gap:6px' },
        h('input', { type: 'checkbox', checked: S.showEmpty, onchange: e => { S.showEmpty = e.target.checked; render(); } }), 'Mostra esauriti'),
      sortSel),
    listEl,
  ];
}

function greeting() {
  const hr = new Date().getHours();
  if (hr < 12) return 'Buongiorno! Cosa c’è in cantina oggi?';
  if (hr < 18) return 'Buon pomeriggio, pronto per un calice?';
  return 'Buonasera, cosa si stappa stasera?';
}

// ============ Dettaglio ============
function viewItem(id) {
  const it = byId(id);
  if (!it) { go('/'); return null; }
  const style = styleOf(it);
  const st = STYLES[style];
  const ws = windowStatus(it);
  const w = drinkWindow(it);
  const isBeer = it.type === 'birra';
  const bs = beerStyleById(it.beerStyle);

  const qtyV = h('div', { class: 'v' }, String(+it.qty || 0));
  const setQty = async n => {
    it.qty = Math.max(0, n); it.updatedAt = new Date().toISOString();
    await db.put('items', it); qtyV.textContent = String(it.qty);
  };

  const spec = (l, v, wide) => v ? h('div', { class: 'spec' + (wide ? ' wide' : '') }, h('div', { class: 'l' }, l), h('div', { class: 'v' }, v)) : null;
  const pair = dishesForItem(it);
  const drunk = S.history.filter(x => x.itemId === it.id).sort((a, b) => b.date.localeCompare(a.date));

  let windowEl = null;
  if (w && w.from && w.to) {
    const y = new Date().getFullYear();
    const lo = Math.min(w.from - 1, y - 1), hi = Math.max(w.to + 1, y + 1);
    const pct = v => ((v - lo) / (hi - lo)) * 100;
    windowEl = h('div', { class: 'window' },
      h('div', { style: 'display:flex;justify-content:space-between;align-items:center' },
        h('div', { style: 'font-weight:600' }, 'Finestra di consumo'),
        ws ? h('span', { class: 'tag ' + ws.cls }, ws.label) : null),
      h('div', { class: 'bar' },
        h('div', { class: 'fill', style: `left:${pct(w.from)}%;right:${100 - pct(w.to)}%` }),
        h('div', { class: 'now', style: `left:${pct(y)}%` })),
      h('div', { class: 'ends' }, h('span', {}, `dal ${w.from}`), h('span', {}, `oggi ${y}`), h('span', {}, `entro ${w.to}`)),
      w.estimated ? h('div', { class: 'hint', style: 'margin:8px 0 0' }, 'Stima basata su tipologia e denominazione. Puoi personalizzarla modificando la scheda.') : null);
  }

  return [
    h('div', { class: 'hero' + (it.image ? ' has-img' : '') }, thumb(it)),
    h('div', { class: 'floating-bar' },
      h('button', { class: 'icon-btn stroke', 'aria-label': 'Indietro', onclick: () => history.length > 1 ? history.back() : go('/') }, icon('back')),
      h('button', { class: 'icon-btn stroke', 'aria-label': 'Modifica', onclick: () => go('/edit/' + it.id) }, icon('pen'))),
    h('div', { class: 'detail-head' },
      h('div', { class: 'tags', style: 'display:flex;gap:6px;flex-wrap:wrap' }, typeTag(it.type), it.vintage ? h('span', { class: 'tag wine' }, it.vintage) : null, it.rating ? h('span', { class: 'tag amber' }, '★ ' + it.rating) : null),
      h('h1', {}, it.name || 'Senza nome'),
      h('div', { class: 'pr' }, [it.producer, isBeer ? (bs ? bs.label : it.beerStyleText) : it.denomination].filter(Boolean).join(' · '))),
    h('div', { class: 'qty-card' },
      h('div', {}, h('div', { class: 'l' }, 'In cantina'), qtyV),
      h('div', { class: 'stepper', style: 'margin-left:6px' },
        h('button', { 'aria-label': 'Togli una', onclick: () => setQty((+it.qty || 0) - 1) }, '−'),
        h('button', { 'aria-label': 'Aggiungi una', onclick: () => setQty((+it.qty || 0) + 1) }, '+')),
      h('button', { class: 'btn primary', style: 'margin-left:auto', onclick: () => drinkSheet(it, () => { qtyV.textContent = String(it.qty); render(); }) }, icon('glass'), isBeer ? 'Bevi' : 'Stappa')),
    windowEl,
    h('div', { class: 'specs' },
      isBeer ? spec('Stile', bs ? bs.label : it.beerStyleText) : spec('Denominazione', it.denomination),
      spec(isBeer ? 'Birrificio' : 'Produttore', it.producer),
      !isBeer ? spec('Vitigni', it.grapes, (it.grapes || '').length > 22) : null,
      spec('Zona', [it.region, it.country].filter(Boolean).join(', ')),
      spec('Gradazione', it.abv ? `${String(it.abv).replace('.', ',')}% vol` : ''),
      spec('Formato', it.size),
      spec('Prezzo', it.price ? money(it.price) : ''),
      spec('Posizione', it.location),
      spec('Servizio', st ? st.temp : ''),
      spec('Bicchiere', st ? st.glass : ''),
      spec('Acquisto', [it.purchaseDate ? fmtDate(it.purchaseDate) : '', it.purchasePlace].filter(Boolean).join(' · ')),
      spec('Codice a barre', it.barcode)),
    it.notes ? [h('div', { class: 'section-t' }, h('h2', {}, 'Note')), h('div', { class: 'notes' }, it.notes)] : null,
    h('div', { class: 'section-t' }, h('h2', {}, 'Cosa ci mangio?'), h('button', { class: 'a', onclick: () => { S.pairMode = 'wine'; S.pickId = it.id; go('/pairing'); } }, 'Dettagli')),
    st ? h('div', { class: 'hint', style: 'margin:-4px 4px 12px' }, `Profilo: ${st.label.toLowerCase()}`) : null,
    h('div', { class: 'pair-grid' }, pair.dishes.map(d => h('div', { class: 'dish' }, h('div', { class: 'em' }, d.em), h('div', { class: 'nm' }, d.nm), h('div', { class: 'why' }, d.why)))),
    drunk.length ? [
      h('div', { class: 'section-t' }, h('h2', {}, 'Già bevute')),
      h('div', { class: 'list' }, drunk.map(histRow)),
    ] : null,
    h('div', { style: 'margin-top:28px;display:grid;gap:8px' },
      h('button', { class: 'btn danger block', onclick: async () => {
        if (await confirmSheet({ title: 'Eliminare questa etichetta?', text: 'Lo storico delle bottiglie bevute resterà.', ok: 'Elimina', danger: true })) {
          await db.del('items', it.id); await load(); toast('Etichetta eliminata'); go('/');
        }
      } }, icon('trash'), 'Elimina etichetta')),
  ];
}

function drinkSheet(it, after) {
  const today = new Date().toISOString().slice(0, 10);
  const e = { date: today, rating: it.rating || 0, notes: '', dish: '', occasion: '' };
  sheet((box, close) => {
    const inp = (label, key, attrs = {}) => {
      const i = h(attrs.tag || 'input', { ...attrs, tag: null, value: e[key] });
      i.oninput = () => { e[key] = i.value; };
      return h('div', { class: 'field' + (attrs.tag === 'textarea' ? ' col' : '') }, h('label', {}, label), i);
    };
    box.append(
      h('h3', {}, it.type === 'birra' ? 'Salute! 🍺' : 'Cin cin! 🍷'),
      h('div', { class: 'sub' }, `${it.name}${it.vintage ? ' ' + it.vintage : ''} — verrà tolta una bottiglia dalla cantina e aggiunta allo storico.`),
      h('div', { class: 'form' },
        h('div', { class: 'group' },
          inp('Data', 'date', { type: 'date' }),
          h('div', { class: 'field' }, h('label', {}, 'Voto'), stars(e.rating, v => { e.rating = v; })),
          inp('Con il piatto', 'dish', { placeholder: 'es. Brasato' }),
          inp('Occasione', 'occasion', { placeholder: 'es. Cena con amici' }),
          inp('Note di degustazione', 'notes', { tag: 'textarea', placeholder: 'Profumi, gusto, impressioni…' })),
        h('button', { class: 'btn primary block', onclick: async () => {
          const entry = {
            id: uid(), itemId: it.id, date: e.date || today, rating: e.rating, notes: e.notes.trim(), dish: e.dish.trim(), occasion: e.occasion.trim(),
            snapshot: { name: it.name, producer: it.producer, vintage: it.vintage, type: it.type, image: it.image, denomination: it.denomination, beerStyle: it.beerStyle },
            createdAt: new Date().toISOString(),
          };
          await db.put('history', entry);
          it.qty = Math.max(0, (+it.qty || 0) - 1);
          if (e.rating) it.rating = e.rating;
          it.updatedAt = new Date().toISOString();
          await db.put('items', it);
          await load();
          close();
          toast(it.qty ? `Aggiunto allo storico · ne restano ${it.qty}` : 'Aggiunto allo storico · era l’ultima!');
          after && after();
        } }, icon('glass'), 'Registra nello storico')));
  });
}

// ============ Aggiungi ============
async function startScan() {
  const code = await scanBarcode();
  if (!code) return;
  await handleBarcode(code);
}

async function handleBarcode(code) {
  const existing = S.items.find(i => i.barcode === code);
  if (existing) {
    sheet((box, close) => box.append(
      h('h3', {}, 'Già in cantina'),
      h('div', { class: 'sub' }, `${existing.name} — ${+existing.qty || 0} bottiglie`),
      h('div', { style: 'display:grid;gap:10px' },
        h('button', { class: 'btn primary block', onclick: async () => { existing.qty = (+existing.qty || 0) + 1; await db.put('items', existing); await load(); close(); toast('Una bottiglia in più!'); go('/item/' + existing.id); } }, icon('plus'), 'Aggiungi una bottiglia'),
        h('button', { class: 'btn block', onclick: () => { close(); go('/item/' + existing.id); } }, 'Apri la scheda'),
        h('button', { class: 'btn ghost block', onclick: () => { close(); S.draft = { ...existing, id: null, qty: 1, vintage: '' }; go('/new'); } }, 'Nuova annata dello stesso vino'))));
    return;
  }
  const close = sheet(box => box.append(h('div', { class: 'loading' }, h('div', { class: 'spin' }), `Cerco ${code}…`)));
  let found = null;
  try { found = await lookupBarcode(code); } catch { /* offline o errore */ }
  close();
  if (found) {
    S.draft = { qty: 1, ...found };
    toast(found.name ? `Trovato: ${found.name}` : 'Prodotto trovato');
  } else {
    S.draft = { barcode: code, qty: 1, type: 'rosso' };
    toast('Non trovato online: completa tu i dati');
  }
  go('/new');
}

// Lettura etichetta con AI: scatta/scegli foto → campi della scheda
const LABEL_FIELDS = ['name', 'producer', 'vintage', 'type', 'denomination', 'grapes', 'region', 'country', 'abv', 'size', 'beerStyle', 'drinkFrom', 'drinkTo', 'notes'];
function pickImageFile() {
  return new Promise(resolve => {
    const fi = h('input', { type: 'file', accept: 'image/*', style: 'display:none' });
    fi.onchange = () => { resolve(fi.files[0] || null); fi.remove(); };
    document.body.append(fi); fi.click();
  });
}
async function readLabel() {
  if (!aiReady()) { toast('Attiva prima il Sommelier AI'); go('/settings'); return null; }
  const file = await pickImageFile();
  if (!file) return null;
  const dataURL = await fileToDataURL(file, 1280);
  const close = sheet(box => box.append(h('div', { class: 'loading' }, h('div', { class: 'spin' }), `Leggo l’etichetta con ${aiLabel().split(' · ')[0]}…`)));
  try {
    const r = await aiReadLabel(dataURL);
    const out = { image: await fileToDataURL(file, 900) };
    for (const k of LABEL_FIELDS) {
      let v = r[k]; if (v == null) continue; v = String(v).trim(); if (!v) continue;
      if (k === 'type' && !TYPES[v]) continue;
      if (k === 'beerStyle' && !beerStyleById(v)) continue;
      if (k === 'vintage' || k === 'drinkFrom' || k === 'drinkTo') { v = (v.match(/\d{4}/) || [''])[0]; if (!v) continue; }
      if (k === 'abv') v = v.replace('.', ',').replace(/[^\d,]/g, '');
      out[k] = v;
    }
    close();
    return out;
  } catch (e) { close(); toast(e.message || 'Lettura non riuscita'); return null; }
}

function viewAdd() {
  return [
    h('div', { class: 'hdr' }, h('div', {}, h('h1', {}, 'Aggiungi'), h('div', { class: 'sub' }, 'Una nuova bottiglia in cantina'))),
    h('div', { class: 'big-actions' },
      h('button', { class: 'big-action scan', onclick: startScan },
        h('div', { class: 'ic' }, icon('barcode')),
        h('div', {}, h('div', { class: 'tt' }, 'Scansiona il codice a barre'), h('div', { class: 'ds' }, 'Riconosco la bottiglia e cerco foto e dati online'))),
      h('button', { class: 'big-action', onclick: async () => { const r = await readLabel(); if (r) { S.draft = { qty: 1, type: 'rosso', ...r }; toast(r.name ? `Letto: ${r.name}` : 'Etichetta letta'); go('/new'); } } },
        h('div', { class: 'ic', style: 'background:linear-gradient(135deg,#F3E6FF,#FFE3EC);color:#8E2443' }, icon('camera')),
        h('div', {}, h('div', { class: 'tt' }, 'Foto dell’etichetta ✨'), h('div', { class: 'ds' }, aiReady() ? `L’AI legge l’etichetta e compila la scheda (${aiLabel().split(' · ')[0]})` : 'Attiva il Sommelier AI in “Altro” per usarla'))),
      h('button', { class: 'big-action', onclick: () => { S.draft = { type: 'rosso', qty: 1 }; go('/new'); } },
        h('div', { class: 'ic', style: 'background:var(--wine-soft);color:var(--wine)' }, icon('glass')),
        h('div', {}, h('div', { class: 'tt' }, 'Vino a mano'), h('div', { class: 'ds' }, 'Scrivi nome e denominazione, il resto lo suggerisco io'))),
      h('button', { class: 'big-action', onclick: () => { S.draft = { type: 'birra', qty: 1, size: '0,33 L' }; go('/new'); } },
        h('div', { class: 'ic', style: 'background:var(--amber-soft);color:var(--amber)', html: '<svg viewBox="0 0 24 24"><path d="M5 7h10v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2zM15 10h2a2.5 2.5 0 0 1 0 5h-2M5 7c0-2 1.5-3 3-2.5C9 3 11 3 12 4.5 13.5 4 15 5 15 7"/></svg>' }),
        h('div', {}, h('div', { class: 'tt' }, 'Birra a mano'), h('div', { class: 'ds' }, 'Stile, birrificio e abbinamenti')))),
    h('p', { class: 'hint', style: 'margin-top:18px' }, 'Il codice a barre viene cercato su Open Food Facts, il database aperto dei prodotti. Se una bottiglia non c’è, puoi completarla a mano: la prossima volta che scansioni lo stesso codice la troverò in cantina.'),
  ];
}

// ============ Form ============
function viewForm(id) {
  const editing = id ? byId(id) : null;
  if (id && !editing) { go('/'); return null; }
  const f = editing ? { ...editing } : { qty: 1, type: 'rosso', ...(S.draft || {}) };
  const container = h('div');
  let photo;

  const autoFill = () => {
    if (editing) return;
    const inf = infer(f);
    let changed = false;
    if (inf.type && !f._typeTouched && inf.type !== f.type) { f.type = inf.type; changed = true; }
    let filled = false;
    for (const k of ['grapes', 'region', 'country']) if (inf[k] && !f[k]) {
      f[k] = inf[k]; filled = true;
      const el = container.querySelector(`[data-k="${k}"]`); if (el) el.value = inf[k];
    }
    if (inf.beerStyle && !f.beerStyle) { f.beerStyle = inf.beerStyle; changed = true; }
    if (changed) draw();   // cambia la tipologia: ridisegna i campi
    if (changed || filled) toast('Ho completato alcuni campi per te ✨');
  };

  const field = (label, key, attrs = {}) => {
    const el = h(attrs.tag || 'input', { ...attrs, tag: null, auto: null, 'data-k': key, value: f[key] ?? '' });
    el.addEventListener('input', () => { f[key] = el.value; });
    if (attrs.auto) el.addEventListener('change', autoFill);
    return h('div', { class: 'field' + (attrs.tag === 'textarea' ? ' col' : '') }, h('label', { for: 'f-' + key }, label), el);
  };
  const select = (label, key, options) => {
    const el = h('select', {}, options.map(([v, l]) => h('option', { value: v, selected: (f[key] || '') === v }, l)));
    el.onchange = () => { f[key] = el.value; };
    return h('div', { class: 'field' }, h('label', {}, label), el);
  };

  const pickPhoto = () => {
    const ph = thumb(f);
    const fileIn = h('input', { type: 'file', accept: 'image/*', style: 'display:none' });
    fileIn.onchange = async () => { if (!fileIn.files[0]) return; f.image = await fileToDataURL(fileIn.files[0]); photo.replaceWith(photo = pickPhoto()); };
    return h('div', { class: 'group' }, h('div', { class: 'photo-pick' }, ph,
      h('div', { class: 'acts' },
        h('button', { class: 'btn sm', type: 'button', onclick: () => imageSheet(f, url => { f.image = url; photo.replaceWith(photo = pickPhoto()); }) }, icon('search'), 'Cerca su internet'),
        h('button', { class: 'btn sm', type: 'button', onclick: () => fileIn.click() }, icon('camera'), 'Scatta o scegli'),
        aiReady() ? h('button', { class: 'btn sm', type: 'button', onclick: async () => {
          const r = await readLabel(); if (!r) return;
          let n = 0;
          for (const [k, v] of Object.entries(r)) { if (k === 'image' ? !f.image : !f[k] || (k === 'type' && !f._typeTouched && !editing)) { if (f[k] !== v) { f[k] = v; n++; } } }
          draw(); toast(n ? `Ho compilato ${n} campi ✨` : 'Nessun campo nuovo dall’etichetta');
        } }, '✨ Leggi etichetta') : null,
        f.image ? h('button', { class: 'btn sm ghost', type: 'button', onclick: () => { f.image = ''; photo.replaceWith(photo = pickPhoto()); } }, 'Rimuovi foto') : null),
      fileIn));
  };

  const draw = () => {
    const isBeer = f.type === 'birra';
    const isWine = !isBeer && f.type !== 'altro';
    photo = pickPhoto();
    container.replaceChildren(h('div', { class: 'form' },
      photo,
      h('div', { class: 'group-t' }, 'Tipologia'),
      h('div', { class: 'group' }, h('div', { class: 'seg' }, Object.entries(TYPES).map(([k, t]) =>
        h('button', { type: 'button', class: f.type === k ? 'on' : '', onclick: () => { f.type = k; f._typeTouched = true; draw(); } }, h('span', { class: 'dot', style: `background:${t.color}` }), t.label)))),
      h('div', { class: 'group-t' }, isBeer ? 'La birra' : 'Il vino'),
      h('div', { class: 'group' },
        field('Nome', 'name', { placeholder: isBeer ? 'es. Tripel Karmeliet' : 'es. Barolo Cannubi', auto: true, autocapitalize: 'words' }),
        field(isBeer ? 'Birrificio' : 'Produttore', 'producer', { placeholder: isBeer ? 'es. Bosteels' : 'es. Cantina…', autocapitalize: 'words' }),
        !isBeer ? field('Annata', 'vintage', { inputmode: 'numeric', placeholder: 'es. 2019', maxlength: 4 }) : null,
        isWine ? field('Denominazione', 'denomination', { placeholder: 'es. Chianti Classico DOCG', auto: true, autocapitalize: 'words' }) : null,
        isBeer ? select('Stile', 'beerStyle', [['', 'Scegli…'], ...BEER_STYLES.map(b => [b.id, b.label])]) : null,
        isWine ? field('Vitigni', 'grapes', { placeholder: 'es. Nebbiolo', auto: true, autocapitalize: 'words' }) : null,
        (f.type === 'rosso' || f.type === 'bianco') ? select('Corpo', 'body', [['', 'Automatico'], ['leggero', 'Leggero'], ['medio', 'Medio'], ['pieno', 'Pieno/strutturato']]) : null,
        field('Regione', 'region', { placeholder: 'es. Piemonte', autocapitalize: 'words' }),
        field('Paese', 'country', { placeholder: 'es. Italia', autocapitalize: 'words' }),
        field('Gradazione %', 'abv', { inputmode: 'decimal', placeholder: 'es. 14' }),
        field('Formato', 'size', { placeholder: isBeer ? '0,33 L' : '0,75 L', list: 'sizes' })),
      h('datalist', { id: 'sizes' }, ['0,33 L', '0,375 L', '0,5 L', '0,75 L', '1,5 L', '3 L'].map(v => h('option', { value: v }))),
      h('div', { class: 'group-t' }, 'In cantina'),
      h('div', { class: 'group' },
        h('div', { class: 'field' }, h('label', {}, 'Bottiglie'), (() => {
          const span = h('span', {}, String(+f.qty || 0));
          return h('div', { class: 'stepper' },
            h('button', { type: 'button', onclick: () => { f.qty = Math.max(0, (+f.qty || 0) - 1); span.textContent = f.qty; } }, '−'), span,
            h('button', { type: 'button', onclick: () => { f.qty = (+f.qty || 0) + 1; span.textContent = f.qty; } }, '+'));
        })()),
        field('Prezzo (€)', 'price', { inputmode: 'decimal', placeholder: 'a bottiglia' }),
        field('Posizione', 'location', { placeholder: 'es. Scaffale B, riga 2' }),
        field('Acquistato il', 'purchaseDate', { type: 'date' }),
        field('Acquistato da', 'purchasePlace', { placeholder: 'es. Enoteca…' }),
        !isBeer ? field('Bere dal', 'drinkFrom', { inputmode: 'numeric', placeholder: 'anno (facoltativo)', maxlength: 4 }) : null,
        !isBeer ? field('Bere entro', 'drinkTo', { inputmode: 'numeric', placeholder: 'anno (facoltativo)', maxlength: 4 }) : null),
      h('div', { class: 'group-t' }, 'Le mie note'),
      h('div', { class: 'group' },
        h('div', { class: 'field' }, h('label', {}, 'Voto'), stars(f.rating || 0, v => { f.rating = v; })),
        field('Note', 'notes', { tag: 'textarea', placeholder: 'Profumi, gusto, ricordi…' }),
        field('Codice a barre', 'barcode', { inputmode: 'numeric' })),
      h('button', { class: 'btn primary block', type: 'button', onclick: save }, editing ? 'Salva modifiche' : 'Aggiungi in cantina'),
    ));
  };

  async function save() {
    if (!(f.name || '').trim()) { toast('Inserisci almeno il nome'); return; }
    const now = new Date().toISOString();
    const it = {
      ...f,
      id: editing ? editing.id : uid(),
      name: f.name.trim(),
      qty: +f.qty || 0,
      price: parseNum(f.price),
      abv: f.abv ? String(f.abv).replace('.', ',') : '',
      vintage: (f.vintage || '').toString().replace(/\D/g, '').slice(0, 4),
      createdAt: editing ? editing.createdAt : now,
      updatedAt: now,
    };
    delete it._typeTouched;
    await db.put('items', it);
    await load();
    S.draft = null;
    toast(editing ? 'Modifiche salvate' : 'Aggiunto in cantina 🍷');
    if (editing) history.back(); else location.replace('#/item/' + it.id);
  }

  draw();
  return [
    h('div', { class: 'topbar' },
      h('button', { class: 'back', onclick: () => history.length > 1 ? history.back() : go('/') }, icon('back'), 'Indietro'),
      h('div', { class: 't' }, editing ? 'Modifica' : 'Nuova bottiglia'),
      h('button', { class: 'back', style: 'font-weight:600', onclick: save }, 'Salva')),
    container,
  ];
}

function imageSheet(f, onPick) {
  sheet((box, close) => {
    const q = h('input', { type: 'search', value: [f.producer, f.name, f.vintage].filter(Boolean).join(' '), placeholder: 'Nome del vino o della birra', enterkeyhint: 'search' });
    const grid = h('div', { class: 'img-grid' });
    const status = h('div');
    const urlIn = h('input', { type: 'url', placeholder: 'https://… (link a un’immagine)' });
    const run = async () => {
      if (!q.value.trim()) return;
      status.replaceChildren(h('div', { class: 'loading' }, h('div', { class: 'spin' }), 'Cerco immagini…'));
      grid.replaceChildren();
      const res = await searchImages(q.value, { beer: f.type === 'birra' });
      status.replaceChildren(res.length ? h('div', { class: 'hint', style: 'margin:0 0 10px' }, 'Tocca un’immagine per usarla') : h('div', { class: 'hint', style: 'margin:0 0 10px' }, 'Nessuna immagine trovata: prova a semplificare la ricerca (es. solo produttore e nome).'));
      grid.replaceChildren(...res.map(r => {
        const img = h('img', { src: r.url, alt: r.title, loading: 'lazy', referrerpolicy: 'no-referrer' });
        const b = h('button', { type: 'button', title: r.title, onclick: () => { onPick(r.url); close(); } }, img);
        img.onerror = () => b.remove();
        return b;
      }));
    };
    box.append(
      h('h3', {}, 'Foto da internet'),
      h('div', { class: 'sub' }, 'Da Open Food Facts, Wikimedia e Wikipedia'),
      h('form', { onsubmit: e => { e.preventDefault(); q.blur(); run(); }, style: 'display:flex;gap:8px;margin-bottom:12px' },
        h('label', { class: 'search', style: 'flex:1' }, icon('search'), q), h('button', { class: 'btn primary sm', style: 'height:42px' }, 'Cerca')),
      status, grid,
      h('div', { class: 'group-t', style: 'margin:18px 4px 8px' }, 'Oppure incolla un link'),
      h('form', { onsubmit: e => { e.preventDefault(); if (/^https?:\/\//.test(urlIn.value)) { onPick(urlIn.value.trim()); close(); } else toast('Link non valido'); }, style: 'display:flex;gap:8px' },
        h('label', { class: 'search', style: 'flex:1' }, icon('link'), urlIn), h('button', { class: 'btn sm', style: 'height:42px' }, 'Usa')),
      h('p', { class: 'hint' }, 'Suggerimento: su Google Immagini tieni premuto su una foto › “Copia link immagine” e incollalo qui.'));
    run();
  });
}

// ============ Abbinamenti ============
function viewPairing() {
  const body = h('div');
  const tab = (k, l) => h('button', { class: S.pairMode === k ? 'on' : '', onclick: () => { S.pairMode = k; render(); } }, l);
  const tabs = h('div', { class: 'seg-tabs three' }, tab('dish', 'Piatto'), tab('wine', 'Bottiglia'), tab('ask', 'Chiedi ✨'));

  if (S.pairMode === 'dish') {
    const out = h('div');
    const inp = h('input', { type: 'search', placeholder: 'Cosa cucini? es. risotto ai funghi', value: S.dishText, enterkeyhint: 'search' });
    const run = () => {
      S.dishText = inp.value;
      if (!inp.value.trim()) { out.replaceChildren(); return; }
      const dish = inp.value.trim();
      const r = suggestForDish(dish, S.items);
      const aiBox = aiAction(`Chiedi al sommelier AI`, async () => renderAIDish(await aiPairDish(dish, S.items, windowStatus)));
      if (!r.matches.length) {
        out.replaceChildren(h('div', { class: 'empty', style: 'padding:24px 10px 10px' }, h('h3', {}, 'Non ho riconosciuto il piatto'), h('p', {}, aiReady() ? 'Chiedi al sommelier AI: capisce anche le descrizioni più complesse.' : 'Prova con l’ingrediente principale o il tipo di cottura (es. “pesce alla griglia”, “brasato”).')), aiBox);
        return;
      }
      out.replaceChildren(
        h('div', { class: 'ideal' },
          h('div', { class: 'h' }, 'L’abbinamento ideale'),
          h('div', { class: 'b' }, r.ideal.map(i => i.label).join(' · ')),
          h('div', { class: 's' }, `Per esempio: ${r.ideal[0].ex}. ${r.matches[0].cat.why}`),
          h('div', { class: 'hint', style: 'margin:8px 0 0' }, 'Riconosciuto: ' + r.matches.map(m => m.cat.label.toLowerCase()).join(', '))),
        aiBox,
        h('div', { class: 'section-t' }, h('h2', {}, 'Dalla tua cantina')),
        r.wines.length
          ? h('div', { class: 'list' }, r.wines.map(w => wineMatchCard(w.it, w.match, w.reasons[0] || '', (STYLES[w.style] || {}).label)))
          : h('div', { class: 'notes' }, S.items.length ? 'Nessuna bottiglia adatta in cantina: forse è il momento di fare un salto in enoteca! 🛒' : 'Aggiungi qualche bottiglia per ricevere suggerimenti dalla tua cantina.'));
    };
    inp.oninput = () => { clearTimeout(inp._t); inp._t = setTimeout(run, 300); };
    body.append(
      h('form', { onsubmit: e => { e.preventDefault(); inp.blur(); run(); } }, h('label', { class: 'search' }, icon('search'), inp)),
      h('div', { class: 'quick' }, QUICK_DISHES.map(d => h('button', { onclick: () => { inp.value = d; run(); } }, d))),
      out);
    if (S.dishText) run();
  } else if (S.pairMode === 'wine') {
    const out = h('div');
    const avail = S.items.filter(i => (+i.qty || 0) > 0);
    const free = h('input', { type: 'search', placeholder: 'Oppure scrivi un vino o una birra', enterkeyhint: 'search' });
    const showFor = (it) => {
      const p = dishesForItem(it);
      out.replaceChildren(
        p.info ? h('div', { class: 'ideal' }, h('div', { class: 'h' }, 'Profilo'), h('div', { class: 'b' }, p.info.label), h('div', { class: 's' }, `Servire a ${p.info.temp} · ${p.info.glass}`)) : null,
        aiAction('Approfondisci con l’AI', async () => renderAIWine(await aiPairWine(it))),
        h('div', { class: 'section-t' }, h('h2', {}, 'Piatti consigliati')),
        dishGrid(p.dishes.map(d => ({ em: d.em, nm: d.nm, why: d.why }))));
      out.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    const pickList = h('div', { class: 'picker' }, avail.map(it => {
      const row = h('div', { class: 'pick-row' + (S.pickId === it.id ? ' on' : ''), onclick: () => {
        S.pickId = it.id; pickList.querySelectorAll('.pick-row').forEach(r => r.classList.remove('on')); row.classList.add('on'); showFor(it);
      } }, thumb(it), h('div', {}, h('div', { class: 'nm' }, it.name + (it.vintage ? ' ' + it.vintage : '')), h('div', { class: 'pr' }, [TYPES[it.type]?.label, it.producer].filter(Boolean).join(' · '))));
      return row;
    }));
    body.append(
      h('form', { onsubmit: e => {
        e.preventDefault(); free.blur();
        const v = free.value.trim(); if (!v) return;
        const inf = infer({ name: v });
        const it = { name: v, type: inf.type || 'rosso', beerStyle: inf.beerStyle, denomination: '' };
        S.pickId = null; pickList.querySelectorAll('.pick-row').forEach(r => r.classList.remove('on'));
        showFor(it);
      } }, h('label', { class: 'search' }, icon('search'), free)),
      ...(avail.length ? [h('div', { class: 'section-t' }, h('h2', {}, 'Scegli dalla cantina')), pickList] : [h('p', { class: 'hint' }, 'Scrivi ad esempio “Barolo”, “Vermentino”, “IPA”, “Prosecco”.')]),
      out);
    const sel = S.pickId && byId(S.pickId);
    if (sel) setTimeout(() => showFor(sel), 50);
  } else {
    body.append(...viewChat());
  }

  return [
    h('div', { class: 'hdr' }, h('div', {}, h('h1', {}, 'Abbinamenti'), h('div', { class: 'sub' }, aiReady() ? `Il sommelier in tasca · ✨ ${aiLabel()}` : 'Il sommelier in tasca'))),
    tabs, body,
  ];
}

function wineMatchCard(it, match, reason, sub) {
  return h('div', { class: 'card', onclick: () => go('/item/' + it.id) },
    thumb(it),
    h('div', { class: 'bd' },
      match != null ? h('div', { class: 'match' }, `${match}% compatibile`) : null,
      h('div', { class: 'nm' }, it.name + (it.vintage ? ' ' + it.vintage : '')),
      h('div', { class: 'pr' }, [it.producer, sub].filter(Boolean).join(' · ')),
      reason ? h('div', { class: 'reason' }, reason) : null));
}
const dishGrid = dishes => h('div', { class: 'pair-grid' }, dishes.map(d => h('div', { class: 'dish' }, h('div', { class: 'em' }, d.em || '🍽'), h('div', { class: 'nm' }, d.nm), h('div', { class: 'why' }, d.why || ''))));

// Pulsante "AI" con stato di caricamento ed errori; se l'AI non è configurata invita ad attivarla
function aiAction(label, run) {
  const box = h('div', { class: 'ai-box' });
  if (!aiReady()) {
    box.append(h('button', { class: 'ai-cta off', onclick: () => go('/settings') }, '✨ Attiva il Sommelier AI', h('span', {}, 'Gemini o Claude, con la tua chiave')));
    return box;
  }
  const btn = h('button', { class: 'ai-cta', onclick: async () => {
    btn.disabled = true;
    box.replaceChildren(h('div', { class: 'ai-card' }, h('div', { class: 'loading' }, h('div', { class: 'spin' }), `${aiLabel().split(' · ')[0]} sta pensando…`)));
    try { box.replaceChildren(await run()); }
    catch (e) { box.replaceChildren(h('div', { class: 'ai-card err' }, e.message || 'Errore'), btn); btn.disabled = false; }
  } }, '✨ ' + label, h('span', {}, aiLabel()));
  box.append(btn);
  return box;
}

function renderAIDish(r) {
  const picks = (r.scelte || []).map(p => ({ p, it: byId(p.id) })).filter(x => x.it);
  return h('div', { class: 'ai-card' },
    h('div', { class: 'ai-h' }, '✨ Il sommelier AI'),
    r.ideale ? h('div', { class: 'b' }, r.ideale) : null,
    r.spiegazione ? h('div', { class: 's' }, r.spiegazione) : null,
    picks.length ? h('div', { class: 'list', style: 'margin-top:12px' }, picks.map(({ p, it }) => wineMatchCard(it, Math.round(+p.percentuale) || null, p.motivo, TYPES[it.type]?.label))) : h('div', { class: 's', style: 'margin-top:10px' }, 'Nessuna bottiglia della cantina è davvero adatta.'),
    (r.da_comprare || []).length ? h('div', { class: 's', style: 'margin-top:12px' }, h('b', {}, '🛒 Da comprare: '), r.da_comprare.join(' · ')) : null,
    h('div', { class: 'ai-foot' }, aiLabel()));
}

function renderAIWine(r) {
  return h('div', { class: 'ai-card' },
    h('div', { class: 'ai-h' }, '✨ Il sommelier AI'),
    r.profilo ? h('div', { class: 's' }, r.profilo) : null,
    r.servizio ? h('div', { class: 's', style: 'margin-top:8px' }, h('b', {}, 'Servizio: '), r.servizio) : null,
    (r.piatti || []).length ? h('div', { style: 'margin-top:12px' }, dishGrid(r.piatti.map(d => ({ em: d.emoji, nm: d.nome, why: d.perche })))) : null,
    r.da_evitare ? h('div', { class: 's', style: 'margin-top:12px' }, h('b', {}, 'Da evitare: '), r.da_evitare) : null,
    h('div', { class: 'ai-foot' }, aiLabel()));
}

// ---------- Chat con il sommelier ----------
function mdLite(text) {
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  return esc(text)
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/^#{1,4}\s*(.+)$/gm, '<b>$1</b>')
    .replace(/^\s*[-*•]\s+(.+)$/gm, '<span class="li">$1</span>')
    .replace(/<\/span>\n/g, '</span>')
    .replace(/\n/g, '<br>');
}

function viewChat() {
  if (!aiReady()) {
    return [h('div', { class: 'empty', style: 'padding:30px 16px' },
      h('div', { class: 'art', html: '<svg viewBox="0 0 24 24"><path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8zM19 14l.9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9z"/></svg>' }),
      h('h3', {}, 'Chiedi al sommelier AI'),
      h('p', {}, 'Fai domande libere sulla tua cantina: “cosa apro sabato con 6 amici e una grigliata?”. Funziona con Gemini o Claude, con la tua chiave API.'),
      h('button', { class: 'btn primary', onclick: () => go('/settings') }, 'Configura il Sommelier AI'))];
  }
  const log = h('div', { class: 'chat' });
  const draw = () => {
    log.replaceChildren(...S.chat.map(m => h('div', { class: 'bubble ' + (m.role === 'user' ? 'me' : 'ai') + (m.error ? ' err' : ''), html: m.role === 'user' ? mdLite(m.text) : mdLite(m.text) })));
    if (S.chatBusy) log.append(h('div', { class: 'bubble ai' }, h('div', { class: 'loading', style: 'padding:4px' }, h('div', { class: 'spin' }), 'Sto pensando…')));
  };
  const inp = h('textarea', { rows: 1, placeholder: 'Scrivi una domanda…', enterkeyhint: 'send' });
  inp.oninput = () => { inp.style.height = 'auto'; inp.style.height = Math.min(inp.scrollHeight, 140) + 'px'; };
  const send = async text => {
    text = (text || '').trim();
    if (!text || S.chatBusy) return;
    S.chat.push({ role: 'user', text });
    inp.value = ''; inp.oninput();
    S.chatBusy = true; draw(); window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    try {
      const history = S.chat.filter(m => !m.error).slice(-12).map(m => ({ role: m.role, text: m.text }));
      const reply = await aiChat(history, S.items, windowStatus);
      S.chat.push({ role: 'assistant', text: reply });
    } catch (e) {
      S.chat.push({ role: 'assistant', text: e.message || 'Errore', error: true });
    }
    S.chatBusy = false;
    if (current === '/pairing' && S.pairMode === 'ask') { draw(); window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); }
  };
  inp.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); send(inp.value); } });
  draw();
  const ideas = ['Cosa apro stasera con una pizza?', 'Quali bottiglie devo bere per prime?', 'Organizza una cena di 4 portate con i miei vini', 'Cosa mi manca in cantina?'];
  return [
    S.chat.length ? null : h('div', { class: 'quick', style: 'margin-top:0' }, ideas.map(q => h('button', { onclick: () => send(q) }, q))),
    log,
    h('form', { class: 'chat-input', onsubmit: e => { e.preventDefault(); send(inp.value); } },
      inp, h('button', { class: 'btn primary sm', type: 'submit', 'aria-label': 'Invia' }, '↑')),
    S.chat.length ? h('button', { class: 'btn ghost sm', style: 'margin:6px auto 0;display:flex', onclick: () => { S.chat = []; render(); } }, 'Nuova conversazione') : null,
    h('p', { class: 'hint', style: 'text-align:center' }, `Risponde ${aiLabel()} · conosce l’elenco della tua cantina`),
  ];
}

// ============ Storico ============
function histRow(x) {
  const s = x.snapshot || {};
  const d = dLocal(x.date);
  return h('div', { class: 'hist', onclick: () => histSheet(x) },
    h('div', { class: 'day' }, h('div', { class: 'd' }, d.getDate()), h('div', { class: 'w' }, d.toLocaleDateString('it-IT', { weekday: 'short' }))),
    thumb(s),
    h('div', { class: 'bd' },
      h('div', { class: 'nm' }, (s.name || 'Bottiglia') + (s.vintage ? ' ' + s.vintage : '')),
      h('div', { class: 'pr' }, s.producer || TYPES[s.type]?.label || ''),
      x.rating ? stars(x.rating) : null,
      x.dish || x.occasion ? h('div', { class: 'with' }, [x.dish ? '🍽 ' + x.dish : '', x.occasion].filter(Boolean).join(' · ')) : null,
      x.notes ? h('div', { class: 'nt' }, x.notes.length > 110 ? x.notes.slice(0, 110) + '…' : x.notes) : null));
}

function histSheet(x) {
  const s = x.snapshot || {};
  const it = x.itemId && byId(x.itemId);
  sheet((box, close) => box.append(
    h('div', { style: 'display:flex;gap:14px;align-items:center;margin-bottom:12px' }, thumb(s, '') , h('div', {},
      h('h3', { style: 'margin:0' }, s.name + (s.vintage ? ' ' + s.vintage : '')),
      h('div', { class: 'sub', style: 'margin:2px 0 0' }, [s.producer, fmtDate(x.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })].filter(Boolean).join(' · ')))),
    x.rating ? h('div', { style: 'margin-bottom:10px' }, stars(x.rating)) : null,
    x.dish ? h('div', { class: 'spec', style: 'margin-bottom:8px' }, h('div', { class: 'l' }, 'Con il piatto'), h('div', { class: 'v' }, x.dish)) : null,
    x.occasion ? h('div', { class: 'spec', style: 'margin-bottom:8px' }, h('div', { class: 'l' }, 'Occasione'), h('div', { class: 'v' }, x.occasion)) : null,
    x.notes ? h('div', { class: 'notes', style: 'margin:0 0 8px' }, x.notes) : null,
    h('div', { style: 'display:grid;gap:8px;margin-top:14px' },
      it ? h('button', { class: 'btn block', onclick: () => { close(); go('/item/' + it.id); } }, 'Apri la scheda in cantina') : null,
      it ? h('button', { class: 'btn block', onclick: async () => { it.qty = (+it.qty || 0) + 1; await db.put('items', it); await load(); close(); toast('Bottiglia rimessa in cantina'); render(); } }, icon('plus'), 'Ho ricomprato questa bottiglia') : null,
      h('button', { class: 'btn danger block', onclick: async () => {
        close();
        if (await confirmSheet({ title: 'Eliminare dallo storico?', text: 'La bottiglia non verrà rimessa in cantina.', ok: 'Elimina', danger: true })) {
          await db.del('history', x.id); await load(); render(); toast('Eliminato');
        }
      } }, icon('trash'), 'Elimina dallo storico'))));
}

function viewHistory() {
  const year = new Date().getFullYear();
  const all = [...S.history].sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt || '').localeCompare(a.createdAt || ''));
  const thisYear = all.filter(x => x.date.startsWith(String(year))).length;
  const rated = all.filter(x => x.rating);
  const avg = rated.length ? (rated.reduce((a, x) => a + x.rating, 0) / rated.length).toFixed(1).replace('.', ',') : '—';

  if (!all.length) return [
    h('div', { class: 'hdr' }, h('div', {}, h('h1', {}, 'Storico'), h('div', { class: 'sub' }, 'Le bottiglie che hai bevuto'))),
    h('div', { class: 'empty' },
      h('div', { class: 'art', html: '<svg viewBox="0 0 24 24"><path d="M7 2h10c0 6-2 9-4 9.8V20h3a1 1 0 0 1 0 2H8a1 1 0 0 1 0-2h3v-8.2C9 11 7 8 7 2z"/></svg>' }),
      h('h3', {}, 'Ancora nessun brindisi'),
      h('p', {}, 'Quando stappi una bottiglia dalla sua scheda, la ritrovi qui con data, voto e note.')),
  ];

  const listEl = h('div');
  const fill = () => {
    const q = norm(S.histQuery);
    const list = q ? all.filter(x => norm([x.snapshot?.name, x.snapshot?.producer, x.snapshot?.vintage, x.dish, x.notes, x.occasion].join(' ')).includes(q)) : all;
    const groups = new Map();
    for (const x of list) {
      const k = dLocal(x.date).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(x);
    }
    listEl.replaceChildren(...[...groups].map(([k, xs]) => [h('div', { class: 'month' }, k), h('div', { class: 'list' }, xs.map(histRow))]).flat());
    if (!list.length) listEl.replaceChildren(h('div', { class: 'empty', style: 'padding:30px' }, h('p', {}, 'Nessun risultato.')));
  };
  fill();
  const search = h('input', { type: 'search', placeholder: 'Cerca nello storico…', value: S.histQuery });
  search.oninput = () => { S.histQuery = search.value; fill(); };

  // preferiti: più bevuti
  const counts = {};
  all.forEach(x => { const k = (x.snapshot?.name || '') + '|' + (x.snapshot?.producer || ''); counts[k] = (counts[k] || 0) + 1; });

  return [
    h('div', { class: 'hdr' }, h('div', {}, h('h1', {}, 'Storico'), h('div', { class: 'sub' }, 'Le bottiglie che hai bevuto'))),
    h('div', { class: 'stats' },
      h('div', { class: 'stat accent' }, h('div', { class: 'v' }, all.length), h('div', { class: 'l' }, 'in totale')),
      h('div', { class: 'stat' }, h('div', { class: 'v' }, thisYear), h('div', { class: 'l' }, `nel ${year}`)),
      h('div', { class: 'stat' }, h('div', { class: 'v' }, avg), h('div', { class: 'l' }, 'voto medio'))),
    h('div', { style: 'margin-top:16px' }, h('label', { class: 'search' }, icon('search'), search)),
    listEl,
  ];
}

// ============ Altro / impostazioni ============
const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
function installTip() {
  if (isStandalone()) return null;
  return h('div', { class: 'install-tip', style: 'margin-top:20px' },
    h('b', {}, '📲 Installa Cantina sull’iPhone: '),
    'apri questa pagina in Safari, tocca il pulsante Condividi ', h('b', {}, '⎋'), ' e scegli ', h('b', {}, '“Aggiungi alla schermata Home”'), '. Si aprirà a tutto schermo come un’app, anche offline.');
}

// ---------- Impostazioni Sommelier AI ----------
function pickDefaultModel(provider, list) {
  const ids = list.map(m => m.id);
  if (provider === 'gemini') {
    return ids.find(id => /^gemini-[\d.]+-flash$/.test(id)) || ids.find(id => /flash/.test(id) && !/lite|preview|exp/.test(id)) || ids.find(id => /flash/.test(id)) || ids[0];
  }
  return ids.find(id => /sonnet/.test(id)) || ids[0];
}

function aiSettingsSection() {
  const wrap = h('div');
  const draw = () => {
    const s = getAI();
    const seg = h('div', { class: 'seg', style: 'padding:12px 14px' },
      [['off', 'Spento'], ['gemini', 'Gemini'], ['claude', 'Claude']].map(([k, l]) =>
        h('button', { type: 'button', class: s.provider === k ? 'on' : '', onclick: () => {
          if (k !== 'off' && !s.keys[k]) toast(`Inserisci prima la chiave ${PROVIDERS[k].short}`);
          setAI({ provider: k }); draw();
        } }, l)));

    const providerGroup = p => {
      const P = PROVIDERS[p];
      const lists = s.lists || {};
      const list = lists[p] || [];
      const cur = s.models[p] || P.defaultModel;
      const opts = list.length ? list : [{ id: cur, label: cur }];
      if (!opts.some(o => o.id === cur)) opts.unshift({ id: cur, label: cur });
      const keyIn = h('input', { type: 'password', value: s.keys[p] || '', placeholder: P.keyHint, autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false' });
      const status = h('div', { class: 'hint', style: 'margin:0;padding:0 14px 12px' });
      const loadModels = async (quiet) => {
        const key = getAI().keys[p]; if (!key) return;
        status.textContent = 'Carico i modelli disponibili…';
        try {
          const l = await listModels(p, key);
          const st = getAI();
          setAI({ lists: { ...(st.lists || {}), [p]: l }, models: st.models[p] && l.some(m => m.id === st.models[p]) ? {} : { [p]: pickDefaultModel(p, l) || '' } });
          if (!quiet) toast(`${l.length} modelli trovati`);
          draw();
        } catch (e) { status.textContent = e.message; }
      };
      keyIn.onchange = async () => {
        const v = keyIn.value.trim();
        const st = getAI();
        setAI({ keys: { [p]: v }, ...(v && st.provider === 'off' ? { provider: p } : {}), ...(!v && st.provider === p ? { provider: 'off' } : {}) });
        if (v) { toast(`Chiave ${P.short} salvata`); await loadModels(true); } else draw();
      };
      const sel = h('select', {}, opts.map(m => h('option', { value: m.id, selected: m.id === cur }, m.label === m.id ? m.id : `${m.label}`)));
      sel.onchange = () => { setAI({ models: { [p]: sel.value } }); toast('Modello aggiornato'); };
      return h('div', { class: 'group', style: s.provider === p ? 'box-shadow:0 0 0 2px var(--wine)' : '' },
        h('div', { class: 'field' }, h('label', { style: 'font-weight:600;color:var(--ink)' }, P.label), s.provider === p ? h('span', { class: 'tag ok', style: 'margin-left:auto' }, 'In uso') : (s.keys[p] ? h('button', { class: 'btn sm ghost', style: 'margin-left:auto;height:30px', onclick: () => { setAI({ provider: p }); draw(); toast(`Ora usi ${P.short}`); } }, 'Usa questo') : null)),
        h('div', { class: 'field' }, h('label', {}, 'Chiave API'), keyIn),
        h('div', { class: 'field' }, h('label', {}, 'Modello'), sel),
        s.keys[p] ? h('div', { class: 'field', style: 'gap:8px;justify-content:flex-end' },
          h('button', { class: 'btn sm', type: 'button', onclick: () => loadModels(false) }, 'Aggiorna modelli'),
          h('button', { class: 'btn sm', type: 'button', onclick: async () => {
            status.textContent = 'Provo la connessione…';
            try { await testConnection(p); status.textContent = `✅ ${P.short} risponde correttamente.`; }
            catch (e) { status.textContent = '⚠️ ' + e.message; }
          } }, 'Prova')) : h('div', { class: 'hint', style: 'margin:0;padding:10px 14px 0' }, h('a', { href: P.keyUrl, target: '_blank', rel: 'noopener', style: 'color:var(--wine)' }, `Dove trovo la chiave ${P.short}? ›`)),
        status);
    };

    wrap.replaceChildren(
      h('div', { class: 'section-t' }, h('h2', {}, '✨ Sommelier AI')),
      h('div', { class: 'group' }, seg),
      h('div', { style: 'display:grid;gap:12px;margin-top:12px' }, providerGroup('gemini'), providerGroup('claude')),
      h('p', { class: 'hint' }, 'Puoi salvare entrambe le chiavi e passare da Gemini a Claude in qualunque momento. Le chiavi restano solo su questo telefono e non vengono incluse nei backup. Quando usi l’AI, il piatto, la foto dell’etichetta o l’elenco della cantina vengono inviati al fornitore scelto; il costo dipende dal tuo piano.'));
  };
  draw();
  return wrap;
}

function viewSettings() {
  const fileIn = h('input', { type: 'file', accept: 'application/json,.json', style: 'display:none' });
  fileIn.onchange = async () => {
    const file = fileIn.files[0]; if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      const replace = await confirmSheet({ title: 'Importa backup', text: `Il file contiene ${data.items?.length || 0} etichette e ${data.history?.length || 0} voci di storico. Vuoi sostituire i dati attuali? (Annulla = unisci)`, ok: 'Sostituisci' });
      const r = await importAll(data, { replace });
      await load(); toast(`Importate ${r.items} etichette`); render();
    } catch (e) { toast('File non valido'); }
    fileIn.value = '';
  };
  const row = (ic, color, title, ds, onclick) => h('button', { onclick },
    h('div', { class: 'ic', style: `background:${color}` }, icon(ic)),
    h('div', {}, h('div', {}, title), ds ? h('div', { class: 'ds' }, ds) : null),
    h('span', { class: 'chev' }, '›'));

  return [
    h('div', { class: 'hdr' }, h('div', {}, h('h1', {}, 'Altro'), h('div', { class: 'sub' }, `${totalBottles()} bottiglie · ${S.history.length} nello storico`))),
    installTip(),
    aiSettingsSection(),
    h('div', { class: 'section-t' }, h('h2', {}, 'I tuoi dati')),
    h('div', { class: 'menu' },
      row('download', '#3C8D5A', 'Esporta backup', 'Salva un file con cantina e storico', exportBackup),
      row('upload', '#2F6FD0', 'Importa backup', 'Ripristina da un file salvato', () => fileIn.click()),
      row('wand', '#C98A1B', 'Carica bottiglie di esempio', 'Per provare l’app', loadDemo),
      row('trash', '#D03A3A', 'Cancella tutto', 'Svuota cantina e storico', async () => {
        if (await confirmSheet({ title: 'Cancellare tutto?', text: 'Verranno eliminati cantina e storico da questo telefono. Ti consiglio di esportare un backup prima.', ok: 'Cancella tutto', danger: true })) {
          await db.clear('items'); await db.clear('history'); await load(); toast('Dati cancellati'); go('/');
        }
      })),
    fileIn,
    h('p', { class: 'hint' }, 'I dati restano solo su questo telefono (nessun account, nessun server). Esporta un backup ogni tanto e salvalo su iCloud Drive: ti servirà se cambi telefono o cancelli i dati di Safari.'),
    h('div', { class: 'section-t' }, h('h2', {}, 'Come funziona')),
    h('div', { class: 'notes', style: 'font-size:14px;line-height:1.5' },
      '• ', h('b', {}, 'Barcode: '), 'i dati e la foto arrivano da Open Food Facts, un database aperto. I vini meno diffusi potrebbero mancare: in quel caso completa a mano e cerca la foto con “Cerca su internet”.\n',
      '• ', h('b', {}, 'Abbinamenti: '), 'un motore di regole da sommelier (tipologia, vitigno, denominazione, stile di birra) che funziona anche offline.\n',
      '• ', h('b', {}, 'Finestra di consumo: '), 'stimata da annata e denominazione; puoi impostarla tu nella scheda.\n',
      '• ', h('b', {}, 'Sommelier AI (facoltativo): '), 'con una chiave Gemini o Claude ottieni abbinamenti spiegati anche per piatti complessi, la lettura dell’etichetta da foto e una chat sulla tua cantina.'),
    h('p', { class: 'hint', style: 'text-align:center;margin-top:24px' }, 'Cantina · v1.1'),
  ];
}

async function exportBackup() {
  const data = await exportAll();
  const name = `cantina-backup-${new Date().toISOString().slice(0, 10)}.json`;
  const blob = new Blob([JSON.stringify(data, null, 1)], { type: 'application/json' });
  const file = new File([blob], name, { type: 'application/json' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title: 'Backup Cantina' }); return; } catch (e) { if (e.name === 'AbortError') return; }
  }
  const a = h('a', { href: URL.createObjectURL(blob), download: name });
  document.body.append(a); a.click(); a.remove();
  toast('Backup scaricato');
}

async function loadDemo() {
  const y = new Date().getFullYear();
  const now = Date.now();
  const demo = [
    { name: 'Barolo Cannubi', producer: 'Cantina di Langa', type: 'rosso', vintage: '2016', denomination: 'Barolo DOCG', grapes: 'Nebbiolo', region: 'Piemonte', country: 'Italia', abv: '14,5', size: '0,75 L', qty: 3, price: 58, location: 'Scaffale A1', rating: 5 },
    { name: 'Chianti Classico I Sodi', producer: 'I Sodi', type: 'rosso', vintage: String(y - 4), denomination: 'Chianti Classico DOCG', grapes: 'Sangiovese', region: 'Toscana', country: 'Italia', abv: '13,5', size: '0,75 L', qty: 6, price: 16, location: 'Scaffale A2', image: 'https://images.openfoodfacts.org/images/products/803/121/900/1207/front_it.3.400.jpg', barcode: '8031219001207' },
    { name: 'Amarone della Valpolicella', producer: 'Tenuta Collina', type: 'rosso', vintage: '2015', denomination: 'Amarone della Valpolicella DOCG', grapes: 'Corvina, Corvinone, Rondinella', region: 'Veneto', country: 'Italia', abv: '16', size: '0,75 L', qty: 2, price: 45, location: 'Scaffale A3' },
    { name: 'Vermentino di Gallura', producer: 'Costa Smeralda', type: 'bianco', vintage: String(y - 1), denomination: 'Vermentino di Gallura DOCG', grapes: 'Vermentino', region: 'Sardegna', country: 'Italia', abv: '13', size: '0,75 L', qty: 4, price: 14, location: 'Frigo vini' },
    { name: 'Gewürztraminer', producer: 'Kellerei Alto Adige', type: 'bianco', vintage: String(y - 2), denomination: 'Alto Adige DOC', grapes: 'Gewürztraminer', region: 'Alto Adige', country: 'Italia', abv: '14', size: '0,75 L', qty: 2, price: 19 },
    { name: 'Franciacorta Brut', producer: 'Cascina Lago', type: 'bollicine', denomination: 'Franciacorta DOCG', grapes: 'Chardonnay, Pinot Nero', region: 'Lombardia', country: 'Italia', abv: '12,5', size: '0,75 L', qty: 3, price: 26, location: 'Frigo vini', rating: 4 },
    { name: 'Lambrusco di Sorbara', producer: 'Podere Emilia', type: 'rosso', vintage: String(y - 1), denomination: 'Lambrusco di Sorbara DOC', grapes: 'Lambrusco', region: 'Emilia-Romagna', country: 'Italia', abv: '11', size: '0,75 L', qty: 4, price: 9 },
    { name: 'Moscato d’Asti', producer: 'Bricco Dolce', type: 'dolce', vintage: String(y - 1), denomination: 'Moscato d’Asti DOCG', grapes: 'Moscato', region: 'Piemonte', country: 'Italia', abv: '5,5', size: '0,75 L', qty: 2, price: 12 },
    { name: 'Tripel Karmeliet', producer: 'Bosteels', type: 'birra', beerStyle: 'tripel', country: 'Belgio', abv: '8,4', size: '0,33 L', qty: 6, price: 3.5, rating: 4 },
    { name: 'Guinness Draught', producer: 'Guinness', type: 'birra', beerStyle: 'stout', country: 'Irlanda', abv: '4,2', size: '0,44 L', qty: 4, price: 2.5 },
    { name: 'West Coast IPA', producer: 'Birrificio del Porto', type: 'birra', beerStyle: 'ipa', country: 'Italia', abv: '6,5', size: '0,33 L', qty: 6, price: 4 },
  ];
  for (const [i, d] of demo.entries()) {
    await db.put('items', { id: uid(), createdAt: new Date(now - i * 60000).toISOString(), updatedAt: new Date().toISOString(), ...d });
  }
  const items = await db.all('items');
  const barolo = items.find(i => i.name === 'Barolo Cannubi');
  const fr = items.find(i => i.name === 'Franciacorta Brut');
  const mk = (it, daysAgo, rating, dish, notes, occasion) => ({ id: uid(), itemId: it.id, date: new Date(now - daysAgo * 864e5).toISOString().slice(0, 10), rating, dish, notes, occasion, snapshot: { name: it.name, producer: it.producer, vintage: it.vintage, type: it.type, image: it.image, denomination: it.denomination }, createdAt: new Date().toISOString() });
  await db.put('history', mk(barolo, 12, 5, 'Brasato con polenta', 'Rosa, catrame e liquirizia. Tannino setoso, finale lunghissimo.', 'Domenica in famiglia'));
  await db.put('history', mk(fr, 30, 4, 'Crudi di mare', 'Perlage fine, crosta di pane e agrumi.', 'Anniversario'));
  await load();
  toast('Bottiglie di esempio aggiunte');
  go('/'); render();
}

// ============ Avvio ============
(async () => {
  await load();
  render();
  requestPersistence();
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
