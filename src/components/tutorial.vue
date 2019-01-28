<i18n>
{
  "en": {
    "master": {
      "empty": "Hello!|Let's walk you through the basics|Choose a strong Master Password|Memorize it or write it down...|...and enter it below",
      "password": "Excellent choice!|You might be wondering what those emoji mean{\"silent\":\"sweaty\"}They represent your Master Password in a unique way|It is very easy to check that you typed it correctly|Even if a single character is off|The emoji won't be the same|Don't be worried, though|Master Password can't be recovered from them|Let's hit \"Next\" button{\"delay\":100}",
      "confirm": "Still remember your Master Password?|Let's type it one more time to confirm|If something is wrong, you can start from scratch by hitting \"Reset\"{\"delay\":100}",
      "submit": "Perfect!|Click \"Start\" to continue"
    },
    "application-list": {
      "first": "You don't have any applications yet|Let's fix this by creating one|Click \"Add application\" to continue{\"delay\":100}"
    },
    "application": {
      "empty": "What the heck is \"Application\"?|Suppose that you'd like to register on a website: fancypillows.com|Naturally, they ask you to provide a password|Instead of choosing one manually, you could use DerivePass{\"silent\":\"glasses\"}Type the name of website in \"Domain name\" field to continue{\"delay\":100}",
      "domain": "Fantastic!{\"silent\":\"thumb\"}Now let's fill \"Username\" field{\"delay\":100}",
      "username": "Lovely{\"silent\":\"heart\"}Generate the password password by hitting \"Compute Password\"",
      "password": "Copy the password by clicking \"Copy Password\"|Saving the application will complete this tutorial{\"delay\":100}"
    }
  }
}
</i18n>

<template>
  <section class="tutorial">
    <b-popover
      target="tutorial-emoji"
      :show="computeText().length !== 0"
      placement="top">
      <div class="text-center">{{ computeText() }}</div>
    </b-popover>
    <section id="tutorial-emoji" class="text-center">
      {{ emoji }}
    </section>
  </section>
</template>

<script>
import bPopover from 'bootstrap-vue/es/components/popover/popover';

const SPEAKING = [
  '🙂',
  '😮',
  '😀',
  '😐',
];

const SILENT = {
  'teeth': '😬',
  'sweaty': '😅',
  'glasses': '😎',
  'thumb': '👍',
  'heart': '🥰',
};

const DEFAULT_DELAY = 40;

const SPLIT_RE = /\||(\{[^}]*\})/g

export default {
  name: 'tutorial',

  components: { bPopover },
  props: {
    state: { type: String, required: true }
  },

  data() {
    return { timer: null, index: { letter: -10, sentence: -1 }, silent: null };
  },

  mounted() {
    this.timer = setInterval(() => {
      this.index.letter++;
    }, 60);
  },

  destroyed() {
    clearInterval(this.timer);
  },

  computed: {
    emoji() {
      if (this.index.letter < 0) {
        return SILENT[this.silent || 'teeth'];
      }

      return SPEAKING[this.index.letter % SPEAKING.length];
    },

    message() {
      let msg = this.$t(this.state);

      // Parse separators
      const separators = [];
      msg = msg.replace(SPLIT_RE, (_, json) => {
        separators.push(json ? JSON.parse(json) : {});
        return '|';
      })

      // Remove trailing separator before splitting
      msg = msg.replace(/\|$/, '');

      const sentences = msg.split('|');

      // Allow trailing separator
      if (separators.length < sentences.length) {
        separators.push({});
      }

      return { sentences, separators };
    },
  },

  methods: {
    computeText() {
      const index = this.index;

      const { sentences, separators } = this.message;

      if (sentences.length === 0) {
        this.silent = null;
        return '';
      }

      if (index.letter < 0) {
        if (index.sentence === -1) {
          return '';
        }

        let prev = index.sentence - 1;
        if (prev < 0) {
          prev += sentences.length;
        }
        this.silent = separators[prev].silent;
        return sentences[prev];
      }

      // Initial
      if (index.sentence < 0) {
        index.sentence = 0;
      }

      this.silent = null;

      const sentence = sentences[index.sentence];
      const current = 1 + index.letter % sentence.length;

      const result = sentence.slice(0, current);
      if (current >= sentence.length) {
        index.letter = -(separators[index.sentence].delay || DEFAULT_DELAY);
        index.sentence++;
        index.sentence %= sentences.length;
      }
      return result.trim();
    }
  },

  watch: {
    state() {
      this.index.sentence = 0;
      this.index.letter = 0;
    },
  },
};
</script>

<style scoped>
.tutorial {
  font-size: 48px;
  font-family: Apple Color Emoji;
}
</style>
