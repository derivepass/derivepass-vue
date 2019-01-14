import * as crypto from 'crypto';

global.window = {};
global.window.crypto = {};
global.window.crypto.getRandomValues = (buf) => {
  const src = crypto.randomBytes(buf.length);
  for (let i = 0; i < buf.length; i++) {
    buf[i] = src[i];
  }
};
