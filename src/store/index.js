export const state = () => {
  return {
    aesKey: false,
    emoji: false,
    applications: [
    ],
  };
};

export const getters = {
  hasAESKey(state) {
    return state.aesKey && state.emoji;
  }
};

export const mutations = {
  receiveApp(state, app) {
    state.applications.push(app);
  },

  setAESKey(state, payload) {
    state.aesKey = payload.aesKey;
    state.emoji = payload.emoji;
  }
};
