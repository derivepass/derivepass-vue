// Pages
import Home from './pages/home.vue';

export default [
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
