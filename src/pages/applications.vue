<template>
  <layout>
    Apps
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
    if (!this.$store.getters['crypto/isReady']) {
      this.$router.replace('/');
    }
  }
};
</script>

<style>
</style>
