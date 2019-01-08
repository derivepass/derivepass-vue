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
import Sync from './pages/sync.vue';

// Store
import * as storeApplications from './store/applications';
import * as storeCrypto from './store/crypto';

Vue.config.productionTip = false;

Vue.use(Vuex);
Vue.use(VueRouter);
Vue.use(BootstrapVue);

const store = new Vuex.Store({
  modules: {
    applications: storeApplications,
    crypto: storeCrypto,
  }
});

const routes = [
  { path: '/', redirect: '/master' },
  { path: '/master', component: MasterPassword },
  { path: '/applications', component: Applications },
  { path: '/sync', component: Sync },
];

const router = new VueRouter({
  routes,
});

new Vue({
  store,
  router,
  render: (h) => h(App),
}).$mount('#app');
