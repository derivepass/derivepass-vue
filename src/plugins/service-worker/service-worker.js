/* global workbox addEventListener */
workbox.core.setCacheNameDetails({prefix: "DerivePass"});

workbox.routing.registerRoute(
  'https://cdn.apple-cloudkit.com/ck/2/cloudkit.js',
  workbox.strategies.staleWhileRevalidate(),
);

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [].concat(self.__precacheManifest || []);
workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

/* Just testing */

addEventListener('message', (event) => {
  const sender = event.ports[0];
  const { type } = event.data;

  if (type === 'update') {
    const response = self.skipWaiting()
      .then(() => {
        sender.postMesage({ type: 'ok', payload: null });
      })
      .catch((err) => {
        sender.postMessage({ type: 'error', payload: err.message });
      });

    event.waitUntil(response);
  }
});
