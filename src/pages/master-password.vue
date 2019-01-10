<template>
  <layout>
    <b-form
      @submit.prevent="onSubmit"
      @reset.prevent="onReset"
      autocomplete="off">
      <b-form-group>
        <div class="emoji-hash text-center">
          {{emojiHash}}
        </div>
      </b-form-group>
      <b-form-group
        v-if="!isConfirming"
        label="Enter your Master Password"
        label-for="master-input"
        description="The Master Password is used for storage decryption and website password derivation"
        :invalid-feedback="invalidFeedback"
        :state="state">
        <b-form-input
          autocomplete="off"
          required
          :disabled="computing"
          id="master-input"
          type="password"
          v-model="password"/>
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
          id="master-confirmation"
          type="password"
          v-model="confirmPassword"/>
      </b-form-group>

      <b-button
        :disabled="computing"
        type="submit"
        variant="primary">{{submitText}}</b-button>
      <b-button
        v-if="isConfirming"
        type="reset"
        variant="danger">Reset</b-button>
    </b-form>

    <computing
      :active="computing"
      text="Decryption keys are being computed..."/>
  </layout>
</template>

<script>
import { mapState } from 'vuex';

import Layout from '../layouts/default';
import Computing from '../components/computing';
import emojiHash from '../utils/emoji-hash';

export default {
  name: 'master-password',
  components: { Layout, Computing },

  data() {
    return {
      password: '',
      isConfirming: false,
      confirmPassword: '',
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
    }),
    emojiHash() {
      return emojiHash(this.password);
    },

    submitText() {
      return this.hasApps ? 'Submit' : 'Confirm';
    },

    // Form field validation

    state() {
      return this.password.length !== 0;
    },
    invalidFeedback() {
      if (this.password.length === 0) {
        return 'Master Password can\'t be empty';
      } else {
        return '';
      }
    },

    confirmState() {
      return this.password === this.confirmPassword;
    },
    invalidConfirmFeedback() {
      if (this.confirmPassword.length === 0) {
        return '';
      } else if (this.confirmPassword !== this.password) {
        return 'Password and confirmation should match';
      } else {
        return '';
      }
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
        });

        // TODO(indutny): reset password after timeout
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
