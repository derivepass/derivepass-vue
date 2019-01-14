import * as assert from 'assert';
import { Buffer } from 'buffer';
import { randomBytes } from 'crypto';

import '../fixtures/polyfill';

import * as crypto from '../../src/utils/crypto';
import { parseAppOptions } from '../../src/utils/common';

describe('crypto', () => {
  it('should convert to hex', () => {
    assert.strictEqual(crypto.toHex([ 1, 15, 83 ]), '010f53');
  });

  it('should convert from hex', () => {
    assert.deepStrictEqual(Array.from(crypto.fromHex('010f53')), [ 1, 15, 83 ]);
  });

  it('should check if arrays are equal', () => {
    assert.ok(crypto.isEqual([ 1, 2 ], [ 1, 2 ]));
    assert.ok(!crypto.isEqual([ 1 ], [ 1, 2 ]));
    assert.ok(!crypto.isEqual([ 1, 3 ], [ 1, 2 ]));
  });

  it('should decrypt old format', () => {
    const aesKey = Buffer.from([
      0xe3, 0x3b, 0x22, 0x21, 0xd5, 0x1d, 0xe5, 0xb5,
      0x92, 0x17, 0xd9, 0xea, 0x05, 0x83, 0x25, 0xa5,
      0x1d, 0x3b, 0x32, 0x93, 0x06, 0xcd, 0x1c, 0x98,
      0x61, 0xaa, 0x5e, 0x17, 0xee, 0xef, 0x16, 0x71 ]);
    const macKey = Buffer.from([
      0x8a, 0x41, 0x93, 0x94, 0x8b, 0xcd, 0x65, 0x34, 0x76, 0xba, 0x6e,
      0xc4, 0x1b, 0x28, 0x02, 0xed, 0x41, 0xd4, 0x3e, 0x03, 0x2f, 0x87,
      0x90, 0x9a, 0xf0, 0xc4, 0x3e, 0x0c, 0x2d, 0x25, 0xaa, 0x83, 0x1c,
      0xb2, 0x1a, 0xe0, 0x82, 0x54, 0xf3, 0x09, 0x4c, 0x81, 0xe1, 0xe2,
      0x57, 0xf5, 0x26, 0xf8, 0xed, 0xbb, 0xdb, 0x60, 0x99, 0xcf, 0xb0,
      0xa0, 0xc5, 0x55, 0x6c, 0x0b, 0x22, 0x8a, 0x96, 0xf2 ]);

    const old =
      '7bc85a06f6cbc315e27696c4e648c46e217c12946299522583773907c6bf32b4';

    const value = crypto.decrypt(old, { aesKey, macKey });
    assert.strictEqual(value, 'ohai');
  });

  it('should encrypt/decrypt current format', () => {
    const aesKey = randomBytes(crypto.AES_KEY_SIZE);
    const macKey = randomBytes(crypto.MAC_KEY_SIZE);
    const keys = { aesKey, macKey };

    const encrypted = crypto.encrypt('hello', keys);
    assert.strictEqual(crypto.decrypt(encrypted, keys), 'hello');
  });

  it('should not reuse IV', () => {
    const aesKey = randomBytes(crypto.AES_KEY_SIZE);
    const macKey = randomBytes(crypto.MAC_KEY_SIZE);
    const keys = { aesKey, macKey };

    const encrypted = crypto.encrypt('hello', keys);
    assert.notStrictEqual(crypto.encrypt('hello', keys), encrypted);
  });

  it('should compute password entropy bits', () => {
    const bits = crypto.passwordEntropyBits({
      union: new Array(14),
      maxLength: 24,
    });

    assert.strictEqual(bits, 92);
  });

  it('should compute legacy password', () => {
    // master: hello, domain: gmail.com/test
    const pass = crypto.computeLegacyPassword([
      0x6f, 0x8a, 0xf9, 0x70, 0xc3, 0x42, 0x75, 0xc2,
      0xc9, 0x67, 0x96, 0xab, 0xa0, 0x2a, 0x39, 0x08,
      0x63, 0x3b,
    ]);
    assert.strictEqual(pass, 'b4r5cMNCdcLJZ5aroCo5CGM7');
  });

  it('should compute password', () => {
    // master: hello, domain: gmail.com/test
    const pass = crypto.computePassword([
      185, 200, 253, 102, 60, 26, 11, 22, 171, 244, 181,
    ], parseAppOptions({
      allowed: '0-9',
      required: '_@',
      maxLength: 24,
    }));
    assert.strictEqual(pass, '903442501816978_9324552@');
  });
});
