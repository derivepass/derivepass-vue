// Immediately start connecting to iCloud
import CloudKit from '../../utils/sync/cloud-kit';
import Local from '../../utils/sync/local-storage';

// Enable cloud sync
export default {
  install(Vue, options) {
    const cloudKit = new CloudKit(options.store);
    Vue.prototype.$cloudKit = cloudKit;

    // Enable local sync
    const local = new Local(options.store);
    Vue.prototype.$localStorage = local;
  },
};
