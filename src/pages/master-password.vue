<template>
  <div>
    <b-form
      @submit.prevent="onSubmit"
      @reset.prevent="onReset"
      autocomplete="off">
      <b-form-group>
        <div class="emoji-hash text-center">
          {{emoji}}
        </div>
      </b-form-group>
      <template v-if="!isConfirming">
        <b-form-group
          v-if="!isConfirming"
          :label="masterLabel"
          label-for="master-input"
          description="Used for decrypting storage and computing passwords"
          :invalid-feedback="invalidPasswordFeedback"
          :state="passwordState">
          <b-form-input
            ref="passwordRef"
            autocomplete="off"
            required
            :disabled="computing"
            :state="passwordState"
            id="master-input"
            type="password"
            @input="passwordChanged = true"
            v-model="password"/>
        </b-form-group>
      </template>
      <template v-else>
        <b-form-group>
          <div class="emoji-hash text-center">
            {{emojiConfirm}}
          </div>
        </b-form-group>
        <b-form-group
          v-if="isConfirming"
          label="Confirm your Master Password"
          label-for="master-confirmation"
          :invalid-feedback="invalidConfirmFeedback"
          :state="confirmState">
          <b-form-input
            ref="confirmRef"
            autocomplete="off"
            :disabled="computing"
            :state="confirmState"
            id="master-confirmation"
            type="password"
            @input="confirmChanged = true"
            v-model="confirmPassword"/>
        </b-form-group>
      </template>

      <b-button
        :disabled="computing || !canSubmit"
        type="submit"
        variant="primary">
        {{submitText}}
      </b-button>
      <b-button
        class="ml-2"
        v-if="isConfirming"
        type="reset"
        variant="danger">Reset</b-button>
    </b-form>

    <computing
      :active="computing"
      text="Computing decryption keys..."/>
  </div>
</template>

<script>
import Vue from 'vue';
import { mapState } from 'vuex';

import bButton from 'bootstrap-vue/es/components/button/button';
import bForm from 'bootstrap-vue/es/components/form/form';
import bFormGroup from 'bootstrap-vue/es/components/form-group/form-group';
import bFormInput from 'bootstrap-vue/es/components/form-input/form-input';

import Computing from '../components/computing';
import emojiHash from '../utils/emoji-hash';

const LOGOUT_TIMEOUT = 3 * 60 * 1000; // 3 minutes of total inactivity

export default {
  name: 'master-password',
  components: {
    bButton, bForm, bFormGroup, bFormInput,
    Computing,
  },

  data() {
    return {
      password: '',
      passwordChanged: false,

      isConfirming: false,
      confirmPassword: '',
      confirmChanged: false,

      computing: false,
      error: null,
    };
  },

  computed: {
    ...mapState({
      hasApps(state) {
        const apps = state.applications;
        const emoji = this.emoji;
        return apps.some((app) => app.master === emoji);
      },
      newUser(state) {
        return state.applications.length === 0;
      }
    }),

    emoji() {
      return emojiHash(this.password);
    },

    emojiConfirm() {
      return emojiHash(this.confirmPassword);
    },

    // Form field validation

    passwordState() {
      if (!this.passwordChanged) {
        return null;
      }
      return this.password.length !== 0 ? 'valid' : 'invalid';
    },
    invalidPasswordFeedback() {
      if (this.password.length === 0) {
        return 'Master Password can\'t be empty';
      } else {
        return '';
      }
    },

    confirmState() {
      if (!this.confirmChanged) {
        return null;
      }
      return this.password === this.confirmPassword ? 'valid' : 'invalid';
    },
    invalidConfirmFeedback() {
      if (this.confirmPassword.length !== 0 &&
          this.password.startsWith(this.confirmPassword)) {
        return 'Just a few more characters...';
      } else if (this.confirmPassword !== this.password) {
        return 'Password and confirmation should match';
      } else {
        return '';
      }
    },

    masterLabel() {
      return this.newUser ?
        'Choose your Master Password' :
        'Enter your Master Password';
    },

    submitText() {
      if (this.isConfirming) {
        return 'Start';
      }

      if (this.hasApps) {
        return 'Decrypt';
      }

      return 'Next';
    },

    canSubmit() {
      if (this.passwordState !== 'valid') {
        return false;
      }

      if (this.hasApps) {
        return true;
      }

      return !this.isConfirming || this.confirmState === 'valid';
    }
  },

  methods: {
    onSubmit() {
      const emoji = this.emoji;

      if (this.isConfirming) {
        if (!this.confirmState) {
          // Confirmation doesn't match
          return;
        }

      } else {
        if (!this.hasApps) {
          // No known apps, needs confirmation
          this.isConfirming = true;
          Vue.nextTick(() => this.$refs.confirmRef.focus());
          return;
        }

        // Has known apps, submit!
      }

      this.computing = true;

      this.$derivepass.computeKeys(this.password).then((keys) => {
        this.$store.commit('setCryptoKeys', {
          master: this.password,
          crypto: keys,
          emoji: emoji,
        });

        this.$autoLogout.login(() => {
          this.$store.commit('resetCryptoKeys');

          const needRedirect = this.$route.matched.some((route) => {
            return route.meta.requiresAuth;
          });

          if (needRedirect) {
            this.$router.push('/');
          }
        }, LOGOUT_TIMEOUT);

        this.$router.push('/applications', () => {
          this.computing = false;
        });
      }).catch((err) => {
        this.error = err;
        this.computing = false;
      });
    },

    onReset() {
      this.password = '';
      this.confirmPassword = '';
      this.passwordChanged = false;
      this.confirmChanged = false;
      this.isConfirming = false;

      Vue.nextTick(() => this.$refs.passwordRef.focus());
    },
  }
};
</script>

<style scoped>
.emoji-hash {
  font-size: 48px;
  font-family: Apple Color Emoji;
}
</style>
