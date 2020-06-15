
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
  "9": newImage('images/9.png'),
  "10": newImage('images/10.png'),
  "11": newImage('images/11.png'),
  "12": newImage('images/12.png'),
  "13": newImage('images/13.png'),
  "14": newImage('images/14.png'),
  "15": newImage('images/15.png'),
  "16": newImage('images/16.png'),
  "17": newImage('images/17.png'),
  "20": newImage('images/20.png'),
  "21": newImage('images/21.png'),
  "22": newImage('images/22.png'),
  "23": newImage('images/23.png'),
  "24": newImage('images/24.png'),
  "25": newImage('images/25.png'),
  "26": newImage('images/26.png'),
  "27": newImage('images/27.png'),
  "camp1": newImage('images/camp1.png'),
  "camp2": newImage('images/camp2.png'),
  "bgm_paused_true": newImage('images/bgm_paused_true.png'),
  "bgm_paused_false": newImage('images/bgm_paused_false.png'),
  "fullscreen_true": newImage('images/fullscreen_true.png'),
  "fullscreen_false": newImage('images/fullscreen_false.png'),
}
