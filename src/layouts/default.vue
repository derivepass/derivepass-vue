<template>
  <section id="page">
    <b-alert :show="updateAvailable" :variant="updateError ? 'danger': 'info'">
      <span v-if="updateError">
        <b>Update error:</b>
        <br/>
        {{ updateError.message || updateError }}
      </span>
      <span v-else-if="updating">
        Updating...
      </span>
      <span v-else>
        Update available,
        <a href="#" class="alert-link" @click.prevent="update()">install now</a>
        or in {{ updateIn }} secs
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
