<template>
  <div class="text-center">
    <cloud-kit class="mb-2"/>
    <qr/>
  </div>
</template>

<script>
import CloudKit from '../components/cloud-kit.vue';
import Qr from '../components/qr.vue';

export default {
  name: 'settings',
  components: { CloudKit, Qr },
};
</script>

<style>
</style>
