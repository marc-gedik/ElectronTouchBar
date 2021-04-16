const { TouchBar } = require('electron')
const { TouchBarSpacer, TouchBarSegmentedControl } = TouchBar
const fs = require('fs');
const path = require('path');
const util = require('util')
const { exec } = require("child_process");

function chunck(array, size) {
  let chuncks = [];
  for (var i = 0; i < array.length; i += size) {
    chuncks.push(array.slice(i, i + size));
  }
  return chuncks
}

function createSoundButton(settings, filepath) {
  let playing = null
  const name = path.parse(filepath).name
  return {
    label: name.substring(1),
    click: () => {
      if (playing && !settings.replay) {
        exec('kill ' + playing)
      } else {
        playing = exec('afplay ' + filepath, () => playing = null).pid
      }
    }
  }
}

function createSoundsSegment(items) {
  return new TouchBarSegmentedControl({
    segmentStyle: "separated",
    mode: "buttons",
    segments: items,
    change: index => items[index].click()
  })
}

const execAsync = util.promisify(exec)

async function populateTouchBar(window, settings) {
  const all = (await Promise.all(fs.readdirSync(settings.path).map(async filename => {
    const filepath = settings.path + filename
    const playable = await execAsync('afplay -v 0 -t 0.1 ' + filepath).catch(err => null)
    return playable && createSoundButton(settings, filepath)
  }))).flatMap(it => it ? [it] : []);

  const chunks = chunck(all, 8)
  const setTouchBar = (i) => {
    window.setTouchBar(
      new TouchBar({
        items: [
          createSoundsSegment(chunks[i]),
          new TouchBarSpacer({ size: "flexible" }),
          new TouchBarSegmentedControl({
            mode: "buttons",
            segments: [
              { label: "<", enabled: chunks[i - 1] },
              { label: ">", enabled: chunks[i + 1] }
            ],
            change: selected => selected ? setTouchBar(i + 1) : setTouchBar(i - 1)
          })
        ]
      })
    )
  }

  setTouchBar(0)
}

exports.populateTouchBar = populateTouchBar
