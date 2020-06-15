
FireEnding = function() {
  this.fire = []
}

FireEnding.prototype = {
  add: function() {
    this.fire.push({
      x: Utils.choose([adapt.W_6, adapt.W_3, adapt.W_2, adapt.W_3 * 2, adapt.W_6 * 5]),
      y: adapt.H - adapt.W_12,
      xSpeed: Utils.random(-5, 5) * adapt.W_100 / 10,
      ySpeed: Utils.random(-360, -320) * adapt.H_10000,
      yFrict: Utils.random(8, 16) * adapt.H_10000,
      path: []
    })
  },

  update: function(play) {
    for (var i in this.fire) {
      let f = this.fire[i]
      if (f.x < 0 || f.y < 0 || f.x > adapt.W) {
        this.fire.splice(i, 1)
        continue
      }
      if (f.path.length > 30 || f.ySpeed >= 0) {
        f.path.shift()
      }
      if (f.ySpeed < 0) {
        f.x += f.xSpeed
        f.y += f.ySpeed
        f.ySpeed += f.yFrict
        f.path.push({x: f.x, y: f.y})
      }
      if (f.path.length === 1 && f.ySpeed >= 0) {
        if (f.y > adapt.H_4 * 3) continue
        play.flowers.add(f.x, f.y, Utils.randomColor())
        this.fire.splice(i, 1)
      }
    }
  },

  draw: function() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
    for (var f of this.fire) {
      for(var i in f.path) {
        var p = f.path[i]
        var w = adapt.W_100 + adapt.W_100 * i / 30,  w_2 = w / 2
        ctx.fillRect(p.x - w_2, p.y - w_2, w, w)
      }
    }
  }

}
