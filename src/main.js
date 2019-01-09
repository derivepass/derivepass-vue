import Vue from 'vue';
import Vuex from 'vuex'
import VueRouter from 'vue-router';

import BootstrapVue from 'bootstrap-vue';
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import App from './App.vue';

// Pages
import MasterPassword from './pages/master-password.vue';
import Applications from './pages/applications.vue';
import Settings from './pages/settings.vue';

// Store
import storeConfig from './store/index';

// Immediately start connecting to iCloud
import CloudKit from './utils/sync/cloud-kit';
import CloudKitLoader from './utils/cloud-kit-loader';
import LocalStorage from './utils/sync/local-storage';

import DerivePass from './plugins/derivepass';

Vue.config.productionTip = false;

Vue.use(Vuex);
Vue.use(VueRouter);
Vue.use(BootstrapVue);
Vue.use(DerivePass);

const store = new Vuex.Store(storeConfig);

// Enable cloud sync
CloudKitLoader.then(async (config) => {
  const cloudKit = new CloudKit(config);
  cloudKit.setStore(store);

  await cloudKit.init();
});

// Enable local sync
const localStorage = new LocalStorage();
localStorage.setStore(store);

const routes = [
  { path: '/', redirect: '/master' },
  { path: '/master', component: MasterPassword },
  { path: '/applications', component: Applications },
  { path: '/settings', component: Settings },
];

const router = new VueRouter({
  routes,
});

new Vue({
  store,
  router,
  render: (h) => h(App),
}).$mount('#app');
