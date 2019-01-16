import jsQR from 'jsqr';
import * as qrImage from 'qr-image';
import * as pako from 'pako';
import * as createDebug from 'debug';
import { isEqual } from '../crypto';

const debug = createDebug('derivepass:utils:qr:io');

export const VERSION = 1;

export default class QRIO {
  constructor(options) {
    this.options = options;

    this.lastData = null;
    this.seq = 0;

    this.waiters = {
      receive: {
        type: null,
        resolve: null,
      },
      send: {
        seq: null,
        resolve: null,
      }
    };
  }

  async send(type, payload) {
    return await new Promise((resolve) => {
      const seq = this.seq++;

      this.waiters.send.seq = seq;
      this.waiters.send.resolve = resolve;

      this.showImage('data', [ seq, type, payload ]);
    });
  }

  async receive(type) {
    return await new Promise((resolve) => {
      this.waiters.receive.type = type;
      this.waiters.receive.resolve = resolve;
    });
  }

  handleFrame(frame, width, height) {
    let code;
    try {
      code = jsQR(frame, width, height);
    } catch (e) {
      debug('malformed frame', e);
      return;
    }

    if (!code || !code.data) {
      // No QR code
      return;
    }

    // Skip duplicates
    if (isEqual(code.data, this.lastData)) {
      return;
    }
    this.lastData = code.data;

    let packet;
    try {
      const raw = pako.inflate(code.data, { to: 'string' });
      packet = JSON.parse(raw);
    } catch (e) {
      throw new Error('Malformed packet');
    }

    if (packet[1] === 'data') {
      const seq = packet[2];
      const type = packet[3];
      const payload = packet[4];

      // Ignore early messages
      if (!this.waiters.receive.type) {
        return;
      }

      if (this.waiters.receive.type !== type) {
        throw new Error(
          `Expected "${this.waiters.receive.type}" type, but got "${type}"`);
      }

      this.showImage('ack', [ seq ]);

      this.waiters.receive.type = null;
      this.waiters.receive.resolve(payload);
      return;
    } else if (packet[1] === 'ack') {
      const seq = packet[2];

      if (!this.waiters.send.seq !== seq) {
        throw new Error(
          `Expected "${this.waiters.send.seq}" seq id, but got "${seq}"`);
      }

      this.waiters.send.seq = null;
      this.waiters.send.resolve();
      return;
    }

    // Ignore unknown messages for future extensibility
  }

  // Internal

  showImage(type, payload) {
    const json = JSON.stringify([ VERSION ].concat(type, payload));
    const compressed = Array.from(pako.deflate(json));
    const url = 'data:image/svg+xml;utf8,' + qrImage.imageSync(compressed, {
      type: 'svg',
    });
    this.options.onImage(url);
  }
}
