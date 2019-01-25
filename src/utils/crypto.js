// TODO(indutny): dumb-crypto and wasm
import * as BN from 'bn.js';

export const AES_KEY_SIZE = 32;
export const IV_SIZE = 16;
export const MAC_KEY_SIZE = 64;
export const MAC_SIZE = 32;

export function fromHex(hex) {
  if (hex.length % 2 !== 0) {
    throw new Error(`Invalid hex: "${hex}"`);
  }

  const alpha = (ch) => {
    // 0-9
    if (ch >= 0x30 && ch <= 0x39) {
      return ch - 0x30;
    } else if (ch >= 0x41 && ch <= 0x46) {
      return ch - 0x41 + 10;
    } else if (ch >= 0x61 && ch <= 0x66) {
      return ch - 0x61 + 10;
    } else {
      throw new Error('Not a hex character, code: ' + ch);
    }
  };

  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    const hi = alpha(hex.charCodeAt(i));
    const lo = alpha(hex.charCodeAt(i + 1));

    out[i >> 1] = (hi << 4) | lo;
  }
  return out;
}

export function toHex(buf) {
  let res = '';
  for (let i = 0; i < buf.length; i++) {
    let d = buf[i].toString(16);
    if (d.length < 2) {
      d = '0' + d;
    }
    res += d;
  }
  return res;
}

// Password generation

// NOTE: this is upper bound for an entropy, lower bound depends on the size
// of `required` array.
export function passwordEntropyBits(options) {
  return Math.ceil(Math.log2(options.union.length) * options.maxLength);
}

export const LEGACY_PASSWORD_SIZE = 18;
export const PASSWORD_BASE64 =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_.'.split('');

export function computeLegacyPassword(raw) {
  if (raw.length !== LEGACY_PASSWORD_SIZE) {
    throw new Error('Invalid raw bytes');
  }

  let out = '';
  for (let i = 0; i < raw.length; i += 3) {
    const a = raw[i];
    const b = raw[i + 1];
    const c = raw[i + 2];

    out += PASSWORD_BASE64[a >>> 2];
    out += PASSWORD_BASE64[((a & 3) << 4) | (b >>> 4)];
    out += PASSWORD_BASE64[((b & 0x0f) << 2) | (c >>> 6)];
    out += PASSWORD_BASE64[c & 0x3f];
  }

  return out;
}

export function computePassword(raw, options) {
  const num = new BN(Array.from(raw), 'le');

  const required = new Set(options.required);

  let out = '';
  while (out.length < options.maxLength) {
    let alphabet;

    // Emitted all required chars, move to allowed
    if (required.size === 0) {
      alphabet = options.allowed;

    // Remaining space has to be filled with required chars
    } else if (required.size === options.maxLength - out.length) {
      alphabet = Array.from(required);

    // Just emit any chars
    } else {
      alphabet = options.union;
    }

    const ch = alphabet[num.modn(alphabet.length)];
    num.idivn(alphabet.length);

    required.delete(ch);
    out += ch;
  }

  return out;
}
