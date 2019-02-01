<i18n>
{
  "en": {
    "title": "iCloud Sync",
    "loading": {
      "init": "Connecting to iCloud...",
      "enable": "Enabling iCloud Synchronization...",
      "disable": "Disabling iCloud Synchronization...",
      "sign-in": "Signing into iCloud...",
      "sign-out": "Signing out of iCloud..."
    },
    "failed": "Failed to connect to iCloud!",
    "details": "Details",
    "dismiss": "Dismiss",
    "enable": "Enable",
    "disable": "Disable",
    "sign-in": "Sign In",
    "sign-out": "Sign Out"
  },
  "ru": {
    "title": "Синхронизация с iCloud",
    "loading": {
      "init": "Подключение к iCloud...",
      "enable": "Включение синхронизации с iCloud...",
      "disable": "Отключение синхронизации с iCloud...",
      "sign-in": "Авторизация iCloud...",
      "sign-out": "Выход из iCloud..."
    },
    "failed": "Не удалось соединиться с iCloud!",
    "details": "Подробности",
    "dismiss": "Скрыть",
    "enable": "Включить",
    "disable": "Отключить",
    "sign-in": "Авторизовать",
    "sign-out": "Деавторизовать"
  },
  "ca": {
    "title": "Sincronitza amb iCloud",
    "loading": {
      "init": "Connectant a iCloud...",
      "enable": "Habilitant sincronització d'iCloud...",
      "disable": "Deshabilitant sincronització d'iCloud...",
      "sign-in": "Iniciant sessió a iCloud...",
      "sign-out": "Tancant sessió a iCloud..."
    },
    "failed": "Error en connectar a iCloud!",
    "details": "Detalls",
    "dismiss": "Ignora",
    "enable": "Habilita",
    "disable": "Deshabilita",
    "sign-in": "Inicia sessió",
    "sign-out": "Tanca sessió"
  }
}
</i18n>

<template>
  <b-card :title="$t('title')">
    <template v-if="loading">
      <b-alert show variant="info">{{ $t('loading.' + this.loading) }}</b-alert>
    </template>
    <template v-else-if="error">
      <b-alert show variant="danger">
        <p>{{ $t('failed') }}</p>
        <p>
          {{ $t('details') }}:
          <i>{{ error.tag ? $t(error.tag, error.extra) : error.message }}</i>
        </p>
        <b-button @click="error = undefined">{{ $t('dismiss') }}</b-button>
      </b-alert>
    </template>
    <template v-else>
      <div>
        <b-button
          @click="load(enable(), 'enable')"
          variant="outline-primary"
          v-if="!isEnabled">
          {{ $t('enable') }}
        </b-button>
        <b-button
          @click="load(disable(), 'disable')"
          variant="outline-warning"
          v-else>
          {{ $t('disable') }}
        </b-button>
      </div>

      <div v-if="isEnabled" class="mt-3">
        <b-button
          @click="load(signIn(), 'sign-in')"
          variant="primary"
          v-if="!isAuthenticated">
          {{ $t('sign-in') }}
        </b-button>
        <b-button
          @click="load(signOut(), 'sign-out')"
          variant="warning"
          v-else>
          {{ $t('sign-out') }}
        </b-button>
      </div>
    </template>
  </b-card>
</template>

<script>
import bAlert from 'bootstrap-vue/es/components/alert/alert';
import bButton from 'bootstrap-vue/es/components/button/button';
import bCard from 'bootstrap-vue/es/components/card/card';

export default {
  name: 'cloud-kit',

  components: { bAlert, bButton, bCard },

  data() {
    return {
      loading: 'init',
      error: null,
      isAuthenticated: false,
      isEnabled: this.$cloudKit.isEnabled,
    };
  },

  async created() {
    try {
      await this.asyncInit();
    } catch (e) {
      this.error = e;
    } finally {
      this.loading = false;
    }
  },

  methods: {
    async asyncInit() {
      await this.$cloudKit.init();
      this.isAuthenticated = this.$cloudKit.isAuthenticated;
    },

    async load(promise, tag) {
      this.loading = tag;
      try {
        await promise;
      } catch (e) {
        this.error = e;
        return;
      } finally {
        this.loading = false;
      }
    },

    async enable() {
      await this.$cloudKit.enable();
      this.isEnabled = true;
    },

    async disable() {
      await this.$cloudKit.disable();
      this.isEnabled = false;
      this.isAuthenticated = false;
    },

    async signIn() {
      await this.$cloudKit.signIn();
      this.isAuthenticated = true;
    },

    async signOut() {
      await this.$cloudKit.signOut();
      this.isAuthenticated = false;
    }
  },
};
</script>
