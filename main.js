const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      // Depending on your security needs, adjust these:
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  // Load the Angular app. Ensure you've built the Angular app first.
  win.loadFile(path.join(__dirname, 'dist/2025ASDDAGUI/browser/index.html'));

  // Uncomment to open the DevTools.
  win.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});