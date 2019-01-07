import { derive as scrypt } from 'dumb-scrypt-wasm';

const SCRYPT_R = 8;
const SCRYPT_N = 32768;
const SCRYPT_P = 4;
const OUT_SIZE = 18;

export default function derivepass(master, domain) {
  const out = scrypt(SCRYPT_R, SCRYPT_N, SCRYPT_P, master, domain, OUT_SIZE);
  return out.join('-');
};
