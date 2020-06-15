
Press = function(X, Y, imageId) {
  this.imageId = imageId
  this.init(X, Y)
}
  
Press.prototype = {
  init: function(X, Y) {
    // 是否展示图片
    this.show = true
    // 触摸开始时间
    this.TStime = null
    // 气泡初始位置、移动方向、初始尺寸、爆破尺寸
    this.x = X
    this.y = Y
    this.xSpeed = 0
    this.ySpeed = 1
    this.radius = 1
    this.limit = [adapt.W_6, adapt.W_4, adapt.W_12 * 5][this.imageId % 10]
  },

  grow: function(play) {
    if (!this.show) return
    // 每次增长耗费金币
    if (this.radius > 25) 
      play.money -= [5e4, 20e4, 50e4][this.imageId % 10] / (this.limit / 0.05)
    // 气泡特效与增加金币
    if (this.radius > 30 && this.TStime === null) {
      this.show = false
    } else if (this.radius > this.limit - 5 && this.imageId < 100) {
      play.money += [10e4, 35e4, 80e4][this.imageId % 10]
      this.imageId += 100
    } else if (this.radius > this.limit) {
      Audios.playBoom(0)
      this.show = false
      this.TStime = null
    } 
  }

}