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
  receiveApp({ commit }, app) {
    if (app.removed) {
      app = scrubApp(app);
    }
    commit('receiveApp', app);
  }
}
