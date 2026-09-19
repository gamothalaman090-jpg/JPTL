import { tokenStorage } from './api';

let workerInstance = null;
let reqIdSequence = 0;
const pendingRequests = new Map();
const inFlightBatches = new Map();

function getWorker() {
  if (typeof window === 'undefined' || typeof window.Worker === 'undefined') {
    return null;
  }

  if (!workerInstance) {
    try {
      workerInstance = new Worker(
        new URL('../workers/fetchWorker.js', import.meta.url),
        { type: 'module' }
      );

      workerInstance.onmessage = (e) => {
        const { id, type, payload, error } = e.data || {};
        const pending = pendingRequests.get(id);
        if (!pending) return;

        pendingRequests.delete(id);
        if (type === 'FETCH_CONCURRENT_SUCCESS') {
          pending.resolve(payload);
        } else {
          pending.reject(new Error(error || 'Worker execution failed'));
        }
      };

      workerInstance.onerror = (err) => {
        console.warn('Web Worker error, continuing with fallback:', err.message);
      };
    } catch (err) {
      console.warn('Unable to initialize Web Worker in this environment:', err.message);
      workerInstance = null;
    }
  }

  return workerInstance;
}

/**
 * Fetch multiple endpoints concurrently using a Web Worker.
 * Offloads concurrent HTTP network calls and JSON parsing off the UI thread.
 *
 * @param {Array<{ key: string, endpoint: string, method?: string, body?: any }>} tasks
 * @returns {Promise<Record<string, { key: string, ok: boolean, status: number, data?: any, error?: string }>>}
 */
export async function fetchConcurrent(tasks) {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return {};
  }

  // Deduplicate identical in-flight batch fetches (e.g. React StrictMode mount)
  const batchKey = tasks.map((t) => `${t.method || 'GET'}:${t.endpoint}`).sort().join('|');
  if (inFlightBatches.has(batchKey)) {
    return inFlightBatches.get(batchKey);
  }

  const worker = getWorker();
  const token = tokenStorage.getToken();
  const baseUrl = import.meta.env.VITE_API_URL || '/api';

  let fetchPromise;

  if (worker) {
    const id = ++reqIdSequence;
    fetchPromise = new Promise((resolve, reject) => {
      pendingRequests.set(id, { resolve, reject });
      worker.postMessage({
        id,
        type: 'FETCH_CONCURRENT',
        tasks,
        baseUrl,
        token,
      });
    });
  } else {
    // High-performance Promise.all fallback on main thread
    fetchPromise = (async () => {
      const results = await Promise.all(
        tasks.map(async (task) => {
          const { key, endpoint, method = 'GET', body = null } = task;
          const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;
          const headers = { 'Content-Type': 'application/json' };
          if (token) headers.Authorization = `Bearer ${token}`;

          const opts = { method, headers, credentials: 'include' };
          if (body && method !== 'GET') {
            opts.body = typeof body === 'string' ? body : JSON.stringify(body);
          }

          try {
            const res = await fetch(url, opts);
            const data = await res.json().catch(() => null);
            return { key, ok: res.ok, status: res.status, data };
          } catch (err) {
            return { key, ok: false, status: 0, error: err.message };
          }
        })
      );

      const payload = {};
      for (const r of results) {
        payload[r.key] = r;
      }
      return payload;
    })();
  }

  // Track in-flight batch to avoid duplicate requests during mount
  inFlightBatches.set(batchKey, fetchPromise);
  fetchPromise.finally(() => {
    inFlightBatches.delete(batchKey);
  });

  return fetchPromise;
}
