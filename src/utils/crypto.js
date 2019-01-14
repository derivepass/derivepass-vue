// TODO(indutny): dumb-crypto and wasm
import { createCipheriv, createDecipheriv } from 'browserify-aes';
import { sha256, hmac } from 'hash.js';
import * as BN from 'bn.js';
import * as createDebug from 'debug';

const debug = createDebug('derivepass:utils:crypto');

export const AES_KEY_SIZE = 32;
export const IV_SIZE = 16;
export const MAC_KEY_SIZE = 64;
export const MAC_SIZE = 32;

export function fromHex(hex) {
  if (hex.length % 2 !== 0) {
    throw new Error('Invalid hex');
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

export function isEqual(a, b) {
  if (a.length !== b.length) {
    return false;
  }

  // Probably still not safe, but we shouldn't worry much about it, considering
  // that Oracle attack doesn't apply for this app.
  let res = 0;
  for (let i = 0; i < a.length; i++) {
    res |= a[i] ^ b[i];
  }

  return res === 0;
}

export function encrypt(value, keys) {
  const iv = new Uint8Array(IV_SIZE);
  window.crypto.getRandomValues(iv);
  const cipher = createCipheriv('aes-256-cbc', keys.aesKey, iv);

  const content = [
    iv,
    cipher.update(value),
    cipher.final()
  ];

  const macStream = hmac(sha256, keys.macKey);
  for (const elem of content) {
    macStream.update(elem);
  }
  const mac = macStream.digest();

  return 'v1:' + content.map(toHex).join('') + toHex(mac);
}

export function decrypt(value, keys) {
  let version = 0;
  if (/^v1:/.test(value)) {
    version = 1;
    value = value.slice(3);
  }

  value = fromHex(value);

  if (version === 1) {
    if (value.length <= IV_SIZE + MAC_SIZE) {
      debug('invalid encrypted value');
      return '<decrypt failed #0>';
    }

    const actual = hmac(sha256, keys.macKey)
        .update(value.slice(0, value.length - MAC_SIZE))
        .digest();
    const mac = value.slice(value.length - MAC_SIZE);
    if (!isEqual(actual, mac)) {
      debug('MAC mismatch');
      return '<decrypt failed #1>';
    }

    value = value.slice(0, value.length - MAC_SIZE);
  }

  const iv = value.slice(0, IV_SIZE);
  const content = value.slice(IV_SIZE);

  const d = createDecipheriv('aes-256-cbc', keys.aesKey, iv);

  try {
    /// XXX(indutny): temporary hack with `hex`
    return d.update(toHex(content), 'hex') + d.final();
  } catch (err) {
    debug('decryption error', err);
    return '<decrypt failed #2>';
  }
}

export function decryptApp(app, keys) {
  return Object.assign({}, app, {
    domain: decrypt(app.domain, keys),
    login: decrypt(app.login, keys),
    revision: parseInt(decrypt(app.revision, keys), 10) || 1,
    options: app.options && JSON.parse(decrypt(app.options, keys)),
  });
}

export function encryptApp(app, keys) {
  return Object.assign({}, app, {
    domain: encrypt(app.domain, keys),
    login: encrypt(app.login, keys),
    revision: encrypt(app.revision.toString(), keys),
    options: encrypt(JSON.stringify(app.options), keys),
  });
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
