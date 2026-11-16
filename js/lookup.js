// Ricerca online: dati prodotto da barcode e immagini delle etichette.
// Fonti gratuite e senza chiavi: Open Food Facts, Wikimedia Commons, Wikipedia.
import { infer, findBeerStyle, norm } from './kb.js';

const OFF = 'https://world.openfoodfacts.org';
const FIELDS = 'product_name,product_name_it,generic_name,generic_name_it,brands,image_front_url,image_url,categories_tags,quantity,nutriments,countries_tags,labels_tags,origins';

async function getJSON(url, ms = 12000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctl.signal });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return await r.json();
  } finally { clearTimeout(t); }
}

const COUNTRY = { italy: 'Italia', france: 'Francia', spain: 'Spagna', germany: 'Germania', portugal: 'Portogallo', belgium: 'Belgio', austria: 'Austria', 'united-states': 'USA', 'united-kingdom': 'Regno Unito', ireland: 'Irlanda', netherlands: 'Paesi Bassi', 'czech-republic': 'Rep. Ceca', chile: 'Cile', argentina: 'Argentina', australia: 'Australia', 'new-zealand': 'Nuova Zelanda', 'south-africa': 'Sudafrica', mexico: 'Messico', denmark: 'Danimarca', hungary: 'Ungheria', greece: 'Grecia', slovenia: 'Slovenia', croatia: 'Croazia' };

function typeFromCategories(tags = []) {
  const s = tags.join(' ').toLowerCase();
  if (/\bbeers?\b|bieres?|birr[ae]|-ales?\b|lagers?|stouts?|\bipa\b|pilsner/.test(s)) return 'birra';
  if (/sparkling|champagne|prosecco|spumant|\bcava\b|cremant|effervescent|franciacorta|frizzant/.test(s)) return 'bollicine';
  if (/ros[eé]-wines?|vins?-ros[eé]s?|vin[io]-rosat[io]|rosati/.test(s)) return 'rosato';
  if (/fortified|port-wines?|\bportos?\b|sherr|marsala|madeira/.test(s)) return 'fortificato';
  if (/dessert-wines?|sweet-wines?|passit|vins?-doux|moscato|vin-santo/.test(s)) return 'dolce';
  if (/white-wines?|vins?-blancs?|vin[io]-bianc[oh]i?|weisswein/.test(s)) return 'bianco';
  if (/red-wines?|vins?-rouges?|vin[io]-ross[io]|rotwein/.test(s)) return 'rosso';
  return null;
}
const isWineish = (tags = []) => /wines?|vins?\b|vin[io]|weine?/.test(tags.join(' '));

function parseVolume(q) {
  if (!q) return '';
  const m = q.replace(',', '.').match(/([\d.]+)\s*(cl|ml|l)\b/i);
  if (!m) return q;
  let v = parseFloat(m[1]); const u = m[2].toLowerCase();
  if (u === 'cl') v = v / 100; if (u === 'ml') v = v / 1000;
  return (Math.round(v * 1000) / 1000).toString().replace('.', ',') + ' L';
}

export async function lookupBarcode(code) {
  const data = await getJSON(`${OFF}/api/v2/product/${encodeURIComponent(code)}.json?fields=${FIELDS}`);
  if (!data || data.status !== 1 || !data.product) return null;
  const p = data.product;
  const name = (p.product_name_it || p.product_name || p.generic_name_it || p.generic_name || '').trim();
  const brand = (p.brands || '').split(',')[0].trim();
  const out = {
    barcode: code,
    name,
    producer: brand,
    image: p.image_front_url || p.image_url || '',
    size: parseVolume(p.quantity),
    source: 'Open Food Facts',
    generic: (p.generic_name_it || p.generic_name || '').trim(),
  };
  const alc = p.nutriments && (p.nutriments.alcohol_100g ?? p.nutriments.alcohol ?? p.nutriments.alcohol_value);
  if (alc) out.abv = String(Math.round(alc * 10) / 10).replace('.', ',');
  const ctry = (p.countries_tags || []).map(c => c.replace(/^en:/, '')).find(c => COUNTRY[c]);
  if (ctry) out.country = COUNTRY[ctry];
  const yr = (name + ' ' + (p.generic_name || '')).match(/\b(19[5-9]\d|20[0-4]\d)\b/);
  if (yr) out.vintage = yr[1];
  const inf = infer({ name, producer: brand, denomination: p.generic_name_it || p.generic_name || '' });
  out.type = typeFromCategories(p.categories_tags) || inf.type || null;
  out.typeSource = out.type ? 'barcode' : null;
  out.isWine = isWineish(p.categories_tags) || !!inf.type;
  if (inf.grapes) out.grapes = inf.grapes;
  if (inf.region) out.region = inf.region;
  if (inf.country && !out.country) out.country = inf.country;
  if (inf.denom) out.denomination = guessDenomLabel(name, inf.denom);
  if (out.type === 'birra') {
    const b = findBeerStyle([name, (p.categories_tags || []).join(' ').replace(/-/g, ' ')].join(' '));
    if (b) out.beerStyle = b.id;
  }
  return out;
}

function guessDenomLabel(name, d) {
  // Prova a ricostruire "Chianti Classico DOCG" dal nome prodotto
  const n = norm(name);
  const k = d.k.find(k => n.includes(norm(k)));
  if (!k) return '';
  return k.replace(/\b\w/g, c => c.toUpperCase());
}

// ---------- immagini ----------
export async function searchImages(query, { beer = false } = {}) {
  const q = query.trim();
  if (!q) return [];
  const tasks = [
    getJSON(`${OFF}/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&json=1&page_size=18&fields=product_name,brands,image_front_url,code`)
      .then(d => (d.products || []).filter(p => p.image_front_url).map(p => ({ url: p.image_front_url, title: [p.product_name, p.brands].filter(Boolean).join(' · '), src: 'Open Food Facts' })))
      .catch(() => []),
    getJSON(`https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(q + (beer ? ' beer' : ' wine'))}&gsrnamespace=6&gsrlimit=12&prop=imageinfo&iiprop=url|mime&iiurlwidth=500&format=json&origin=*`)
      .then(d => Object.values((d.query && d.query.pages) || {}).sort((a, b) => a.index - b.index)
        .filter(p => p.imageinfo && /jpe?g|png|webp/.test(p.imageinfo[0].mime || ''))
        .map(p => ({ url: p.imageinfo[0].thumburl, title: p.title.replace(/^File:/, ''), src: 'Wikimedia' })))
      .catch(() => []),
    getJSON(`https://it.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrlimit=5&prop=pageimages&piprop=thumbnail&pithumbsize=500&format=json&origin=*`)
      .then(d => Object.values((d.query && d.query.pages) || {}).filter(p => p.thumbnail).map(p => ({ url: p.thumbnail.source, title: p.title, src: 'Wikipedia' })))
      .catch(() => []),
  ];
  const res = (await Promise.all(tasks)).flat();
  const seen = new Set();
  return res.filter(r => r.url && !seen.has(r.url) && seen.add(r.url)).slice(0, 30);
}

// Foto dalla fotocamera / libreria → JPEG ridimensionato in data URL
export function fileToDataURL(file, max = 900) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = e => { URL.revokeObjectURL(url); reject(e); };
    img.src = url;
  });
}
