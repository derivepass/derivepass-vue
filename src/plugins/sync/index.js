import * as createDebug from 'debug';
const debug = createDebug('derivepass:sync');

// Immediately start connecting to iCloud
import CloudKit from '../../utils/sync/cloud-kit';
import createCloudKit from '../../utils/cloud-kit-provider';
import LocalStorage from '../../utils/sync/local-storage';

// Enable cloud sync
export default {
  install(Vue, options) {
    const cloudKit = new CloudKit();
    Vue.prototype.$cloudKit = cloudKit;

    debug('loading CloudKit provider');
    createCloudKit().then(async (provider) => {
      cloudKit.setProvider(provider);
      cloudKit.setStore(options.store);

      debug('initializing CloudKit instance');
      await cloudKit.init();

      debug('CloudKit fully operational');
    }).catch((e) => {
      debug('CloudKit error', e);
    });

    // Enable local sync
    const localStorage = new LocalStorage();
    localStorage.setStore(options.store);
  },
};
