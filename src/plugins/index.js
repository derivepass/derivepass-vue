import Vuex from 'vuex'
import VueRouter from 'vue-router';
import VueClipboard from 'vue-clipboard2';

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import DerivePass from './derivepass';
import ServiceWorker from './service-worker';
import AutoLogout from './auto-logout';
import Sync from './sync';

export default {
  install(Vue) {
    Vue.use(Vuex);
    Vue.use(VueRouter);
    Vue.use(VueClipboard);

    // Internal Plugins
    Vue.use(DerivePass);
    Vue.use(ServiceWorker);
    Vue.use(AutoLogout);
  },

  installStoreDependent(Vue, { store }) {
    // Internal Plugins
    Vue.use(Sync, { store });
  }
};
