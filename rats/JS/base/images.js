
let newImage = function (src) {
  var image = new Image()
  image.src = src
  image.onload = function() {
    this.loaded = true
  }
  return image
}

const Images = {
  "1": newImage('images/1.png'),
  "5": newImage('images/5.png'),
  "6": newImage('images/6.png'),
  "11": newImage('images/11.png'),
  "12": newImage('images/12.png'),
  "13": newImage('images/13.png'),
  "14": newImage('images/14.png'),
  "15": newImage('images/15.png'),
  "16": newImage('images/16.png'),
  "17": newImage('images/17.png'),
  "18": newImage('images/18.png'),
  "19": newImage('images/19.png'),
  "bgm_paused_true": newImage('images/bgm_paused_true.png'),
  "bgm_paused_false": newImage('images/bgm_paused_false.png'),
  "fullscreen_true": newImage('images/fullscreen_true.png'),
  "fullscreen_false": newImage('images/fullscreen_false.png'),
}
