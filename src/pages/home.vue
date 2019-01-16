<i18n>
{
  "en": {
    "lead": "Compute secure passwords without storing them anywhere.",
    "start": "Start",
    "description": [
      "Most websites require password on Sign Up. Using the same password everywhere is insecure. Using individual secure passwords and remembering all of them - impossible!",
      "<b>DerivePass</b> is here to help with the task! Choose the <i>Master Password</i> once and use it to generate <b>unlimited</b> number of secure website passwords.",
      "Unlike traditional password managers, <b>DerivePass</b> never uploads neither the <i>Master Password</i> nor website passwords to the Cloud. The only information that is stored is <b>encrypted</b> website names and logins."
    ]
  },
  "ru": {
    "lead": "Генерируйте надежные пароли, не сохраняя их копий.",
    "start": "Начать",
    "description": [
      "Большинство веб-сайтов требуют пароль во время регистрации. Использование одинакового пароля для всех сайтов - небезопасно. Использование разных надежных паролей и запоминание их всех - невозможно!",
      "<b>DerivePass</b> готов помочь в решении этой задачи! Выберите <i>Мастер Пароль</i> один раз и используйте его для создания <b>бесконечного</b> числа надежных паролей для веб-сайтов.",
      "В отличии от традиционных менеджеров паролей, <b>DerivePass</b> не загружает в облако ни <i>Мастер Пароль</i>, ни пароли от веб-сайтов. Единственная сохраняемая информация - это <b>зашифрованные</b> названия веб-сайтов и имена пользователей."
    ]
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
    </b-container>

    <footer class="text-right px-1">
      <small>
        Copyright {{new Date().getFullYear()}}, Fedor Indutny
        <br/>
        <a href="https://github.com/derivepass/derivepass-vue" target="_blank">
          source code
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
};
</script>

<style>
</style>
