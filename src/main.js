import Vue from 'vue';
import Vuex from 'vuex'
import VueRouter from 'vue-router';

import BootstrapVue from 'bootstrap-vue';
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import App from './App.vue';
import Index from './pages/index.vue';
import About from './pages/about.vue';

Vue.config.productionTip = false;

Vue.use(Vuex);
Vue.use(VueRouter);
Vue.use(BootstrapVue);

const routes = [
  { path: '/', component: Index },
  { path: '/about', component: About },
];

const router = new VueRouter({
  routes,
});

new Vue({
  router,
  render: (h) => h(App),
}).$mount('#app');
