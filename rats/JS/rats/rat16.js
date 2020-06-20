
Rat16 = function(frameId, posId) {
  this.imageId = 16
  this.init(frameId, posId)
}
  
Rat16.prototype = {
  init: function(frameId, posId) {
    this.show = true
    this.frameId = frameId
    this.posId = posId
    this.summon = []
  },

  recycle: function(play) {
    this.show = false
    play.rats[this.posId] = 0
    if (this.summon.length > 0)
      this.summon.forEach(posId => play.holes[posId] = 0)
  },

  onHit: function(play) {
    Audios.playBoom(11)
    play.skull -= 1
    this.recycle(play)
  },

  update: function(play) {
    if (!this.show) return
    var frames = play.frameId - this.frameId
    if (this.summon.length < 2 && frames > 0 && frames < 60) {
      var positions = Utils.where(play.holes, 0)
      if (positions.length === 0) return
      var posId = Utils.choose(positions)
      this.summon.push(posId)
      play.holes[posId] = 6
    } else if (this.summon.length > 0 && frames > 60 && frames < 90) {
      Audios.playBoom(15)
      var posId = this.summon.shift()
      play.holes[posId] = 1
    } else if (frames > 90) {
      Audios.playMiss()
      play.life -= 1
      this.recycle(play)
    }
  }

}