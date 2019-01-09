// TODO(indutny): webpack.config.js
import Worker from 'worker-loader!./worker.js';
import * as createDebug from 'debug';

const debug = createDebug('derivepass:plugins:derivepass');
const encoder = new TextEncoder('utf8');
const SCRYPT_AES_DOMAIN = 'derivepass/aes';
const PASSWORD_OUT_SIZE = 18;

const AES_KEY_SIZE = 32;
const MAC_KEY_SIZE = 64;

class DeriveWorker {
  constructor() {
    this.handle = null;
    this.queue = [];
  }

  async init() {
    // Already initialized
    if (this.handle) {
      return;
    }

    this.handle = await new Promise((resolve, reject) => {
      debug('creating worker');
      const worker = new Worker();

      debug('awaiting worker ready message');
      worker.onmessage = (e) => {
        const { type, payload } = e.data;
        if (type === 'ready') {
          debug('worker ready');
          resolve(worker);
        } else if (type === 'error') {
          debug('worker error', payload);
          reject(new Error(payload));
        } else {
          throw new Error(`Unknown message type: "${type}"`);
        }
      };
    });

    this.handle.onmessage = (e) => {
      const { type, payload } = e.data;
      if (this.queue.length === 0) {
        throw new Error(`Unexpected message with type: "${type}"`);
      }
      debug('worker message type=%j', type, payload);

      const first = this.queue.shift();
      if (first.type !== type) {
        throw new Error(`Unexpected message with type: "${type}"`);
      }

      first.resolve(payload);
    };
  }

  async send(type, payload) {
    return await new Promise((resolve) => {
      this.handle.postMessage({ type, payload });

      this.queue.push({ type, resolve });
    });
  }
}

class DerivePass {
  constructor() {
    this.workers = {
      idle: [],
      active: new Set(),
    };
  }

  async getWorker() {
    let worker;
    if (this.workers.idle.length === 0) {
      worker = new DeriveWorker();
      await worker.init();
    } else {
      worker = this.workers.idle.shift();
    }
    return worker;
  }

  async scrypt(master, domain, outSize) {
    const worker = await this.getWorker();
    this.workers.active.add(worker);

    master = encoder.encode(master);
    domain = encoder.encode(domain);

    try {
      return  await worker.send('derivepass', { master, domain, outSize });
    } finally {
      // Reclaim worker
      this.workers.active.delete(worker);
      this.workers.idle.push(worker);
    }
  }

  async computeKeys(master) {
    const buf = await this.scrypt(master, SCRYPT_AES_DOMAIN,
      AES_KEY_SIZE + MAC_KEY_SIZE);

    return {
      aesKey: buf.slice(0, AES_KEY_SIZE),
      macKey: buf.slice(AES_KEY_SIZE),
    };
  }
}

export default {
  install(Vue) {
    Vue.prototype.$derivepass = new DerivePass();
  }
};
