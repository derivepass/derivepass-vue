uu<i18n>
{
  "en": {
    "lead": "Compute secure passwords without storing them anywhere.",
    "start": "Start",
    "description": [
      "Most websites require password on Sign Up. Using the same password everywhere is insecure. Using individual secure passwords and remembering all of them - impossible!",
      "<b>DerivePass</b> is here to help with the task! Choose the <i>Master Password</i> once and use it to generate <b>unlimited</b> number of secure website passwords.",
      "Unlike traditional password managers, <b>DerivePass</b> never uploads neither the <i>Master Password</i> nor website passwords to the Cloud. The only information that is stored is <b>encrypted</b> website names and logins."
    ],
    "security": {
      "title": "Security",
      "subtitle": "Technical Details",
      "description": [
        "{scrypt} algorithm is used for deriving application passwords and encryption/authentication keys. Due to the strong cryptographic properties of {scrypt}, compromise of a single application password does not leak the Master Password, and does not compromise any other application passwords either.",
        "Application's domain name (website), username, and revision are used for generating unique and secure password. In particular, <code>domain/login(#revision)?</code> is used as a salt parameter of {scrypt}. Thus every revision increment will result in a different generated password. This is convenient for changing the password whenever it is required.",
        "Every bit of information that is stored locally and/or remotely (through optional iCloud synchronization) is encrypted with AES key generated from the Master Password with {scrypt} algorithm, using <code>derivepass/aes</code> as a salt. The data is further passed to HMAC-SHA256 algorithm to ensure the data integrity."
      ]
    },
    "source": "source code"
  },
  "ru": {
    "lead": "Генерируйте надежные пароли, не сохраняя их копий.",
    "start": "Начать",
    "description": [
      "Большинство веб-сайтов требуют пароль во время регистрации. Использование одинакового пароля для всех сайтов - небезопасно. Использование разных надежных паролей и запоминание их всех - невозможно!",
      "<b>DerivePass</b> готов помочь в решении этой задачи! Выберите <i>Мастер Пароль</i> один раз и используйте его для создания <b>бесконечного</b> числа надежных паролей для веб-сайтов.",
      "В отличии от традиционных менеджеров паролей, <b>DerivePass</b> не загружает в облако ни <i>Мастер Пароль</i>, ни пароли от веб-сайтов. Единственная сохраняемая информация - это <b>зашифрованные</b> названия веб-сайтов и имена пользователей."
    ],
    "security": {
      "title": "Безопасность",
      "subtitle": "Технические детали",
      "description": [
        "Алгоритм {scrypt} используется для вычисления паролей приложений и ключей шифрования/аутентификации. Благодаря криптографическим качествам {scrypt}, потеря одного пароля для приложения не выдаст злоумышленникам ваш Мастер Пароль и не позволит им вычислить прочие пароли от ваших приложений.",
        "Доменное имя приложения (название веб-сайта), имя пользователя и \"ревизия\" используются для генерации уникального и надежного пароля. В частности, <code>domain/login(#revision)?</code> используется в качестве \"соли\" для {scrypt}. Таким образом, увеличение \"ревизии\" приведет к изменению сгенерированного пароля. Это удобно в ситуациях, когда необходима смена пароля.",
        "Вся информация, которая хранится на вашем компьютере и/или удаленно (через необязательную синхронизацию с iCloud), зашифрована AES ключом, сгенерированным из Мастер Пароля с помощью алгоритма {scrypt}, используя <code>derivepass/aes</code> в качестве \"соли\". Данные, в последствии, получают HMAC-SHA256 подпись, с целью подтверждения их подлинности."
      ]
    },
    "source": "исходный код"
  }
}
</i18n>

<template>
  <div>
    <b-container class="align-items-center">
      <b-row align-v="center" class="mb-3">
        <b-col class="col-6 mx-auto col-md-6 order-md-2">
          <fancy-logo class="img-fluid" width="1024" height="1024"/>
        </b-col>
        <b-col class="col-md-6 order-md-1 text-center text-md-left pr-md-5">
          <h1 class="mb-3">DerivePass</h1>

          <p class="lead">
            {{ $t('lead') }}
          </p>

          <b-button variant="primary" size="lg" to="/master">
            {{ $t('start') }}
          </b-button>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <p v-html="$t('description[0]')"/>
          <p v-html="$t('description[1]')"/>
          <p v-html="$t('description[2]')"/>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <hr/>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <h3 class="mb-2">{{ $t('security.title') }}</h3>
          <h6 class="mb-3"><i>({{ $t('security.subtitle') }})</i></h6>

          <p v-html="$t('security.description[0]', { scrypt })"/>
          <p v-html="$t('security.description[1]', { scrypt })"/>
          <p v-html="$t('security.description[2]', { scrypt })"/>
        </b-col>
      </b-row>
    </b-container>

    <footer class="text-right px-1">
      <small>
        Copyright {{new Date().getFullYear()}}, Fedor Indutny
        <br/>
        <a href="https://github.com/derivepass/derivepass-vue" target="_blank">
          {{ $t('source') }}
        </a>
      </small>
    </footer>
  </div>
</template>

<script>
import bButton from 'bootstrap-vue/es/components/button/button';
import bCol from 'bootstrap-vue/es/components/layout/col';
import bContainer from 'bootstrap-vue/es/components/layout/container';
import bRow from 'bootstrap-vue/es/components/layout/row';

import FancyLogo from '../components/fancy-logo';

export default {
  name: 'home',
  components: { bButton, bCol, bContainer, bRow, FancyLogo },

  computed: {
    scrypt() {
      return '<a href="https://en.wikipedia.org/wiki/Scrypt" target="_blank">' +
        '<code>scrypt</code>' +
        '</a>';
    }
  }
};
</script>

<style>
</style>
