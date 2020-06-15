
let newImage = function(src) {
  var image = new Image()
  image.src = src
  image.onload = function() {
    this.loaded = true
  }
  return image
}

const Images = {
  "0": newImage('images/0.png'),
  "1": newImage('images/1.png'),
  "difficulty0": newImage('images/difficulty0.png'),
  "difficulty1": newImage('images/difficulty1.png'),
  "offensive0": newImage('images/offensive0.png'),
  "offensive1": newImage('images/offensive1.png'),
  "bgm_paused_true": newImage('images/bgm_paused_true.png'),
  "bgm_paused_false": newImage('images/bgm_paused_false.png'),
  "fullscreen_true": newImage('images/fullscreen_true.png'),
  "fullscreen_false": newImage('images/fullscreen_false.png'),
}

