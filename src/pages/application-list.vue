<template>
  <div>
    <b-input-group class="mb-2">
      <b-form-input
        v-model="filter"
        placeholder="Filter applications"/>
      <b-input-group-append>
        <b-button variant="primary" class="float-right" @click="addApplication">
          Add application
        </b-button>
      </b-input-group-append>
    </b-input-group>
    <template v-for="app in applications">
      <router-link
        :to="`/applications/${app.uuid}`"
        :key= "app.uuid">
        <div class="application border rounded p-4 mb-1 align-middle">
          <b>{{app.domain}}</b>
          <br/>
          {{app.login}}
        </div>
      </router-link>
    </template>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import * as uuidV4 from 'uuid/v4';

import bButton from 'bootstrap-vue/es/components/button/button';
import bFormInput from 'bootstrap-vue/es/components/form-input/form-input';
import bInputGroup from 'bootstrap-vue/es/components/input-group/input-group';
import bInputGroupAppend from 'bootstrap-vue/es/components/input-group/input-group-append';

import { decryptApp } from '../utils/crypto';

// TODO(indutny): re-order apps

export default {
  name: 'application-list',
  components: {
    bInputGroup, bFormInput, bInputGroupAppend, bButton,
  },

  beforeMount() {
    // Redirect to master password when not ready
    if (!this.$store.getters.isLoggedIn) {
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
.application {
  font-size: 1.2rem;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space:nowrap;
}

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
