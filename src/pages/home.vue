<template>
  <div>
    <b-container class="align-items-center">
      <b-row align-v="center" class="mb-3">
        <b-col class="col-6 mx-auto col-md-6 order-md-2">
          <img
            class="img-fluid"
            width="1024"
            height="1024"
            src="../assets/logo-fill.svg"/>
        </b-col>
        <b-col class="col-md-6 order-md-1 text-center text-md-left pr-md-5">
          <h1 class="mb-3">DerivePass</h1>

          <p class="lead">
            Compute secure passwords without storing them anywhere.
          </p>

          <b-button variant="primary" size="lg" to="/master">Start</b-button>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <p>
            Most websites online require a password on Sign Up. Using the
            same password everywhere is insecure. Using individual secure
            passwords and remembering all of them - impossible!
          </p>

          <p>
            <b>DerivePass</b> is here to help with this task! Select the
            <i>Master Password</i> once and use it to generate <b>unlimited</b>
            number of secure website passwords.
          </p>

          <p>
            Unlike traditional password managers,
            <b>DerivePass</b> never uploads neither the <i>Master Password</i>
            nor website passwords to the Cloud. The only information that is
            stored is <b>encrypted</b> website names and logins.
          </p>
        </b-col>
      </b-row>
    </b-container>

    <footer class="text-right px-1">
      <small>
        Copyright {{new Date().getFullYear()}}, Fedor Indutny
        <br/>
        <a href="https://github.com/derivepass/derivepass-vue" target="_blank">
          source code
        </a>
      </small>
    </footer>
  </div>
</template>

<script>
import bButton from 'bootstrap-vue/es/components/button/button';
import bCol from 'bootstrap-vue/es/components/layout/col';
import bContainer from 'bootstrap-vue/es/components/layout/container';
import bRow from 'bootstrap-vue/es/components/layout/row';

export default {
  name: 'home',
  components: { bButton, bCol, bContainer, bRow },
};
</script>

<style>
</style>
