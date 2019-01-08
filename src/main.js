import Vue from 'vue';
import Vuex from 'vuex'
import VueRouter from 'vue-router';

import BootstrapVue from 'bootstrap-vue';
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import App from './App.vue';
import MasterPassword from './pages/master-password.vue';
import Applications from './pages/applications.vue';
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
  { path: '/', component: MasterPassword },
  { path: '/applications', component: Applications },
];

const router = new VueRouter({
  routes,
});

new Vue({
  store,
  router,
  render: (h) => h(App),
}).$mount('#app');
