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
  try {
    if (type === 'derivepass') {
      res = {
        type: 'derivepass',
        payload: derivepass(payload.master, payload.domain, payload.outSize),
      };
    } else if (type === 'encrypt') {
      res = {
        type: 'encrypt',
        payload: wasm.encrypt(payload.keys.aesKey, payload.keys.macKey,
          payload.iv, payload.data),
      };
    } else if (type === 'decrypt') {
      res = {
        type: 'decrypt',
        payload: wasm.decrypt(payload.keys.aesKey, payload.keys.macKey,
          payload.data),
      };
    } else if (type === 'decrypt_legacy') {
      res = {
        type: 'decrypt_legacy',
        payload: wasm.decrypt_legacy(payload.aesKey, payload.data),
      };
    } else {
      res = {
        type: 'error',
        payload: `Unknown message type "${type}"`,
      };
    }
  } catch (e) {
    res = { type: 'error', payload: e.message ? (e.message + e.stack) : e };
  }
  postMessage(res);
};
