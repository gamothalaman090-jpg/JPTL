/**
 * JPTL High-Concurrency Web Worker
 * Offloads concurrent network requests and JSON deserialization off the main UI thread.
 * Compatible with Vite bundler and Vercel edge/static hosting.
 */

self.onmessage = async (event) => {
  const { id, type, tasks, baseUrl = '/api', token } = event.data || {};

  if (type === 'FETCH_CONCURRENT') {
    try {
      const results = await Promise.all(
        tasks.map(async (task) => {
          const { key, endpoint, method = 'GET', body = null } = task;
          const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;

          const headers = {
            'Content-Type': 'application/json',
          };
          if (token) {
            headers.Authorization = `Bearer ${token}`;
          }

          const fetchOptions = {
            method,
            headers,
            credentials: 'include',
          };

          if (body && method !== 'GET') {
            fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
          }

          try {
            const res = await fetch(url, fetchOptions);
            const contentType = res.headers.get('content-type') || '';
            let data = null;

            if (contentType.includes('application/json')) {
              data = await res.json();
            } else {
              data = await res.text();
            }

            return {
              key,
              ok: res.ok,
              status: res.status,
              data,
            };
          } catch (networkErr) {
            return {
              key,
              ok: false,
              status: 0,
              error: networkErr.message,
            };
          }
        })
      );

      const payload = {};
      for (const item of results) {
        payload[item.key] = item;
      }

      self.postMessage({ id, type: 'FETCH_CONCURRENT_SUCCESS', payload });
    } catch (err) {
      self.postMessage({ id, type: 'FETCH_CONCURRENT_ERROR', error: err.message });
    }
  }
};
