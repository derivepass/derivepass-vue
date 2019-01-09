export default {
  hasAESKey(state) {
    return state.aesKey && state.macKey && state.emoji;
  }
};
