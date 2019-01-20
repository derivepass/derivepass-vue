import Local from '../../utils/sync/local-storage';

// Enable cloud sync
export default {
  install(Vue, options) {
    // Enable local sync
    const local = new Local(options.store);
    Vue.prototype.$localStorage = local;
  },
};
