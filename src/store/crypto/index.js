export const namespaced = true;

export const state = () => {
  return {
    aesKey: false,
    emoji: false,
  };
};

export const getters = {
  isReady(state) {
    return state.aesKey && state.emoji;
  }
};

export const mutations = {
  setAESKey(state, payload) {
    state.aesKey = payload.aesKey;
    state.emoji = payload.emoji;
  }
};
