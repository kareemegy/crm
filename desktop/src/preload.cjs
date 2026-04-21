// Intentionally minimal. The renderer talks to the Express backend at
// http://localhost:14317 just like in the web build, so no IPC bridge is
// needed yet. Add contextBridge.exposeInMainWorld(...) here if you later
// want native file dialogs, notifications, or shell access from the UI.
