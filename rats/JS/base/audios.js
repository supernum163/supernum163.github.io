
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
  "10": newAudio('audios/10.mp3'),
  "11": newAudio('audios/11.mp3'),
  "12": newAudio('audios/12.mp3'),
  "14": newAudio('audios/14.mp3'),
  "15": newAudio('audios/15.mp3'),
  "17": newAudio('audios/17.mp3'),
  "18": newAudio('audios/18.mp3'),
  "19": newAudio('audios/19.mp3'),
}

Audios.playBoom = function(id) {
  Audios[id].currentTime = 0
  Audios[id].play()
}

Audios.playMiss = function() {
  Audios[10].currentTime = 0
  Audios[10].play()
}
