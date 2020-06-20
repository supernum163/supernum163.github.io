
Flower4 = function(X, Y, color) {
  this.layer = Utils.choose([2, 3, 4])
  this.radius = [8, 16, 24][this.layer - 2] * adapt.W_100
  this.petalW = adapt.W_100
  this.petalW_2 = this.petalW / 2
  this.init(X, Y, color)
}

Flower4.prototype = {
  init: function(X, Y, color) {
    this.X = X
    this.Y = Y
    // 固定格式 "rgba(XXX, XXX, XXX, "
    this.color = color.substr(0, 20)
    this.life = 30
  },

  draw: function() {
    // 花芯
    var grd = ctx.createRadialGradient(
      this.X, this.Y, this.petalW_2, 
      this.X, this.Y, this.radius
    )
    grd.addColorStop(0, this.color + '0.8)')
    grd.addColorStop(this.layer / 10, this.color + '0.3)')
    grd.addColorStop(1, this.color + '0)')
    ctx.fillStyle = grd
    ctx.arc(this.X, this.Y, this.radius, 0, Math.PI * 2)
    ctx.closePath()
    ctx.fill()
  }

}