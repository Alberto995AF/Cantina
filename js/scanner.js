// Lettore barcode a tutto schermo.
// Motore principale: ZXing-C++ in WebAssembly (zxing-wasm), molto più robusto su iPhone
// di ZXing JavaScript; quest'ultimo resta come riserva se il WASM non si carica.
import { h, icon } from './ui.js';

const FORMATS = ['EAN13', 'EAN8', 'UPCA', 'UPCE', 'Code128', 'ITF'];
const valid = code => /^\d{8,14}$/.test(code);

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[data-src="${src}"]`)) return resolve();
    const s = document.createElement('script');
    s.src = src; s.dataset.src = src; s.onload = resolve; s.onerror = () => reject(new Error('load ' + src));
    document.head.append(s);
  });
}

// ---------- motore WASM ----------
let wasmReady = null;
function loadWasm() {
  if (!wasmReady) {
    wasmReady = (async () => {
      await loadScript('vendor/zxing-wasm-reader.js');
      const Z = window.ZXingWASM;
      const wasmURL = new URL('vendor/zxing_reader.wasm', location.href).href;
      await Z.prepareZXingModule({ overrides: { locateFile: (path, prefix) => path.endsWith('.wasm') ? wasmURL : prefix + path }, fireImmediately: true });
      return Z;
    })().catch(e => { wasmReady = null; throw e; });
  }
  return wasmReady;
}
async function wasmRead(Z, input, opts = {}) {
  const res = await Z.readBarcodes(input, { formats: FORMATS, tryHarder: true, tryRotate: true, tryInvert: false, maxNumberOfSymbols: 1, ...opts });
  const r = res.find(x => x.isValid !== false && valid(x.text));
  return r ? r.text : null;
}

// ---------- motore JS di riserva ----------
async function jsReader() {
  await loadScript('vendor/zxing.min.js');
  const Z = window.ZXing;
  const hints = new Map();
  hints.set(Z.DecodeHintType.POSSIBLE_FORMATS, [Z.BarcodeFormat.EAN_13, Z.BarcodeFormat.EAN_8, Z.BarcodeFormat.UPC_A, Z.BarcodeFormat.UPC_E, Z.BarcodeFormat.CODE_128, Z.BarcodeFormat.ITF]);
  hints.set(Z.DecodeHintType.TRY_HARDER, true);
  return new Z.BrowserMultiFormatReader(hints, 200);
}

// Decodifica una foto (file) — usata dal pulsante fotocamera e utile anche altrove
export async function decodeImageFile(file) {
  try {
    const Z = await loadWasm();
    const code = await wasmRead(Z, file);
    if (code) return code;
    // seconda prova: immagine ridotta (le foto da 12 MP a volte vanno meglio ridimensionate)
    const bmp = await createImageBitmap(file);
    const s = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas'); c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s);
    const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(bmp, 0, 0, c.width, c.height);
    return await wasmRead(Z, g.getImageData(0, 0, c.width, c.height), { tryDenoise: true });
  } catch {
    const url = URL.createObjectURL(file);
    try { const r = await (await jsReader()).decodeFromImageUrl(url); return valid(r.getText()) ? r.getText() : null; }
    catch { return null; }
    finally { URL.revokeObjectURL(url); }
  }
}

export function scanBarcode() {
  return new Promise(resolve => {
    let done = false, stream = null, jsr = null, timer = 0, hintT = 0, zoomed = false, torchOn = false;
    const video = h('video', { playsinline: '', muted: '', autoplay: '' });
    video.muted = true; video.setAttribute('playsinline', ''); video.setAttribute('webkit-playsinline', '');
    const msg = h('div', { class: 'msg' }, 'Inquadra il codice a barre nel riquadro');
    const tip = h('div', { class: 'tip' }, 'Tieni il telefono a 15–20 cm: troppo vicino l’iPhone non mette a fuoco.');
    const input = h('input', { type: 'text', inputmode: 'numeric', placeholder: 'Oppure digita il codice…', autocomplete: 'off' });
    const fileIn = h('input', { type: 'file', accept: 'image/*', capture: 'environment', style: 'display:none' });
    const tools = h('div', { class: 'tools' });
    const frame = h('div', { class: 'frame' }, h('div', { class: 'laser' }));

    const stop = () => {
      clearTimeout(timer); clearTimeout(hintT);
      try { jsr && jsr.reset(); } catch {}
      if (stream) stream.getTracks().forEach(t => t.stop());
      stream = null;
    };
    const finish = code => {
      if (done) return; done = true;
      stop();
      el.remove();
      document.getElementById('tabbar').classList.remove('hide');
      if (code && navigator.vibrate) navigator.vibrate(60);
      resolve(code || null);
    };

    const el = h('div', { class: 'scanner' },
      video, frame,
      h('div', { class: 'top' },
        h('button', { class: 'icon-btn stroke', 'aria-label': 'Chiudi', onclick: () => finish(null) }, icon('x')),
        h('div', { style: 'font-weight:600' }, 'Scansiona'),
        h('button', { class: 'icon-btn stroke', 'aria-label': 'Foto del codice', onclick: () => fileIn.click() }, icon('camera'))),
      msg,
      h('div', { class: 'bottom' },
        tools, tip,
        h('form', { class: 'manual', onsubmit: e => { e.preventDefault(); const v = input.value.replace(/\D/g, ''); if (valid(v)) finish(v); else msg.textContent = 'Codice non valido (8–14 cifre)'; } },
          input, h('button', { class: 'btn primary sm', type: 'submit' }, 'Cerca'))),
      fileIn);
    document.body.append(el);
    document.getElementById('tabbar').classList.add('hide');

    fileIn.onchange = async () => {
      const f = fileIn.files[0]; if (!f) return;
      msg.textContent = 'Analizzo la foto…';
      const code = await decodeImageFile(f);
      fileIn.value = '';
      if (code) finish(code);
      else msg.textContent = 'Nessun codice trovato nella foto. Riprova inquadrando solo il codice, ben illuminato.';
    };

    const constraints = { video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false };

    // pulsanti zoom/torcia se la fotocamera li supporta
    const setupTools = track => {
      let caps = {};
      try { caps = track.getCapabilities ? track.getCapabilities() : {}; } catch {}
      try { if ((caps.focusMode || []).includes('continuous')) track.applyConstraints({ advanced: [{ focusMode: 'continuous' }] }); } catch {}
      if (caps.zoom && caps.zoom.max >= 1.8) {
        const z = Math.min(2, caps.zoom.max);
        const b = h('button', { class: 'chip-btn', type: 'button', onclick: async () => {
          zoomed = !zoomed;
          try { await track.applyConstraints({ advanced: [{ zoom: zoomed ? z : (caps.zoom.min || 1) }] }); b.textContent = zoomed ? '1×' : '2×'; } catch {}
        } }, '2×');
        tools.append(b);
      }
      if (caps.torch) {
        const b = h('button', { class: 'chip-btn', type: 'button', onclick: async () => {
          torchOn = !torchOn;
          try { await track.applyConstraints({ advanced: [{ torch: torchOn }] }); b.classList.toggle('on', torchOn); } catch {}
        } }, '💡 Luce');
        tools.append(b);
      }
    };

    // ritaglia la zona del riquadro (alternando con l'intera immagine per i codici verticali)
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    let frameNo = 0;
    const grab = full => {
      const vw = video.videoWidth, vh = video.videoHeight;
      if (!vw || !vh) return null;
      // mappa il riquadro a schermo sulle coordinate del video (object-fit: cover)
      const vr = video.getBoundingClientRect();
      const scale = Math.max(vr.width / vw, vr.height / vh);
      const offX = (vw * scale - vr.width) / 2, offY = (vh * scale - vr.height) / 2;
      let sx, sy, sw, sh;
      if (full) {
        // ogni tanto l'intera inquadratura visibile, per codici verticali o fuori riquadro
        sx = offX / scale; sy = offY / scale; sw = vr.width / scale; sh = vr.height / scale;
      } else {
        const fr = frame.getBoundingClientRect();
        const padX = fr.width * 0.08, padY = fr.height * 0.35;
        sx = (fr.left - vr.left - padX + offX) / scale; sy = (fr.top - vr.top - padY + offY) / scale;
        sw = (fr.width + padX * 2) / scale; sh = (fr.height + padY * 2) / scale;
      }
      sx = Math.max(0, sx); sy = Math.max(0, sy); sw = Math.min(vw - sx, sw); sh = Math.min(vh - sy, sh);
      const maxW = 1280, k = Math.min(1, maxW / sw);
      canvas.width = Math.round(sw * k); canvas.height = Math.round(sh * k);
      ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      return ctx.getImageData(0, 0, canvas.width, canvas.height);
    };

    (async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        msg.textContent = 'Fotocamera non disponibile: digita il codice o usa una foto.';
        return;
      }
      let Z = null;
      try { Z = await loadWasm(); } catch { /* userà il motore JS */ }
      if (done) return;
      try {
        if (Z) {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
          if (done) return stop();
          video.srcObject = stream;
          await video.play().catch(() => {});
          const track = stream.getVideoTracks()[0];
          setupTools(track);
          const loop = async () => {
            if (done) return;
            try {
              // 2 fotogrammi sul riquadro, 1 sull'intera inquadratura (codici verticali o fuori riquadro)
              const img = grab(frameNo++ % 3 === 2);
              if (img) { const code = await wasmRead(Z, img); if (code) return finish(code); }
            } catch {}
            timer = setTimeout(loop, 60);
          };
          loop();
        } else {
          jsr = await jsReader();
          await jsr.decodeFromConstraints(constraints, video, res => { if (res && valid(res.getText())) finish(res.getText()); });
          stream = video.srcObject;
        }
        hintT = setTimeout(() => { if (!done) msg.textContent = 'Non riesco a leggerlo? Allontana un po’ il telefono, oppure tocca 📷 in alto e scatta una foto del codice.'; }, 9000);
      } catch (e) {
        msg.textContent = e && e.name === 'NotAllowedError'
          ? 'Accesso alla fotocamera negato. Abilitalo in Impostazioni › Safari › Fotocamera (o nelle impostazioni del sito), oppure digita il codice.'
          : 'Impossibile avviare la fotocamera: digita il codice o usa una foto.';
      }
    })();
  });
}
