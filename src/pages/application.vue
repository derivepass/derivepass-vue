<i18n>
{
  "en": {
    "title": {
      "new": "New Application"
    },
    "copy": {
      "ready": "Copy Password",
      "complete": "Copied"
    },
    "compute": {
      "idle": "Compute Password",
      "running": "Computing Password"
    },
    "computing": {
      "password": "Computing secure password...",
      "app": "Encrypting application..."
    },
    "edit": "Edit",
    "back": "Back",

    "domain": {
      "label": "Domain name",
      "description": "Examples: google.com, fb.com, etc",
      "placeholder": "google.com",
      "feedback": {
        "empty": "Domain can't be empty",
        "reserved": "Sorry, this domain name is reserved for internal use",
        "www": "Domain should not start with `www.`, `http://`, or any other `schema://`",
        "upper-case": "Domain should be lower-case",
        "whitespace": "Domain should not start or end with whitespace"
      }
    },

    "preset": {
      "title": "<b>Recommended</b> configuration is available for this domain.",
      "danger": "<b>Warning</b>: Changing configuration for an existing app will change computed password. Consider computing and copying current password before making a change.",
      "use": "Use"
    },

    "login": {
      "label": "Username",
      "description": "Examples: my_user_name, derivepass82",
      "placeholder": "my@email.com",
      "feedback": {
        "empty": "Username can't be empty",
        "whitespace": "Username should not start or end with whitespace"
      }
    },

    "revision": {
      "label": "Revision",
      "description": "Increment this by one to change the password",
      "feedback": {
        "non-positive": "Revision must be greater than zero"
      }
    },

    "extra": {
      "button": "Extra Options",
      "danger": "Most websites do not require editing options below",
      "allowed": {
        "label": "Allowed characters",
        "description": "Characters that CAN be present in the password",
        "feedback": {
          "empty": "Can't be empty"
        }
      },
      "required": {
        "label": "Required characters",
        "description": "Characters that MUST be present in the password"
      },
      "max-len": {
        "label": "Password length",
        "feedback": {
          "less-than-one": "Must be greater than 1",
          "less-than-required": "Minimum length is {len}",
          "entropy": "Password is not strong enough. Please increase length, or add more allowed characters"
        }
      },
      "save": {
        "ready": "Save",
        "complete": "Saved"
      },
      "reset": "Reset",
      "delete": {
        "button": "Delete",
        "title": "Confirm Deletion",
        "confirm": "Delete",
        "pre": "This action will irreversibly delete:",
        "post": "...from the application list."
      }
    }
  },
  "ru": {
    "title": {
      "new": "Новое Приложение"
    },
    "copy": {
      "ready": "Скопировать Пароль",
      "complete": "Скопирован"
    },
    "compute": {
      "idle": "Сгенерировать Пароль",
      "running": "Генерируем Пароль"
    },
    "computing": {
      "password": "Генерируем надежный пароль...",
      "app": "Зашифровываем приложение..."
    },
    "edit": "Редактировать",
    "back": "Назад",

    "domain": {
      "label": "Доменное имя",
      "description": "Примеры: google.com, fb.com, etc",
      "placeholder": "google.com",
      "feedback": {
        "empty": "Доменное имя не может быть пустым",
        "reserved": "Извините, но это доменное имя зарезервировано для внутреннего использования",
        "www": "Доменное имя не должен начинаться на `www.`, `http://`, или какой-либо другой `протокол://`",
        "upper-case": "Доменное имя не может содержать заглавные буквы",
        "whitespace": "Доменное имя не должен начинаться или заканчиваться пробелом"
      }
    },

    "preset": {
      "title": "Для этого веб-сайта доступна <b>рекомендованная</b> конфигурация.",
      "danger": "<b>Опасность</b>: Смена конфигурации для существующего приложения изменит генерируемый пароль. Сгенерируйте и скопируйте пароль перед внесением изменений.",
      "use": "Использовать"
    },

    "login": {
      "label": "Имя пользователя",
      "description": "Примеры: my_user_name, derivepass82",
      "placeholder": "my@email.com",
      "feedback": {
        "empty": "Имя пользователя не может быть пустым",
        "whitespace": "Имя пользователя не должно начинаться или заканчиваться пробелом"
      }
    },

    "revision": {
      "label": "Ревизия",
      "description": "Добавьте единицу, если необходима смена пароля",
      "feedback": {
        "non-positive": "Ревизия должна быть больше нуля"
      }
    },

    "extra": {
      "button": "Дополнительные Настройки",
      "danger": "Большинство веб-сайтов не требуют изменения настроек ниже",
      "allowed": {
        "label": "Разрешенные символы",
        "description": "Символы, которые МОГУТ присутствовать в пароле",
        "feedback": {
          "empty": "Поле не может быть пустым"
        }
      },
      "required": {
        "label": "Необходимые символы",
        "description": "Символы, которые ДОЛЖНЫ присутствовать в пароле"
      },
      "max-len": {
        "label": "Длина пароля",
        "feedback": {
          "less-than-one": "Длина должна быть больше 1",
          "less-than-required": "Минимальная длина: {len}",
          "entropy": "Пароль недостаточно сложный. Пожалуйста, увеличьте длину или добавьте больше разрешенных символов"
        }
      },
      "save": {
        "ready": "Сохранить",
        "complete": "Сохранено"
      },
      "reset": "Сброс",
      "delete": {
        "button": "Удалить",
        "title": "Подтвердить Удаление",
        "confirm": "Удалить",
        "pre": "Это действие необратимо удалит:",
        "post": "...из списка приложений."
      }
    }
  }
}
</i18n>

<template>
  <div>
    <template v-if="isNew">
      <h3>{{ $t('title.new') }}</h3>
    </template>
    <template v-else>
      <div class="mb-2 application-name w-100">
        <b>{{app.domain}}</b>/{{app.login}}
      </div>
    </template>

    <div class="d-flex flex-column flex-md-row application-buttons">
      <b-button
        v-if="password"
        variant="primary"
        @click="copyPassword">
        {{ copied ? $t('copy.complete') : $t('copy.ready') }}
      </b-button>
      <b-button
        v-else
        variant="primary"
        :disabled="!isValidApp"
        @click="compute()">
        {{ computing === 'password' ? $t('compute.running') : $t('compute.idle') }}
      </b-button>
      <b-button @click="showDetails = !showDetails" variant="link">
        {{ $t('edit') }}
      </b-button>
      <b-button @click="$router.go(-1)" variant="link">
        {{ $t('back') }}
      </b-button>
    </div>

    <computing
      :active="!!computing"
      :text="computing ? $t('computing.' + computing) : ''"/>

    <b-collapse class="py-3" id="application-details" v-model="showDetails">
      <b-form @submit.prevent="onSave" autocomplete="off">
        <b-form-group
          :label="$t('domain.label')"
          label-for="application-domain"
          :description="$t('domain.description')"
          :invalid-feedback="invalidDomainFeedback"
          :state="domainState">
          <b-form-input
            required
            :state="domainState ? null : 'invalid'"
            id="application-domain"
            v-model="app.domain"
            :placeholder="$t('domain.placeholder')"
            @input="onChange"/>
        </b-form-group>

        <b-alert :show="hasPreset" variant="warning" dismissible>
          <p v-html="$t('preset.title')"/>

          <p class="text-danger" v-if="!isNew" v-html="$t('preset.danger')"/>
          <b-button variant="warning" @click.prevent="usePreset">
            {{ $t('preset.use') }}
          </b-button>
        </b-alert>

        <b-form-group
          :label="$t('login.label')"
          label-for="application-login"
          :description="$t('login.description')"
          :invalid-feedback="invalidLoginFeedback"
          :state="loginState">
          <b-form-input
            required
            :state="loginState ? null : 'invalid'"
            id="application-login"
            v-model="app.login"
            :placeholder="$t('login.placeholder')"
            @input="onChange"/>
        </b-form-group>

        <b-form-group
          :label="$t('revision.label')"
          label-for="application-revision"
          :description="$t('revision.description')"
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
            {{ $t('extra.button') }}
          </b-button>
        </b-form-group>

        <b-collapse id="application-options">
          <p class="text-danger">
            <i>{{ $t('extra.danger') }}</i>
          </p>

          <b-form-group
            :label="$t('extra.allowed.label')"
            label-for="application-allowed-chars"
            :description="$t('extra.allowed.description')"
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
            :label="$t('extra.required.label')"
            label-for="application-required-chars"
            :description="$t('extra.required.description')"
            :invalid-feedback="invalidRequiredFeedback"
            :state="requiredState">
            <b-form-input
              id="application-required-chars"
              v-model="app.options.required"
              :state="requiredState ? null : 'invalid'"
              @input="onChange"/>
          </b-form-group>

          <b-form-group
            :label="$t('extra.max-len.label')"
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
            {{ saved ? $t('extra.save.complete') : $t('extra.save.ready') }}
          </b-button>
          <b-button @click.prevent="onReset()">
            {{ $t('extra.reset') }}
          </b-button>
          <b-button variant="danger" v-b-modal.application-confirm-delete>
            {{ $t('extra.delete.button') }}
          </b-button>
        </b-button-group>
      </b-form>
    </b-collapse>

    <b-modal
      id="application-confirm-delete"
      :title="$t('extra.delete.title')"
      ok-variant="danger"
      :ok-title="$t('extra.delete.confirm')"
      @ok="onDelete">
      <p>{{ $t('extra.delete.pre') }}</p>
      <p><b>{{app.domain}}</b>/<i>{{app.login}}</i></p>
      <p>{{ $t('extra.delete.post') }}</p>
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
import { passwordEntropyBits } from '../utils/crypto';
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

    let app = this.$store.state.decryptedApps.find((app) => app.uuid === uuid);

    // Nothing we can do to restore the app
    if (app && app.removed) {
      this.$router.replace('/');
      return;
    }

    let isNew;
    if (app && this.$store.getters.isLoggedIn) {
      isNew = false;

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

    return {
      app,
      savedApp: cloneApp(app),
      isNew,

      // General state

      showDetails: isNew,
      copied: false,
      saved: false,
      computing: false,
      error: null,
      password: '',
      presetDomain: null,
    };
  },

  computed: {
    domainState() {
      return this.invalidDomainFeedback === null;
    },
    invalidDomainFeedback() {
      const domain = this.app.domain;
      if (domain.length === 0) {
        return this.$t('domain.feedback.empty');
      }

      if (domain === 'derivepass') {
        return this.$t('domain.feedback.reserved');
      }

      if (/^(www\.|\w+:\/\/)/.test(domain)) {
        return this.$t('domain.feedback.www');
      }

      if (/[A-Z]/.test(domain)) {
        return this.$t('domain.feedback.upper-case');
      }

      if (/^\s+|\s+$/.test(domain)) {
        return this.$t('domain.feedback.whitespace');
      }

      return null;
    },
    loginState() {
      return this.invalidLoginFeedback === null;
    },
    invalidLoginFeedback() {
      const login = this.app.login;
      if (login.length === 0) {
        return this.$t('login.feedback.empty');
      }

      if (/^\s+|\s+$/.test(login)) {
        return this.$t('login.feedback.whitespace');
      }

      return null;
    },
    revisionState() {
      return this.app.revision > 0;
    },
    invalidRevisionFeedback() {
      return this.$t('revision.feedback.non-positive');
    },
    allowedState() {
      return this.invalidAllowedFeedback === null;
    },
    invalidAllowedFeedback() {
      const allowed = this.app.options.allowed;
      if (allowed.length === 0) {
        return this.$t('extra.allowed.feedback.empty');
      }

      try {
        flattenRange(allowed);
      } catch (e) {
        return e.tag ? this.$root.$t(e.tag, e.extra) : e.message;
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
        return e.tag ? this.$root.$t(e.tag, e.extra) : e.message;
      }
      return null;
    },
    lengthState() {
      return this.invalidLengthFeedback === null;
    },
    invalidLengthFeedback() {
      if (this.app.options.maxLength <= 1) {
        return this.$t('extra.max-len.feedback.less-than-one');
      }

      const required = flattenRange(this.app.options.required);
      if (this.app.options.maxLength < required.length) {
        return this.$t('extra.max-len.feedback.less-than-required', {
          len: required.length,
        });
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
        return this.$t('extra.max-len.feedback.entropy');
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
      this.computing = 'password';

      const app = this.app;

      const master = this.$store.state.master;
      let domain = `${app.domain}/${app.login}`;
      if (app.revision > 1) {
        domain += `#${app.revision}`;
      }

      const isLegacy = isSameOptions(app.options, DEFAULT_APP_OPTIONS);

      const derivepass = this.$store.state.derivepass;

      let promise;
      if (isLegacy) {
        promise = derivepass.computeLegacyPassword(master, domain);
      } else {
        promise = derivepass.computePassword(master, domain,
          parseAppOptions(app.options));
      }

      promise.then((password) => {
        this.password = password;
      }).catch((err) => {
        // TODO(indutny): display this
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
      const app = Object.assign(this.app, { changedAt: Date.now() });

      this.computing = 'app';
      this.$store.dispatch('receiveDecryptedApp', app).then(() => {
        this.saved = true;
        setTimeout(() => this.saved = false, 2500);

        cloneApp(this.app, this.savedApp);
      }).catch((err) => {
        // TODO(indutny): display this
        this.error = err;
      }).finally(() => {
        this.computing = false;
      });
    },
    onReset() {
      cloneApp(this.savedApp, this.app);
    },
    onDelete() {
      const app = Object.assign(this.app, {
        removed: true,
        changedAt: Date.now(),
      });

      this.computing = 'app';
      this.$store.dispatch('receiveDecryptedApp', app).then(() => {
        this.$router.go(-1);
      }).catch((err) => {
        // TODO(indutny): display this
        this.error = err;
      }).finally(() => {
        this.computing = false;
      });
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
