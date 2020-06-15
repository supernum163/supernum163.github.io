
Board = function() {

}

Board.prototype = {
  init: function(difficulty) {
    this.rank = [3, 4, 5][difficulty]
    this.resize()
    // 拼图图片
    this.IMG = Images["puzzle0"]
    this.w_IMG = 600 / this.rank
    // 生成拼图棋盘
    this.puzzle = this.genPuzzle()
    // 当前选中的位置
    this.selected = {area: ""}
  },

  resize: function() {
    this.w0 = adapt.W_100 * 5
    this.w1 = adapt.W_100 * 95
    this.h0 = adapt.H / 2 - adapt.W_100 *45
    this.h1 = adapt.H / 2 + adapt.W_100 *45
    this.w = adapt.W_100 * 90 / this.rank
    this.w_2 = this.w / 2
    // 重新开始按钮关键位置
    this.restartButton_w = adapt.W_100 * 20
    this.restartButton_w0 = adapt.W_2 - this.restartButton_w / 2
    this.restartButton_w1 = this.restartButton_w0 + this.restartButton_w
    this.restartButton_h0 = adapt.H_4 * 3 + adapt.W_4 - this.restartButton_w / 2
    this.restartButton_h1 = this.restartButton_h0 + this.restartButton_w
  },
  // 获取空格所在位置
  getBlank: function(puzzle) {
    for (var i = 0; i < this.rank; i++) {
      for (var j = 0; j < this.rank; j++) {
        if (puzzle[i][j] === null) return [i, j]
      }
    }
    return []
  },
  // 随机生成 this.rank 阶拼图迷面
  genPuzzle: function() {
    // 先生成拼图终局
    var puzzle = Array(this.rank)
    for (var i = 0; i < this.rank; i++) {
      puzzle[i] = Array(this.rank)
      for (var j = 0; j < this.rank; j++) {
        if (i === this.rank - 1 && j === this.rank - 1) {
          puzzle[i][j] = null 
        } else puzzle[i][j] = {i: i, j: j}
      }
    }
    // 再随机把拼图打乱
    var maxLoop = (1 + parseInt(Math.random() * 2)) * this.rank * 20
    for (var loop = 0; loop < maxLoop; loop++) {
      var [i, j] = this.getBlank(puzzle, this.rank)
      var directs = [[-1, 0], [1, 0], [0, -1], [0, 1]]
      for (var d = 0; d < 4; d++) {
        var direct = parseInt(Math.random() * directs.length)
        var [istep, jstep] = directs[direct]
        directs.splice(direct, 1)
        var m = i + istep, n = j + jstep
        if (m < 0 || m >= this.rank || n < 0 || n >= this.rank) continue
        puzzle[i][j] =  puzzle[m][n] 
        puzzle[m][n] = null
        break
      }
    }
    return puzzle
  },
  draw: function(play) {
    // 绘制拼图碎片
    for (var i = 0; i < this.rank; i++) {
      for (var j = 0; j < this.rank; j++) {
        if (this.puzzle[i][j] === null) continue
        if (this.selected.area === "puzzle" && 
          this.selected.i === i && this.selected.j === j
        ) continue
        var p = this.puzzle[i][j]
        ctx.drawImage(this.IMG,
          p.j * this.w_IMG, p.i * this.w_IMG, this.w_IMG, this.w_IMG,
          this.w0 + this.w * j, this.h0 + this.w * i, this.w, this.w
        )
      }
    }
    // 绘制正在被拖动的拼图碎片
    if (this.selected.area === "puzzle") {
      var p = this.selected.p
      ctx.drawImage(this.IMG,
        p.j * this.w_IMG, p.i * this.w_IMG, this.w_IMG, this.w_IMG,
        this.selected.x - this.w_2, this.selected.y - this.w_2, this.w, this.w
      )
    }
    // 绘制边框
    for (var i = 0; i <= this.rank; i++) {
      ctx.strokeStyle = i % this.rank === 0 ? "black" : "lightgray"
      ctx.beginPath()
      ctx.moveTo(this.w0, this.h0 + this.w * i)
      ctx.lineTo(this.w1, this.h0 + this.w * i)
      ctx.moveTo(this.w0 + this.w * i, this.h0)
      ctx.lineTo(this.w0 + this.w * i, this.h1)
      ctx.closePath()
      ctx.stroke()
    }
    // 绘制重新开始按钮
    var id = this.selected.area === "restart" ? "restart1" : "restart0"
    ctx.drawImage(Images[id],
      this.restartButton_w0, this.restartButton_h0,
      this.restartButton_w, this.restartButton_w
    )
  },
  // 判断是否挑战成功
  check: function(play) {
    for (var i = 0; i < this.rank; i++) {
      for (var j = 0; j < this.rank; j++) {
        if (this.puzzle[i][j] === null) continue
        var p = this.puzzle[i][j]
        if (p.i !== i || p.j !== j) return
      }
    }
    play.result = 1
    play.stage = 2
  },
  // 处理点击、拖动事件
  handle: function(play, e) {
    // 点击重新开始
    var area = ""
    if (e.X > this.restartButton_w0 && e.X < this.restartButton_w1 &&
      e.Y > this.restartButton_h0 && e.Y < this.restartButton_h1
    ) area = "restart"
    // 点击拼图区域
    if (e.type === 1) {
      this.selected.area = area
      if (e.X < this.w0 || e.Y < this.h0 ||  e.X > this.w1 || e.Y > this.h1) return
      var i = parseInt((e.Y - this.h0) / this.w)
      var j = parseInt((e.X - this.w0) / this.w)
      var x = this.w0 + this.w * j + this.w_2
      var y = this.h0 + this.w * i + this.w_2
      this.selected = {area: "puzzle", i: i, j: j, p: this.puzzle[i][j], x: x, y: y}
      this.selected.x0 = (j > 0 && this.puzzle[i][j - 1] === null) ? 
        x - this.w : x
      this.selected.x1 = (j < this.rank - 1 && this.puzzle[i][j + 1] === null) ? 
        x + this.w : x
      this.selected.y0 = (i > 0 && this.puzzle[i - 1][j] === null) ? 
        y - this.w : y
      this.selected.y1 = (i < this.rank - 1 && this.puzzle[i + 1][j] === null) ? 
        y + this.w : y
    } else if (this.selected.area === "restart") {
      if (area !== "restart") this.selected.area = ""
      else if (e.type === 3) play.stage = 0
    } else if (this.selected.area === "puzzle") {
      this.selected.x = Math.min(Math.max(e.X, this.selected.x0), this.selected.x1)
      this.selected.y = Math.min(Math.max(e.Y, this.selected.y0), this.selected.y1)
      if (e.type === 3) {
        this.selected.area = ""
        var i = parseInt((this.selected.y - this.h0) / this.w)
        var j = parseInt((this.selected.x - this.w0) / this.w)
        this.puzzle[this.selected.i][this.selected.j] = null 
        this.puzzle[i][j] = this.selected.p
        this.check(play)
      }
    }
  }

}
