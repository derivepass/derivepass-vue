<template>
  <layout>
    <master-password v-model="password"/>
  </layout>
</template>

<script>
import Layout from '../layouts/default';
import MasterPassword from '../components/master-password';

export default {
  name: 'index',
  data: () => {
    return { password: '' };
  },
  components: {
    Layout,
    MasterPassword,
  }
};
</script>

<style>
</style>
