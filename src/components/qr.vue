<template>
  <b-card title="QR Sync">
    <b-button-group>
      <b-button variant="outline-primary" @click="send = !send">
        {{ send ? 'Stop Sending' : 'Send' }}
      </b-button>
      <b-button variant="outline-primary" @click="receive = !receive">
        {{ receive ? 'Stop Receiving' : 'Receive' }}
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
