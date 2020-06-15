
Rects = function() {
  this.rects = []
}

Rects.prototype = {
  init: function() {
    for(var rect of this.rects) rect.life = -1
  }, 

  add: function(rectLife) {
    let rect
    // 先考虑回收利用
    for (rect of this.rects) {
      if (rect.life < 0) {
        rect.init(rectLife)
        return
      }
    }
    // 再考虑新建对象
    rect = new Rect(rectLife)
    this.rects.unshift(rect)
  },

  update: function(play) {
    for(var rect of this.rects) {
      if (rect.life < 0) continue
      if (rect.life === 0) play.money -= 2
      rect.life--
      rect.x += rect.xSpeed
      rect.y += rect.ySpeed
      if (rect.x < 0 || rect.x + rect.w > adapt.W) rect.xSpeed *= -1
      if (rect.y < 0 || rect.y + rect.h > adapt.H_4 * 3) rect.ySpeed *= -1
    }
  },

  draw: function() {
    for(var rect of this.rects) {
      if(rect.life < 0) continue
      if (rect.life < 100 && rect.life % 10 > 5) continue
      ctx.strokeStyle = rect.color
      ctx.strokeRect(rect.x, rect.y, rect.w, rect.h)
    }
  }

}

