'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('gameAPI', Object.freeze({
  minimize: () => ipcRenderer.send('win-min'),
  close: () => ipcRenderer.send('win-close'),
  copyText: (value) => ipcRenderer.invoke('copy-text', String(value ?? ''))
}));
