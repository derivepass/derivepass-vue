export default {
  isLoggedIn(state) {
    return state.cryptoKeys && state.emoji;
  },

  newUser(state) {
    return state.applications.length === 0;
  },
};
