
Click = function(X, Y, imageId) {
  this.imageId = imageId
  this.init(X, Y)
}
  
Click.prototype = {
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
    this.limit = Utils.random(adapt.W_100 * 10, adapt.W_100 * 20)
  },

  grow: function(play) {
    // 点击戳破与每次增长加减金币
    if (!this.show) {
      if (this.TStime === null) return
      play.money += this.radius * 25
      this.TStime = null
      return
    }
    // 气泡增长时的颜色变换与特效
    if (this.radius > this.limit - 5 && this.imageId < 100) {
      this.imageId += 100
    } else if (this.radius > this.limit) {
      // 自然增长至破裂，无视是否长按
      Audios.playBoom(0)
      play.money -= this.radius * 50
      this.show = false
      this.TStime = null
    } 
  }

}