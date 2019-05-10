import { DEFAULT_APP_OPTIONS } from './utils/common';

const RAW = {
  'google.com': {
    alias: [ 'accounts.google.com', 'gmail.com', 'youtube.com' ],
  },

  'facebook.com': {
    alias: [ 'fb.com' ],
  },

  'yahoo.com': {
    alias: [ 'login.yahoo.com' ],
  },

  'live.com': {
    alias: [ 'signup.live.com' ],
    options: {
      required: '@',
    },
  },

  'paypal.com': {
    options: {
      required: '@',
      maxLength: 20,
    },
  },

  'easyjet.com': {
    options: {
      maxLength: 20,
    },
  },

  // NOTE: >= 3 repeating characters are disallowed
  'nintendo.com': {
    alias: [ 'accounts.nintendo.com' ],
    options: {
      required: '@',
      maxLength: 20,
    },
  },

  'nic.ru': {
    options: {
      allowed: 'a-zA-Z0-9',
    },
  },

  'hrblock.com': {
    options: {
      required: '$',
    },
  },

  'nyumlc.org': {
    options: {
      maxLength: 20,
    },
  },

  'redislabs.com': {
    options: {
      required: '$',
    },
  },
}

const PRESETS = new Map();

Object.keys(RAW).forEach((domain) => {
  const entry = RAW[domain];
  const domains = [ domain ].concat(entry.alias);

  for (const alias of domains) {
    PRESETS.set(alias, {
      domain,

      options: Object.assign({}, DEFAULT_APP_OPTIONS, entry.options || {}),
    });
  }
});

export default PRESETS;
