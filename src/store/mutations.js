import * as createDebug from 'debug';

const debug = createDebug('derivepass:store');

export default {
  receiveApp(state, app) {
    const existing = state.applications.find((existing) => {
      return existing.uuid === app.uuid;
    });

    if (!existing) {
      debug('new app with uuid: %j', app.uuid);
      state.applications.push(app);
      return;
    }

    if (existing.changedAt >= app.changedAt) {
      return;
    }

    // NOTE: `removed` should not flip from `true` to `false`
    const removed = existing.removed || app.removed;
    let changedAt = app.changedAt;

    if (removed !== app.removed) {
      changedAt = Date.now();
    }

    debug('updating existing app %j from %j to %j', app.uuid,
      existing.changedAt,
      app.changedAt);
    Object.assign(existing, app, {
      removed,
      changedAt,
    });
  },

  updateDecryptedApp(state, app) {
    const existing = state.decryptedApps.find((decrypted) => {
      return decrypted.uuid === app.uuid;
    });

    if (!existing) {
      // Strange, but okay?
      if (app.removed) {
        debug('why %j', state.decryptedApps);
        return;
      }

      debug('new decrypted app.uuid=%j', app.uuid);
      state.decryptedApps.push(Object.assign({}, app));

      // Display recently modified apps first
      state.decryptedApps.sort((a, b) => {
        return b.changedAt - a.changedAt;
      });
      return;
    }

    if (app.removed) {
      debug('removed decrypted app.uuid=%j', app.uuid);
      state.decryptedApps.splice(state.decryptedApps.indexOf(existing), 1);
      return;
    }

    debug('updated decrypted app.uuid=%j', app.uuid);
    Object.assign(existing, app);
  },

  setCryptoKeys(state, payload) {
    state.master = payload.master;
    state.cryptoKeys = payload.crypto;
    state.emoji = payload.emoji;
  },

  resetCryptoKeys(state) {
    state.cryptoKeys = null;
    state.master = '';
    state.emoji = '';
    state.decryptedApps = [];
  },

  setDecryptedApps(state, payload) {
    state.decryptedApps = payload;
  }
};
