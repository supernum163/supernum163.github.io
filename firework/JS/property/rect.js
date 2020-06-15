
Rect = function(rectLife) {
  this.xSpeed = Utils.choose([-1, -0.5, 0, 0.5, 1]) * adapt.W_100,
  this.ySpeed = Utils.choose([-1, -0.5, 0, 0.5, 1]) * adapt.W_100,
  this.color = Utils.randomColor()
  this.init(rectLife)
}

Rect.prototype = {
  init: function(rectLife) {
    this.life = rectLife,
    this.w = Utils.random(10, 30) * adapt.W_100,
    this.h = Utils.random(10, 30) * adapt.W_100,
    this.x = Utils.random(0, adapt.W - this.w)
    this.y = Utils.random(0, adapt.H_4 * 3 - this.h)
  },

  inRect: function(flower) {
    if(this.life < 0) return false
    let w1 = this.x + this.w, h1 = this.y + this.h
    for (p of flower.petal) {
      var x = flower.X + p.x, y = flower.Y + p.y
      if (x > this.x && y > this.y && x  < w1 && y < h1) 
        return true
    }
    return false
  }

}

