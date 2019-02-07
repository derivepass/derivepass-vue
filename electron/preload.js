const { ipcRenderer: ipc } = require('electron');

window.electron = window.electron || {};

let seq = 0;
const queue = new Map();

Object.assign(window.electron, {
  async iCloudAuth(url) {
    seq = (seq + 1) >>> 0;

    ipc.send('icloud:auth', { seq, url });

    return await new Promise((resolve, reject) => {
      queue.set(seq, (payload) => {
        queue.delete(seq);

        resolve(payload);
      });
    });
  },
});

ipc.on('icloud:response', (_, { seq, payload }) => {
  queue.get(seq)(payload);
});
