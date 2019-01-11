<template>
  <b-card title="iCloud Sync">
    <cloud-kit/>
  </b-card>
</template>

<script>
import bCard from 'bootstrap-vue/es/components/card/card';

import CloudKit from '../components/cloud-kit.vue';

export default {
  name: 'settings',
  components: {
    bCard,
    CloudKit,
  },
};
</script>

<style>
</style>
