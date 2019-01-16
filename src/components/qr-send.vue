<template>
  <img class="img-fluid" width="256" height="256" :src="encode(codes[index])"/>
</template>

<script>
import { mapState } from 'vuex';
import * as qrImage from 'qr-image';

const INIT_INTERVAL = 750;
const UPDATE_INTERVAL = 250;

export default {
  name: 'qr-send',

  props: { active: { type: Boolean, required: true } },

  data() {
    return {
      index: 0,
      timer: null,
    };
  },

  destroyed() {
    this.deactivate();
  },

  computed: {
    ...mapState({
      applications: (state) => state.applications,
    }),

    codes() {
      if (!this.active) {
        return [];
      }

      return [
        [
          'init',
          {
            init: INIT_INTERVAL,
            update: UPDATE_INTERVAL,
            count: this.applications.length,
          },
        ],
      ].concat(this.applications.map((app) => {
        return [ 'app', app ];
      }));
    },
  },

  methods: {
    activate() {
      const schedule = () => {
        return setTimeout(() => {
          this.index++;
          if (this.index === this.codes.length) {
            this.index = 0;
          }
          this.timer = schedule();
        }, this.index === 0 ? INIT_INTERVAL : UPDATE_INTERVAL);
      };

      this.index = 0;
      this.timer = schedule();
    },

    deactivate() {
      clearTimeout(this.timer);
      this.timer = null;
    },

    encode(data) {
      if (!data) {
        return 'data:image/svg+xml;utf8,' +
          '<svg xmlns="http://www.w3.org/2000/svg"/>';
      }

      const json = JSON.stringify(data);
      return 'data:image/svg+xml;utf8,' + qrImage.imageSync(json, {
        type: 'svg',
      });
    }
  },

  watch: {
    active(newValue) {
      if (newValue) {
        this.activate();
      } else {
        this.deactivate();
      }
    }
  },
};
</script>
