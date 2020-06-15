
Rat17 = function(frameId, posId) {
  this.imageId = 17
  this.init(frameId, posId)
}
  
Rat17.prototype = {
  init: function(frameId, posId) {
    this.show = true
    this.frameId = frameId
    this.posId = posId
    this.life = 2
  },

  recycle: function(play) {
    this.show = false
    play.rats[this.posId] = 0
  },

  onHit: function(play) {
    this.life -= 1
    if (this.life <= 0) {
      Audios.playBoom(11)
      play.skull -= 1
      this.recycle(play)
    } else {
      Audios.playBoom(17)
      var positions = play.avilPos()
      if (positions.length === 0) return
      var posId = Utils.choose(positions)
      play.rats[this.posId] = 0
      play.rats[posId] = this.imageId
      this.posId = posId
    }
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