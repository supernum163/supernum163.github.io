
Flower3 = function(X, Y, color) {
  this.layer = 1
  this.radius = 8 * adapt.W_100
  this.petal = []
  this.petalW = adapt.W_100
  this.petalW_2 = this.petalW / 2

  let n = Utils.random(12, 18)
  let r_2 = this.radius / 2
  let degree = Math.PI * 2 / n
  for (let j = 0; j < n; j++) {
    let x = this.radius * Math.sin(degree * j) + 
      Utils.random(-r_2, r_2) - this.petalW_2
    let y = this.radius * Math.cos(degree * j) + 
      Utils.random(-r_2, r_2) - this.petalW_2
    this.petal.push({ x: x, y: y })
  }
  this.init(X, Y, color)
}

Flower3.prototype = {
  init: function(X, Y, color) {
    this.X = X
    this.Y = Y
    this.color = color
    this.life = 30
  },

  draw: function() {
    // 花瓣
    ctx.fillStyle = this.color
    ctx.strokeStyle = this.color
    for (var p of this.petal) {
      ctx.beginPath()
      ctx.moveTo(this.X, this.Y)
      if (p.x === 0 || p.y === 0) {
        ctx.lineTo(this.X + p.x, this.Y + p.y)
      } else if (p.y < 0) {
        ctx.bezierCurveTo(this.X + p.x / 2, this.Y, 
          this.X, this.Y + p.y / 2, 
          this.X + p.x, this.Y + p.y
        )
      } else {
        ctx.bezierCurveTo(this.X, this.Y + p.y / 2,
          this.X + p.x / 2, this.Y,
          this.X + p.x, this.Y + p.y
        )
      }
      ctx.closePath()
      ctx.stroke()
      ctx.fillRect(this.X + p.x, this.Y + p.y, this.petalW, this.petalW)
    }
    // 花芯
    var grd = ctx.createRadialGradient(
      this.X, this.Y, this.petalW_2, 
      this.X, this.Y, this.radius
    )
    grd.addColorStop(0, 'rgba(255, 255, 255, 0.8)')
    grd.addColorStop(this.layer / 10, 'rgba(255, 255, 255, 0.3)')
    grd.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.fillStyle = grd
    ctx.arc(this.X, this.Y, this.radius, 0, Math.PI * 2)
    ctx.closePath()
    ctx.fill()
  }

}