
Board = function() {
  this.chesses = []
}

Board.prototype = {
  init: function(level) {
    level = (level >= 0 && level < 42) ? level : 0
    this.title = PUZZLES[level].title
    var puzzle = PUZZLES[level].puzzle
    this.chesses.splice(0, this.chesses.length)
    for (var i = 0; i < 5; i++) {
      for (var j = 0; j < 4; j++) {
        if (puzzle[i][j] === 0 || puzzle[i][j] % 10 !== 0) continue
        var c = {i: i, j: j,
          id: parseInt(puzzle[i][j] / 100),
          shape: parseInt(puzzle[i][j] % 100 / 10),
        }
        c.label = ["", "兵", "曹操", "关羽", "张飞", "赵云", "马超", "黄忠"][c.id]
        c.color = ["white", "hsl(30, 80%, 50%)", "hsl(0, 80%, 10%)",
          "hsl(0, 80%, 50%)", "hsl(5, 80%, 50%)", "hsl(10, 80%, 50%)", 
          "hsl(15, 80%, 50%)", "hsl(20, 80%, 50%)"
        ][c.id]
        this.chesses.push(c)
      }
    }
    this.resize()
    // 当前选中的位置
    this.selected = {area: ""}
  },

  resize: function() {
    this.w = adapt.W_100 * 20
    this.w_2 = this.w / 2
    this.w0 = adapt.W_100 * 10
    this.w1 = adapt.W_100 * 90
    this.h0 = adapt.H_2 - adapt.W_2
    this.h1 = adapt.H_2 + adapt.W_2
    // 重新开始按钮关键位置
    this.restartButton_w = adapt.W_100 * 20
    this.restartButton_w0 = adapt.W_2 - this.restartButton_w / 2
    this.restartButton_w1 = this.restartButton_w0 + this.restartButton_w
    this.restartButton_h0 = this.h0 / 2 + this.h1 - this.restartButton_w / 2
    this.restartButton_h1 = this.restartButton_h0 + this.restartButton_w
    // 棋子关键位置
    for (var c of this.chesses) {
      c.x0 = this.w0 + this.w * c.j
      c.y0 = this.h0 + this.w * c.i
      c.w = (c.shape === 2 || c.shape === 3) ? 2 * this.w : this.w
      c.h = (c.shape === 2 || c.shape === 4) ? 2 * this.w : this.w
      c.w_2 = c.w / 2; c.h_2 = c.h / 2
      c.fontSize = this.w / 3 * [0, 1, 2, 1, 1][c.shape]
    }
  },
  
  draw: function(play) {
    // 绘制标题
    ctx.fillStyle = "black"
    ctx.font = 'bold ' + adapt.W_12 + 'px monospace'
    ctx.fillText(this.title, adapt.W_2, this.h0 / 2)
    // 绘制棋子
    ctx.lineWidth = 1
    for (var c of this.chesses) {
      ctx.fillStyle = c.color
      ctx.fillRect(c.x0, c.y0, c.w, c.h)
      ctx.strokeStyle =  "white"
      ctx.strokeRect(c.x0, c.y0, c.w, c.h)
      ctx.fillStyle = "white"
      ctx.font = 'normal ' + c.fontSize + 'px monospace'
      if (c.shape === 4) {
        ctx.textBaseline = 'bottom'
        ctx.fillText(c.label[0], c.x0 + c.w_2, c.y0 + c.h_2)
        ctx.textBaseline = 'top'
        ctx.fillText(c.label[1], c.x0 + c.w_2, c.y0 + c.h_2)
        ctx.textBaseline = 'middle'
      } else {
        ctx.fillText(c.label, c.x0 + c.w_2, c.y0 + c.h_2)
      }
    }
    // 绘制边框
    ctx.lineWidth = 3
    ctx.strokeStyle =  "black"
    ctx.strokeRect(this.w0, this.h0, this.w * 4, this.w * 5)
    ctx.strokeStyle =  "white"
    ctx.beginPath()
    ctx.moveTo(this.w0 + this.w * 1, this.h1)
    ctx.lineTo(this.w0 + this.w * 3, this.h1)
    ctx.closePath()
    ctx.stroke()
    // 绘制重新开始按钮
    var id = this.selected.area === "restart" ? "restart1" : "restart0"
    ctx.drawImage(Images[id],
      this.restartButton_w0, this.restartButton_h0,
      this.restartButton_w, this.restartButton_w
    )
  },
  // 判断是否挑战成功
  check: function(play) {
    for (var c of this.chesses) {
      if (c.id === 2 && c.i === 3 && c.j === 1) {
        play.result = 1
        play.stage = 2
      }
    }
  },
  move: function(C, x, y) {
    var x0 = Math.min(this.w1 - C.w, Math.max(this.w0, x - C.w_2))
    var y0 = Math.min(this.h1 - C.h, Math.max(this.h0, y - C.h_2))
    for (var c of this.chesses) {
      if (C === c) continue
      // 计算棋子 C 与其它棋子 c 的交叉区域
      var xOverlap = 0, yOverlap = 0, Cintop, Cinleft
      if (C.x0 >= c.x0 && C.x0 <= c.x0 + c.w) {
        xOverlap = c.x0 + c.w - C.x0
        Cinleft = false
      } else if (c.x0 >= C.x0 && c.x0 <= C.x0 + C.w) {
        xOverlap = C.x0 + C.w - c.x0
        Cinleft = true
      } else continue
      if (C.y0 >= c.y0 && C.y0 <= c.y0 + c.h) {
        yOverlap = c.y0 + c.h - C.y0
        Cintop = false
      } else if (c.y0 >= C.y0 && c.y0 <= C.y0 + C.h) {
        yOverlap = C.y0 + C.h - c.y0
        Cintop = true
      } else continue
      // 调整棋子应该在的位置
      if (xOverlap === yOverlap) {
        continue
      } else if (xOverlap < yOverlap) {
        x0 = Cinleft ? Math.min(x0, c.x0 - C.w) : Math.max(x0, c.x0 + c.w)
      } else {
        y0 = Cintop ? Math.min(y0, c.y0 - C.h) : Math.max(y0, c.y0 + c.h)
      }
    }
    C.x0 = x0; C.y0 = y0
  },
  // 处理点击、拖动事件
  handle: function(play, e) {
    // 是否点击重新开始
    var area = ""
    if (e.X > this.restartButton_w0 && e.X < this.restartButton_w1 &&
      e.Y > this.restartButton_h0 && e.Y < this.restartButton_h1
    ) area = "restart"
    if (e.type === 1) {
      this.selected.area = area
      if (area !== "") return
      // 是否点击拼图区域
      for (var i in this.chesses) {
        var c = this.chesses[i]
        if (e.X > c.x0 && e.Y > c.y0 && e.X < c.x0 + c.w && e.Y < c.y0 + c.h) {
          this.selected = {area: "puzzle", id: i}
          break
        }
      }
    } else if (this.selected.area === "restart") {
      if (area !== "restart") this.selected.area = ""
      else if (e.type === 3) play.stage = 0
    } else if (this.selected.area === "puzzle") {
      var C = this.chesses[this.selected.id]
      this.move(C, e.X, e.Y)
      if (e.type === 3) {
        C.j = parseInt((C.x0 + this.w_2 - this.w0) / this.w)
        C.i = parseInt((C.y0 + this.w_2 - this.h0) / this.w)
        C.x0 = C.j * this.w + this.w0
        C.y0 = C.i * this.w + this.h0
        this.check(play)
        this.selected.area = ""
      }
    }
  }

}
