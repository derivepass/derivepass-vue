export const ENV =
  location.protocol === 'derivepass:' ? 'electron' :
    process.env.NODE_ENV === 'production' ? 'production' : 'development';

export const LOCALE_KEY = 'derivepass/config/locale';

export const DEFAULT_APP_OPTIONS = {
  allowed: 'a-zA-Z0-9_.',
  required: '',
  maxLength: 24,
};

export class LocaleError extends Error {
  constructor(message, tag, extra = {}) {
    super(message);

    this.tag = tag;
    this.extra = extra;
  }
}

export function flattenRange(str) {
  if (/\s/.test(str)) {
    throw new Error(new LocaleError('Can\'t contain whitespace',
      'error.flatten.whitespace'));
  }

  // a-zA-Z
  str = str.replace(/(\w)-(\w)/g, (range, from, to) => {
    const fromCode = from.charCodeAt(0);
    const toCode = to.charCodeAt(0);

    if (from.length !== 1 || fromCode > 0xff) {
      throw new LocaleError(`Invalid starting character in range "${range}"`,
        'error.flatten.invalid-start', { range });
    }
    if (to.length !== 1 || toCode > 0xff) {
      throw new LocaleError(`Invalid ending character in range "${range}"`,
        'error.flatten.invalid-end', { range });
    }

    if (fromCode > toCode) {
      throw new LocaleError(`Invalid range "${range}"`, 'error.flatten.invalid',
        { range });
    }

    let res = '';
    for (let code = fromCode; code <= toCode; code++) {
      res += String.fromCharCode(code);
    }
    return res;
  });

  // Report invalid ranges
  str.replace(/[^\\]-|[^\\]-\W|^-\W|^-\w?/, (invalid) => {
    throw new LocaleError(`Unterminated range "${invalid}"`,
      'error.flatten.unterminated', { range: invalid });
  });

  // Unescape `\x` => `x`
  str = str.replace(/\\(.)/g, '$1');

  return Array.from(new Set(str.split(''))).sort();
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
