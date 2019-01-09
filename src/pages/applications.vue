<template>
  <layout>
    <b-form-input v-model="filter" placeholder="Filter applications"/>
    <b-table hover :items="applications"/>
  </layout>
</template>

<script>
import { mapState } from 'vuex';
import Layout from '../layouts/default';
import { decrypt } from '../utils/crypto';

export default {
  name: 'applications',
  components: {
    Layout,
  },

  beforeMount() {
    // Redirect to master password when not ready
    if (!this.$store.getters.showApps) {
      this.$router.replace('/');
    }
  },

  data() {
    return { filter: '' };
  },

  computed: mapState({
    decryptedApps(state) {
      return state.applications.filter((app) => {
        return app.master === state.emoji && !app.removed;
      }).map((app) => {
        return {
          domain: decrypt(app.domain, state.cryptoKeys),
          login: decrypt(app.login, state.cryptoKeys),
          revision: decrypt(app.revision, state.cryptoKeys),

          index: app.index,
        };
      });
    },
    applications() {
      return this.decryptedApps
        .sort((a, b) => {
          return a.index - b.index;
        })
        .filter((app) => {
          if (this.filter) {
            return app.domain.includes(this.filter) ||
              app.login.includes(this.filter);
          } else {
            return true;
          }
        });
    },
  })
};
</script>

<style>
</style>
