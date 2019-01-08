import App from './app';
import Sync from './base';
import * as createDebug from 'debug';

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

    this.store = null;

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

  setStore(store) {
    this.store = store;
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
          const fields = record.fields;

          const app = new App({
            uuid: record.recordName,

            domain: fields.domain.value,
            login: fields.login.value,
            revision: fields.revision.value,

            emoji: fields.master.value,
            index: fields.index.value,
            removed: fields.removed.value ? true : false,
            changedAt: new Date(record.modified.timestamp),
          });

          this.store.commit('receiveApp', app);
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
}

const ENV = process.env.ENV === 'production' ? 'production' : 'development';
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
