<template>
  <b-modal
    v-model="active"
    centered
    hide-header-close
    hide-footer
    busy
    no-close-on-esc
    no-close-on-backdrop
    title="Computing...">
    <div class="text-center mb-1">{{text}}</div>
    <b-progress
      :value="progress"
      variant="info"
      animated/>
  </b-modal>
</template>

<script>
const COMPUTING_TIME = 2000;
const COMPUTING_STEPS = 20;

export default {
  name: 'computing',
  props: {
    active: { type: Boolean, required: true },
    text: { type: String, required: true },
  },

  data: () => ({ progress: 0 }),

  watch: {
    active(newValue) {
      if (!newValue) {
        return;
      }

      let steps = 0;
      const doStep = () => {
        if (steps++ === COMPUTING_STEPS) {
          return;
        }
        this.progress = 100 * steps / COMPUTING_STEPS;

        setTimeout(doStep, COMPUTING_TIME / COMPUTING_STEPS);
      }

      doStep();
    }
  }
};
</script>
