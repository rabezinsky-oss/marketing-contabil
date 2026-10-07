const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("desktopNotifications", {
  show(title, body) {
    ipcRenderer.send("show-notification", {
      title: String(title || "Marketing Contábil"),
      body: String(body || "")
    });
  }
});
