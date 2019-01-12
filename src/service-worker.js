/* global workbox */
workbox.core.setCacheNameDetails({prefix: "DerivePass"});

workbox.clientsClaim();

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
