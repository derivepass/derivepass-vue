export const state = () => {
  return {
    aesKey: false,
    emoji: false,
    applications: [
      { emoji: '😅👉🐷🍨🛎' },
    ],
  };
};

export const getters = {
  hasAESKey(state) {
    return state.aesKey && state.emoji;
  }
};

export const mutations = {
  setAESKey(state, payload) {
    state.aesKey = payload.aesKey;
    state.emoji = payload.emoji;
  }
};
