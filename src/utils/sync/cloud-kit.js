import Sync from './base';
import * as createDebug from 'debug';
import createCloudKit from '../cloud-kit-provider';

const debug = createDebug('derivepass:sync:cloud-kit');

const UI_RETRY_DELAY = 500;
const RETRY_DELAY = 1500;

// TODO(indutny): make this configurable
const SYNC_EVERY = 60 * 60 * 1000; // 1 hour

export default class CloudKit extends Sync {
  constructor(store) {
    super(store);

    this.initPromise = null;

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

    // Automatically initialize when enabled
    if (localStorage.getItem('derivepass/config/enable-icloud')) {
      this.init();
    }
  }

  async init() {
    if (!this.initPromise) {
      this.initPromise = this.initOnce();
    }
    return await this.initPromise;
  }

  async initOnce() {
    debug('loading CloudKit provider');
    const provider = await createCloudKit();

    this.container = provider.container;
    this.db = provider.db;

    debug('setting up authentication');
    this.user = await this.container.setUpAuth();

    debug('CloudKit fully operational');

    // Async auth loop
    this.authLoop();
  }

  get isAuthenticated() {
    return !!this.user;
  }

  async signIn() {
    localStorage.setItem('derivepass/config/enable-icloud', true);

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
    await Promise.all([
      this.container.whenUserSignsIn(),
      button.click(),
    ]);
  }

  async signOut() {
    localStorage.setItem('derivepass/config/enable-icloud', false);

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
    await Promise.all([
      this.container.whenUserSignsOut(),
      button.click(),
    ]);
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

  async authLoop() {
    debug('starting auth loop');
    for (;;) {
      try {
        if (this.user) {
          debug('auth loop: logged in, syncing');
          await this.sync();

          debug('auth loop: subscribing');
          this.subscribe();

          debug('auth loop: awaiting sign out');
          await this.container.whenUserSignsOut();
          this.user = null;
        } else {
          this.pauseSync();

          debug('auth loop: unsubscribing');
          this.unsubscribe();

          debug('auth loop: awaiting sign in');
          this.user = await this.container.whenUserSignsIn();
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
      this.user = await this.container.fetchCurrentUserIdentity();
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
