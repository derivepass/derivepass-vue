<template>
  <layout>
    <div class="text-center">
      <h3>{{app.domain}}</h3>
      <p><i>{{app.login}}</i></p>
      <b-alert
        fade
        variant="success"
        :show="copied">
        Password copied to Clipboard
      </b-alert>
      <b-button-group>
        <b-button
          v-if="password"
          variant="primary"
          @click="copyPassword">
          Copy Password
        </b-button>
        <b-button
          v-else
          variant="primary"
          @click="compute()">
          Compute Password
        </b-button>
        <b-button v-b-toggle.application-collapse>Details</b-button>
      </b-button-group>
    </div>

    <computing :active="computing" text="Computing secure password"/>

    <b-collapse id="application-collapse" class="mt-3">
      <b-form @submit="onSubmit" autocomplete="off">
        <b-form-group
          label="Domain name"
          label-for="application-domain"
          description="Examples: gmail.com, fb.com, etc"
          :invalid-feedback="invalidDomainFeedback"
          :state="domainState">
          <b-form-input
            required
            :state="domainState ? null : 'invalid'"
            id="application-domain"
            v-model="app.domain"
            @input="resetPassword"/>
        </b-form-group>
        <b-form-group
          label="Login"
          label-for="application-login"
          description="Examples: my_user_name, derivepass82"
          :invalid-feedback="invalidLoginFeedback"
          :state="loginState">
          <b-form-input
            required
            :state="loginState ? null : 'invalid'"
            id="application-login"
            v-model="app.login"
            @input="resetPassword"/>
        </b-form-group>
        <b-form-group
          label="Revision"
          label-for="application-revision"
          description="Increment this by one to change password"
          :invalid-feedback="invalidRevisionFeedback"
          :state="revisionState">
          <b-form-input
            required
            :state="revisionState ? null : 'invalid'"
            type="number"
            id="application-revision"
            v-model="app.revision"
            @input="resetPassword"/>
        </b-form-group>
        <b-button-group class="text-right">
          <b-button>Save</b-button>
          <b-button variant="danger">Delete</b-button>
        </b-button-group>
      </b-form>
    </b-collapse>
  </layout>
</template>

<script>
import Layout from '../layouts/default';
import Computing from '../components/computing';
import { decryptApp } from '../utils/crypto';

export default {
  name: 'application',
  components: { Layout, Computing },
  data() {
    return {
      app: { domain: '', login: '', revision: 1, new: true },
      copied: false,
      computing: false,
      password: '',
    };
  },

  beforeMount() {
    // Redirect to master password when not ready
    if (!this.$store.getters.showApps) {
      return this.$router.replace('/');
    }

    const uuid = this.$route.params.uuid;

    const app = this.$store.state.applications.find((app) => app.uuid === uuid);
    Object.assign(this.app, decryptApp(app, this.$store.state.cryptoKeys), {
      new: false,
    });
  },

  computed: {
    domainState() {
      return this.app.domain.length !== 0;
    },
    invalidDomainFeedback() {
      return 'Domain can\'t be empty';
    },
    loginState() {
      return this.app.login.length !== 0;
    },
    invalidLoginFeedback() {
      return 'Login can\'t be empty';
    },
    revisionState() {
      return this.app.revision > 0;
    },
    invalidRevisionFeedback() {
      return 'Revision must be greater than zero';
    },
  },

  methods: {
    compute() {
      this.computing = true;

      const master = this.$store.state.master;
      let domain = `${this.app.domain}/${this.app.login}`;
      if (this.app.revision > 1) {
        domain += `#${this.app.revision}`;
      }

      this.$derivepass.computePassword(master, domain).then((password) => {
        this.password = password;
      }).catch((err) => {
        this.error = err;
      }).finally(() => {
        this.computing = false;
      });
    },
    resetPassword() {
      this.password = '';
      this.copied = false;
    },
    copyPassword() {
      if (this.copied) {
        return;
      }

      this.copied = true;
      setTimeout(() => this.copied = false, 2500);
      this.$copyText(this.password);
    },
    onSubmit() {
    }
  }
};
</script>
