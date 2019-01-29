import Vue from 'vue'
import VueI18n from 'vue-i18n'
import * as createDebug from 'debug';

import { LOCALE_KEY } from './utils/common';

const debug = createDebug('derivepass:i18n');

Vue.use(VueI18n)

let locale = 'en';

// Guess locale
try {
  let guess;
  if (!localStorage.getItem(LOCALE_KEY)) {
    guess = navigator.language.split('-')[0];
  }
  if (guess) {
    locale = guess;
  }

  debug('guessed locale %j', locale);
} catch (e) {
  // Ignore
}

try {
  locale = localStorage.getItem(LOCALE_KEY) || locale;

  debug('retrieved locale %j', locale);
} catch (e) {
  // Ignore
}

function loadLocaleMessages () {
  const locales = require.context('./locales', true, /[A-Za-z0-9-_,\s]+\.json$/i);
  const messages = {};
  locales.keys().forEach(key => {
    const matched = key.match(/([A-Za-z0-9-_]+)\./i);
    if (matched && matched.length > 1) {
      const locale = matched[1];
      messages[locale] = locales(key);
    }
  })
  return messages;
}

export default new VueI18n({
  locale,
  fallbackLocale: 'en',
  messages: loadLocaleMessages(),
  localeDir: 'locales',
  enableInSFC: true,
});
