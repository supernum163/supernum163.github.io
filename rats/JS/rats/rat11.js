
Rat11 = function(frameId, posId) {
  this.imageId = 11
  this.init(frameId, posId)
}
  
Rat11.prototype = {
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
    Audios.playBoom(11)
    play.skull -= 1
    this.recycle(play)
  },

  update: function(play) {
    if (!this.show) return
    if (play.frameId - this.frameId > 60) {
      Audios.playMiss()
      play.life -= 1
      this.recycle(play)
    }
  }

}