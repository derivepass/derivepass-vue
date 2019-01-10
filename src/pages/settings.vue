<template>
  <b-card title="iCloud Sync">
    <cloud-kit/>
  </b-card>
</template>

<script>
import CloudKit from '../components/cloud-kit.vue';

export default {
  name: 'settings',
  components: { CloudKit },
};
</script>

<style>
</style>
