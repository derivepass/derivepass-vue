<template>
  <div>
    <template v-if="loading">
      <b-alert show variant="info">Connecting to iCloud APIs...</b-alert>
    </template>
    <template v-else-if="error">
      <b-alert show variant="error">Failed to connect to iCloud APIs!</b-alert>
    </template>
    <template v-else>
      <b-btn @click="signOut" v-if="isAuthenticated">Disable</b-btn>
      <b-btn @click="signIn" v-else>Enable</b-btn>
    </template>
  </div>
</template>

<script>
import CloudKitPromise from '../utils/cloud-kit';

let CloudKit;

export default {
  data() {
    return { loading: true, error: null, isAuthenticated: false };
  },

  created() {
    this.asyncInit().finally(() => {
      this.loading = false;
    }).catch((e) => {
      this.error = e;
    });
  },

  methods: {
    async asyncInit() {
      CloudKit = await CloudKitPromise;
      this.isAuthenticated = CloudKit.isAuthenticated;
    },

    signIn() {
      this.loading = true;
      CloudKit.signIn().then(() => {
        this.isAuthenticated = true;
      }).catch((err) => {
        this.error = err;
      }).finally(() => {
        this.loading = false;
      });
    },

    signOut() {
      CloudKit.signOut().then(() => {
        this.isAuthenticated = false;
      }).catch((err) => {
        this.error = err;
      }).finally(() => {
        this.loading = false;
      });
    }
  },
};
</script>
