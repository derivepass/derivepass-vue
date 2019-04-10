export default {
  isLoggedIn(state) {
    return state.cryptoKeys;
  },

  newUser(state) {
    return state.applications.length === 0;
  },
};
