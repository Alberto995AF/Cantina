// Motore di abbinamento cibo ↔ vino/birra (regole, completamente offline).
import { DISHES, STYLES, norm, styleOf, findDenom, beerStyleById, findBeerStyle, windowStatus } from './kb.js';

// Trova le categorie di piatto citate nel testo; scarta le corrispondenze "contenute" in una più lunga
export function matchDishes(text) {
  const t = ' ' + norm(text) + ' ';
  const hits = [];
  for (const cat of DISHES) {
    for (const kw of cat.k) {
      const k = norm(kw);
      let i = t.indexOf(' ' + k);
      while (i !== -1) {
        hits.push({ cat, kw: k, start: i + 1, end: i + 1 + k.length });
        i = t.indexOf(' ' + k, i + 1);
      }
    }
  }
  const kept = hits.filter(h => !hits.some(o => o !== h && o.cat !== h.cat && o.start <= h.start && o.end >= h.end && (o.end - o.start) > (h.end - h.start)));
  const byCat = new Map();
  for (const h of kept) {
    const prev = byCat.get(h.cat.id);
    if (!prev || h.kw.length > prev.kw.length) byCat.set(h.cat.id, h);
  }
  return [...byCat.values()].sort((a, b) => b.kw.length - a.kw.length);
}

// Profilo ideale: peso per stile combinando le categorie trovate
export function profileFor(matches) {
  const acc = {};
  for (const { cat } of matches) for (const [s, w] of Object.entries(cat.w)) (acc[s] ||= []).push(w);
  const prof = {};
  for (const [s, ws] of Object.entries(acc)) {
    const max = Math.max(...ws), sum = ws.reduce((a, b) => a + b, 0);
    // penalizza gli stili che non funzionano per uno degli ingredienti
    const missing = matches.length - ws.length;
    prof[s] = max + 0.3 * (sum - max) - 0.8 * missing;
  }
  return prof;
}

function classicsOf(it) {
  if (it.type === 'birra') {
    const b = beerStyleById(it.beerStyle) || findBeerStyle(it.name);
    return b ? b.d : [];
  }
  const d = findDenom([it.name, it.denomination].join(' '));
  return d ? d.d : [];
}

export function suggestForDish(text, items) {
  const matches = matchDishes(text);
  if (!matches.length) return { matches, ideal: [], wines: [] };
  const prof = profileFor(matches);
  const ideal = Object.entries(prof).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([s, v]) => ({ style: s, score: v, ...STYLES[s] }));
  const STOP = new Set(['alla', 'alle', 'allo', 'agli', 'della', 'delle', 'dello', 'degli', 'dalla', 'nella', 'nelle', 'sulla', 'con', 'senza', 'piatto', 'pasta', 'salsa', 'sugo', 'crema', 'cotto', 'cotta', 'fatto', 'fatta', 'misto', 'mista']);
  const words = norm(text).split(' ').filter(w => w.length > 3 && !STOP.has(w));
  const wines = items.filter(it => (+it.qty || 0) > 0).map(it => {
    const s = styleOf(it);
    let score = (prof[s] || 0) * 10;
    const reasons = [];
    const classic = classicsOf(it).find(c => { const n = norm(c); return words.some(w => n.includes(w)) || matches.some(m => n.includes(m.kw)); });
    if (classic) { score += 8; reasons.push(`Abbinamento classico: ${classic}`); }
    if (score <= 0) return null;
    const ws = windowStatus(it);
    if (ws) score += { now: 2, 'now-last': 4, late: -1, early: -4 }[ws.k] || 0;
    score += (+it.rating || 0) * 0.4;
    const best = matches.filter(m => (m.cat.w[s] || 0) >= 2).sort((a, b) => b.cat.w[s] - a.cat.w[s])[0];
    if (best) reasons.push(best.cat.why);
    else if (s && STYLES[s]) reasons.push(`${STYLES[s].label}: accostamento possibile.`);
    if (ws && ws.k === 'now-last') reasons.push('È il momento giusto per stapparlo.');
    if (ws && ws.k === 'early') reasons.push('Sarebbe meglio attendere ancora qualche anno.');
    return { it, style: s, score, reasons };
  }).filter(Boolean).sort((a, b) => b.score - a.score);
  wines.forEach(w => { w.match = Math.max(20, Math.min(99, Math.round(w.score / 38 * 100))); });
  return { matches, ideal, wines: wines.filter(w => w.match >= 30).slice(0, 12) };
}

// Piatti consigliati per una bottiglia
export function dishesForItem(it) {
  const s = styleOf(it);
  const out = [];
  for (const c of classicsOf(it).slice(0, 3)) out.push({ em: '⭐️', nm: c, why: 'Abbinamento classico del territorio' });
  const cats = DISHES.filter(d => (d.w[s] || 0) >= 2).sort((a, b) => (b.w[s] || 0) - (a.w[s] || 0));
  for (const c of cats) {
    if (out.length >= 8) break;
    out.push({ em: c.em, nm: c.label, why: c.why, best: c.w[s] === 3 });
  }
  return { style: s, info: STYLES[s], dishes: out };
}

export const QUICK_DISHES = ['Bistecca alla fiorentina', 'Sushi', 'Pizza margherita', 'Lasagne', 'Risotto ai funghi', 'Frittura di pesce', 'Spaghetti alle vongole', 'Curry piccante', 'Formaggi stagionati', 'Gorgonzola', 'Brasato', 'Tiramisù', 'Hamburger', 'Pollo arrosto', 'Cioccolato fondente'];
