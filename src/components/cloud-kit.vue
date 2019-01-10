<template>
  <div>
    <template v-if="loading">
      <b-alert show variant="info">Connecting to iCloud APIs...</b-alert>
    </template>
    <template v-else-if="error">
      <!-- TODO(indutny): colors, remove b-alert -->
      <b-alert show variant="error">
        <p>Failed to connect to iCloud APIs!</p>
        <p>Details: <i>{{error.message || err}}</i></p>
        <b-btn @click="error = undefined">Dismiss</b-btn>
      </b-alert>
    </template>
    <template v-else>
      <b-btn @click="signOut" v-if="isAuthenticated">Disable</b-btn>
      <b-btn @click="signIn" v-else>Enable</b-btn>
    </template>
  </div>
</template>

<script>
export default {
  name: 'cloud-kit',

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
