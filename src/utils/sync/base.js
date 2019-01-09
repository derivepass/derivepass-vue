const COALESCE_DELAY = 50;

export default class Sync {
  constructor() {
    this.store = null;

    this.received = new Map();
    this.buffer = new Set();
    this.bufferTimer = null;
  }

  setStore(store) {
    if (this.store) {
      throw new Error('Can\'t assign store twice');
    }

    this.store = store;
    this.store.subscribe(({ type, payload }) => {
      if (type !== 'receiveApp') {
        return;
      }

      if (this.received.has(payload.uuid)) {
        const existing = this.received.get(payload.uuid);

        // Avoid spurious changes
        if (existing.changedAt >= payload.changedAt) {
          return;
        }
      }

      this.received.set(payload.uuid, payload);
      this.buffer.add(payload.uuid);

      if (this.bufferTimer) {
        clearTimeout(this.bufferTimer);
      }
      this.bufferTimer = setTimeout(() => {
        const uuids = Array.from(this.buffer);
        this.buffer.clear();
        this.bufferTimer = null;

        this.sendApps(uuids);
      }, COALESCE_DELAY);
    });
  }

  receiveApp(app) {
    this.received.set(app.uuid, Object.assign({}, app));

    this.store.commit('receiveApp', app);
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
}
