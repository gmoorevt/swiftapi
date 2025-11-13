/**
 * Electron Main Process Entry Point
 * Manages application lifecycle and creates browser windows
 */

import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { registerMockServerIpc } from './ipc/mockServerIpc';
import { mockServerService } from './mockServerService';

let mainWindow: BrowserWindow | null = null;

/**
 * Creates the main application window
 */
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    show: false, // Don't show until ready (prevents flash)
  });

  // Load the app
  if (process.env['NODE_ENV'] === 'development') {
    void mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    void mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // Show window when ready (prevents white flash)
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Set main window on mock server service for log events
  mockServerService.setMainWindow(mainWindow);

  // Clean up on close
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle handlers
app.on('ready', () => {
  // Register IPC handlers
  registerMockServerIpc();

  createWindow();
});

app.on('window-all-closed', () => {
  // Stop all mock servers before quitting
  void mockServerService.stopAllServers();

  // On macOS, keep app active until user explicitly quits
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Stop all servers on quit
app.on('before-quit', (event) => {
  event.preventDefault();
  void mockServerService.stopAllServers().then(() => {
    app.exit(0);
  });
});

app.on('activate', () => {
  // On macOS, re-create window when dock icon is clicked and no windows open
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
