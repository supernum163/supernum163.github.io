
// 烟花头，只能在 JS/property/fire.js 中使用
FireFlower = function(pos, layer) {
  this.layer = layer
  this.radius = [4, 8, 16][this.layer - 1] * adapt.W_100
  this.cost = [1, 2, 4][this.layer - 1]
  this.petal = []
  this.petalW = adapt.W_100
  this.petalW_2 = this.petalW / 2
  for(let i = 0; i < layer; i++) {
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
  this.init(pos)
}

FireFlower.prototype = {
  init: function(pos) {
    this.X = pos.x
    this.Y = pos.y
    this.life = 30
  }

}
