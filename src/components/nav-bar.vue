<template>
  <b-navbar class="mb-3" toggleable="md">
    <b-navbar-brand to="/">
      <img src="../assets/logo.svg" class="logo"/>
    </b-navbar-brand>

    <b-navbar-toggle target="m-main-nav"/>

    <b-collapse is-nav id="m-main-nav">
      <b-navbar-nav>
        <b-nav-item to="/master">Master Password</b-nav-item>
        <b-nav-item to="/applications" v-if="$store.getters.showApps">
          Applications
        </b-nav-item>
        <b-nav-item to="/settings">Settings</b-nav-item>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>

<script>
export default {
  name: 'nav-bar',
};
</script>

<style scoped>
.logo {
  width: 2rem;
  height: 2rem;
}
</style>
