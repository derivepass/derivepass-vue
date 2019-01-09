<template>
  <layout>
    <b-form-input
      class="mb-2"
      v-model="filter"
      placeholder="Filter applications"/>
    <template v-for="app in applications">
      <router-link :to="`/applications/${app.uuid}`" :key="app.uuid">
        <b-card
          class="application mb-1"
          :title="app.domain"
          :sub-title="app.login"/>
      </router-link>
    </template>
    <b-card class="application-add text-center">
      <b-button variant="primary" @click="addApplication">
        Add application
      </b-button>
    </b-card>
  </layout>
</template>

<script>
import { mapState } from 'vuex';
import Layout from '../layouts/default';
import { decryptApp } from '../utils/crypto';
import * as uuidV4 from 'uuid/v4';

// TODO(indutny): re-order apps

export default {
  name: 'application-list',
  components: { Layout },

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
        return decryptApp(app, state.cryptoKeys);
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
  }),

  methods: {
    addApplication() {
      const index = Math.max(...this.applications.map((app) => app.index)) + 1;
      this.$router.push({
        path: `/applications/${uuidV4()}`,
        query: { index },
      });
    },
  }
};
</script>

<style scoped>
.application:hover {
  background: #eee;
}

.application-buttons {
  opacity: 0;
}

.application:hover .application-buttons {
  opacity: 1;
}
</style>
