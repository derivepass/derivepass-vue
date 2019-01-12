import { register } from 'register-service-worker'
import * as createDebug from 'debug';

const debug = createDebug('derivepass:register-service-worker');

const UPDATE_EVERY = 3600 * 1000;  // 1 hour

class ServiceWorker {
  constructor() {
    this.updateQueue = [];
    this.registration = undefined;

    if (process.env.NODE_ENV !== 'production') {
      debug('running in debug mode, no service-worker used');
      return;
    }

    register(`${process.env.BASE_URL}service-worker.js`, {
      ready() {
        debug('app is being served from cache by a service worker');
      },
      registered(reg) {
        debug('service worker has been registered');

        this.registration = reg;
        setInterval(() => reg.update(), UPDATE_EVERY);
      },
      cached() {
        debug('content has been cached for offline use');
      },
      updatefound() {
        debug('New content is downloading');
      },
      updated: () => {
        debug('New content is available; please refresh');
        const queue = this.updateQueue;
        this.updateQueue = [];
        for (const resolve of queue) {
          resolve();
        }
      },
      offline() {
        debug('No internet connection found. App is running in offline mode');
      },
      error(error) {
        debug('Error during service worker registration:', error);
      }
    });
  }

  async whenUpdated() {
    await new Promise((resolve) => this.updateQueue.push(resolve));
  }

  async update() {
    const reg = this.registration;
    if (!reg) {
      throw new Error('Can\'t update not registered worker');
    }

    if (!reg.waiting) {
      throw new Error('No workers waiting');
    }

    const waiting = reg.waiting;

    await new Promise((resolve, reject) => {
      const channel = new MessageChannel();

      channel.port1.onmessage = (msg) => {
        if (msg.type === 'ok') {
          resolve();
        } else if (msg.type === 'error') {
          reject(new Error(msg.payload));
        }
      };

      waiting.postMessage({ type: 'update' }, [ channel.port2 ]);
    });
  }
}

export default {
  install(Vue) {
    Vue.prototype.$serviceWorker = new ServiceWorker();
  }
};
