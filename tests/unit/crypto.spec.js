import * as assert from 'assert';

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
    // master: test, domain: test.com/indutny
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
