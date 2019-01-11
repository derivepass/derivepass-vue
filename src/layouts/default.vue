<template>
  <section id="page">
    <nav-bar/>

    <b-container>
      <b-row>
        <b-col/>
        <b-col md="9" xl="9">
          <slot/>
        </b-col>
        <b-col/>
      </b-row>
    </b-container>
  </section>
</template>

<script>
import bCol from 'bootstrap-vue/es/components/layout/col';
import bContainer from 'bootstrap-vue/es/components/layout/container';
import bRow from 'bootstrap-vue/es/components/layout/row';

import NavBar from '../components/nav-bar';

export default {
  name: 'default-layout',
  components: {
    bContainer, bRow, bCol,
    NavBar
  },
};
</script>
