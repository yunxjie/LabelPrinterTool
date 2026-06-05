const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const fs = require("fs");
const path = require("path");

let savePath = "";

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile("index.html");
}

app.whenReady().then(() => {
  savePath = path.join(app.getPath("documents"), "打印标签记录");

  if (!fs.existsSync(savePath)) {
    fs.mkdirSync(savePath, { recursive: true });
  }

  createWindow();
});

ipcMain.handle("choose-save-path", async () => {
  const result = await dialog.showOpenDialog({
    title: "选择打印记录保存路径",
    properties: ["openDirectory"]
  });

  if (!result.canceled && result.filePaths.length > 0) {
    savePath = result.filePaths[0];

    if (!fs.existsSync(savePath)) {
      fs.mkdirSync(savePath, { recursive: true });
    }
  }

  return savePath;
});

ipcMain.handle("get-save-path", async () => {
  return savePath;
});

ipcMain.handle("save-print-history", async (_, data) => {
  const filePath = path.join(savePath, "print_history.json");

  let history = [];

  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf8");
      history = content ? JSON.parse(content) : [];
    }
  } catch (error) {
    history = [];
  }

  const now = Date.now();
  const oneMonth = 30 * 24 * 60 * 60 * 1000;

  history = history.filter((item) => {
    if (!item.timestamp) return false;
    return now - item.timestamp <= oneMonth;
  });

  history.unshift({
    ...data,
    timestamp: now,
    time: new Date(now).toLocaleString()
  });

  fs.writeFileSync(filePath, JSON.stringify(history, null, 2), "utf8");

  return {
    success: true,
    filePath,
    count: history.length
  };
});