const SCRYPT_R = 8;
const SCRYPT_N = 32768;
const SCRYPT_P = 4;
const OUT_SIZE = 18;

import('dumb-scrypt-wasm').then((wasm) => {
  function derivepass(master, domain) {
    const out = wasm.derive(SCRYPT_R, SCRYPT_N, SCRYPT_P, master, domain,
      OUT_SIZE);
    return out.join('-');
  }

  onmessage = (e) => {
    const { type, payload } = e.data;

    let res;
    if (type === 'derivepass') {
      res = {
        type: 'derivepass',
        payload: derivepass(payload.master, payload.domain),
      };
    } else {
      res = {
        type: 'error',
        payload: `Unknown message type "${type}"`,
      };
    }
    postMessage(res);
  };

  postMessage({ type: 'ready', payload: null });
}).catch((err) => {
  postMessage({ type: 'error', payload: err.message });
});
