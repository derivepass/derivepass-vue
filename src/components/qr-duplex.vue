<template>
  <b-card title="QR Two-Way Sync">
    <b-alert :show="!!error" variant="warning" dismissible>
      {{ error }}
    </b-alert>
    <b-alert :show="complete" variant="success">
      Synchronization complete
    </b-alert>

    <div v-if="running && !ready" class="text-info">Initializing video...</div>

    <b-progress
      v-if="!complete && total !== 0"
      :value="received"
      :max="total"
      variant="primary"
      class="mb-2"
      animated/>


    <b-container v-show="ready && !complete" class="align-items-center mt-3">
      <b-row align-v="center">
        <b-col class="col-4 mx-auto">
          <img
            ref="imageRef"
            class="img-fluid"
            width="1024"
            height="1024"
            :src="code"/>
        </b-col>
        <b-col class="col-4 mx-auto">
          <video
            class="img-fluid"
            ref="videoRef"
            playsinline/>
        </b-col>
      </b-row>
    </b-container>

    <p class="card-text">
      Sync data directly between two devices by pointing their screens and
      camers to each other.
    </p>

    <div>
      <b-button
        variant="outline-primary"
        class="mb-3"
        @click="running ? stop() : start()">
        {{ running ? 'Stop' : 'Start' }}
      </b-button>
    </div>

    <canvas style="display:none" ref="canvasRef"/>
  </b-card>
</template>

<script>
import Vue from 'vue';
import bAlert from 'bootstrap-vue/es/components/alert/alert';
import bButton from 'bootstrap-vue/es/components/button/button';
import bCard from 'bootstrap-vue/es/components/card/card';
import bCol from 'bootstrap-vue/es/components/layout/col';
import bContainer from 'bootstrap-vue/es/components/layout/container';
import bRow from 'bootstrap-vue/es/components/layout/row';
import bProgress from 'bootstrap-vue/es/components/progress/progress';

import QRIO from '../utils/qr/io';
import QRSync from '../utils/qr/sync';

const EMPTY_SVG =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg"/>';

const UPDATE_INTERVAL = 100;

export default {
  name: 'qr-duplex',
  components: {
    bAlert, bButton, bCard, bProgress,
    bContainer, bCol, bRow,
  },

  data() {
    return {
      running: false,
      complete: false,
      ready: false,
      error: null,

      received: 0,
      total: 0,

      stream: null,
      timer: null,

      code: EMPTY_SVG,
    };
  },

  methods: {
    start() {
      this.complete = false;
      this.running = true;

      const io = new QRIO({
        onImage: (code) => this.code = code,
      });

      const sync = new QRSync(io, {
        onProgress: (value, total) => {
          this.received = value;
          this.total = total;
        },
        onEntry: (app) => {
          this.$store.commit('receiveApp', app);
        },
      });

      sync.run(this.$store.state.applications).then(() => {
        this.complete = true;
      }).catch((e) => {
        this.error = e.message;
      });

      this.attachVideo(io);
    },

    stop() {
      this.running = false;
      this.detachVideo();
    },

    // TODO(indutny): move to mix-in?

    attachVideo(io) {
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
          this.getFrame(io);
        } catch (e) {
          this.error = e.message;
        }
      }, UPDATE_INTERVAL);
    },

    detachVideo() {
      if (!this.stream) {
        return;
      }

      const video = this.$refs.videoRef;
      video.srcObject = null;
      clearInterval(this.timer);
      this.ready = false;

      this.stream.then((stream) => {
        for (const track of stream.getTracks()) {
          track.stop();
        }
      }).catch((e) => {
        this.error = e.message;
      });

      this.stream = null;
    },

    async getStream() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Video recording is not supported by browser');
      }

      return await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: 'user' } },
      });
    },

    getFrame(io) {
      const canvas = this.$refs.canvasRef;
      const video = this.$refs.videoRef;

      this.$autoLogout.reset();

      const width = video.videoWidth;
      const height = video.videoHeight;
      if (width === 0 || height === 0) {
        // Not ready
        return;
      }

      if (!this.ready) {
        Vue.nextTick(() => {
          this.$refs.imageRef.scrollIntoView(true);
        });
        this.ready = true;
      }

      const context = canvas.getContext("2d");

      canvas.width = width;
      canvas.height = height;

      context.drawImage(video, 0, 0, width, height);
      const data = context.getImageData(0, 0, width, height);

      try {
        io.handleFrame(data.data, width, height);
      } catch (e) {
        this.error = e.message;
      }
    },
  }
}
</script>
