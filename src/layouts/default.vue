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
import NavBar from '../components/nav-bar';

export default {
  name: 'default-layout',
  components: { NavBar },
};
</script>
