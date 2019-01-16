<i18n>
{
  "en": {
    "applications": "Applications",
    "settings": "Settings",
    "about": "About",
    "logout": "Logout",
    "master": "Master Password",
    "home": "Home Page",
    "logo": "Logotype"
  },
  "ru": {
    "applications": "Приложения",
    "settings": "Настройки",
    "about": "О сайте",
    "logout": "Выйти",
    "master": "Мастер Пароль",
    "home": "Главная Страница",
    "logo": "Логотип"
  }
}
</i18n>

<template>
  <b-navbar class="mb-3" toggleable="md">
    <b-navbar-brand to="/">
      <img
        src="../assets/logo.svg"
        @load="isLogoVisible=true"
        :title="$t('home')"
        :alt="$t('logo')"
        :class="['logo', secureLogo, visibleLogo]"/>
    </b-navbar-brand>

    <b-navbar-toggle target="m-main-nav"/>

    <b-collapse is-nav id="m-main-nav">
      <b-navbar-nav>
        <template v-if="$store.getters.isLoggedIn">
          <b-nav-item to="/applications" v-if="$store.getters.isLoggedIn">
            {{ $t('applications') }}
          </b-nav-item>
        </template>
        <template v-else>
          <b-nav-item to="/master">
            {{ $t('master') }}
          </b-nav-item>
        </template>
        <b-nav-item to="/settings">
          {{ $t('settings') }}
        </b-nav-item>
        <b-nav-item to="/about">
          {{ $t('about') }}
        </b-nav-item>
        <template v-if="$store.getters.isLoggedIn">
          <b-nav-item @click.prevent="$autoLogout.logout()">
            {{ $t('logout') }}
          </b-nav-item>
        </template>
        <b-nav-item>
          <select v-model="$root.$i18n.locale">
            <option
              v-for="(lang, i) in langs"
              :key="`Lang${i}`"
              :value="lang">
              {{ lang }}
            </option>
          </select>
        </b-nav-item>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>

<script>
import bCollapse from 'bootstrap-vue/es/components/collapse/collapse';
import bNavItem from 'bootstrap-vue/es/components/nav/nav-item';
import bNavbar from 'bootstrap-vue/es/components/navbar/navbar';
import bNavbarBrand from 'bootstrap-vue/es/components/navbar/navbar-brand';
import bNavbarNav from 'bootstrap-vue/es/components/navbar/navbar-nav';
import bNavbarToggle from 'bootstrap-vue/es/components/navbar/navbar-toggle';

export default {
  name: 'nav-bar',
  components: {
    bNavbar, bNavbarBrand, bNavbarToggle, bNavbarNav, bNavItem, bCollapse,
  },

  data() {
    return {
      isLogoVisible: false,
      langs: [ 'en', 'ru' ],
    };
  },

  computed: {
    visibleLogo() {
      return this.isLogoVisible ? 'logo-visible' : '';
    },
    secureLogo() {
      return this.$store.getters.isLoggedIn ? 'secure' : '';
    }
  },
};
</script>

<style scoped>
.logo {
  width: 2rem;
  height: 2rem;
}

.logo.logo-visible {
  background: rgba(0,0,0,0.9);
  transition: background 0.8s;
}

.logo.secure {
  background: rgb(18,188,0);
}
</style>
