<template>
  <b-navbar class="m-navbar" toggleable="md" type="dark" variant="info">
    <b-navbar-brand to="/">
      Derivepass
    </b-navbar-brand>

    <b-navbar-nav>
      <b-nav-item to="/" v-if="!$store.getters['crypto/isReady']">
        Master Password
      </b-nav-item>
      <b-nav-item to="/apps" v-else>Applications</b-nav-item>
    </b-navbar-nav>
  </b-navbar>
</template>

<script>
export default {
  name: 'NavBar',
};
</script>

<style scoped>
.logo {
  width: 32px;
  height: 32px;
}
</style>
