// Piccole utility DOM e componenti condivisi.
import { TYPES } from './kb.js';

export function h(tag, attrs = {}, ...kids) {
  const el = document.createElementNS(tag === 'svg' || tag === 'path' || tag === 'circle' ? 'http://www.w3.org/2000/svg' : 'http://www.w3.org/1999/xhtml', tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'class') el.setAttribute('class', v);
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'value' && 'value' in el) el.value = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat(Infinity)) {
    if (kid == null || kid === false) continue;
    el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  }
  return el;
}

const ICONS = {
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  barcode: '<path d="M4 6v12M7 6v12M10 6v12M14 6v12M16 6v12M20 6v12M3 4h3M18 4h3M3 20h3M18 20h3"/>',
  pen: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M14 6l4 4"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  glass: '<path d="M8 3h8c0 5-1.5 8-4 8s-4-3-4-8zM12 11v9M8 21h8"/>',
  download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  upload: '<path d="M12 20V9M7 13l5-5 5 5M5 4h14"/>',
  share: '<path d="M12 3v12M7 8l5-5 5 5M5 13v7h14v-7"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  wand: '<path d="M4 20L15 9M14 4v2M19 9h2M18 5l-1.5 1.5M11 5l1 1M18 12l1 1"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  home: '<path d="M4 11l8-7 8 7v9H4z"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M4 16V4h12"/>',
};
export function icon(name) {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('viewBox', '0 0 24 24');
  s.innerHTML = ICONS[name] || '';
  return s;
}

// Glifi per i segnaposto (bottiglia/boccale)
const BOTTLE = '<path d="M10 2h4v4c0 1 2 2.5 2 5.5V21a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-9.5C8 8.5 10 7 10 6z"/>';
const MUG = '<path d="M5 6h10v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2zM15 9h2a3 3 0 0 1 0 6h-2v-2h2a1 1 0 0 0 0-2h-2zM5 4.5C5 3 6.5 2 8 2.5 9 1.5 11 1.5 12 2.5c1.5-.5 3 .5 3 2V6H5z"/>';
const GLASS = '<path d="M7 2h10c0 6-2 9-4 9.8V20h3a1 1 0 0 1 0 2H8a1 1 0 0 1 0-2h3v-8.2C9 11 7 8 7 2z"/>';

export function thumb(it, cls = '') {
  const t = (it && it.type) || 'altro';
  const ph = h('div', { class: `ph t-${t} ${cls}` });
  const glyph = () => { const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('class', 'glyph'); s.innerHTML = t === 'birra' ? MUG : t === 'altro' ? GLASS : BOTTLE; return s; };
  if (it && it.image) {
    ph.classList.add('contain');
    ph.classList.remove(`t-${t}`);
    const img = h('img', { src: it.image, alt: '', loading: 'lazy', referrerpolicy: 'no-referrer' });
    img.onerror = () => { img.remove(); ph.classList.remove('contain'); ph.classList.add(`t-${t}`); ph.append(glyph()); };
    ph.append(img);
  } else ph.append(glyph());
  return ph;
}

export function typeTag(type) {
  const t = TYPES[type] || TYPES.altro;
  return h('span', { class: 'tag' }, h('span', { class: 'dot', style: `background:${t.color}` }), t.label);
}

const STAR = '<path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z"/>';
export function stars(value = 0, onChange) {
  const wrap = h('div', { class: 'stars' + (onChange ? '' : ' ro') });
  const draw = v => {
    wrap.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
      const b = h(onChange ? 'button' : 'span', { type: 'button', class: i <= v ? 'on' : '', 'aria-label': `${i} stelle` });
      b.innerHTML = `<svg viewBox="0 0 24 24">${STAR}</svg>`;
      if (onChange) b.onclick = () => { const nv = v === i ? 0 : i; onChange(nv); draw(nv); };
      wrap.append(b);
    }
  };
  draw(+value || 0);
  return wrap;
}

let toastT;
export function toast(text) {
  const el = document.getElementById('toast');
  el.textContent = text;
  el.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(() => el.classList.remove('show'), 2400);
}

export function sheet(build, onClose) {
  const root = document.getElementById('sheet-root');
  const back = h('div', { class: 'backdrop' });
  const box = h('div', { class: 'sheet', role: 'dialog' }, h('div', { class: 'grab' }));
  let closed = false;
  const close = () => { if (closed) return; closed = true; back.remove(); box.remove(); document.body.style.overflow = ''; onClose && onClose(); };
  back.onclick = close;
  // trascina verso il basso per chiudere
  let y0 = null;
  box.addEventListener('touchstart', e => { if (box.scrollTop <= 0) y0 = e.touches[0].clientY; }, { passive: true });
  box.addEventListener('touchmove', e => { if (y0 == null) return; const dy = e.touches[0].clientY - y0; if (dy > 0) box.style.transform = `translateY(${dy}px)`; }, { passive: true });
  box.addEventListener('touchend', e => { if (y0 == null) return; const dy = e.changedTouches[0].clientY - y0; y0 = null; if (dy > 110) close(); else box.style.transform = ''; });
  build(box, close);
  root.append(back, box);
  document.body.style.overflow = 'hidden';
  return close;
}

export function confirmSheet({ title, text, ok = 'Conferma', danger = false }) {
  return new Promise(resolve => {
    let res = false;
    sheet((box, close) => {
      box.append(
        h('h3', {}, title),
        text ? h('div', { class: 'sub' }, text) : null,
        h('div', { class: 'btn-row', style: 'margin-top:8px' },
          h('button', { class: 'btn', onclick: () => close() }, 'Annulla'),
          h('button', { class: 'btn primary', style: danger ? 'background:#D03A3A;box-shadow:none' : '', onclick: () => { res = true; close(); } }, ok)));
    }, () => resolve(res));
  });
}

export const dLocal = s => new Date(s && s.length === 10 ? s + 'T12:00' : s);
export const fmtDate = (iso, opts = { day: 'numeric', month: 'short', year: 'numeric' }) => {
  try { return dLocal(iso).toLocaleDateString('it-IT', opts); } catch { return iso; }
};
export const money = v => (v === '' || v == null || isNaN(+v)) ? '' : (+v).toLocaleString('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: (+v) % 1 ? 2 : 0 });
export const parseNum = v => { if (v === '' || v == null) return ''; const n = parseFloat(String(v).replace(',', '.')); return isNaN(n) ? '' : n; };
