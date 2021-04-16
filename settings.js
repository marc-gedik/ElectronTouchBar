
const { app } = require('electron')
const fs = require('fs');

const settingsPath = app.getPath('userData') + "/settings.json"

function saveSettings(settings) {
  fs.writeFileSync(settingsPath, JSON.stringify(settings));
}

function getSettings() {
  try {
    fs.statSync(settingsPath);
  } catch (err) {
    saveSettings({
      path: app.getPath('music') + '/ElectronTouchboard/',
      replay: false
    });
  }
  const data = fs.readFileSync(settingsPath, 'utf-8');
  return JSON.parse(data);
}

let settingSaver = {
  set: function (target, key, value) {
    target[key] = value
    saveSettings(target)
    return target
  }
};

const settings = new Proxy(getSettings(), settingSaver)
exports.settings = settings
