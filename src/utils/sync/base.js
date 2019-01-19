import * as createDebug from 'debug';

const debug = createDebug('derivepass:utils:sync:base');

const COALESCE_DELAY = 50;

export default class Sync {
  constructor(store) {
    this.store = store;

    this.state = 'init';

    this.received = new Map();
    this.buffer = new Set();
    this.bufferTimer = null;
  }

  subscribe() {
    if (this.state === 'init') {
      this.store.subscribe(({ type, payload }) => {
        if (type !== 'receiveApp') {
          return;
        }

        if (this.state === 'subscribed') {
          this.onAppChange(payload);
        }
      });
    }

    this.state = 'subscribed';

    // Feed all past app changes
    for (const app of this.store.state.applications) {
      this.onAppChange(app);
    }
  }

  unsubscribe() {
    this.state = 'unsubscribed';
  }

  receiveApp(app) {
    this.received.set(app.uuid, Object.assign({}, app));
    this.store.dispatch('receiveApp', app);
  }

  sendApps() {
    throw new Error('Not implemented');
  }

  getApps(uuids) {
    // Could this be more efficient?
    return uuids.map((uuid) => {
      return this.store.state.applications.find((app) => {
        return app.uuid === uuid;
      });
    });
  }

  // Internal

  onAppChange(app) {
    if (this.received.has(app.uuid)) {
      const existing = this.received.get(app.uuid);
      // Avoid spurious changes
      if (existing.changedAt >= app.changedAt) {
        return;
      }
    }

    debug('received app with uuid %j changedAt %j', app.uuid, app.changedAt);

    this.received.set(app.uuid, app);
    this.buffer.add(app.uuid);

    if (this.bufferTimer) {
      return;
    }
    this.bufferTimer = setTimeout(() => {
      const uuids = Array.from(this.buffer);
      this.buffer.clear();
      this.bufferTimer = null;

      this.sendApps(uuids);
    }, COALESCE_DELAY);
  }

}
