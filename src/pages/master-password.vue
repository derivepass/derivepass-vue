<i18n>
{
  "en": {
    "master": {
      "description": "Used for decrypting storage and computing passwords",
      "label": {
        "new": "Choose your Master Password",
        "existing": "Enter your Master Password"
      },
      "feedback": {
        "empty": "Master Password can't be empty"
      }
    },
    "confirm": {
      "label": "Confirm your Master Password",
      "feedback": {
        "almost": "Just a few more characters...",
        "no-match": "Password and confirmation should match"
      }
    },
    "computing": "Computing decryption keys..."
  },
  "ru": {
    "master": {
      "description": "Используется для расшифровки хранилища и генерации паролей",
      "label": {
        "new": "Выберите ваш Мастер Пароль",
        "existing": "Введите ваш Мастер Пароль"
      },
      "feedback": {
        "empty": "Мастер Пароль не может быть пустым"
      }
    },
    "confirm": {
      "label": "Подтвердите ваш Мастер Пароль",
      "feedback": {
        "almost": "Еще немного символов...",
        "no-match": "Пароль и подтверждение должны быть одинаковыми"
      }
    },
    "computing": "Генерируем криптографические ключи..."
  },
  "ca": {
    "master": {
      "description": "Emprat per desencriptar l'emmagatzematge i per computar les contrasenyes",
      "label": {
        "new": "Escull la teva Contrasenya Mestre",
        "existing": "Introdueix la teva Contrasenya Mestre"
      },
      "feedback": {
        "empty": "La Contrasenya Mestre no pot ser buida"
      }
    },
    "confirm": {
      "label": "Confirma la teva Contrasenya Mestre",
      "feedback": {
        "almost": "Va, uns pocs caràcters més...",
        "no-match": "La contrasenya i la confirmació han de coincidir"
      }
    },
    "computing": "Computant claus de desxifratge..."
  }
}
</i18n>

<template>
  <div>
    <b-alert v-if="error" show dismissable variant="danger">
      {{ error.tag ? $root.$t(error.tag, error.extra) : error.message }}
      <b-button @click="error = undefined">
        {{ $root.$t('button.dismiss') }}
      </b-button>
    </b-alert>

    <b-form
      @submit.prevent="onSubmit"
      @reset.prevent="onReset"
      autocomplete="off">
      <b-form-group v-if="newUser && tutorialState !== 'hide'">
        <tutorial :state="tutorialState"/>
      </b-form-group>
      <b-form-group>
        <div v-if="!newUser || !!password" :class="emojiClass" id="emoji">
          {{emoji}}
        </div>
      </b-form-group>
      <template v-if="!isConfirming">
        <b-form-group
          v-if="!isConfirming"
          :label="masterLabel"
          label-for="master-input"
          :description="$t('master.description')"
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
          :label="$t('confirm.label')"
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
        variant="danger">{{ $root.$t('button.reset') }}</b-button>
    </b-form>

    <computing
      :active="computing"
      :text="$t('computing')"/>
  </div>
</template>

<script>
import Vue from 'vue';
import { mapState, mapGetters } from 'vuex';

import bAlert from 'bootstrap-vue/es/components/alert/alert';
import bButton from 'bootstrap-vue/es/components/button/button';
import bForm from 'bootstrap-vue/es/components/form/form';
import bFormGroup from 'bootstrap-vue/es/components/form-group/form-group';
import bFormInput from 'bootstrap-vue/es/components/form-input/form-input';

import Computing from '../components/computing';
import Tutorial from '../components/tutorial';
import emojiHash from '../utils/emoji-hash';

const LOGOUT_TIMEOUT = 3 * 60 * 1000; // 3 minutes of total inactivity

export default {
  name: 'master-password',
  components: {
    bAlert, bButton, bForm, bFormGroup, bFormInput,
    Computing, Tutorial,
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
    }),

    ...mapGetters([ 'newUser' ]),

    emoji() {
      return emojiHash(this.password);
    },

    emojiClass() {
      return 'emoji-hash text-center ' +
        (this.isConfirming ? 'emoji-hash-gray' : '');
    },

    emojiConfirm() {
      return emojiHash(this.confirmPassword);
    },

    // Tutorial
    tutorialState() {
      if (this.computing) {
        return 'hide';
      }

      if (!this.password) {
        return 'master.empty';
      }

      if (this.isConfirming) {
        if (this.canSubmit) {
          return 'master.submit';
        } else {
          return 'master.confirm';
        }
      }

      return 'master.password';
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
        return this.$t('master.feedback.empty');
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
        return this.$t('confirm.feedback.almost');
      } else if (this.confirmPassword !== this.password) {
        return this.$t('confirm.feedback.no-match');
      } else {
        return '';
      }
    },

    masterLabel() {
      return this.newUser ?
        this.$t('master.label.new') :
        this.$t('master.label.existing');
    },

    submitText() {
      if (this.isConfirming) {
        return this.$root.$t('button.start');
      }

      if (this.hasApps) {
        return this.$root.$t('button.decrypt');
      }

      return this.$root.$t('button.next');
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
        if (!this.canSubmit) {
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

      this.$store.state.derivepass.computeKeys(this.password).then((keys) => {
        return this.$store.dispatch('setCryptoKeys', {
          master: this.password,
          crypto: keys,
          emoji: emoji,
        });
      }).then(() => {
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
  transition: filter 0.25s;
}

.emoji-hash-gray {
  filter: grayscale(25%) blur(1px);
}
</style>
