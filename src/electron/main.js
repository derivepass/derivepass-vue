const {
  app, BrowserWindow, protocol, session, shell, ipcMain: ipc,
} = require('electron');
const log = require('electron-log');
const { autoUpdater } = require("electron-updater");

const { parse: parseURL } = require('url');
const { parse: parseQuery } = require('querystring');
const path = require('path');
const fs = require('fs');

const STATIC = path.join(__dirname, '..', '..', 'dist');
const INDEX_HTML = path.join(STATIC, 'index.html');
const PRELOAD = path.join(__dirname, 'preload.js');

// Request update every 4 hours for those who run it over prolonged periods
// of time.
const UPDATE_FREQUENCY = 4 * 3600 * 1000;

let window = null;
const iCloudQueue = [];

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

function createWindow () {
  if (window) {
    return;
  }

  window = new BrowserWindow({
    width: 800,
    height: 800,
    show: false,

    webPreferences: {
      preload: PRELOAD,

      // Security
      contextIsolation: false,
      nodeIntegration: false,
      sandbox: true,
      enableRemoteModule: false,

      // Disable unused features
      webgl: false,
      webaudio: false,
    },
  });
  window.once('ready-to-show', () => window.show());

  window.loadURL('derivepass://electron/');

  window.on('closed', () => {
    window = null;
  });
}

protocol.registerStandardSchemes([ 'derivepass' ], { secure: true });

app.on('ready', () =>{
  protocol.registerFileProtocol('derivepass', (request, callback) => {
    let url = request.url.replace(/^derivepass:\/\//, '');
    if (!url.startsWith('electron/')) {
      throw new Error('Invalid url');
    }

    url = url.replace(/^electron\//, '');
    let file = path.join(STATIC, url);

    if (url === '' || !fs.existsSync(file)) {
      // Push History
      file = INDEX_HTML;
    }

    callback({
      path: file,
    });
  });

  // Add `Origin` to CloudKit requests
  const webRequest = session.defaultSession.webRequest;
  webRequest.onBeforeSendHeaders({
    urls: [
      'https://api.apple-cloudkit.com/*',
    ],
  }, (details, callback) => {
    const requestHeaders = Object.assign({}, details.requestHeaders, {
      Origin: 'https://derivepass.com',
    });

    callback({ requestHeaders });
  });

  protocol.registerFileProtocol(
    'cloudkit-icloud.com.indutny.derivepass',
    (req, callback) => {
      const uri = parseURL(req.url);
      const query = parseQuery(uri.query);

      callback({ path: 'about:blank' });

      iCloudQueue.shift()(query);
    });

  createWindow();

  setInterval(() => {
    autoUpdater.checkForUpdatesAndNotify().catch(() => {
      // Ignore
    });
  }, UPDATE_FREQUENCY);

  autoUpdater.checkForUpdatesAndNotify().catch(() => {
    // Ignore
  });
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Open windows in external browser
app.on('web-contents-created', (_, contents) => {
  contents.on('new-window', (e, url) => {
    e.preventDefault();
    shell.openExternal(url);
  });
})

app.on('activate', () => {
  createWindow();
});

ipc.on('icloud:auth', (_, { seq, url }) => {
  const popup = new BrowserWindow({
    center: true,
    width: 500,
    height: 500,

    parent: window,
    webPreferences: {
      // Security
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      enableRemoteModule: false,
    },
  });

  popup.loadURL(url);

  const onComplete = (payload) => {
    window.webContents.send('icloud:response', { seq, payload });
    popup.close();
  };
  iCloudQueue.push(onComplete);

  popup.once('close', () => {
    const index = iCloudQueue.indexOf(onComplete);
    if (index !== -1) {
      iCloudQueue.splice(index, 1);
      onComplete({ canceled: true });
    }
  });
});
