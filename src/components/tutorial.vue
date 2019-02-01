<i18n>
{
  "en": {
    "master": {
      "empty": "Hello!|Let's walk you through the basics|Choose a strong Master Password|Memorize it or write it down...|...and enter it below",
      "password": "Excellent choice!|You might be wondering what those emoji mean{\"silent\":\"sweaty\"}They represent your Master Password in a unique way|It is very easy to check that you typed it correctly|Even if a single character is off|The emoji won't be the same|Don't be worried about revealing your password, though|Master Password can't be recovered from them|Let's hit \"@:(button.next)\" button{\"delay\":true}",
      "confirm": "Still remember your Master Password?|Let's type it one more time to confirm|If something is wrong, you can start from scratch by hitting \"@:(button.reset)\"{\"delay\":true}",
      "submit": "Perfect!|Click \"@:(button.start)\" to continue"
    },
    "application-list": {
      "first": "You don't have any applications yet|Let's fix this by creating one|Click \"@:(button.add-app)\" to continue{\"delay\":true}"
    },
    "application": {
      "empty": "What the heck is \"Application\"?|Suppose that you'd like to register on a website: fancypillows.com|Naturally, they ask you to provide a password|Instead of choosing one manually, you could use DerivePass{\"silent\":\"glasses\"}Type the name of website in \"@:(label.domain)\" field to continue{\"delay\":true}",
      "domain": "Fantastic!{\"silent\":\"thumb\"}Now let's fill \"@:(label.login)\" field{\"delay\":true}",
      "username": "Lovely{\"silent\":\"heart\"}Generate the password password by hitting \"@:(button.compute.idle)\"",
      "password": "Copy the password by clicking \"@:(button.copy.ready)\"|Saving the application will complete this tutorial{\"delay\":true}"
    }
  },
  "ru": {
    "master": {
      "empty": "Здравствуйте!|Давайте вместе разберемся, как пользоваться DerivePass|Выберите надежный Мастер Пароль|Запомните его или запишите...|...и введите его в поле ниже",
      "password": "Прекрасный выбор!|Возможно, вас заинтересовали emoji внизу?{\"silent\":\"sweaty\"}Они уникально подобраны для вашего Мастер Пароля|Проверить правильность ввода очень просто|Если хотя бы один символ был набран неверно|Emoji будут отличаться от тех, что вы видите сейчас|Несмотря на это, Мастер Пароль нельзя подглядеть и восстановить из emoji|Давайте нажмем \"@:(button.next)\"{\"delay\":true}",
      "confirm": "Все еще помните ваш Мастер Пароль?|Введите его еще один раз для подтверждения|Если что-то пошло не так, вы всегда можете начать сначала, нажав \"@:(button.reset)\"{\"delay\":true}",
      "submit": "Замечательно!|Нажмите \"@:(button.start)\", чтобы продолжить"
    },
    "application-list": {
      "first": "У вас пока нет приложений|Давайте исправим это, создав одно!|Нажмите \"@:(button.add-app)\" для продолжения{\"delay\":true}"
    },
    "application": {
    "empty": "Что такое \"Приложение\"?|Допустим, вы хотите зарегистрироваться на веб-сайте: fancypillows.com|Для этого вам, наверняка, будет необходимо выбрать пароль|Вместо того, чтобы выбирать его вручную, вы можете использовать DerivePass{\"silent\":\"glasses\"}Введите название веб-сайта в поле \"@:(label.domain)\", чтобы продолжить{\"delay\":true}",
      "domain": "Прекрасно!{\"silent\":\"thumb\"}Теперь давайте заполним поле \"@:(label.login)\"{\"delay\":true}",
      "username": "Изумительно!{\"silent\":\"heart\"}Вы можете сгенерировать пароль, нажав \"@:(button.compute.idle)\"",
      "password": "Скопируйте пароль, щелкнув по \"@:(button.copy.ready)\"|Сохранение данного приложения завершит наше обучение{\"delay\":true}"
    }
  },
  "ca": {
    "master": {
      "empty": "Hola!|Anem a veure els bàsics|Escull una Contrasenya Mestre forta|Memoritza-la, o anota-te-la...|...i introdueix-la a continuació",
      "password": "Genial elecció!!|Deus estar pensant què signifiquen aquests emoji{\"silent\":\"sweaty\"}Representen la teva Contrasenya Mestre d'una manera única|És molt fàcil comprovar que l'has escrita correctament|Inclús si et deixes un sol caràcter|Els emoji no seran els mateixos|No pateixis si reveles una contrasenya per això|La Contrasenya Mestre no es pot extreure d'elles|Va, apretem el botó \"@:(button.next)\"{\"delay\":true}",
      "confirm": "Encara recordes la teva Contrasenya Mestre?|Va, posa-la un cop més per confirmar-ho|Si res esta malament, pots començar de nou prement el botó \"@:(button.reset)\"{\"delay\":true}",
      "submit": "Perfecte!|Prem \"@:(button.start)\" per continuar"
    },
    "application-list": {
      "first": "Encara no tens cap aplicació|Solucionem-ho afegeint-ne una|Prem \"@:(button.add-app)\" per continuar{\"delay\":true}"
    },
    "application": {
      "empty": "Què nassos és \"Aplicació\"?|Suposa que vols registrar-te a un lloc web: coixins-guais.cat|Naturalment, et demanaran una contrasenya|Enlloc de triar-ne una manualment, pots emprar DerivePass{\"silent\":\"glasses\"}Escriu el nom del lloc web al camp \"@:(label.domain)\" per continuar{\"delay\":true}",
      "domain": "Fantàstic!{\"silent\":\"thumb\"}Ara omple el camp \"@:(label.login)\"{\"delay\":true}",
      "username": "Preciós{\"silent\":\"heart\"}Genera la contrasenya prement \"@:(button.compute.idle)\"",
      "password": "Copia la contrasenya prement \"@:(button.copy.ready)\"|Desa l'aplicació per completar aquest tutorial{\"delay\":true}"
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

const DEFAULT_DELAY = 60;

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
        index.letter = -(separators[index.sentence].delay ? 2 : 1) *
          DEFAULT_DELAY;
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
