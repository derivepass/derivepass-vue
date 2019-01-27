import * as createDebug from 'debug';

import {
  DEFAULT_APP_OPTIONS,
} from '../utils/common';

const debug = createDebug('derivepass:store:actions');

function scrubApp(app) {
  if (!app.domain && !app.login && !app.revision && !app.options &&
      !app.master && !app.index) {
    // Already scrubbed
    return app;
  }

  // Scrub
  debug('scrubbing app with uuid: %j', app.uuid);
  return Object.assign({}, app, {
    changedAt: Date.now(),
    domain: '',
    login: '',
    revision: '',
    options: '',
    master: '',
    index: 0,
  });
}

export default {
  receiveApp({ state, getters, commit }, app) {
    if (app.removed) {
      app = scrubApp(app);
    }
    commit('receiveApp', app);

    if (app.removed) {
      // Shortcut
      commit('updateDecryptedApp', app);
      return;
    }

    if (!getters.isLoggedIn || app.master !== state.emoji) {
      return;
    }

    state.derivepass.decryptApp(app, state.cryptoKeys).then((decrypted) => {
      commit('updateDecryptedApp', decrypted);
    }).catch((err) => {
      debug('decryption error=%j', err.message);
    });
  },

  async receiveDecryptedApp({ state, dispatch }, app) {
    const encrypted = await state.derivepass.encryptApp(app, state.cryptoKeys);
    dispatch('receiveApp', encrypted);
  },

  async setCryptoKeys({ state, commit }, payload) {
    const { emoji } = payload;

    const matchingApps = state.applications.filter((app) => {
      return app.master === emoji && !app.removed;
    });

    const decryptedApps = await Promise.all(matchingApps.map(async (app) => {
      try {
        return await state.derivepass.decryptApp(app, payload.crypto);
      } catch (e) {
        return Object.assign({}, app, {
          domain: '<error>',
          login: '<error>',
          revision: 1,
          options: Object.assign({}, DEFAULT_APP_OPTIONS),
        });
      }
    }));

    // Display recently modified apps first
    decryptedApps.sort((a, b) => {
      return b.changedAt - a.changedAt;
    });

    commit('setCryptoKeys', payload);
    commit('setDecryptedApps', decryptedApps);
  }
}
