<template>
  <div>
    <b-alert :show="!!error" variant="warning" dismissible>
      {{ error }}
    </b-alert>
    <b-alert :show="complete" variant="success">
      Synchronization complete
    </b-alert>
    <b-progress
      v-if="!complete"
      :value="received.length"
      :max="total"
      variant="info"
      animated/>
    <video v-show="active" class="w-100" ref="videoRef" playsinline/>
    <canvas style="display:none" ref="canvasRef"/>
  </div>
</template>

<script>
import bAlert from 'bootstrap-vue/es/components/alert/alert';
import bProgress from 'bootstrap-vue/es/components/progress/progress';

import jsQR from 'jsqr';

const UPDATE_INTERVAL = 100;

export default {
  name: 'qr-receive',
  props: { active: { type: Boolean, required: true } },
  components: { bAlert, bProgress },

  data() {
    return {
      stream: null,
      error: null,
      complete: false,
      timer: null,
      lastData: null,

      received: [],
      total: 1,
    };
  },

  mounted() {
    if (this.active) {
      this.activate();
    }
  },

  methods: {
    activate() {
      this.complete = false;

      // Not mounted yet
      if (!this.$refs.videoRef) {
        return;
      }

      if (!this.stream) {
        this.stream = this.getStream();
      }

      this.stream.then((stream) => {
        const video = this.$refs.videoRef;

        video.srcObject = stream;
        video.play();
      }).catch((e) => {
        this.error = e.message;
      });

      this.timer = setInterval(() => {
        try {
          this.update();
        } catch (e) {
          this.error = e.message;
        }
      }, UPDATE_INTERVAL);
    },

    deactivate() {
      // Not mounted yet
      if (!this.$refs.videoRef) {
        return;
      }

      if (!this.stream) {
        return;
      }

      const video = this.$refs.videoRef;
      video.srcObject = null;
      clearInterval(this.timer);

      this.stream.then((stream) => {
        for (const track of stream.getTracks()) {
          track.stop();
        }
      }).catch((e) => {
        this.error = e.message;
      });

      this.stream = null;
      this.lastData = null;
    },

    async getStream() {
      return await navigator.mediaDevices.getUserMedia({ video: {} });
    },

    update() {
      const canvas = this.$refs.canvasRef;
      const video = this.$refs.videoRef;

      const width = video.videoWidth;
      const height = video.videoHeight;
      if (width === 0 || height === 0) {
        // Not ready
        return;
      }

      const context = canvas.getContext("2d");

      canvas.width = width;
      canvas.height = height;

      context.drawImage(video, 0, 0, width, height);
      const data = context.getImageData(0, 0, width, height);

      let code;
      try {
        code = jsQR(data.data, width, height);
      } catch (e) {
        // Malformed data
        return;
      }

      if (!code || !code.data) {
        // No code
        return;
      }

      // Skip duplicates
      if (code.data === this.lastData) {
        return;
      }
      this.lastData = code.data;

      const [ type, payload ] = JSON.parse(code.data);

      this.handleMessage(type, payload);
    },
    handleMessage(type, payload) {
      if (type === 'init') {
        this.total = payload.count;
      } else if (type === 'app') {
        if (!this.received.includes(payload.uuid)) {
          this.received.push(payload.uuid);

          this.$store.commit('receiveApp', payload);
        }
      } else {
        throw new Error(`Invalid type: "${type}"`);
      }

      if (this.total !== 0 && this.total === this.received.length) {
        this.complete = true;
        this.deactivate();
      }
    },
  },

  watch: {
    active(newValue) {
      if (newValue) {
        this.activate();
      } else {
        this.deactivate();
      }
    }
  }
}
</script>
