import Sync from './base';
import * as createDebug from 'debug';
import CloudKitAPI from '../cloud-kit-api';

const debug = createDebug('derivepass:sync:cloud-kit');

const ENABLE_KEY = 'derivepass/config/enable-icloud';

// TODO(indutny): make this configurable
const SYNC_EVERY = 60 * 60 * 1000; // 1 hour

export default class CloudKit extends Sync {
  constructor(store) {
    super(store);

    this.initPromise = null;

    this.container = null;
    this.db = new CloudKitAPI();
    this.user = null;
    this.syncTimer = null;

    // Map from app uuid to recordChangeTag
    this.changeTags = new Map();

    // Automatically initialize when enabled
    if (this.isEnabled) {
      this.init();
    }
  }

  get isEnabled() {
    return localStorage.getItem(ENABLE_KEY) === 'true';
  }

  async enable() {
    localStorage.setItem(ENABLE_KEY, true);

    // Load scripts if needed
    await this.init();
  }

  async disable() {
    localStorage.setItem(ENABLE_KEY, false);

    if (this.user) {
      await this.signOut();
    }
  }

  async init() {
    // Do not load scripts until enabled
    if (!this.isEnabled) {
      return;
    }

    if (!this.initPromise) {
      this.initPromise = this.initOnce();
    }

    return await this.initPromise;
  }

  async initOnce() {
    debug('setting up authentication');
    this.setUser(await this.db.getUser());

    debug('CloudKit fully operational');
  }

  get isAuthenticated() {
    return !!this.user;
  }

  async signIn() {
    await this.db.signIn();
    this.setUser(await this.db.getUser());
  }

  async signOut() {
    await this.db.signOut();
    this.setUser(null);
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

    // Update tag and modification dates
    for (const record of (res.records || [])) {
      this.receiveRecord(record);
    }

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

  async setUser(user) {
    if (this.user === user) {
      return;
    }

    this.user = user;
    if (this.user) {
      debug('logged in, syncing');
      await this.sync();

      debug('subscribing');
      this.subscribe();
    } else {
      this.pauseSync();

      debug('unsubscribing');
      this.unsubscribe();
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
        const res = await this.db.fetchRecords({
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
      options: fields.options && fields.options.value,

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
        options: wrap(app.options),
        master: wrap(app.master),
        index: wrap(app.index),
        removed: wrap(app.removed ? 1 : 0),
      }
    };
  }
}
