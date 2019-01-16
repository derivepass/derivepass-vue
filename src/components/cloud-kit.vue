<i18n>
{
  "en": {
    "title": "iCloud Sync",
    "connecting": "Connecting to iCloud...",
    "failed": "Failed to connect to iCloud!",
    "details": "Details",
    "dismiss": "Dismiss",
    "disable": "Disable",
    "enable": "Enable"
  },
  "ru": {
    "title": "Синхронизация с iCloud",
    "connecting": "Подключение к iCloud...",
    "failed": "Не удалось соединиться с iCloud!",
    "details": "Подробности",
    "dismiss": "Скрыть",
    "disable": "Отключить",
    "enable": "Включить"
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
        @click="signOut"
        variant="outline-warning"
        v-if="isAuthenticated">
        {{ $t('disable') }}
      </b-button>
      <b-button
        @click="signIn"
        variant="outline-primary"
        v-else>
        {{ $t('enable') }}
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
    return { loading: true, error: null, isAuthenticated: false };
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
