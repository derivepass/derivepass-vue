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
    required: '@',
  },

  'paypal.com': {
    required: '@',
    maxLength: 20,
  },

  // NOTE: >= 3 repeating characters are disallowed
  'nintendo.com': {
    alias: [ 'accounts.nintendo.com' ],
    required: '@',
    maxLength: 20,
  },
}

const PRESETS = new Map();

Object.keys(RAW).forEach((domain) => {
  const options = RAW[domain];
  const domains = [ domain ].concat(options.alias);

  for (const alias of domains) {
    PRESETS.set(alias, {
      domain,

      options: {
        allowed: options.allowed,
        required: options.required,
        maxLength: options.maxLength,
      },
    });
  }
});

export default PRESETS;
