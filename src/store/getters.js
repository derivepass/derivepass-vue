export default {
  isLoggedIn(state) {
    return state.cryptoKeys && state.emoji;
  },
};
