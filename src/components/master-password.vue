<template>
  <section>
    <emoji-hash :text="password"/>
    <b-form-group
      label="Enter your Master Password"
      label-for="master-password-input"
      description="The Master Password is used for storage decryption and website password derivation"
      :invalid-feedback="invalidFeedback"
      :state="state">
      <b-form-input
        id="master-password-input"
        type="password"
        @change="$emit('change', $event)"
        @input="$emit('change', $event)"/>
    </b-form-group>
  </section>
</template>

<script>
import EmojiHash from './emoji-hash.vue';

export default {
  components: { EmojiHash },

  props: { password: String },
  model: { prop: 'password', event: 'change' },

  computed: {
    state() {
      return this.password.length !== 0;
    },
    invalidFeedback() {
      if (this.password.length === 0) {
        return 'Please enter something';
      } else {
        return '';
      }
    },
  },
};
</script>
