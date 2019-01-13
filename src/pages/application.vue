<template>
  <div>
    <template v-if="isNew">
      <h3>New Application</h3>
    </template>
    <template v-else>
      <div class="mb-2 application-name w-100">
        <b>{{app.domain}}</b>/{{app.login}}
      </div>
    </template>

    <div class="d-flex flex-column flex-lg-row application-buttons">
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
        {{ computing ? 'Computing Password' : 'Compute Password' }}
      </b-button>
      <b-button @click="showDetails = !showDetails" variant="link">Edit</b-button>
      <b-button @click="$router.go(-1)" variant="link">Back</b-button>
    </div>

    <computing :active="computing" text="Computing secure password..."/>

    <b-collapse class="mt-3" id="application-details" v-model="showDetails">
      <b-form @submit.prevent="onSave" autocomplete="off">
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
          <b-button
            type="submit"
            variant="primary"
            :disabled="!hasChanged || !canSubmit">
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
  </div>
</template>

<script>
import bButton from 'bootstrap-vue/es/components/button/button';
import bButtonGroup from 'bootstrap-vue/es/components/button-group/button-group';
import bCollapse from 'bootstrap-vue/es/components/collapse/collapse';
import bForm from 'bootstrap-vue/es/components/form/form';
import bFormGroup from 'bootstrap-vue/es/components/form-group/form-group';
import bFormInput from 'bootstrap-vue/es/components/form-input/form-input';
import bModal from 'bootstrap-vue/es/components/modal/modal';
import bModalDirective from 'bootstrap-vue/es/directives/modal/modal';

import Computing from '../components/computing';
import { decryptApp, encryptApp } from '../utils/crypto';

export default {
  name: 'application',
  components: {
    bCollapse, bModal, bButton, bButtonGroup, bForm,
    bFormGroup, bFormInput,

    Computing,
  },
  directives: {
    bModal: bModalDirective,
  },

  data() {
    const uuid = this.$route.params.uuid;

    let app = this.$store.state.applications.find((app) => app.uuid === uuid);
    let isNew;
    if (app && this.$store.getters.isLoggedIn) {
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
    // Redirect to master password if not ready
    if (!this.$store.getters.isLoggedIn) {
      this.$router.replace('/');
    }
  },

  computed: {
    domainState() {
      return this.invalidDomainFeedback === null;
    },
    invalidDomainFeedback() {
      const domain = this.app.domain;
      if (domain.length === 0) {
        return 'Domain can\'t be empty';
      }

      if (/^(www\.|\w+:\/\/)/.test(domain)) {
        return 'Domain should not start with `www.`, `http://`, or any other ' +
          '`schema://`';
      }

      if (/^\s+|\s+$/.test(domain)) {
        return 'Domain should not start or end with whitespace';
      }

      return null;
    },
    loginState() {
      return this.invalidLoginFeedback === null;
    },
    invalidLoginFeedback() {
      const login = this.app.login;
      if (login.length === 0) {
        return 'Login can\'t be empty';
      }

      if (/^\s+|\s+$/.test(login)) {
        return 'Login should not start or end with whitespace';
      }

      return null;
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
    },
    canSubmit() {
      return this.domainState && this.loginState;
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

      this.$copyText(this.password);
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

<style scoped>
.application-name {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  font-size: 1.75rem;
}

.application-buttons button {
  display: block;
}
</style>
