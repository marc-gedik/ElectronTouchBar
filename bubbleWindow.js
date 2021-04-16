const { screen } = require('electron')

function moveToEdge(window) {
    const screenWidth = screen.getDisplayNearestPoint(window.getBounds()).workArea.width
    const middle = screenWidth / 2
    const bounds = window.getBounds()
    const posX = bounds.x + (bounds.width / 2)
    if(middle > posX) {
      window.setPosition(-25, bounds.y, true)
    } else {
      window.setPosition(screenWidth + 10, bounds.y, true)
    }
}

exports.moveToEdge = moveToEdge
