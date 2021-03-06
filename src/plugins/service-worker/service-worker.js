/* global workbox addEventListener */
workbox.core.setCacheNameDetails({ prefix: 'DerivePass' });

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [].concat(self.__precacheManifest || []);
workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

addEventListener('message', (event) => {
  const port = event.ports[0];
  const { type } = event.data;

  if (type === 'update') {
    const response = self.skipWaiting()
      .then(() => {
        port.postMessage({ type: 'ok', payload: null });
      })
      .catch((err) => {
        port.postMessage({ type: 'error', payload: err.message });
      });

    event.waitUntil(response);
  }
});
