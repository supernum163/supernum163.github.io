
let newAudio = function (src, loop = false) {
  let audio = new Audio()
  audio.loop = loop
  audio.src = src
  audio.addEventListener("canplay", function(){
    this.loaded = true
  })
  return audio
}

const Audios = {
  "bgm": newAudio("audios/bgm.mp3", true),
  "boom0": newAudio("audios/boom0.mp3"),
  "boom1": newAudio("audios/boom1.mp3"),
  "success": newAudio("audios/success.mp3"),
  "fail": newAudio("audios/fail.mp3"),
}

Audios.playBoom = function(id) {
  Audios[id].currentTime = 0
  Audios[id].play()
}

