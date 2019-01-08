<template>
  <layout>
    <b-form-input v-model="filter" placeholder="Filter applications"/>
    <b-table hover :items="applications"/>
  </layout>
</template>

<script>
import { mapState } from 'vuex';
import Layout from '../layouts/default';

export default {
  name: 'applications',
  components: {
    Layout,
  },

  beforeMount() {
    // Redirect to master password when not ready
    if (!this.$store.getters.hasAESKey) {
      this.$router.replace('/');
    }
  },

  data() {
    return { filter: '' };
  },

  computed: mapState({
    applications(state) {
      return state.applications.filter((app) => {
        return app.master === state.emoji && !app.removed;
      }).map((app) => {
        return {
          domain: app.domain,
          login: app.login,
          revision: app.revision,

          index: app.index,
        };
      }).sort((a, b) => {
        return a.index - b.index;
      });
    },
  })
};
</script>

<style>
</style>
