
let newImage = function (src) {
  var image = new Image()
  image.src = src
  image.onload = function() {
    this.loaded = true
  }
  return image
}

const Images = {
  "tip": newImage('images/tip.png'),
  "10": newImage('images/10.png'),
  "11": newImage('images/11.png'),
  "12": newImage('images/12.png'),
  "20": newImage('images/20.png'),
  "21": newImage('images/21.png'),
  "22": newImage('images/22.png'),
  "30": newImage('images/30.png'),
  "31": newImage('images/31.png'),
  "32": newImage('images/32.png'),
  "40": newImage('images/40.png'),
  "41": newImage('images/41.png'),
  "42": newImage('images/42.png'),
  "110": newImage('images/110.png'),
  "111": newImage('images/111.png'),
  "112": newImage('images/112.png'),
  "120": newImage('images/120.png'),
  "121": newImage('images/121.png'),
  "122": newImage('images/122.png'),
  "130": newImage('images/130.png'),
  "131": newImage('images/131.png'),
  "132": newImage('images/132.png'),
  "140": newImage('images/140.png'),
  "141": newImage('images/141.png'),
  "142": newImage('images/142.png'),
  "bgm_paused_true": newImage('images/bgm_paused_true.png'),
  "bgm_paused_false": newImage('images/bgm_paused_false.png'),
  "fullscreen_true": newImage('images/fullscreen_true.png'),
  "fullscreen_false": newImage('images/fullscreen_false.png'),
}
