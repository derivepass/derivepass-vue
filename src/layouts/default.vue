<template>
  <section id="page">
    <nav-bar/>
    <b-container>
      <b-row>
        <b-col>
          <slot/>
        </b-col>
      </b-row>
    </b-container>
  </section>
</template>

<script>
import NavBar from '../components/nav-bar';

export default {
  components: { NavBar },
};
</script>
