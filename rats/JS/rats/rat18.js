
Rat18 = function(frameId, posId) {
  this.imageId = 18
  this.init(frameId, posId)
}
  
Rat18.prototype = {
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
    Audios.playBoom(18)
    play.skull -= 1
    this.recycle(play)
    for (var i = 0; i < 2; i++) {
      var positions = play.avilPos()
      if (positions.length === 0) return
      var posId = Utils.choose(positions)
      play.add(posId)
    }
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