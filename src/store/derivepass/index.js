// TODO(indutny): webpack.config.js
// Blocked by: https://github.com/vuejs/vue-cli/issues/3192
import Worker from 'worker-loader?{"name":"js/worker.[hash:8].js"}!./derive.worker.js';
import * as createDebug from 'debug';

import {
  AES_KEY_SIZE, MAC_KEY_SIZE, IV_SIZE,
  toHex, fromHex,
  LEGACY_PASSWORD_SIZE,
  passwordEntropyBits,
  computeLegacyPassword,
  computePassword,
} from '../../utils/crypto';

const debug = createDebug('derivepass:plugins:derivepass');
const encoder = new TextEncoder('utf-8');
const decoder = new TextDecoder('utf-8');

const SCRYPT_AES_DOMAIN = 'derivepass/aes';
const MAX_WORKERS = 8;

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

      worker.onerror = (e) => {
        reject(e);
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

export default class DerivePass {
  constructor() {
    this.workers = {
      idle: [],
      active: new Set(),
      queue: [],
      count: 0,
    };
  }

  async getWorker() {
    let worker;
    if (this.workers.idle.length !== 0) {
      debug('using idle worker');
      worker = this.workers.idle.shift();
    } else if (this.workers.count >= MAX_WORKERS) {
      debug('waiting for next idle worker');
      worker = await new Promise((resolve) => {
        this.workers.queue.push(resolve);
      });
    } else {
      debug('spawning new worker');
      worker = new DeriveWorker();
      this.workers.count++;
      await worker.init();
    }
    this.workers.active.add(worker);
    return worker;
  }

  reclaimWorker(worker) {
    debug('reclaiming worker');
    this.workers.active.delete(worker);
    if (this.workers.queue.length !== 0) {
      this.workers.queue.shift()(worker);
    } else {
      this.workers.idle.push(worker);
    }
  }

  async scrypt(master, domain, outSize) {
    const worker = await this.getWorker();

    master = encoder.encode(master);
    domain = encoder.encode(domain);

    try {
      return await worker.send('derivepass', { master, domain, outSize });
    } finally {
      this.reclaimWorker(worker);
    }
  }

  async encrypt(payload, keys) {
    const worker = await this.getWorker();
    try {
      const iv = new Uint8Array(IV_SIZE);
      window.crypto.getRandomValues(iv);

      const data = encoder.encode(payload);
      const raw = await worker.send('encrypt', { keys, iv, data });
      const hex = toHex(raw);

      return 'v1:' + hex;
    } finally {
      this.reclaimWorker(worker);
    }
  }

  async decrypt(payload, keys) {
    const worker = await this.getWorker();
    try {
      let version = 0;
      if (/^v1:/.test(payload)) {
        version = 1;
        payload = payload.slice(3);
      }
      payload = fromHex(payload);
      const raw = await worker.send(
        version === 1 ? 'decrypt' : 'decrypt_legacy',
        { keys, data: payload });
      return decoder.decode(raw);
    } finally {
      this.reclaimWorker(worker);
    }
  }

  // NOTE: We're intentionally not using `Promise.all()` here and below for
  // better interactivity. Most users will have several apps and it will look
  // better if they'll load in chunks.
  async decryptApp(app, keys) {
    return Object.assign({}, app, {
      domain: await this.decrypt(app.domain, keys),
      login: await this.decrypt(app.login, keys),
      revision: parseInt(await this.decrypt(app.revision, keys), 10) || 1,
      options: app.options && JSON.parse(await this.decrypt(app.options, keys)),
    });
  }

  async encryptApp(app, keys) {
    return Object.assign({}, app, {
      domain: await this.encrypt(app.domain, keys),
      login: await this.encrypt(app.login, keys),
      revision: await this.encrypt(app.revision.toString(), keys),
      options: await this.encrypt(JSON.stringify(app.options), keys),
    });
  }

  async computeKeys(master) {
    const buf = await this.scrypt(master, SCRYPT_AES_DOMAIN,
      AES_KEY_SIZE + MAC_KEY_SIZE);

    return {
      aesKey: buf.slice(0, AES_KEY_SIZE),
      macKey: buf.slice(AES_KEY_SIZE),
    };
  }

  async computeLegacyPassword(master, domain) {
    const raw = await this.scrypt(master, domain, LEGACY_PASSWORD_SIZE);

    return computeLegacyPassword(raw);
  }

  async computePassword(master, domain, options) {
    const bytes = Math.ceil(passwordEntropyBits(options) / 8);
    const raw = await this.scrypt(master, domain, bytes);
    return computePassword(raw, options);
  }
}
