
Flower1 = function(X, Y, color) {
  this.layer = Utils.choose([1, 2, 3])
  this.radius = [4, 8, 16][this.layer - 1] * adapt.W_100
  this.petal = []
  this.petalW = adapt.W_100
  this.petalW_2 = this.petalW / 2
  for(let i = 0; i < this.layer; i++) {
    let n = [6, 12, 24][i]
    let r = [4, 8, 16][i] * adapt.W_100
    let r_2 = r / 2
    let degree = Math.PI * 2 / n
    for (let j = 0; j < n; j++) {
      let x = r * Math.sin(degree * j) + Utils.random(-r_2, r_2) - this.petalW_2
      let y = r * Math.cos(degree * j) + Utils.random(-r_2, r_2) - this.petalW_2
      this.petal.push({ x: x, y: y })
    }
  }
  this.init(X, Y, color)
}

Flower1.prototype = {
  init: function(X, Y, color) {
    this.X = X
    this.Y = Y
    this.color = color
    this.life = 30
  },

  draw: function() {
    // 花芯
    var grd = ctx.createRadialGradient(
      this.X, this.Y, this.petalW, 
      this.X, this.Y, this.radius
    )
    grd.addColorStop(0, 'rgba(255, 255, 255, 0.8)')
    grd.addColorStop(this.layer / 10, 'rgba(255, 255, 255, 0.3)')
    grd.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.fillStyle = grd
    ctx.arc(this.X, this.Y, this.radius, 0, Math.PI * 2)
    ctx.closePath()
    ctx.fill()
    // 花瓣
    ctx.fillStyle = this.color
    for (var p of this.petal) {
      ctx.fillRect(this.X + p.x, this.Y + p.y, this.petalW, this.petalW)
    }
  }

}