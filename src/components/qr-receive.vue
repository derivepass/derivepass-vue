<template>
  <div>
    <div class="text-danger" v-if="error">{{ error.message || error }}</div>
    <video class="w-100" ref="videoRef" playsinline/>
    <canvas style="display:none" ref="canvasRef"/>
  </div>
</template>

<script>
import jsQR from 'jsqr';

const UPDATE_INTERVAL = 100;

export default {
  name: 'qr-receive',
  props: { active: { type: Boolean, required: true } },

  data() {
    return {
      stream: null,
      error: null,
      timer: null,
    };
  },

  methods: {
    activate() {
      if (!this.stream) {
        this.stream = this.getStream();
      }

      const video = this.$refs.videoRef;

      this.stream.then((stream) => {
        video.srcObject = stream;
        video.play();
      }).catch((e) => {
        this.error = e;
      });

      this.timer = setInterval(() => {
        this.update();
      }, UPDATE_INTERVAL);
    },

    deactivate() {
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
        this.error = e;
      });
      this.stream = null;
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
        code = jsQR(data, width, height);
      } catch (e) {
        // Malformed data
        return;
      }

      if (!code) {
        // No code
        return;
      }

      console.log(code);
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
