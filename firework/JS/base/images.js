
newImage = function (src) {
  let image = new Image()
  image.src = src
  image.onload = function() {
    this.loaded = true
  }
  return image
}

const Images = {
  '1': newImage('images/1.png'),
  '2': newImage('images/2.png'),
  '3': newImage('images/3.png'),
  "bgm_paused_true": newImage('images/bgm_paused_true.png'),
  "bgm_paused_false": newImage('images/bgm_paused_false.png'),
  "fullscreen_true": newImage('images/fullscreen_true.png'),
  "fullscreen_false": newImage('images/fullscreen_false.png'),
}
