const COALESCE_DELAY = 50;

export default class Sync {
  constructor() {
    this.store = null;

    this.received = new Map();
    this.buffer = new Map();
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
      this.buffer.set(payload.uuid, payload);

      if (this.bufferTimer) {
        clearTimeout(this.bufferTimer);
      }
      this.bufferTimer = setTimeout(() => {
        const apps = Array.from(this.buffer.values());
        this.buffer.clear();
        this.bufferTimer = null;

        this.sendApps(apps);
      }, COALESCE_DELAY);
    });
  }

  receiveApp(app) {
    this.received.set(app.uuid, app);

    this.store.commit('receiveApp', app);
  }

  sendApps() {
    throw new Error('Not implemented');
  }
}
