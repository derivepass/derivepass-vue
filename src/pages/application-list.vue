<template>
  <layout>
    <b-input-group prepend="Filter applications" class="mb-2">
      <b-form-input
        v-model="filter"
        placeholder="Examples: gmail.com, username18, ..."/>
      <b-input-group-append>
        <b-btn variant="primary" class="float-right" @click="addApplication">
          Add application
        </b-btn>
      </b-input-group-append>
    </b-input-group>
    <template v-for="app in applications">
      <router-link :to="`/applications/${app.uuid}`" :key="app.uuid">
        <b-card
          class="application mb-1"
          :title="app.domain"
          :sub-title="app.login"/>
      </router-link>
    </template>
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
    return { filter: this.$route.query.filter || '' };
  },

  computed: {
    lowFilter() {
      return this.filter.toLowerCase();
    },
    ...mapState({
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
            if (this.lowFilter) {
              return app.domain.toLowerCase().includes(this.lowFilter) ||
                app.login.toLowerCase().includes(this.lowFilter);
            } else {
              return true;
            }
          });
      },
    })
  },

  watch: {
    filter(newValue) {
      this.$router.replace({
        path: '/applications',
        query: { filter: newValue },
      });
    }
  },

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
