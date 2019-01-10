<template>
  <layout>
    <b-container>
      <b-row align-h="center">
        <h1>
          <template v-if="isNew">New Application</template>
          <template v-else>Application</template>
        </h1>
      </b-row>
      <b-row align-v="center">
        <b-col v-if="app.domain || app.login">
          <b>{{app.domain}}</b>/<i>{{app.login}}</i>
        </b-col>
        <b-col>
          <b-button-group>
            <b-button
              v-if="password"
              variant="primary"
              @click="copyPassword">
              {{ copied ? 'Copied' : 'Copy Password' }}
            </b-button>
            <b-button
              v-else
              variant="primary"
              :disabled="isEmpty"
              @click="compute()">
              Compute Password
            </b-button>
            <b-button @click="showDetails = !showDetails">Details</b-button>
            <b-button @click="$router.go(-1)">Back</b-button>
          </b-button-group>
        </b-col>
      </b-row>
    </b-container>

    <computing :active="computing" text="Computing secure password"/>

    <b-collapse class="mt-3" id="application-details" v-model="showDetails">
      <b-form @submit="onSave" autocomplete="off">
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
            placeholder="gmail.com"
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
            placeholder="my@email.com"
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
          <b-button type="submit" variant="primary" :disabled="!hasChanged">
            {{ saved ? 'Saved' : 'Save' }}
          </b-button>
          <b-button variant="danger" v-b-modal.application-confirm-delete>
            Delete
          </b-button>
        </b-button-group>
      </b-form>
    </b-collapse>

    <b-modal
      id="application-confirm-delete"
      title="Confirm Deletion"
      ok-variant="danger"
      ok-title="Delete"
      @ok="onDelete">
      <p>This action will irreversibly delete:</p>
      <p><b>{{app.domain}}</b>/<i>{{app.login}}</i></p>
      <p>...from the application list.</p>
    </b-modal>
  </layout>
</template>

<script>
import Layout from '../layouts/default';
import Computing from '../components/computing';
import { decryptApp, encryptApp } from '../utils/crypto';

export default {
  name: 'application',
  components: { Layout, Computing },

  data() {
    const uuid = this.$route.params.uuid;

    let app = this.$store.state.applications.find((app) => app.uuid === uuid);
    let isNew;
    if (app && this.$store.getters.showApps) {
      isNew = false;
      app = decryptApp(app, this.$store.state.cryptoKeys);
    } else {
      isNew = true;
      app = {
        uuid,

        domain: '',
        login: '',
        revision: 1,

        master: this.$store.state.emoji,
        index: parseInt(this.$route.query.index, 10) || 0,
        removed: false,
        changedAt: Date.now(),
      };
    }

    // Nothing we can do to restore the app
    if (app.removed) {
      this.$router.replace('/');
    }

    return {
      app,
      savedApp: Object.assign({}, app),
      isNew,

      showDetails: isNew,
      copied: false,
      saved: false,
      computing: false,
      password: '',
    };
  },

  beforeMount() {
    // Redirect to master password when not ready
    if (!this.$store.getters.showApps) {
      this.$router.replace('/');
    }
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
    isEmpty() {
      return !this.app.domain || !this.app.login;
    },
    hasChanged() {
      return this.app.domain !== this.savedApp.domain ||
        this.app.login !== this.savedApp.login ||
        this.app.revision !== this.savedApp.revision;
    }
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
      this.saved = false;
    },
    copyPassword() {
      if (this.copied) {
        return;
      }

      this.copied = true;
      setTimeout(() => this.copied = false, 2500);
      navigator.clipboard.writeText(this.password);
    },
    onSave() {
      const app = Object.assign(
        encryptApp(this.app, this.$store.state.cryptoKeys),
        {
          changedAt: Date.now(),
        });
      this.$store.commit('receiveApp', app);

      Object.assign(this.savedApp, this.app);
      this.saved = true;
      setTimeout(() => this.saved = false, 2500);
    },
    onDelete() {
      const app = Object.assign(
        encryptApp(this.app, this.$store.state.cryptoKeys),
        {
          removed: true,
          changedAt: Date.now(),
        });
      this.$store.commit('receiveApp', app);
      this.$router.go(-1);
    }
  }
};
</script>
