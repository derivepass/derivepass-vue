<template>
  <b-navbar class="m-navbar" toggleable="md" type="dark" variant="info">
    <b-navbar-brand to="/">
      DerivePass
    </b-navbar-brand>

    <b-navbar-nav>
      <b-nav-item to="/master">Master Password</b-nav-item>
      <b-nav-item to="/applications" v-if="$store.getters.showApps">
        Applications
      </b-nav-item>
      <b-nav-item to="/settings">Settings</b-nav-item>
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

.m-navbar {
  margin-bottom: 16px;
}
</style>
