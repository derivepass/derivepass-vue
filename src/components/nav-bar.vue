<i18n>
{
  "en": {
    "applications": "Applications",
    "settings": "Settings",
    "about": "About",
    "logout": "Logout",
    "master": "Master Password",
    "home": "Home Page",
    "logo": "Logotype",
    "extra": "Extra",
    "suggest": "Suggest feature",
    "bug": "Report bug"
  },
  "ru": {
    "applications": "Приложения",
    "settings": "Настройки",
    "about": "О сайте",
    "logout": "Выйти",
    "master": "Мастер Пароль",
    "home": "Главная Страница",
    "logo": "Логотип",
    "extra": "Дополнительно",
    "suggest": "Предложить идею",
    "bug": "Сообщить об ошибке"
  },
  "ca": {
    "applications": "Aplicacions",
    "settings": "Configuració",
    "about": "Quant a",
    "logout": "Tanca sessió",
    "master": "Contrasenya Mestre",
    "home": "Pàgina Inicial",
    "logo": "Logo",
    "extra": "Extra",
    "suggest": "Suggerir funcionalitat",
    "bug": "Reportar incidència"
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
          <b-nav-item @click.prevent="logout">
            {{ $t('logout') }}
          </b-nav-item>
        </template>
      </b-navbar-nav>

      <b-navbar-nav class="ml-auto">
        <!-- Extra -->

        <b-nav-item-dropdown :text="$t('extra')" right>
          <b-dropdown-item
            href="https://github.com/derivepass/derivepass-vue/issues/new?template=feature_request.md&labels=enhancement"
            target="_blank">
            {{ $t('suggest') }}
          </b-dropdown-item>

          <b-dropdown-item
            href="https://github.com/derivepass/derivepass-vue/issues/new?template=bug_report.md&labels=bug"
            target="_blank">
            {{ $t('bug') }}
          </b-dropdown-item>
        </b-nav-item-dropdown>

        <!-- Locale choice -->

        <b-nav-item-dropdown :text="$root.$i18n.locale" right>
          <b-dropdown-item
            href="#"
            v-for="(lang, i) in langs"
            @click.prevent="changeLocale(lang.latin)"
            :key="`lang-${i}`"
            :value="lang.latin">
            {{ lang.native }}
          </b-dropdown-item>
        </b-nav-item-dropdown>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>

<script>
import bCollapse from 'bootstrap-vue/es/components/collapse/collapse';
import bDropdownItem from 'bootstrap-vue/es/components/dropdown/dropdown-item';
import bNavItem from 'bootstrap-vue/es/components/nav/nav-item';
import bNavItemDropdown from 'bootstrap-vue/es/components/nav/nav-item-dropdown';
import bNavbar from 'bootstrap-vue/es/components/navbar/navbar';
import bNavbarBrand from 'bootstrap-vue/es/components/navbar/navbar-brand';
import bNavbarNav from 'bootstrap-vue/es/components/navbar/navbar-nav';
import bNavbarToggle from 'bootstrap-vue/es/components/navbar/navbar-toggle';

import { LOCALE_KEY } from '../utils/common';

export default {
  name: 'nav-bar',
  components: {
    bNavbar, bNavbarBrand, bNavbarToggle, bNavbarNav, bNavItem, bCollapse,
    bNavItemDropdown, bDropdownItem,
  },

  data() {
    return {
      isLogoVisible: false,
      langs: [
        { latin: 'ca', native: 'Catalan' },
        { latin: 'en', native: 'English' },
        { latin: 'ru', native: 'Русский' }
      ],
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

  methods: {
    changeLocale(locale) {
      this.$root.$i18n.locale = locale;

      // Persist locale
      try {
        localStorage.setItem(LOCALE_KEY, locale);
      } catch (e) {
        // Ignore
      }
    },

    logout() {
      this.$autoLogout.logout();
      this.$router.push('/');
    }
  }
};
</script>

<style scoped>
.logo {
  width: 2rem;
  height: 2rem;
  visibility: hidden;
}

.logo.logo-visible {
  background: rgba(0,0,0,0.9);
  transition: background 0.8s;
  visibility: visible;
}

.logo.secure {
  background: rgb(18,188,0);
}
</style>
