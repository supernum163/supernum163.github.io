
Fire = function() {
  // 烟花筒图片id及锁定状态
  this.boxes = [
    {id: 1, lock: 0},
    {id: 2, lock: 0},
    {id: 3, lock: 0},
    {id: 2, lock: 0},
    {id: 1, lock: 0},
  ]
  // 烟花筒 CD 时长
  this.lockTime = 300
}

Fire.prototype = {
  init: function() {
    this.path = []
    this.pathEnd = true
    this.layer = 0
    this.flowers = []
    for(var b of this.boxes) b.lock = 0
  },

  handle: function(e) {
    if (e.type === 1 && this.pathEnd &&
        e.Y > adapt.H - adapt.W_6 && e.Y < adapt.H && 
        e.X > adapt.W_12 && e.X < adapt.W - adapt.W_12
    ) {
      this.b = parseInt((e.X - adapt.W_12) / adapt.W_6)
      if (this.boxes[this.b].lock > 0) return
      this.boxes[this.b].lock = this.lockTime
      this.layer = this.boxes[this.b].id
      this.path.push({x: e.X, y: e.Y})
      this.pathEnd = false
      Audios.playFire(this.boxes[this.b].id)
    } else if (this.pathEnd) {
      return
    } else if (e.type === 2) {
      if (e.X < 0 || e.X > adapt.W || e.Y < 0 ||
        e.Y > this.path[this.path.length - 1].y
      ) {
        this.pathEnd = true
        Audios.playBoom(this.boxes[this.b].id)
      } else {
         this.path.push({x: e.X, y: e.Y})
      }
    } else if (e.type === 3) {
      this.path.push({x: e.X, y: e.Y})
      this.pathEnd = true
      Audios.playBoom(this.boxes[this.b].id)
    }

  },

  update: function(play) {
    // 更新道具冷却状态
    for(var box of this.boxes) {
      if (box.lock > 0) box.lock --
    }
    // 更新烟花路径
    if (this.path.length > 30 || this.pathEnd)
      this.path.shift()
    // 生成烟花头
    if (this.path.length === 1 && this.pathEnd) {
      var flower, noRecycle = true
      // 先考虑回收利用
      for (var i in this.flowers) {
        flower = this.flowers[i]
        if (flower.life < 0 && flower.layer === this.layer) {
          flower.init(this.path[0])
          this.flowers.splice(i, 1)
          noRecycle = false
          break
        }
      }
      // 再考虑新建对象
      if (noRecycle) flower = new FireFlower(this.path[0], this.layer)
      this.flowers.unshift(flower)
    }
    // 更新烟花头寿命
    for (var flower of this.flowers) {
      if (flower.life < 0) continue 
      if (flower.life === 30) play.money -= flower.cost
      for (var rect of play.rects.rects) {
        if (!rect.inRect(flower)) continue
        play.flowers.add(
          rect.x + rect.w / 2, 
          rect.y + rect.h / 2, 
          rect.color
        )
        play.money += 2
        rect.life = -1
      }
      flower.life --
    }

  },

  drawBoxes: function() {
    for(var i in this.boxes) {
      ctx.drawImage(Images[this.boxes[i].id],
        adapt.W_12 + adapt.W_6 * i, adapt.H - adapt.W_6,
        adapt.W_6, adapt.W_6
      )
    }
  },

  draw: function() {
    // 绘制道具栏
    this.drawBoxes()
    // 绘制道具冷却状态
    for(var i in this.boxes) {
      if (this.boxes[i].lock <= 0) continue
      var h = adapt.W_6 * this.boxes[i].lock / this.lockTime
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
      ctx.fillRect(adapt.W_12 + adapt.W_6 * i, adapt.H - h, adapt.W_6, h)
    }
    // 绘制烟花路径
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
    for(var i in this.path) {
      var p = this.path[i]
      var w = adapt.W_100 + adapt.W_100 * i / 30,  w_2 = w / 2
      ctx.fillRect(p.x - w_2, p.y - w_2, w, w)
    }
    // 绘制爆炸出来的烟花头
    for (var flower of this.flowers) {
      if (flower.life < 0) continue
      for (var p of flower.petal) {
        ctx.fillRect(flower.X + p.x, flower.Y + p.y, flower.petalW, flower.petalW)
      }
    }
  }

}
