const { app, Menu, dialog, BrowserWindow, ipcMain } = require('electron')
const { populateTouchBar } = require('./touchbar')
const { moveToEdge } = require('./bubbleWindow')
const { settings } = require('./settings')
const path = require('path');

function buildMenu(onDirectoryChange) {
  const changeDirectory = () => dialog.showOpenDialog({
    defaultPath: settings.path,
    properties: ['openDirectory']
  }).then(function (fileObj) {
    if (!fileObj.canceled) {
      onDirectoryChange(fileObj.filePaths[0] + '/')
    }
  })
  
  const template = [
    { label: 'Open', click: changeDirectory },
    { type: 'separator' },
    { label: 'Stop', type: 'radio', checked: !settings.replay, click: () => settings.replay = false },
    { label: 'Replay', type: 'radio', checked: settings.replay, click: () => settings.replay = true },
    { type: 'separator' },
    { label: 'Close', role: 'quit' },
  ]
  return Menu.buildFromTemplate(template)
}

app.whenReady().then(() => {
  app.dock.hide()

  const window = new BrowserWindow({
    frame: false,
    fullscreenable: false,
    resizable: false,
    transparent: true,
    skipTaskbar: true,
    alwaysOnTop: true,
    width: 68,
    height: 68,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    }
  })
  const menu = buildMenu(dir => populateTouchBar(window, dir))
  ipcMain.on('mouseup', () => moveToEdge(window))
  ipcMain.on('contextmenu', () => menu.popup())
  moveToEdge(window)

  window.loadFile('index.html')
  populateTouchBar(window, settings)
})
