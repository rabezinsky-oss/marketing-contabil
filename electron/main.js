const { app, BrowserWindow, shell, dialog, Notification, ipcMain } = require("electron");
const path = require("path");
const { autoUpdater } = require("electron-updater");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1000,
    minHeight: 650,
    title: "Marketing Contábil",
    backgroundColor: "#f5f7fb",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js")
    }
  });

  mainWindow.loadFile(path.join(__dirname, "..", "index.html"));

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}

function setupDesktopNotifications() {
  ipcMain.on("show-notification", (_event, payload = {}) => {
    if (process.platform !== "win32") return;
    const title = String(payload.title || "Marketing Contábil");
    const body = String(payload.body || "");
    try {
      new Notification({ title, body }).show();
    } catch (error) {
      console.error("Erro ao exibir notificação do Windows:", error);
    }
  });
}

function setupAutoUpdater() {
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on("checking-for-update", () => {
    console.log("Verificando atualizações...");
  });

  autoUpdater.on("update-available", (info) => {
    console.log("Atualização encontrada:", info.version);
  });

  autoUpdater.on("update-not-available", () => {
    console.log("O aplicativo já está atualizado.");
  });

  autoUpdater.on("update-downloaded", async (info) => {
    console.log("Atualização baixada:", info.version);

    const result = await dialog.showMessageBox(mainWindow, {
      type: "info",
      title: "Atualização disponível",
      message: `A versão ${info.version} foi baixada.`,
      detail: "O Marketing Contábil será reiniciado para concluir a atualização.",
      buttons: ["Atualizar agora", "Depois"]
    });

    if (result.response === 0) {
      autoUpdater.quitAndInstall(false, true);
    }
  });

  autoUpdater.on("error", (error) => {
    console.error("Erro no atualizador:", error);
  });

  if (app.isPackaged) {
    autoUpdater.checkForUpdates();
  }
}

app.whenReady().then(() => {
  setupDesktopNotifications();
  createWindow();
  setupAutoUpdater();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});