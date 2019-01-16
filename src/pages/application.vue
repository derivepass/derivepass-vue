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
        :disabled="!isValidApp"
        @click="compute()">
        {{ computing ? 'Computing Password' : 'Compute Password' }}
      </b-button>
      <b-button @click="showDetails = !showDetails" variant="link">Edit</b-button>
      <b-button @click="$router.go(-1)" variant="link">Back</b-button>
    </div>

    <computing :active="computing" text="Computing secure password..."/>

    <b-collapse class="py-3" id="application-details" v-model="showDetails">
      <b-form @submit.prevent="onSave" autocomplete="off">
        <b-form-group
          label="Domain name"
          label-for="application-domain"
          description="Examples: google.com, fb.com, etc"
          :invalid-feedback="invalidDomainFeedback"
          :state="domainState">
          <b-form-input
            required
            :state="domainState ? null : 'invalid'"
            id="application-domain"
            v-model="app.domain"
            placeholder="google.com"
            @input="onChange"/>
        </b-form-group>

        <b-alert :show="hasPreset" variant="warning" dismissible>
          <p>
            <b>Recommended</b> configuration is available for this domain.
          </p>
          <p class="text-danger" v-if="!isNew">
            <b>Warning</b>:
            Changing configuration for an existing app will change
            computed password. Consider computing and copying current password
            before making a change.
          </p>
          <b-button variant="warning" @click.prevent="usePreset">Use</b-button>
        </b-alert>

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
            @input="onChange"/>
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
            @input="onChange"/>
        </b-form-group>

        <b-form-group>
          <b-button
            v-b-toggle.application-options
            variant="outline-danger">
            Extra Options
          </b-button>
        </b-form-group>

        <b-collapse id="application-options">
          <p class="text-danger">
            <i>Most websites do not require editing options below</i>
          </p>

          <b-form-group
            label="Allowed characters"
            label-for="application-allowed-chars"
            description="Characters that CAN be present in the password"
            :invalid-feedback="invalidAllowedFeedback"
            :state="allowedState">
            <b-form-input
              required
              id="application-allowed-chars"
              v-model="app.options.allowed"
              :state="allowedState ? null : 'invalid'"
              @input="onChange"/>
          </b-form-group>

          <b-form-group
            label="Required characters"
            label-for="application-required-chars"
            description="Characters that MUST be present in the password"
            :invalid-feedback="invalidRequiredFeedback"
            :state="requiredState">
            <b-form-input
              id="application-required-chars"
              v-model="app.options.required"
              :state="requiredState ? null : 'invalid'"
              @input="onChange"/>
          </b-form-group>

          <b-form-group
            label="Password length"
            label-for="application-max-length"
            :invalid-feedback="invalidLengthFeedback"
            :state="lengthState">
            <b-form-input
              required
              type="number"
              id="application-max-length"
              v-model="app.options.maxLength"
              :state="lengthState ? null : 'invalid'"
              @input="onChange"/>
          </b-form-group>
        </b-collapse>

        <!-- buttons -->

        <b-button-group class="text-right">
          <b-button
            type="submit"
            variant="primary"
            :disabled="!hasChanged || !isValidApp">
            {{ saved ? 'Saved' : 'Save' }}
          </b-button>
          <b-button @click.prevent="onReset()">
            Reset
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
import bAlert from 'bootstrap-vue/es/components/alert/alert';
import bButton from 'bootstrap-vue/es/components/button/button';
import bButtonGroup from 'bootstrap-vue/es/components/button-group/button-group';
import bCollapse from 'bootstrap-vue/es/components/collapse/collapse';
import bToggleDirective from 'bootstrap-vue/es/directives/toggle/toggle';
import bForm from 'bootstrap-vue/es/components/form/form';
import bFormGroup from 'bootstrap-vue/es/components/form-group/form-group';
import bFormInput from 'bootstrap-vue/es/components/form-input/form-input';
import bModal from 'bootstrap-vue/es/components/modal/modal';
import bModalDirective from 'bootstrap-vue/es/directives/modal/modal';

import Computing from '../components/computing';
import { decryptApp, encryptApp, passwordEntropyBits } from '../utils/crypto';
import {
  parseAppOptions, flattenRange, DEFAULT_APP_OPTIONS,
} from '../utils/common';
import PRESETS from '../presets';

const MIN_ENTROPY = 64;

const isSameOptions = (a, b) => {
  return a.allowed === b.allowed &&
    a.required === b.required &&
    a.maxLength === b.maxLength;
};

const cloneApp = (app, into) => {
  return Object.assign(into || {}, app, {
    options: Object.assign({}, app.options),
  });
};

export default {
  name: 'application',
  components: {
    bCollapse, bModal, bButton, bButtonGroup, bForm,
    bFormGroup, bFormInput, bAlert,

    Computing,
  },
  directives: {
    bToggle: bToggleDirective,
    bModal: bModalDirective,
  },

  data() {
    const uuid = this.$route.params.uuid;

    const defaultOptions = Object.assign({}, DEFAULT_APP_OPTIONS);

    let app = this.$store.state.applications.find((app) => app.uuid === uuid);
    let isNew;
    if (app && this.$store.getters.isLoggedIn) {
      isNew = false;
      app = decryptApp(app, this.$store.state.cryptoKeys);

      // Migrate old records
      if (!app.options) {
        app = Object.assign({}, app, { options: defaultOptions });
      }
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

        options: defaultOptions,
      };
    }

    // Nothing we can do to restore the app
    if (app.removed) {
      this.$router.replace('/');
    }

    return {
      app,
      savedApp: cloneApp(app),
      isNew,

      // General state

      showDetails: isNew,
      copied: false,
      saved: false,
      computing: false,
      password: '',
      presetDomain: null,
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

      if (/[A-Z]/.test(domain)) {
        return 'Domain should be lower-case';
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
    allowedState() {
      return this.invalidAllowedFeedback === null;
    },
    invalidAllowedFeedback() {
      const allowed = this.app.options.allowed;
      if (allowed.length === 0) {
        return 'Can\'t be empty';
      }

      try {
        flattenRange(allowed);
      } catch (e) {
        return e.message;
      }
      return null;
    },
    requiredState() {
      return this.invalidRequiredFeedback === null;
    },
    invalidRequiredFeedback() {
      const required = this.app.options.required;
      try {
        flattenRange(required);
      } catch (e) {
        return e.message;
      }
      return null;
    },
    lengthState() {
      return this.invalidLengthFeedback === null;
    },
    invalidLengthFeedback() {
      if (this.app.options.maxLength <= 1) {
        return 'Must be greater than 1';
      }

      const required = flattenRange(this.app.options.required);
      if (this.app.options.maxLength < required.length) {
        return `Minimum length is ${required.length}`;
      }

      let parsedOptions;
      try {
        parsedOptions = parseAppOptions(this.app.options);
      } catch (e) {
        // Invalid ranges
        return null;
      }

      const bits = passwordEntropyBits(parsedOptions);
      if (bits < MIN_ENTROPY) {
        return `Password is not strong enough. ` +
          `Please increase length, or add more allowed characters`;
      }

      return null;
    },

    isValidApp() {
      return this.domainState && this.loginState && this.revisionState &&
        this.allowedState && this.requiredState && this.lengthState;
    },
    hasChanged() {
      if (this.app.domain !== this.savedApp.domain ||
          this.app.login !== this.savedApp.login ||
          this.app.revision !== this.savedApp.revision) {
        return true;
      }

      return !isSameOptions(this.app.options, this.savedApp.options);
    },

    hasPreset() {
      if (!PRESETS.has(this.app.domain)) {
        return false;
      }

      const preset = PRESETS.get(this.app.domain);
      if (preset.domain !== this.app.domain) {
        return true;
      }

      const options = preset.options;
      const appOptions = this.app.options;

      if (options.allowed !== appOptions.allowed) {
        return true;
      }

      if (options.required !== appOptions.required) {
        return true;
      }

      if (options.maxLength !== appOptions.maxLength) {
        return true;
      }

      return false;
    },
  },

  methods: {
    usePreset() {
      if (!PRESETS.has(this.app.domain)) {
        return;
      }

      const preset = PRESETS.get(this.app.domain);
      this.app.domain = preset.domain;
      this.presetDomain = preset.domain;

      const options = preset.options;
      const appOptions = this.app.options;

      appOptions.allowed = options.allowed;
      appOptions.required = options.required;
      appOptions.maxLength = options.maxLength;
    },

    compute() {
      this.computing = true;

      const app = this.app;

      const master = this.$store.state.master;
      let domain = `${app.domain}/${app.login}`;
      if (app.revision > 1) {
        domain += `#${app.revision}`;
      }

      const isLegacy = isSameOptions(app.options, DEFAULT_APP_OPTIONS);

      let promise;
      if (isLegacy) {
        promise = this.$derivepass.computeLegacyPassword(master, domain);
      } else {
        promise = this.$derivepass.computePassword(master, domain,
          parseAppOptions(app.options));
      }

      promise.then((password) => {
        this.password = password;
      }).catch((err) => {
        this.error = err;
      }).finally(() => {
        this.computing = false;
      });
    },
    onChange() {
      // Reset password
      this.password = '';
      this.copied = false;
      this.saved = false;

      if (this.presetDomain && this.app.domain !== this.presetDomain) {
        this.app.options = Object.assign({}, this.savedApp.options);
      }
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

      cloneApp(this.app, this.savedApp);
      this.saved = true;
      setTimeout(() => this.saved = false, 2500);
    },
    onReset() {
      cloneApp(this.savedApp, this.app);
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
