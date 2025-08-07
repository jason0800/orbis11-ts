import { app, BrowserWindow } from 'electron';
import path from 'path';
import { isDev } from './util.js';
import { handlers } from './handlers.js';

function createWindow () {
  const win = new BrowserWindow({
    width: 1200,
    height: 700,
    webPreferences: {
      preload: path.join(app.getAppPath(), 'src/electron/preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  // win.webContents.openDevTools();

  if (isDev()) {
    win.loadURL("http://localhost:3000/")
  } else {
    win.loadFile(path.join(app.getAppPath(), 'dist-react/index.html'))
  }
}

app.whenReady().then(() => {
  handlers()   // all ipc.Main handlers
  createWindow()
})

app.on('window-all-closed', () => {
  if (globalThis.process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})