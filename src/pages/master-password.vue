<template>
  <layout>
    <b-form @submit="onSubmit" @reset="onReset" autocomplete="off">
      <b-form-group>
        <div class="emoji-hash">
          {{emojiHash}}
        </div>
      </b-form-group>
      <b-form-group
        label="Enter your Master Password"
        label-for="master-password-input"
        description="The Master Password is used for storage decryption and website password derivation"
        :invalid-feedback="invalidFeedback"
        :state="state">
        <b-form-input
          id="master-password-input"
          type="password"
          v-model="password"/>
      </b-form-group>
      <b-form-group
        v-if="isConfirming"
        label="Confirm your Master Password"
        label-for="master-password-confirmation"
        :invalid-feedback="invalidConfirmFeedback"
        :state="confirmState">
        <b-form-input
          id="master-password-confirmation"
          type="password"
          v-model="confirmPassword"/>
      </b-form-group>
      <b-button type="submit" variant="primary">{{submitText}}</b-button>
    </b-form>
  </layout>
</template>

<script>
import { mapState } from 'vuex';

import Layout from '../layouts/default';
import emojiHash from '../utils/emoji-hash';

export default {
  name: 'master-password',
  components: { Layout },

  data() {
    return { password: '', isConfirming: false, confirmPassword: '' };
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
        return 'Please enter something';
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

      // TODO(indutny): scrypt-generate AES key
      this.$store.commit('setAESKey', {
        aesKey: this.password,
        emoji: emoji,
      });

      // TODO(indutny): reset password after timeout
      this.$router.push('/applications');
    },

    onReset() {
      this.password = '';
    }
  }
};
</script>

<style scoped>
.emoji-hash {
  font-size: 48px;
}
</style>
