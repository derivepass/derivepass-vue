import Sync from './base';
import * as createDebug from 'debug';

const debug = createDebug('derivepass:sync:cloud-kit');

const UI_RETRY_DELAY = 500;
const RETRY_DELAY = 1500;

// TODO(indutny): make this configurable
const SYNC_EVERY = 60 * 60 * 1000; // 1 hour

export default class CloudKit extends Sync {
  constructor() {
    super();

    this.ready = false;
    this.initPromise = new Promise((resolve) => {
      this.initResolve = resolve;
    });

    this.container = null;
    this.db = null;
    this.user = null;
    this.syncTimer = null;

    // Map from app uuid to recordChangeTag
    this.changeTags = new Map();

    this.buttons = {
      signIn: document.getElementById('apple-sign-in-button'),
      signOut: document.getElementById('apple-sign-out-button'),
    };
  }

  setProvider(provider) {
    if (this.container) {
      throw new Error('Already has a provider');
    }

    this.container = provider.container;
    this.db = provider.db;

    this.initResolve();
  }

  async init() {
    await this.initPromise;
    if (this.ready) {
      return;
    }
    this.ready = true;

    debug('setting up authentication');
    this.user = await this.container.setUpAuth();

    // Async auth loop
    this.authLoop();
  }

  get isAuthenticated() {
    return !!this.user;
  }

  async signIn() {
    // XXX(indutny): Terrible hacks
    if (this.buttons.signIn.children.length === 0) {
      throw new Error('CloudKit initialization error');
    }

    const button = this.buttons.signIn.children[0];
    if (button.style.display === 'none') {
      debug('signIn button invisible, retrying after delay');
      await new Promise((resolve) => setTimeout(resolve, UI_RETRY_DELAY));
      return await this.signIn();
    }

    debug('signIn clicked');
    const res = this.container.whenUserSignsIn();
    button.click();
    return await res;
  }

  async signOut() {
    // XXX(indutny): Terrible hacks
    if (this.buttons.signOut.children.length === 0) {
      throw new Error('CloudKit initialization error');
    }

    const button = this.buttons.signOut.children[0];
    if (button.style.display === 'none') {
      debug('signOut button invisible, retrying after delay');
      await new Promise((resolve) => setTimeout(resolve, UI_RETRY_DELAY));
      return await this.signIn();
    }

    debug('signOut clicked');
    const res = this.container.whenUserSignsOut();
    button.click();
    return await res;
  }

  // Override

  async sendApps(uuids) {
    if (!this.user) {
      return;
    }
    debug('sending apps uuids.len=%d', uuids.length);

    // Always fetch fresh apps from storage
    const apps = this.getApps(uuids);

    const records = apps.map((app) => this.appToRecord(app));

    const res = await this.db.saveRecords(records);
    if (!res.hasErrors) {
      debug('successfully sent apps');
      return;
    }

    const hasConflicts =
      res.errors.some((err) => err.ckErrorCode === 'CONFLICT');
    if (hasConflicts) {
      debug('has conflicts, forcing full synchronization');
      this.sync();
    }

    const uuidsLeft = res.errors.map((err) => err.recordName);
    debug('apps with errors uuidsLeft.len=%d', uuidsLeft.length);
    await this.sendApps(uuidsLeft);
  }

  // Internal

  async authLoop() {
    debug('starting auth loop');
    for (;;) {
      try {
        if (this.user) {
          this.sync();
        } else {
          this.pauseSync();
        }

        if (this.user) {
          debug('auth loop: awaiting sign out');
          await this.container.whenUserSignsOut();
          this.user = null;
        } else {
          debug('auth loop: awaiting sign in');
          this.user = await this.container.whenUserSignsIn();

          debug('auth loop: user signed in, forcing update');
          this.sendApps(this.store.state.applications.map((app) => app.uuid));
        }
      } catch (e) {
        debug('auth loop: got error %j, retrying in %d ms', e, RETRY_DELAY);
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));

        // Reload `.user` property
        await this.reloadUser();
      }
    }
  }

  async reloadUser() {
    try {
      this.user = this.container.fetchCurrentUserIdentity();
    } catch (e) {
      this.user = null;
    }
  }

  async sync() {
    // Cancel any pending sync cal
    this.pauseSync();

    debug('sync: attempting sync');
    try {
      let marker = null;
      let received = 0;

      do {
        debug('sync: query with marker %j', marker);
        const res = await this.db.performQuery({
          recordType: 'EncryptedApplication',
          continuationMarker: marker,
        });

        if (res.hasErrors) {
          debug('sync: got errors', res.errors);
          break;
        }

        for (const record of res.records) {
          this.receiveRecord(record);
          received++;
        }

        marker = res.continuationMarker;
      } while (marker);

      debug('sync: received %d apps', received);
    } catch(e) {
      debug('sync: error', e);
    }

    // Concurrent `sync()` calls
    if (this.syncTimer) {
      return;
    }
    this.syncTimer = setTimeout(() => this.sync(), SYNC_EVERY);
  }

  pauseSync() {
    if (this.syncTimer) {
      debug('sync: pause');
      clearTimeout(this.syncTimer);
    }
    this.syncTimer = null;
  }

  receiveRecord(record) {
    const fields = record.fields;

    const app = {
      uuid: record.recordName,

      domain: fields.domain.value,
      login: fields.login.value,
      revision: fields.revision.value,

      master: fields.master.value,
      index: fields.index.value,
      removed: fields.removed.value ? true : false,
      changedAt: record.modified.timestamp,
    };

    if (record.recordChangeTag) {
      this.changeTags.set(app.uuid, record.recordChangeTag);
    }

    this.receiveApp(app);
  }

  appToRecord(app) {
    const recordChangeTag = this.changeTags.get(app.uuid);

    const wrap = (value) => ({ value });

    return {
      recordType: 'EncryptedApplication',
      recordName: app.uuid,
      recordChangeTag,
      fields: {
        domain: wrap(app.domain),
        login: wrap(app.login),
        revision: wrap(app.revision),
        master: wrap(app.master),
        index: wrap(app.index),
        removed: wrap(app.removed ? 1 : 0),
      }
    };
  }
}
