import Sync from './base';
import { ENV } from '../common';
import * as createDebug from 'debug';

const debug = createDebug('derivepass:sync:local-storage');

const PREFIX = `derivepass/${ENV}`;

export default class LocalStorage extends Sync {
  constructor(store) {
    super(store);

    this.db = window.localStorage;

    this.start();
  }

  start() {
    if (!this.db) {
      return;
    }

    let count = 0;
    for (let i = 0; i < this.db.length; i++) {
      const key = this.db.key(i);
      if (!key.startsWith(PREFIX)) {
        continue;
      }
      let app;
      try {
        app = JSON.parse(this.db.getItem(key));
      } catch (e) {
        this.db.removeItem(key);
        continue;
      }

      count++;
      this.receiveApp(app);
    }
    debug('emitting initial db.len=%d', count);

    this.subscribe();
  }

  async sendApps(uuids) {
    if (!this.db) {
      return;
    }

    const apps = this.getApps(uuids);
    for (const app of apps) {
      this.db.setItem(`${PREFIX}/${app.uuid}`, JSON.stringify(app));
    }
    debug('updated uuids.len=%d', uuids.length);
  }
}
