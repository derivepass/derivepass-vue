<template>
  <div class="text-center">
    <qr-duplex class="mb-2"/>
    <cloud-kit class="mb-2"/>
    <qr-feed/>
  </div>
</template>

<script>
import CloudKit from '../components/cloud-kit.vue';
import QrFeed from '../components/qr-feed.vue';
import QrDuplex from '../components/qr-duplex.vue';

export default {
  name: 'settings',
  components: { CloudKit, QrFeed, QrDuplex },
};
</script>

<style>
</style>
