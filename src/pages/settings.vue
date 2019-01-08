<template>
  <layout>
    <b-card title="iCloud Sync">
      <cloud-kit/>
    </b-card>
  </layout>
</template>

<script>
import Layout from '../layouts/default';
import CloudKit from '../components/cloud-kit.vue';

export default {
  name: 'settings',
  components: {
    Layout,
    CloudKit,
  },
};
</script>

<style>
</style>
