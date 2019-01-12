import { register } from 'register-service-worker'
import * as createDebug from 'debug';

const debug = createDebug('derivepass:register-service-worker');

if (process.env.NODE_ENV === 'production') {
  register(`${process.env.BASE_URL}service-worker.js`, {
    ready() {
      debug('app is being served from cache by a service worker');
    },
    registered() {
      debug('service worker has been registered');
    },
    cached() {
      debug('content has been cached for offline use');
    },
    updatefound() {
      debug('New content is downloading');
    },
    updated() {
      debug('New content is available; please refresh');
    },
    offline() {
      debug('No internet connection found. App is running in offline mode');
    },
    error(error) {
      debug('Error during service worker registration:', error);
    }
  })
}
