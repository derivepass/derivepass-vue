/* eslint-disable no-console */
import Binding from './wasm';

const SCRYPT_R = 8;
const SCRYPT_N = 32768;
const SCRYPT_P = 4;

const wasm = new Binding();

function derivepass(master, domain, outSize) {
  return wasm.derive(SCRYPT_R, SCRYPT_N, SCRYPT_P, master, domain, outSize);
}

wasm.init().then(() => {
  postMessage({ type: 'ready', payload: null });
});

onmessage = (e) => {
  const { type, payload } = e.data;

  let res;
  if (type === 'derivepass') {
    try {
      res = {
        type: 'derivepass',
        payload: derivepass(payload.master, payload.domain, payload.outSize),
      };
    } catch (e) {
      console.error(e);
      console.error(e.stack);
      throw e;
    }
  } else {
    res = {
      type: 'error',
      payload: `Unknown message type "${type}"`,
    };
  }
  postMessage(res);
};
