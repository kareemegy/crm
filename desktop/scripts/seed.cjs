// Runs the shared server seed against the Electron desktop DB location
// (same path Electron's main process uses via app.getPath('userData')).
// Re-invokes Electron as Node via ELECTRON_RUN_AS_NODE=1 so the forked
// process matches the native-module ABI used at runtime.

const { spawn } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

function userDataDir() {
  const appName = 'crm-desktop';
  if (process.platform === 'win32') {
    return path.join(process.env.APPDATA || path.join(process.env.USERPROFILE, 'AppData', 'Roaming'), appName);
  }
  if (process.platform === 'darwin') {
    return path.join(process.env.HOME, 'Library', 'Application Support', appName);
  }
  return path.join(process.env.XDG_CONFIG_HOME || path.join(process.env.HOME, '.config'), appName);
}

const dir = userDataDir();
fs.mkdirSync(dir, { recursive: true });
const dbFile = path.join(dir, 'crm.db');

const seedEntry = path.join(__dirname, '..', '..', 'server', 'src', 'db', 'seed.js');
const electronBin = require('electron');

console.log(`[seed] target DB: ${dbFile}`);

const child = spawn(electronBin, [seedEntry], {
  env: { ...process.env, ELECTRON_RUN_AS_NODE: '1', DB_FILE: dbFile },
  stdio: 'inherit'
});

child.on('exit', (code) => process.exit(code ?? 0));
