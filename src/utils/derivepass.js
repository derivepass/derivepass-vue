import Worker from 'worker-loader!./derivepass.worker.js';
import * as createDebug from 'debug';

const debug = createDebug('derivepass:utils:derivepass');

export default class DerivePass {
  constructor() {
    this.worker = null;
    this.queue = [];
  }

  async init() {
    this.worker = await new Promise((resolve, reject) => {
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

    this.worker.onmessage = (e) => {
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

  async derive(master, password) {
    return await new Promise((resolve) => {
      this.worker.postMessage({
        type: 'derivepass',
        payload: { master, password },
      });

      this.queue.push({ type: 'derivepass', resolve });
    });
  }
}
