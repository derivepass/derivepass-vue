<template>
  <div>
    <template v-if="loading">
      <b-alert show variant="info">Connecting to iCloud APIs...</b-alert>
    </template>
    <template v-else-if="error">
      <b-alert show variant="danger">
        <p>Failed to connect to iCloud APIs!</p>
        <p>Details: <i>{{error.message || err}}</i></p>
        <b-button @click="error = undefined">Dismiss</b-button>
      </b-alert>
    </template>
    <template v-else>
      <b-button @click="signOut" v-if="isAuthenticated">Disable</b-button>
      <b-button @click="signIn" v-else>Enable</b-button>
    </template>
  </div>
</template>

<script>
import bAlert from 'bootstrap-vue/es/components/alert/alert';
import bButton from 'bootstrap-vue/es/components/button/button';

export default {
  name: 'cloud-kit',

  components: { bAlert, bButton },

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
