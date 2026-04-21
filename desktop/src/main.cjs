const { app, BrowserWindow, Menu, shell } = require('electron');
const { fork } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');
const http = require('node:http');

const SERVER_PORT = 14317;
const SERVER_HOST = '127.0.0.1';

const isPackaged = app.isPackaged;

function resolveServerEntry() {
  if (isPackaged) {
    return path.join(process.resourcesPath, 'server', 'src', 'app.js');
  }
  return path.join(__dirname, '..', '..', 'server', 'src', 'app.js');
}

function resolveClientIndex() {
  if (isPackaged) {
    return path.join(process.resourcesPath, 'client', 'dist', 'index.html');
  }
  return path.join(__dirname, '..', '..', 'client', 'dist', 'index.html');
}

function resolveDbFile() {
  return path.join(app.getPath('userData'), 'crm.db');
}

let serverProcess = null;
let mainWindow = null;

function startServer() {
  const entry = resolveServerEntry();
  if (!fs.existsSync(entry)) {
    throw new Error(`Server entry not found at ${entry}`);
  }

  const env = {
    ...process.env,
    ELECTRON_RUN_AS_NODE: '1',
    PORT: String(SERVER_PORT),
    DB_FILE: resolveDbFile(),
    NODE_ENV: isPackaged ? 'production' : 'development'
  };

  serverProcess = fork(entry, [], {
    execPath: process.execPath,
    env,
    stdio: ['ignore', 'pipe', 'pipe', 'ipc']
  });

  serverProcess.stdout?.on('data', (d) => process.stdout.write(`[server] ${d}`));
  serverProcess.stderr?.on('data', (d) => process.stderr.write(`[server] ${d}`));

  serverProcess.on('exit', (code, signal) => {
    console.log(`[server] exited code=${code} signal=${signal}`);
    serverProcess = null;
    if (!app.isQuitting) app.quit();
  });
}

function waitForServer(timeoutMs = 15000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const ping = () => {
      const req = http.get(
        { host: SERVER_HOST, port: SERVER_PORT, path: '/health', timeout: 1000 },
        (res) => {
          res.resume();
          if (res.statusCode === 200) return resolve();
          retry();
        }
      );
      req.on('error', retry);
      req.on('timeout', () => {
        req.destroy();
        retry();
      });
    };
    const retry = () => {
      if (Date.now() - started > timeoutMs) {
        return reject(new Error('Server did not become ready in time'));
      }
      setTimeout(ping, 250);
    };
    ping();
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#ffffff',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  mainWindow.once('ready-to-show', () => mainWindow.show());

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  const indexPath = resolveClientIndex();
  if (!fs.existsSync(indexPath)) {
    mainWindow.loadURL(
      'data:text/html;charset=utf-8,' +
        encodeURIComponent(
          `<h1 style="font-family:sans-serif">Client not built</h1>
           <p>Run <code>npm run build:client</code> inside the <code>desktop/</code> folder first.</p>
           <p>Looked for: <code>${indexPath.replace(/</g, '&lt;')}</code></p>`
        )
    );
  } else {
    mainWindow.loadFile(indexPath);
  }

  if (!isPackaged) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }
}

function buildMenu() {
  const isMac = process.platform === 'darwin';
  const template = [
    ...(isMac ? [{ role: 'appMenu' }] : []),
    { role: 'fileMenu' },
    { role: 'editMenu' },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    { role: 'windowMenu' }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.on('before-quit', () => {
  app.isQuitting = true;
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('quit', () => {
  if (serverProcess && !serverProcess.killed) {
    try { serverProcess.kill(); } catch (_) { /* ignore */ }
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.whenReady().then(async () => {
  buildMenu();
  try {
    startServer();
    await waitForServer();
  } catch (err) {
    console.error('Failed to start backend:', err);
  }
  createWindow();
});
