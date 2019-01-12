<template>
  <section id="page">
    <b-alert :show="updateAvailable" :variant="updateError ? 'danger': 'info'">
      <span v-if="updateError">
        Update error: {{ updateError.message || updateError }}
      </span>
      <span v-else-if="updating">
        Updating...
      </span>
      <span v-else>
        Update available, applying in {{ updateIn }} seconds...
      </span>
    </b-alert>

    <nav-bar/>

    <b-container>
      <b-row>
        <b-col/>
        <b-col md="9" xl="9">
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

const UPDATE_TIMEOUT = 30;  // 30 seconds

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
      this.updating = true;

      this.$serviceWorker.update()
        .then(() => document.location.reload())
        .catch((e) => this.updateError = e)
        .finally(() => this.updating = false);
    },
  }
};
</script>
