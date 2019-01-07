<template>
  <section class="emoji-hash">
    {{ hash }}
  </section>
</template>

<script>
import emojiHash from '../utils/emoji-hash';

export default {
  props: { text: { type: String, required: true } },

  computed: {
    hash() {
      return emojiHash(this.text);
    }
  }
};
</script>

<style scoped>
.emoji-hash {
  font-size: 48px;
}
</style>
