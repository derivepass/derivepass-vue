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

  setCryptoKeys(state, payload) {
    state.master = payload.master;
    state.cryptoKeys = payload.crypto;
    state.emoji = payload.emoji;

    if (state.logoutTimer) {
      clearTimeout(state.logoutTimer);
    }
    state.logoutTimer = payload.logoutTimer;
  },

  resetCryptoKeys(state) {
    if (state.logoutTimer) {
      clearTimeout(state.logoutTimer);
    }
    state.logoutTimer = null;

    state.cryptoKeys = null;
    state.master = '';
    state.emoji = '';
  },
};
