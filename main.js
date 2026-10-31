'use strict';
const { app, BrowserWindow, Menu, ipcMain, clipboard } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

let mainWindow = null;

function createWindow() {
  Menu.setApplicationMenu(null);

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 650,
    frame: false,              // borderless; the game draws its own title bar
    autoHideMenuBar: true,
    backgroundColor: '#07070f',
    title: 'Turbo Type Racer',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // F11 toggles fullscreen
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown' && input.key === 'F11') {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
      event.preventDefault();
    }
  });

  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url !== pathToFileURL(path.join(__dirname, 'index.html')).href) event.preventDefault();
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

ipcMain.on('win-min', (e) => {
  if (!isTrustedRenderer(e)) return;
  const w = BrowserWindow.fromWebContents(e.sender);
  if (w) w.minimize();
});

ipcMain.on('win-close', (e) => {
  if (!isTrustedRenderer(e)) return;
  const w = BrowserWindow.fromWebContents(e.sender);
  if (w) w.close();
});

ipcMain.handle('copy-text', (event, value) => {
  if (!isTrustedRenderer(event)) return false;
  clipboard.writeText(String(value ?? ''));
  return true;
});

function isTrustedRenderer(event) {
  return event.senderFrame && event.senderFrame.url === pathToFileURL(path.join(__dirname, 'index.html')).href;
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
