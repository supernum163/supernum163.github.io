
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
}
