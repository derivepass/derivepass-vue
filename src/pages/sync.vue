<template>
  <layout>
  Sync {{loading ? 'loading' : 'loaded'}}
  </layout>
</template>

<script>
import Layout from '../layouts/default';

export default {
  name: 'sync',
  components: {
    Layout,
  },

  data: () => {
    return { loading: true };
  },

  async mounted() {
    const CloudKit = await import('../utils/cloudkit');
    this.loading = false;
  }
};
</script>

<style>
</style>
