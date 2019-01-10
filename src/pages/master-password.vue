<template>
  <div>
    <b-form
      @submit.prevent="onSubmit"
      @reset.prevent="onReset"
      autocomplete="off">
      <b-form-group>
        <div class="emoji-hash text-center">
          {{emojiHash}}
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
            {{emojiConfirmHash}}
          </div>
        </b-form-group>
        <b-form-group
          v-if="isConfirming"
          label="Confirm your Master Password"
          label-for="master-confirmation"
          :invalid-feedback="invalidConfirmFeedback"
          :state="confirmState">
          <b-form-input
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
      text="Decryption keys are being computed..."/>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import Computing from '../components/computing';
import emojiHash from '../utils/emoji-hash';

const LOGOUT_TIMEOUT = 90000; // 90 seconds

export default {
  name: 'master-password',
  components: { Computing },

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
        const emoji = this.emojiHash;
        return apps.some((app) => app.master === emoji);
      },
      newUser(state) {
        return state.applications.length === 0;
      }
    }),

    emojiHash() {
      return emojiHash(this.password);
    },

    emojiConfirmHash() {
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
      if (this.confirmPassword.length === 0) {
        return '';
      } else if (this.password.startsWith(this.confirmPassword)) {
        return 'Just few more...';
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
      if (this.newUser && (this.isConfirming || !this.passwordChanged)) {
        return 'Start';
      }

      if (this.hasApps || !this.passwordChanged || this.isConfirming) {
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

  watch: {
    password() {
      // Any password change should reset confirming state
      this.isConfirming = false;
    }
  },

  methods: {
    onSubmit() {
      const emoji = this.emojiHash;

      if (this.isConfirming) {
        if (!this.confirmState) {
          // Confirmation doesn't match
          return;
        }

      } else {
        if (!this.hasApps) {
          // No known apps, needs confirmation
          this.isConfirming = true;
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
          logoutTimer: setTimeout(() => {
            this.$store.commit('resetCryptoKeys');
            this.$router.replace('/master');
          }, LOGOUT_TIMEOUT),
        });

        this.$router.push('/applications');
      }).catch((err) => {
        this.error = err;
      }).finally(() => {
        this.computing = false;
      });
    },

    onReset() {
      this.password = '';
    },
  }
};
</script>

<style scoped>
.emoji-hash {
  font-size: 48px;
}
</style>
