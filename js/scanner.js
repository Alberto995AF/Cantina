// Lettore barcode a tutto schermo. Usa BarcodeDetector nativo se presente, altrimenti ZXing (iPhone).
import { h, icon } from './ui.js';

function zxingReader() {
  const Z = window.ZXing;
  if (!Z) return null;
  const hints = new Map();
  hints.set(Z.DecodeHintType.POSSIBLE_FORMATS, [Z.BarcodeFormat.EAN_13, Z.BarcodeFormat.EAN_8, Z.BarcodeFormat.UPC_A, Z.BarcodeFormat.UPC_E, Z.BarcodeFormat.CODE_128, Z.BarcodeFormat.ITF]);
  hints.set(Z.DecodeHintType.TRY_HARDER, true);
  return new Z.BrowserMultiFormatReader(hints, 250);
}

const valid = code => /^\d{8,14}$/.test(code);

export function scanBarcode() {
  return new Promise(resolve => {
    let done = false, stream = null, reader = null, raf = 0;
    const video = h('video', { playsinline: '', muted: '', autoplay: '' });
    video.muted = true; video.setAttribute('playsinline', '');
    const msg = h('div', { class: 'msg' }, 'Inquadra il codice a barre della bottiglia');
    const input = h('input', { type: 'text', inputmode: 'numeric', placeholder: 'Oppure digita il codice…', autocomplete: 'off' });
    const fileIn = h('input', { type: 'file', accept: 'image/*', capture: 'environment', style: 'display:none' });

    const finish = code => {
      if (done) return; done = true;
      cancelAnimationFrame(raf);
      try { reader && reader.reset(); } catch {}
      if (stream) stream.getTracks().forEach(t => t.stop());
      if (video.srcObject) { try { video.srcObject.getTracks().forEach(t => t.stop()); } catch {} }
      el.remove();
      document.getElementById('tabbar').classList.remove('hide');
      if (code && navigator.vibrate) navigator.vibrate(60);
      resolve(code || null);
    };

    const el = h('div', { class: 'scanner' },
      video,
      h('div', { class: 'frame' }, h('div', { class: 'laser' })),
      h('div', { class: 'top' },
        h('button', { class: 'icon-btn stroke', 'aria-label': 'Chiudi', onclick: () => finish(null) }, icon('x')),
        h('div', { style: 'font-weight:600' }, 'Scansiona'),
        h('button', { class: 'icon-btn stroke', 'aria-label': 'Foto del codice', onclick: () => fileIn.click() }, icon('camera'))),
      msg,
      h('div', { class: 'bottom' },
        h('form', { class: 'manual', onsubmit: e => { e.preventDefault(); const v = input.value.replace(/\D/g, ''); if (valid(v)) finish(v); else msg.textContent = 'Codice non valido (8–14 cifre)'; } },
          input, h('button', { class: 'btn primary sm', type: 'submit' }, 'Cerca'))),
      fileIn);
    document.body.append(el);
    document.getElementById('tabbar').classList.add('hide');

    fileIn.onchange = async () => {
      const f = fileIn.files[0]; if (!f) return;
      msg.textContent = 'Analizzo la foto…';
      const url = URL.createObjectURL(f);
      try {
        const r = zxingReader();
        const res = await r.decodeFromImageUrl(url);
        finish(res.getText());
      } catch { msg.textContent = 'Nessun codice trovato nella foto. Riprova più da vicino.'; }
      finally { URL.revokeObjectURL(url); }
    };

    const constraints = { video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false };

    (async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        msg.textContent = 'Fotocamera non disponibile: digita il codice o usa una foto.';
        return;
      }
      try {
        if ('BarcodeDetector' in window) {
          const formats = await window.BarcodeDetector.getSupportedFormats();
          if (formats.includes('ean_13')) {
            const det = new window.BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'].filter(f => formats.includes(f)) });
            stream = await navigator.mediaDevices.getUserMedia(constraints);
            video.srcObject = stream; await video.play();
            const loop = async () => {
              if (done) return;
              try { const r = await det.detect(video); const c = r.find(x => valid(x.rawValue)); if (c) return finish(c.rawValue); } catch {}
              raf = requestAnimationFrame(loop);
            };
            loop();
            return;
          }
        }
        reader = zxingReader();
        if (!reader) throw new Error('lettore non caricato');
        await reader.decodeFromConstraints(constraints, video, (res) => {
          if (res && valid(res.getText())) finish(res.getText());
        });
      } catch (e) {
        msg.textContent = e && e.name === 'NotAllowedError'
          ? 'Accesso alla fotocamera negato. Abilitalo in Impostazioni › Safari › Fotocamera, oppure digita il codice.'
          : 'Impossibile avviare la fotocamera: digita il codice o usa una foto.';
      }
    })();
  });
}
