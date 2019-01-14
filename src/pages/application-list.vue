<template>
  <div>
    <b-input-group class="mb-2">
      <b-form-input
        v-model="rawFilter"
        placeholder="Filter applications"/>
      <b-input-group-append>
        <b-button variant="primary" class="float-right" @click="addApplication">
          Add application
        </b-button>
      </b-input-group-append>
    </b-input-group>
    <section class="applications">
      <template v-for="app in applications">
        <router-link
          :to="`/applications/${app.uuid}`"
          :key= "app.uuid">
          <div
            class="application border rounded px-4 py-2 p-md-4 mb-1 align-middle">
            <b>{{app.domain}}</b>
            <br/>
            {{app.login}}
          </div>
        </router-link>
      </template>
    </section>
    <b-pagination-nav
      v-if="showPagination"
      use-router
      align="center"
      :link-gen="pageLink"
      :number-of-pages="numberOfPages"
      v-model="currentPage"/>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import * as uuidV4 from 'uuid/v4';

import bButton from 'bootstrap-vue/es/components/button/button';
import bFormInput from 'bootstrap-vue/es/components/form-input/form-input';
import bInputGroup from 'bootstrap-vue/es/components/input-group/input-group';
import bInputGroupAppend from 'bootstrap-vue/es/components/input-group/input-group-append';
import bPaginationNav from 'bootstrap-vue/es/components/pagination-nav/pagination-nav';

import { decryptApp } from '../utils/crypto';

const APPS_PER_PAGE = 10;

export default {
  name: 'application-list',
  components: {
    bInputGroup, bFormInput, bInputGroupAppend, bButton, bPaginationNav,
  },

  data() {
    return {
      rawFilter: this.$route.query.filter || '',
    };
  },

  beforeMount() {
    // Redirect to master password when not ready
    if (!this.$store.getters.isLoggedIn) {
      this.$router.replace('/');
    }
  },

  computed: {
    currentPage() {
      return Math.max(1, parseInt(this.$route.query.page || '1', 10));
    },

    filter() {
      try {
        return new RegExp(this.rawFilter, 'i');
      } catch (e) {
        return /$^/;
      }
    },
    showPagination() {
      return (this.allApps.length > APPS_PER_PAGE) ||
        this.currentPage > 1;
    },
    numberOfPages() {
      return Math.ceil(this.allApps.length / APPS_PER_PAGE);
    },
    ...mapState({
      allApps(state) {
        return state.applications.filter((app) => {
          return app.master === state.emoji && !app.removed;
        });
      },
      decryptedApps(state) {
        const pageApps = this.allApps.slice(
          (this.currentPage - 1) * APPS_PER_PAGE,
          this.currentPage * APPS_PER_PAGE);

        return pageApps.map((app) => {
          return decryptApp(app, state.cryptoKeys);
        });
      },
      applications() {
        return this.decryptedApps
          .sort((a, b) => {
            return a.index - b.index;
          })
          .filter((app) => {
            return this.filter.test(app.domain) ||
              this.filter.test(app.login);
          });
      },
    })
  },

  watch: {
    rawFilter(newValue) {
      this.$router.replace({
        path: '/applications',
        query: {
          filter: newValue,
          page: this.currentPage === 1 ? undefined : this.currentPage,
        },
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

    pageLink(num) {
      const query = Object.assign({}, this.$route.query, {
        page: num,
      })
      return { path: '/applications', query };
    },
  }
};
</script>

<style scoped>
.application {
  font-size: 1.2rem;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
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
