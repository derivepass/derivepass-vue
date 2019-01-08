const ENV = process.env.ENV === 'production' ? 'production' : 'development';
const API_TOKENS = {
  'development':
    'a549ed0b287668fdcef031438d4350e1e96ec12e758499bc1360a03564becaf8',
  'production': 
    'cd95e9dcb918b2d45b94a10416eaed02df8727d7b6fdde4669a5fbcacefafe1b',
};

const RETRY_DELAY = 1500;

class CloudKitSync {
  constructor(api) {
    this.api = api;
    this.container = this.api.getDefaultContainer();
    this.db = this.container.privateCloudDatabase;
    this.user = null;

    this.store = null;

    this.buttons = {
      signIn: document.getElementById('apple-sign-in-button'),
      signOut: document.getElementById('apple-sign-out-button'),
    };
  }

  async init() {
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
    for (;;) {
      try {
        if (this.user) {
          await this.container.whenUserSignsOut();
          this.user = null;
        } else {
          this.user = await this.container.whenUserSignsOut();
        }
      } catch (e) {
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
}

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
