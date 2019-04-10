import * as createDebug from 'debug';

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
    } else if (app.master) {
      // Scrub emojis
      app = Object.assign({}, app, { master: '' });
    }
    commit('receiveApp', app);

    if (app.removed) {
      // Shortcut
      commit('updateDecryptedApp', app);
      return;
    }

    if (!getters.isLoggedIn) {
      return;
    }

    state.derivepass.decryptApp(app, state.cryptoKeys).then((decrypted) => {
      if (!decrypted) {
        return;
      }

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
    const matchingApps = state.applications.filter((app) => {
      return !app.removed;
    });

    let decryptedApps = await Promise.all(matchingApps.map(async (app) => {
      return await state.derivepass.decryptApp(app, payload.crypto);
    }));

    // Filter out any apps encrypted with a different AES key
    decryptedApps = decryptedApps.filter((app) => app !== null);

    // Display recently modified apps first
    decryptedApps.sort((a, b) => {
      return b.changedAt - a.changedAt;
    });

    commit('setCryptoKeys', payload);
    commit('setDecryptedApps', decryptedApps);
  }
}
