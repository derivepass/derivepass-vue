import Vue from 'vue';
import Vuex from 'vuex'
import VueRouter from 'vue-router';
import VueClipboard from 'vue-clipboard2';

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import * as createDebug from 'debug';
const debug = createDebug('derivepass:main');

import App from './App.vue';

// Pages
import Home from './pages/home.vue';

// Store
import storeConfig from './store/index';

// Immediately start connecting to iCloud
import CloudKit from './utils/sync/cloud-kit';
import createCloudKit from './utils/cloud-kit-provider';
import LocalStorage from './utils/sync/local-storage';

import DerivePass from './plugins/derivepass';
import ServiceWorker from './plugins/service-worker';
import AutoLogout from './plugins/auto-logout';

import testFeatures from './utils/feature-test';

const missingFeatures = testFeatures();
if (missingFeatures) {
  const title = document.createElement('b');
  title.textContent =
    'Following features are required for running this application:'
  document.body.appendChild(title);
  for (const feature of missingFeatures) {
    const elem = document.createElement('p');
    elem.textContent = `* ${feature}`;
    document.body.appendChild(elem);
  }
}

Vue.config.productionTip = false;

Vue.use(Vuex);
Vue.use(VueRouter);
Vue.use(VueClipboard);

// Internal Plugins
Vue.use(DerivePass);
Vue.use(ServiceWorker);
Vue.use(AutoLogout);

const store = new Vuex.Store(storeConfig);

// Enable cloud sync
const cloudKit = new CloudKit();
Vue.prototype.$cloudKit = cloudKit;

debug('loading CloudKit provider');
createCloudKit().then(async (provider) => {
  cloudKit.setProvider(provider);
  cloudKit.setStore(store);

  debug('initializing CloudKit instance');
  await cloudKit.init();

  debug('CloudKit fully operational');
}).catch((e) => {
  debug('CloudKit error', e);
});

// Enable local sync
const localStorage = new LocalStorage();
localStorage.setStore(store);

const routes = [
  { path: '/', redirect: '/about' },
  { path: '/about', component: Home },
  { path: '/master', component: () => import('./pages/master-password') },
  {
    path: '/applications',
    component: () => import('./pages/application-list'),
  },
  {
    path: '/applications/:uuid',
    component: () => import('./pages/application'),
  },
  { path: '/settings', component: () => import('./pages/settings') },
  { path: '*', redirect: '/' },
];

const router = new VueRouter({
  mode: 'history',
  routes,
});

new Vue({
  store,
  router,
  render: (h) => h(App),
}).$mount('#app');
