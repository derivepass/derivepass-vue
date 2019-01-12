import * as createDebug from 'debug';

const debug = createDebug('derivepass:auto-logout');

class AutoLogout {
  constructor() {
    this.timer = null;
    this.timeout = null;
    this.doLogout = null;
  }

  login(doLogout, timeout) {
    debug('login with timeout=%d', timeout);
    this.doLogout = doLogout;
    this.timeout = timeout;

    this.reset();
  }

  logout() {
    debug('logout');
    if (this.doLogout) {
      const fn = this.doLogout;
      this.doLogout = null;
      fn();
    }
  }

  reset() {
    if (!this.doLogout) {
      return;
    }

    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => {
      debug('logout timeout');
      this.timer = null;

      this.logout();
    }, this.timeout);
  }
}

export default {
  install(Vue) {
    const instance = new AutoLogout();
    Vue.prototype.$autoLogout = instance;

    window.addEventListener('keypress', () => instance.reset());
    window.addEventListener('click', () => instance.reset());
  }
};
