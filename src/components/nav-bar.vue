 <template>
  <b-navbar class="mb-3" toggleable="md">
    <b-navbar-brand :to="$store.getters.showApps ? '/applications' : '/'">
      <img
        src="../assets/logo.svg"
        @load="isLogoVisible=true"
        :class="['logo', secureLogo, visibleLogo]"/>
    </b-navbar-brand>

    <b-navbar-toggle target="m-main-nav"/>

    <b-collapse is-nav id="m-main-nav">
      <b-navbar-nav>
        <template v-if="$store.getters.showApps">
          <b-nav-item to="/applications" v-if="$store.getters.showApps">
            Applications
          </b-nav-item>
        </template>
        <template v-else>
          <b-nav-item to="/master">Master Password</b-nav-item>
        </template>
        <b-nav-item to="/settings">Settings</b-nav-item>
        <template v-if="$store.getters.showApps">
          <b-nav-item to="/master">
            Logout
          </b-nav-item>
        </template>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>

<script>
import bCollapse from 'bootstrap-vue/es/components/collapse/collapse';
import bNavItem from 'bootstrap-vue/es/components/nav/nav-item';
import bNavbar from 'bootstrap-vue/es/components/navbar/navbar';
import bNavbarBrand from 'bootstrap-vue/es/components/navbar/navbar-brand';
import bNavbarNav from 'bootstrap-vue/es/components/navbar/navbar-nav';
import bNavbarToggle from 'bootstrap-vue/es/components/navbar/navbar-toggle';

export default {
  name: 'nav-bar',
  components: {
    bNavbar, bNavbarBrand, bNavbarToggle, bNavbarNav, bNavItem, bCollapse,
  },

  data() { return { isLogoVisible: false }; },

  computed: {
    visibleLogo() {
      return this.isLogoVisible ? 'visible' : '';
    },
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
}

.logo.visible {
  background: rgba(0,0,0,0.9);
  transition: background 0.8s;
}

.logo.secure {
  background: rgb(18,188,0);
}
</style>
