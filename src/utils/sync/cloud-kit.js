import Sync from './base';
import * as createDebug from 'debug';
import { ENV } from '../common';

const debug = createDebug('derivepass:sync:cloud-kit');

const RETRY_DELAY = 1500;

// TODO(indutny): make this configurable
const SYNC_EVERY = 60 * 60 * 1000; // 1 hour

class CloudKitSync extends Sync {
  constructor(api) {
    super();

    this.api = api;
    this.container = this.api.getDefaultContainer();
    this.db = this.container.privateCloudDatabase;
    this.user = null;
    this.syncTimer = null;

    this.buttons = {
      signIn: document.getElementById('apple-sign-in-button'),
      signOut: document.getElementById('apple-sign-out-button'),
    };
  }

  async init() {
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
    const res = this.container.whenUserSignsIn();
    this.buttons.signIn.children[0].click();
    return res;
  }

  async signOut() {
    // XXX(indutny): Terrible hacks
    const res = this.container.whenUserSignsOut();
    this.buttons.signOut.children[0].click();
    return res;
  }

  // Override
  async sendApps(apps) {
    debug('sending apps', apps);

    debug('fetching latest versions');
    const fetchRes = await this.db.fetchRecords(apps.map((app) => app.uuid));

    const records = new Map();
    if (fetchRes.hasErrors) {
      for (const err in fetchRes.errors) {
        if (err.ckErrorCode === 'NOT_FOUND') {
          records.set(err.recordName, this.emptyRecord(err.recordName));
        } else {
          debug('fetch error', err);
        }
      }
    }

    for (const record of fetchRes.records) {
      records.set(record.recordName, record);
    }

    const missing = [];
    const toSave = [];
    for (const app of apps) {
      if (!records.has(app.uuid)) {
        missing.push(app);
        continue;
      }

      const record = records.get(app.uuid);

      if (record.modified.timestamp > app.changedAt) {
        debug('CloudKit has newer version of record %j', app.uuid);
        this.receiveRecord(record);
        continue;
      }

      if (record.modified.timestamp === app.changedAt) {
        debug('likely same record remote and locally %j', app.uuid);
        continue;
      }

      record.fields.domain.value = app.domain;
      record.fields.login.value = app.login;
      record.fields.revision.value = app.revision;

      record.fields.master.value = app.master;
      record.fields.index.value = app.index;
      record.fields.removed.value = app.removed ? 1 : 0;

      toSave.push(record);
    }

    const saveRes = await this.db.saveRecords(toSave);
    if (saveRes.hasErrors) {
      debug('save failed, retrying', saveRes.errors);
      return setTimeout(() => this.sendApps(apps), RETRY_DELAY);
    }

    debug('successfully sent apps');
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
    } finally {
      this.syncTimer = setTimeout(() => this.sync(), SYNC_EVERY);
    }
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

    this.receiveApp(app);
  }

  emptyRecord(uuid) {
    return {
      recordType: 'EncryptedApplication',
      recordName: uuid,
      fields: {
        domain: {},
        login: {},
        revision: {},
        master: {},
        index: {},
        removed: {}
      }
    };
  }
}

const API_TOKENS = {
  'development':
    'a549ed0b287668fdcef031438d4350e1e96ec12e758499bc1360a03564becaf8',
  'production': 
    'cd95e9dcb918b2d45b94a10416eaed02df8727d7b6fdde4669a5fbcacefafe1b',
};

export default new Promise((resolve, reject) => {
  const onCloudKit = async (CloudKit) => {
    const sync = new CloudKitSync(CloudKit);
    await sync.init();
    return sync;
  };

  // Development
  if (window.CloudKit) {
    resolve(onCloudKit(window.CloudKit));
    return;
  }

  const script = document.createElement('script');
  script.async = true;
  script.addEventListener('load', () => {
    const CloudKit = window.CloudKit;

    CloudKit.configure({
      containers: [{
        containerIdentifier: 'iCloud.com.indutny.DerivePass',
        apiTokenAuth: {
          apiToken: API_TOKENS[ENV],
          persist: true,
        },
        environment: ENV,
      }]
    });
    document.body.removeChild(script);

    resolve(onCloudKit(CloudKit));
  });
  script.addEventListener('error', (err) => reject(err));

  script.src = 'https://cdn.apple-cloudkit.com/ck/2/cloudkit.js';
  document.body.appendChild(script);
});
