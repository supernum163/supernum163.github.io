
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
  "boom1": newAudio("audios/boom1.mp3"),
  "boom2": newAudio("audios/boom2.mp3"),
  "boom3": newAudio("audios/boom3.mp3"),
  "fire1": newAudio("audios/fire1.mp3"),
  "fire2": newAudio("audios/fire2.mp3"),
  "fire3": newAudio("audios/fire3.mp3"),
  "endding": newAudio("audios/endding.mp3", true),
}

Audios.playBoom = function(id) {
  // let id = Utils.choose(["boom1", "boom2", "boom3"])
  id = "boom" + id
  Audios[id].currentTime = 0
  Audios[id].play()
}

Audios.playFire = function(id) {
  // let id = Utils.choose(["fire1", "fire2", "fire3"])
  id = "fire" + id
  Audios[id].currentTime = 0
  Audios[id].play()
}
