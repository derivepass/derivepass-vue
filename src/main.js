import Vue from 'vue';
import Vuex from 'vuex'
import VueRouter from 'vue-router';

import BootstrapVue from 'bootstrap-vue';
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import * as createDebug from 'debug';
const debug = createDebug('derivepass:main');

import App from './App.vue';

// Pages
import MasterPassword from './pages/master-password.vue';
import ApplicationList from './pages/application-list.vue';
import Application from './pages/application.vue';
import Settings from './pages/settings.vue';

// Store
import storeConfig from './store/index';

// Immediately start connecting to iCloud
import CloudKit from './utils/sync/cloud-kit';
import createCloudKit from './utils/cloud-kit-provider';
import LocalStorage from './utils/sync/local-storage';

import DerivePass from './plugins/derivepass';
import './registerServiceWorker'

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
Vue.use(BootstrapVue);
Vue.use(DerivePass);

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
  { path: '/', redirect: '/master' },
  { path: '/master', component: MasterPassword },
  { path: '/applications', component: ApplicationList },
  { path: '/applications/:uuid', component: Application },
  { path: '/settings', component: Settings },
  { path: '*', redirect: '/master' },
];

const router = new VueRouter({
  routes,
});

new Vue({
  store,
  router,
  render: (h) => h(App),
}).$mount('#app');
