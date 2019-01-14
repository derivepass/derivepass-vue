import * as assert from 'assert';

import * as common from '../../src/utils/common';

describe('common', () => {
  it('should flatten valid range', () => {
    assert.deepStrictEqual(
      common.flattenRange('0-3\\-A'),
      [ '-', '0', '1', '2', '3', 'A' ],
    );
  });

  it('should report range with invalid order', () => {
    assert.throws(() => {
      common.flattenRange('3-0');
    }, /"3-0"/);
  });

  it('should report range with unicode start-end', () => {
    assert.throws(() => {
      common.flattenRange('а-б');
    });
  });

  it('should report range with unmatched start', () => {
    assert.throws(() => {
      common.flattenRange('0-');
    }, /"0-"/);
  });

  it('should report range with unmatched end', () => {
    assert.throws(() => {
      common.flattenRange('-9');
    }, /"-9"/);
  });

  it('should report range with no start and no end', () => {
    assert.throws(() => {
      common.flattenRange('-');
    }, /"-"/);
  });
});
