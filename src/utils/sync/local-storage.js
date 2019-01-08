import Sync from './base';
import { ENV } from '../common';

const PREFIX = `derivepass/${ENV}`;

export default class LocalStorage extends Sync {
  constructor() {
    super();

    this.db = window.localStorage;
  }

  setStore(storage) {
    super.setStore(storage);

    if (!this.db) {
      return;
    }

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

      this.receiveApp(app);
    }
  }

  sendApps(apps) {
    if (!this.db) {
      return;
    }

    for (const app of apps) {
      this.db.setItem(`${PREFIX}/${app.uuid}`, JSON.stringify(app));
    }
  }
}
