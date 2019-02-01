<i18n>
{
  "en": {
    "title": "QR Sync",
    "description": "Sync data directly between two devices by displaying QR codes on one, and scanning them on another.",
    "send": "Send",
    "stop-send": "Stop sending",
    "receive": "Receive",
    "stop-receive": "Stop receiving"
  },
  "ru": {
    "title": "QR Синхронизация",
    "description": "Синхронизуйте данные напрямую между двумя устройствами, сканируя QR коды с одного на другое устройство.",
    "send": "Отправить",
    "stop-send": "Остановить отправку",
    "receive": "Получить",
    "stop-receive": "Прекратить получение"
  },
  "ca": {
    "title": "Sincronització QR",
    "description": "Sincronitza dades entre dos dispositius mostrant codis QR a un d'ells, i escanejant-los amb l'altre.",
    "send": "Envia",
    "stop-send": "Atura enviament",
    "receive": "Rep",
    "stop-receive": "Atura recepció"
  }
}
</i18n>

<template>
  <b-card :title="$t('title')">
    <p class="card-text">
      {{ $t('description') }}
    </p>

    <b-button-group>
      <b-button variant="outline-primary" @click="send = !send">
        {{ send ? $t('stop-send') : $t('send') }}
      </b-button>
      <b-button variant="outline-primary" @click="receive = !receive">
        {{ receive ? $t('stop-receive') : $t('receive') }}
      </b-button>
    </b-button-group>

    <b-collapse id="qr-send" v-model="send">
      <send class="mt-3" :active="send"/>
    </b-collapse>

    <b-collapse id="qr-receive" v-model="receive">
      <receive class="mt-3" :active="receive"/>
    </b-collapse>
  </b-card>
</template>

<script>
import bButton from 'bootstrap-vue/es/components/button/button';
import bButtonGroup from 'bootstrap-vue/es/components/button-group/button-group';
import bCard from 'bootstrap-vue/es/components/card/card';
import bCollapse from 'bootstrap-vue/es/components/collapse/collapse';

import Send from './qr-send';
import Receive from './qr-receive';

export default {
  name: 'qr',
  components: {
    bButton, bButtonGroup, bCard, bCollapse,
    Send, Receive,
  },

  data() {
    return { send: false, receive: false };
  }
}
</script>
