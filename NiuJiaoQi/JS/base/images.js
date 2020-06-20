
let newImage = function (src) {
  var image = new Image()
  image.src = src
  image.onload = function() {
    this.loaded = true
  }
  return image
}

const Images = {
  "cow": newImage('images/cow.png'),
  "hunter": newImage('images/hunter.png'),
  "restart": newImage('images/restart.png'),
  "bgm_paused_true": newImage('images/bgm_paused_true.png'),
  "bgm_paused_false": newImage('images/bgm_paused_false.png'),
  "fullscreen_true": newImage('images/fullscreen_true.png'),
  "fullscreen_false": newImage('images/fullscreen_false.png'),
}
