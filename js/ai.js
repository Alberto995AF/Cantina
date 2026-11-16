// Sommelier AI facoltativo: Google Gemini o Anthropic Claude, intercambiabili.
// Le chiavi restano solo su questo dispositivo (localStorage) e NON finiscono nei backup.
// Le chiamate partono direttamente dal telefono verso il fornitore scelto.

const LS_KEY = 'cantina.ai';
export const PROVIDERS = {
  gemini: { label: 'Google Gemini', short: 'Gemini', keyHint: 'AIza…', keyUrl: 'https://aistudio.google.com/apikey', defaultModel: 'gemini-2.5-flash' },
  claude: { label: 'Anthropic Claude', short: 'Claude', keyHint: 'sk-ant-…', keyUrl: 'https://console.anthropic.com/settings/keys', defaultModel: 'claude-sonnet-5-5' },
};

const DEFAULTS = { provider: 'off', keys: { gemini: '', claude: '' }, models: { gemini: '', claude: '' } };

export function getAI() {
  try {
    const s = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
    return { ...DEFAULTS, ...s, keys: { ...DEFAULTS.keys, ...(s.keys || {}) }, models: { ...DEFAULTS.models, ...(s.models || {}) } };
  } catch { return structuredClone(DEFAULTS); }
}
export function setAI(patch) {
  const cur = getAI();
  const next = { ...cur, ...patch, keys: { ...cur.keys, ...(patch.keys || {}) }, models: { ...cur.models, ...(patch.models || {}) } };
  try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch {}
  return next;
}
export function aiReady() {
  const s = getAI();
  return s.provider !== 'off' && !!s.keys[s.provider];
}
export function aiLabel() {
  const s = getAI();
  return s.provider === 'off' ? '' : `${PROVIDERS[s.provider].short} · ${modelOf(s, s.provider)}`;
}
const modelOf = (s, p) => s.models[p] || PROVIDERS[p].defaultModel;

class AIError extends Error {}
function friendly(status, body, provider) {
  const msg = (body && (body.error?.message || body.message)) || '';
  if (status === 400 && /api key|API_KEY/i.test(msg)) return 'Chiave API non valida.';
  if (status === 401 || status === 403) return `Chiave ${PROVIDERS[provider].short} non valida o senza permessi.`;
  if (status === 404) return 'Modello non trovato: scegline un altro nelle impostazioni.';
  if (status === 429) return 'Limite di utilizzo raggiunto: riprova tra poco o controlla il credito.';
  if (status === 529 || status === 503) return 'Il servizio è sovraccarico, riprova tra qualche secondo.';
  return msg ? `Errore ${status}: ${msg}` : `Errore ${status}`;
}

async function call(url, opts, provider, ms = 60000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  let r;
  try { r = await fetch(url, { ...opts, signal: ctl.signal }); }
  catch (e) { throw new AIError(e.name === 'AbortError' ? 'Tempo scaduto: riprova.' : 'Connessione non riuscita: sei online?'); }
  finally { clearTimeout(t); }
  let body = null;
  try { body = await r.json(); } catch {}
  if (!r.ok) throw new AIError(friendly(r.status, body, provider));
  return body;
}

const splitDataURL = d => { const m = /^data:([^;]+);base64,(.*)$/.exec(d || ''); return m ? { mime: m[1], data: m[2] } : null; };

// ---------- elenco modelli ----------
export async function listModels(provider, key) {
  if (provider === 'gemini') {
    const b = await call('https://generativelanguage.googleapis.com/v1beta/models?pageSize=200', { headers: { 'x-goog-api-key': key } }, provider, 20000);
    return (b.models || [])
      .filter(m => (m.supportedGenerationMethods || []).includes('generateContent') && /gemini/.test(m.name) && !/embedding|tts|image|audio|live|aqa|robotics/i.test(m.name))
      .map(m => ({ id: m.name.replace(/^models\//, ''), label: m.displayName || m.name }))
      .sort((a, b) => b.id.localeCompare(a.id, undefined, { numeric: true }));
  }
  const b = await call('https://api.anthropic.com/v1/models?limit=100', { headers: claudeHeaders(key) }, provider, 20000);
  return (b.data || []).map(m => ({ id: m.id, label: m.display_name || m.id }));
}

function claudeHeaders(key) {
  return {
    'x-api-key': key,
    'anthropic-version': '2023-06-01',
    'anthropic-dangerous-direct-browser-access': 'true',
    'content-type': 'application/json',
  };
}

// ---------- generazione ----------
// messages: [{ role: 'user'|'assistant', text, images?: [dataURL] }]
export async function generate({ system, messages, json = false, maxTokens = 2000, provider: forced }) {
  const s = getAI();
  const provider = forced || s.provider;
  if (provider === 'off' || !s.keys[provider]) throw new AIError('Sommelier AI non configurato: vai in Altro › Sommelier AI.');
  const key = s.keys[provider];
  const model = modelOf(s, provider);

  if (provider === 'gemini') {
    const body = {
      systemInstruction: system ? { parts: [{ text: system }] } : undefined,
      contents: messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [
          ...(m.images || []).map(splitDataURL).filter(Boolean).map(i => ({ inline_data: { mime_type: i.mime, data: i.data } })),
          { text: m.text },
        ],
      })),
      generationConfig: { temperature: 0.6, maxOutputTokens: Math.max(maxTokens, 4096), ...(json ? { responseMimeType: 'application/json' } : {}) },
    };
    const b = await call(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      { method: 'POST', headers: { 'x-goog-api-key': key, 'content-type': 'application/json' }, body: JSON.stringify(body) }, provider);
    const cand = b.candidates && b.candidates[0];
    const text = cand && cand.content && (cand.content.parts || []).filter(p => !p.thought).map(p => p.text || '').join('');
    if (!text) throw new AIError(b.promptFeedback?.blockReason ? 'Richiesta bloccata dal filtro di Gemini.' : 'Risposta vuota, riprova.');
    return json ? parseJSON(text) : text;
  }

  const body = {
    model,
    max_tokens: maxTokens,
    system: system ? system + (json ? '\n\nRispondi SOLO con un oggetto JSON valido, senza testo prima o dopo e senza blocchi ```.' : '') : undefined,
    messages: messages.map(m => ({
      role: m.role,
      content: [
        ...(m.images || []).map(splitDataURL).filter(Boolean).map(i => ({ type: 'image', source: { type: 'base64', media_type: i.mime, data: i.data } })),
        { type: 'text', text: m.text },
      ],
    })),
  };
  const b = await call('https://api.anthropic.com/v1/messages', { method: 'POST', headers: claudeHeaders(key), body: JSON.stringify(body) }, provider);
  const text = (b.content || []).filter(c => c.type === 'text').map(c => c.text).join('');
  if (!text) throw new AIError('Risposta vuota, riprova.');
  return json ? parseJSON(text) : text;
}

export function parseJSON(text) {
  let t = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  try { return JSON.parse(t); } catch {}
  const a = t.indexOf('{'), b = t.lastIndexOf('}');
  if (a >= 0 && b > a) { try { return JSON.parse(t.slice(a, b + 1)); } catch {} }
  throw new AIError('Risposta non leggibile, riprova.');
}

export async function testConnection(provider) {
  const r = await generate({ provider, messages: [{ role: 'user', text: 'Rispondi solo con la parola: ok' }], maxTokens: 20 });
  return String(r).trim();
}

// ---------- prompt del sommelier ----------
const SYSTEM = `Sei un sommelier e beer sommelier italiano esperto, cordiale e concreto. Rispondi sempre in italiano.
Conosci vini italiani e internazionali, denominazioni, vitigni, birre artigianali e la cucina italiana.
Quando consigli bottiglie della cantina dell'utente usa SOLO quelle presenti nell'elenco fornito, citandole per id.`;

export function cellarContext(items, windowStatus) {
  const rows = items.filter(i => (+i.qty || 0) > 0).slice(0, 250).map(i => {
    const ws = windowStatus ? windowStatus(i) : null;
    return [i.id, i.name, i.producer, i.vintage, i.type, i.type === 'birra' ? (i.beerStyle || i.beerStyleText) : i.denomination, i.grapes, `${i.qty} bott.`, ws ? ws.label : '', i.rating ? `voto ${i.rating}/5` : '']
      .map(v => (v ?? '').toString().replace(/\|/g, '/')).join(' | ');
  });
  return rows.length ? 'Cantina dell\'utente (id | nome | produttore | annata | tipologia | denominazione o stile | vitigni | quantità | stato | voto):\n' + rows.join('\n') : 'La cantina dell\'utente è vuota.';
}

export async function aiPairDish(dish, items, windowStatus) {
  return generate({
    system: SYSTEM, json: true, maxTokens: 1800,
    messages: [{ role: 'user', text: `${cellarContext(items, windowStatus)}

Piatto: "${dish}"

Rispondi con JSON:
{"ideale": "stile di vino/birra ideale in una riga",
 "spiegazione": "2-3 frasi sul perché",
 "scelte": [{"id": "id della bottiglia in cantina", "percentuale": 0-100, "motivo": "1-2 frasi specifiche"}],
 "da_comprare": ["1-3 bottiglie o stili da acquistare se in cantina manca qualcosa di adatto"]}
Metti in "scelte" al massimo 5 bottiglie davvero adatte, ordinate dalla migliore; lista vuota se nessuna va bene.` }],
  });
}

export async function aiPairWine(it) {
  const desc = [it.name, it.producer, it.vintage, it.type, it.denomination, it.grapes, it.region, it.country, it.beerStyle, it.abv ? it.abv + '%' : ''].filter(Boolean).join(', ');
  return generate({
    system: SYSTEM, json: true, maxTokens: 1800,
    messages: [{ role: 'user', text: `Bottiglia: ${desc}

Rispondi con JSON:
{"profilo": "descrizione sensoriale attesa in 2 frasi",
 "servizio": "temperatura, bicchiere, eventuale decantazione",
 "piatti": [{"emoji": "un emoji", "nome": "piatto preciso", "perche": "1 frase"}],
 "da_evitare": "cosa non abbinare, 1 frase"}
Proponi 6 piatti, privilegiando la cucina italiana e gli abbinamenti del territorio.` }],
  });
}

export const BEER_IDS = 'lager, pils, kolsch, weiss, blanche, ipa, apa, amber, bitter, bock, marzen, saison, tripel, dubbel, quad, stout, porter, imperial, barleywine, sour, lambic, rauch, iga';

export async function aiReadLabel(dataURL) {
  return generate({
    system: SYSTEM, json: true, maxTokens: 1200,
    messages: [{ role: 'user', images: [dataURL], text: `Leggi l'etichetta di questa bottiglia (vino o birra) e restituisci JSON con i campi che riesci a determinare (stringa vuota se non sai):
{"name": "nome commerciale del vino/birra", "producer": "", "vintage": "anno a 4 cifre", "type": "rosso|bianco|rosato|bollicine|dolce|fortificato|birra|altro",
 "denomination": "es. Chianti Classico DOCG", "grapes": "vitigni separati da virgola", "region": "", "country": "", "abv": "solo numero", "size": "es. 0,75 L",
 "beerStyle": "solo per birre, uno tra: ${BEER_IDS}", "drinkFrom": "anno consigliato di inizio consumo", "drinkTo": "anno entro cui berlo", "notes": "1-2 frasi utili sul vino (stile, affinamento)"}
Puoi dedurre vitigni, regione e finestra di consumo dalla denominazione se non sono scritti.` }],
  });
}

export async function aiChat(history, items, windowStatus) {
  const sys = `${SYSTEM}\nRisposte brevi e pratiche (massimo ~150 parole), con elenchi puntati quando utile. Quando citi una bottiglia della cantina scrivi il suo nome, non l'id.\n\n${cellarContext(items, windowStatus)}`;
  return generate({ system: sys, messages: history, maxTokens: 1200 });
}

// ---------- Foto da catalogo (scontorno) con Gemini ----------
// Usa sempre la chiave Gemini, anche se per i testi è selezionato Claude (Claude non genera immagini).
export const DEFAULT_IMAGE_MODEL = 'gemini-2.5-flash-image';
export function aiImageReady() { return !!getAI().keys.gemini; }
export function imageModel() {
  const s = getAI();
  return s.models.geminiImage || DEFAULT_IMAGE_MODEL;
}
export async function listImageModels(key) {
  const b = await call('https://generativelanguage.googleapis.com/v1beta/models?pageSize=200', { headers: { 'x-goog-api-key': key } }, 'gemini', 20000);
  return (b.models || [])
    .filter(m => (m.supportedGenerationMethods || []).includes('generateContent') && /gemini.*image/i.test(m.name))
    .map(m => ({ id: m.name.replace(/^models\//, ''), label: m.displayName || m.name }))
    .sort((a, b) => b.id.localeCompare(a.id, undefined, { numeric: true }));
}

async function toDataURL(src) {
  if (src.startsWith('data:')) return src;
  let r;
  try { r = await fetch(src, { mode: 'cors' }); } catch { throw new AIError('Non posso scaricare questa immagine: scatta o scegli una foto dal telefono e riprova.'); }
  if (!r.ok) throw new AIError('Immagine non raggiungibile: scatta o scegli una foto e riprova.');
  const blob = await r.blob();
  return new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = rej; fr.readAsDataURL(blob); });
}

// Ricomprime il risultato (PNG grande) in JPEG leggero con sfondo bianco
function compress(dataURL, max = 1000) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height);
      resolve(c.toDataURL('image/jpeg', 0.86));
    };
    img.onerror = () => reject(new AIError('Immagine generata non valida, riprova.'));
    img.src = dataURL;
  });
}

const CUTOUT_PROMPT = `Trasforma questa foto in una foto prodotto da catalogo e-commerce di vini (stile Vivino/Tannico).
- Mostra SOLO la bottiglia (o lattina) principale, intera, dritta in verticale e centrata, con l'etichetta frontale rivolta verso l'osservatore.
- Sfondo bianco puro e uniforme (#FFFFFF), nessun altro oggetto, nessuna mano, nessun riflesso dell'ambiente.
- Una leggera ombra morbida sotto la base.
- Mantieni fedeli forma, colore del vetro, capsula ed etichetta: non inventare né modificare testi, loghi o grafica dell'etichetta.
- Inquadratura verticale 3:4 con un piccolo margine bianco attorno alla bottiglia. Fotorealistico.`;

export async function aiCutout(src) {
  const s = getAI();
  const key = s.keys.gemini;
  if (!key) throw new AIError('Serve una chiave Gemini: aggiungila in Altro › Sommelier AI.');
  const input = splitDataURL(await toDataURL(src));
  if (!input) throw new AIError('Formato immagine non supportato.');
  const model = imageModel();
  const body = cfg => JSON.stringify({
    contents: [{ role: 'user', parts: [{ inline_data: { mime_type: input.mime, data: input.data } }, { text: CUTOUT_PROMPT }] }],
    generationConfig: { responseModalities: ['TEXT', 'IMAGE'], ...cfg },
  });
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const headers = { 'x-goog-api-key': key, 'content-type': 'application/json' };
  let b;
  try { b = await call(url, { method: 'POST', headers, body: body({ imageConfig: { aspectRatio: '3:4' } }) }, 'gemini', 90000); }
  catch (e) {
    // alcuni modelli non accettano imageConfig: riprova senza
    if (!/Errore 400/.test(e.message)) throw e;
    b = await call(url, { method: 'POST', headers, body: body({}) }, 'gemini', 90000);
  }
  const parts = (b.candidates && b.candidates[0] && b.candidates[0].content && b.candidates[0].content.parts) || [];
  const img = parts.map(p => p.inlineData || p.inline_data).find(Boolean);
  if (!img) {
    const txt = parts.map(p => p.text || '').join(' ').trim();
    throw new AIError(b.promptFeedback?.blockReason ? 'Richiesta bloccata dal filtro di Gemini.' : (txt ? `Gemini non ha restituito un'immagine: ${txt.slice(0, 140)}` : `Il modello ${model} non ha restituito un'immagine: scegli un modello immagini nelle impostazioni.`));
  }
  return compress(`data:${img.mimeType || img.mime_type || 'image/png'};base64,${img.data}`);
}
