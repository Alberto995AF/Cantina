// Archivio locale su IndexedDB (i dati restano sul telefono).
const DB_NAME = 'cantina';
const DB_VER = 1;
let dbp;

function open() {
  if (dbp) return dbp;
  dbp = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('items')) db.createObjectStore('items', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('history')) db.createObjectStore('history', { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbp;
}

async function tx(store, mode, fn) {
  const db = await open();
  return new Promise((resolve, reject) => {
    const t = db.transaction(store, mode);
    const s = t.objectStore(store);
    const out = fn(s);
    t.oncomplete = () => resolve(out && 'result' in out ? out.result : out);
    t.onerror = () => reject(t.error);
  });
}

export const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));

export const db = {
  all: store => tx(store, 'readonly', s => s.getAll()),
  get: (store, id) => tx(store, 'readonly', s => s.get(id)),
  put: (store, obj) => tx(store, 'readwrite', s => { s.put(obj); return obj; }),
  del: (store, id) => tx(store, 'readwrite', s => { s.delete(id); }),
  clear: store => tx(store, 'readwrite', s => { s.clear(); }),
};

export async function exportAll() {
  const [items, history] = await Promise.all([db.all('items'), db.all('history')]);
  return { app: 'cantina', version: 1, exportedAt: new Date().toISOString(), items, history };
}

export async function importAll(data, { replace = false } = {}) {
  if (!data || data.app !== 'cantina' || !Array.isArray(data.items)) throw new Error('File non valido');
  if (replace) { await db.clear('items'); await db.clear('history'); }
  for (const it of data.items) await db.put('items', it);
  for (const h of data.history || []) await db.put('history', h);
  return { items: data.items.length, history: (data.history || []).length };
}

export async function requestPersistence() {
  try { if (navigator.storage && navigator.storage.persist) return await navigator.storage.persist(); } catch {}
  return false;
}
