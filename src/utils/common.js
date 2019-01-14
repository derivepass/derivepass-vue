export const ENV =
  process.env.NODE_ENV === 'production' ? 'production' : 'development';

export function flattenRange(str) {
  if (/\s/.test(str)) {
    throw new Error('Can\'t contain whitespace');
  }

  const chars = str.replace(/(\w)-(\w)/g, (range, from, to) => {
    if (from.length !== 1) {
      throw new Error(`Invalid starting character in range "${range}"`);
    }
    if (to.length !== 1) {
      throw new Error(`Invalid ending character in range "${range}"`);
    }

    const fromCode = from.charCodeAt(0);
    const toCode = to.charCodeAt(0);
    if (fromCode > toCode) {
      throw new Error(`Invalid range "${range}"`);
    }

    let res = '';
    for (let code = fromCode; code <= toCode; code++) {
      res += String.fromCharCode(code);
    }
    return res;
  });

  return Array.from(new Set(chars.split(''))).sort();
}

export function parseAppOptions(options) {
  const allowed = flattenRange(options.allowed);
  const required = flattenRange(options.required);
  const union = Array.from(new Set(allowed.concat(required))).sort();

  return Object.assign({}, options, {
    allowed,
    required,
    union,
  });
}
