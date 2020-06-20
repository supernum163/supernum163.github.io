
let newImage = function (src) {
  var image = new Image()
  image.src = src
  image.onload = function() {
    this.loaded = true
  }
  return image
}

const Images = {
  "withdraw0": newImage('images/withdraw0.png'),
  "redo0": newImage('images/redo0.png'),
  "clearAll0": newImage('images/clearAll0.png'),
  "restart0": newImage('images/restart0.png'),
  "withdraw1": newImage('images/withdraw1.png'),
  "redo1": newImage('images/redo1.png'),
  "clearAll1": newImage('images/clearAll1.png'),
  "restart1": newImage('images/restart1.png'),
  "bgm_paused_true": newImage('images/bgm_paused_true.png'),
  "bgm_paused_false": newImage('images/bgm_paused_false.png'),
  "fullscreen_true": newImage('images/fullscreen_true.png'),
  "fullscreen_false": newImage('images/fullscreen_false.png'),
}
