 <template>
  <b-navbar class="mb-3" toggleable="md">
    <b-navbar-brand to="/">
      <img src="../assets/logo.svg" :class="['logo', secureLogo]"/>
    </b-navbar-brand>

    <b-navbar-toggle target="m-main-nav"/>

    <b-collapse is-nav id="m-main-nav">
      <b-navbar-nav>
        <template v-if="$store.getters.showApps">
          <b-nav-item to="/master" @click="$store.commit('resetCryptoKeys')">
            Logout
          </b-nav-item>
          <b-nav-item to="/applications" v-if="$store.getters.showApps">
            Applications
          </b-nav-item>
        </template>
        <template v-else>
          <b-nav-item to="/master">Master Password</b-nav-item>
        </template>
        <b-nav-item to="/settings">Settings</b-nav-item>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>

<script>
export default {
  name: 'nav-bar',

  computed: {
    secureLogo() {
      return this.$store.getters.showApps ? 'secure' : '';
    }
  }
};
</script>

<style scoped>
.logo {
  width: 2rem;
  height: 2rem;
  background: rgba(0,0,0,0.9);
  transition: background 0.8s;
}

.logo.secure {
  background: rgb(18,188,0);
}
</style>
