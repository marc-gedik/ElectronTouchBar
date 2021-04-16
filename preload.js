// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { ipcRenderer } = require('electron')

window.addEventListener('DOMContentLoaded', () => {
  window.document.body.addEventListener('mouseup', () => {
    ipcRenderer.send('mouseup')  
  })
  
  window.document.body.addEventListener('contextmenu', () => {
    ipcRenderer.send('contextmenu')
  });

})
