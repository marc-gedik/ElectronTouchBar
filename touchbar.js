const { TouchBar, nativeImage } = require('electron')
const { TouchBarSpacer, TouchBarSegmentedControl, TouchBarScrubber, TouchBarLabel } = TouchBar
const fs = require('fs');
const path = require('path');
const util = require('util')
const { exec } = require("child_process");

function chunck(array, size, _ifExceed) {
  const ifExceed = _ifExceed || size
  if (array.length > ifExceed) {
    let chuncks = [];
    for (var i = 0; i < array.length; i += size) {
      chuncks.push(array.slice(i, i + size));
    }
    return chuncks
  } else {
    return [array]
  }
}

function createSoundButton(settings, filepath) {
  let playing = null
  const name = path.parse(filepath).name
  const [_, index, label] = name.match(/(^\d*)(.*)/)
  return {
    index: index || 0,
    label: label,
    click: () => {
      if (playing && !settings.replay) {
        exec('kill ' + playing)
      } else {
        exec('afplay -v 0 -t 0.1 ' + filepath)
        setTimeout(() => {
          playing = exec('afplay ' + filepath, () => playing = null).pid
        }, 100);
        
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
  window.setTouchBar(
    new TouchBar({items: [new TouchBarLabel({label: "Loading..."})]})
    )
  const all = (await Promise.all(fs.readdirSync(settings.path).map(async filename => {
    const filepath = settings.path + filename
    const playable = await execAsync('afplay -v 0 -t 0.1 ' + filepath).catch(err => null)
    return playable && createSoundButton(settings, filepath)
  })))
  .flatMap(it => it ? [it] : [])
  .sort((a, b) => a.index - b.index);

  const chunks = chunck(all, 8, 11)
  const multiChunks = i => chunks.length > 1 ?
    [
      new TouchBarSpacer({ size: "flexible" }),
      new TouchBarSegmentedControl({
        mode: "buttons",
        segments: [
          { label: "<", enabled: chunks[i - 1] },
          { label: ">", enabled: chunks[i + 1] }
        ],
        change: selected => selected ? setTouchBar(i + 1) : setTouchBar(i - 1)
      })
    ] : [];

  const setTouchBar = (i) => {
    settings.dense ? 
    window.setTouchBar(
      new TouchBar({
        items: [].concat(
          createSoundsSegment(chunks[i]),
          multiChunks(i)
        )
      })
    ) :
    window.setTouchBar(
      new TouchBar({
        items: [new TouchBarScrubber({items: all, mode: "fixed",
        highlight: (i) => {
          all[i].click()
        }})],
        
      })
    )
  }

  setTouchBar(0)
}

exports.populateTouchBar = populateTouchBar
