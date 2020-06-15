

let newAudio = function (src, loop = false) {
  let audio = new Audio()
  audio.loop = loop
  audio.src = src
  audio.addEventListener("canplay", function(){
    this.loaded = true
  })
  return audio
}

let Audios = {
  "bgm": newAudio("audios/bgm.mp3", true),
  "0": newAudio('audios/0.wav'),
  "1": newAudio('audios/1.wav'),
  "2": newAudio('audios/2.wav'),
  "3": newAudio('audios/3.wav'),
}

Audios.playBoom = function(id) {
  Audios[id].currentTime = 0
  Audios[id].play()
}
