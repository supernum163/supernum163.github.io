
Rat14 = function(frameId, posId) {
  this.imageId = 14
  this.init(frameId, posId)
}
  
Rat14.prototype = {
  init: function(frameId, posId) {
    this.show = true
    this.frameId = frameId
    this.posId = posId
  },

  recycle: function(play) {
    this.show = false
    play.rats[this.posId] = 0
  },

  onHit: function(play) {
    Audios.playBoom(14)
    play.skull -= 1
    this.recycle(play)
    play.R.forEach(r => {
      if (!r.show || r.imageId === 14) return
      r.recycle(play)
      play.score -= 1
    })
  },

  update: function(play) {
    if (!this.show) return
    if (play.frameId - this.frameId > 90) {
      Audios.playMiss()
      play.life -= 1
      this.recycle(play)
    }
  }

}