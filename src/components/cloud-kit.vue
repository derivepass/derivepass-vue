<i18n>
{
  "en": {
    "title": "iCloud Sync",
    "connecting": "Connecting to iCloud...",
    "failed": "Failed to connect to iCloud!",
    "details": "Details",
    "dismiss": "Dismiss",
    "enable": "Enable",
    "disable": "Disable",
    "sign-in": "Sign In"
  },
  "ru": {
    "title": "Синхронизация с iCloud",
    "connecting": "Подключение к iCloud...",
    "failed": "Не удалось соединиться с iCloud!",
    "details": "Подробности",
    "dismiss": "Скрыть",
    "enable": "Включить",
    "disable": "Отключить",
    "sign-in": "Авторизовать"
  }
}
</i18n>

<template>
  <b-card :title="$t('title')">
    <template v-if="loading">
      <b-alert show variant="info">{{ $t('connecting') }}</b-alert>
    </template>
    <template v-else-if="error">
      <b-alert show variant="danger">
        <p>{{ $t('failed') }}</p>
        <p>{{ $t('details') }}: <i>{{error.message || err}}</i></p>
        <b-button @click="error = undefined">{{ $t('dismiss') }}</b-button>
      </b-alert>
    </template>
    <template v-else>
      <b-button
        @click="enable"
        variant="outline-primary"
        v-if="!isEnabled">
        {{ $t('enable') }}
      </b-button>
      <b-button
        @click="signIn"
        variant="outline-primary"
        v-else-if="!isAuthenticated">
        {{ $t('sign-in') }}
      </b-button>
      <b-button
        @click="signOut"
        variant="outline-warning"
        v-else>
        {{ $t('disable') }}
      </b-button>
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
      loading: true,
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

    async enable() {
      this.loading = true;
      try {
        this.$cloudKit.enable();
        await this.$cloudKit.init();
        this.isEnabled = true;
      } catch (e) {
        this.error = e;
        return;
      } finally {
        this.loading = false;
      }
    },

    async signIn() {
      this.loading = true;
      try {
        await this.$cloudKit.signIn();
        this.isAuthenticated = true;
      } catch (e) {
        this.error = e;
        return;
      } finally {
        this.loading = false;
      }
    },

    async signOut() {
      this.loading = true;
      try {
        await this.$cloudKit.signOut();
        this.isAuthenticated = false;
      } catch (e) {
        this.error = e;
        return;
      } finally {
        this.loading = false;
      }
    }
  },
};
</script>
