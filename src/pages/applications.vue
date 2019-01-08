<template>
  <layout>
    <b-form-input v-model="filter" placeholder="Filter applications"/>
    <b-table hover :items="applications"/>
  </layout>
</template>

<script>
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

  computed: {
    applications() {
      return this.$store.state.applications.map((app) => {
        return app;
      });
    },
  }
};
</script>

<style>
</style>
