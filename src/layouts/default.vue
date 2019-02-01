<i18n>
{
  "en": {
    "update": {
      "error": "Update error:",
      "running": "Updating...",
      "available": {
        "description": "Update available",
        "install": "install now",
        "or": "or in",
        "second": "sec | secs"
      }
    }
  },
  "ru": {
    "update": {
      "error": "Ошибка обновления:",
      "running": "Обновляем...",
      "available": {
        "description": "Доступно обновление",
        "install": "установить сейчас",
        "or": "или через",
        "second": "сек | сек"
      }
    }
  },
  "ca": {
    "update": {
      "error": "Error d'actualització:",
      "running": "Actualitzant...",
      "available": {
        "description": "Actualització disponible",
        "install": "instal·la ara",
        "or": "o en",
        "second": "segon | segons"
      }
    }
  }
}
</i18n>

<template>
  <section id="page">
    <b-alert :show="updateAvailable" :variant="updateError ? 'danger': 'info'">
      <span v-if="updateError">
        <b>{{ $t('update.error') }}</b>
        <br/>
        {{ updateError.message || updateError }}
      </span>
      <span v-else-if="updating">
        {{ $t('update.running') }}
      </span>
      <span v-else>
        {{ $t('update.available.description') }},
        <a href="#" class="alert-link" @click.prevent="update()">
          {{ $t('update.available.install') }}
        </a>
        {{ $t('update.available.or') }}
        {{ updateIn }}
        {{ $tc('update.available.second', updateIn) }}
      </span>
    </b-alert>

    <nav-bar/>

    <b-container>
      <b-row>
        <b-col/>
        <b-col xl="9">
          <slot/>
        </b-col>
        <b-col/>
      </b-row>
    </b-container>
  </section>
</template>

<script>
import bAlert from 'bootstrap-vue/es/components/alert/alert';
import bCol from 'bootstrap-vue/es/components/layout/col';
import bContainer from 'bootstrap-vue/es/components/layout/container';
import bRow from 'bootstrap-vue/es/components/layout/row';

import NavBar from '../components/nav-bar';

const UPDATE_TIMEOUT = 60;  // 60 seconds

export default {
  name: 'default-layout',
  components: {
    bAlert, bContainer, bRow, bCol,
    NavBar
  },

  data() {
    return {
      updateAvailable: false,
      updateIn: UPDATE_TIMEOUT,
      updateTimer: null,
      updating: false,
      updateError: null,
    };
  },

  async mounted() {
    await this.$serviceWorker.whenUpdated();

    this.updateAvailable = true;

    this.updateCountdown();
  },

  destroyed() {
    if (this.updateTimer) {
      clearTimeout(this.updateTimer);
    }
    this.updateTimer = null;
  },

  methods: {
    updateCountdown() {
      if (this.updateTimer) {
        clearTimeout(this.updateTimer);
      }
      this.updateTimer = setTimeout(() => {
        if (--this.updateIn !== 0) {
          return this.updateCountdown();
        }

        this.update();
      }, 1000);
    },

    update() {
      if (this.updateTimer) {
        clearTimeout(this.updateTimer);
      }
      this.updateTimer = null;

      this.updating = true;

      this.$serviceWorker.update()
        .then(() => document.location.reload())
        .catch((e) => this.updateError = e);
    },
  }
};
</script>
