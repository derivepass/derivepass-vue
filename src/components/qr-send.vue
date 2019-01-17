<i18n>
{
  "en": {
    "qr": "QR code"
  },
  "ru": {
    "qr": "QR код"
  }
}
</i18n>

<template>
  <img
    class="img-fluid"
    width="512"
    height="512"
    :alt="$t('qr')"
    :src="encode(codes[index])"/>
</template>

<script>
import { mapState } from 'vuex';
import * as qrImage from 'qr-image';

const INIT_INTERVAL = 750;
const INIT_EVERY = 15;
const UPDATE_INTERVAL = 500;

const QR_SIZE_LIMIT = 2000;  // 2953 is the limit, but there are extra chars
const REMOVED_BULK_SIZE = 20;

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

      const init = [
        'init',
        {
          init: INIT_INTERVAL,
          update: UPDATE_INTERVAL,
          count: this.applications.length,
        },
      ];

      const normal = this.applications.filter((app) => !app.removed);
      const removed = this.applications.filter((app) => app.removed);

      const list = [];

      for (let i = 0; i < normal.length; i++) {
        const bulk = [];
        let bulkSize = 0;

        for (; i < normal.length; i++) {
          const app = normal[i];

          // TODO(indutny): do not stringify twice
          const appSize = JSON.stringify(app).length;
          if (bulkSize + appSize > QR_SIZE_LIMIT) {
            i--;
            break;
          }

          bulkSize += appSize;
          bulk.push(app);
        }

        list.push([ 'apps', bulk ]);
      }

      for (let i = 0; i < removed.length; i += REMOVED_BULK_SIZE) {
        const slice = removed.slice(i, i + REMOVED_BULK_SIZE).map((app) => {
          return { uuid: app.uuid, changedAt: app.changedAt };
        });
        list.push([ 'remove', slice ]);
      }

      for (let i = list.length - 1; i >= 0; i--) {
        if (i % INIT_EVERY === 0) {
          list.splice(i, 0, init);
        }
      }

      return list;
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
