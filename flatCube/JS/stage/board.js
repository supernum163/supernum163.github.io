
Board = function() {

}

Board.prototype = {
  init: function(difficulty) {
    this.rank = [3, 6, 9][difficulty]
    this.resize()
    this.puzzle = []
    this.colors = []
    for (var i = 0; i < this.rank; i++) {
      this.puzzle.push(Array(this.rank).fill(i))
      var h = i * 360 / this.rank
      this.colors.push("hsl(" + h + ", 80%, 80%)")
    }
    for (var i = 0; i < 30; i++) {
      var direct = Utils.choose(["up", "down", "left", "right"])
      var c = Utils.random(0, this.rank - 1)
      this.move(direct, c)
    }
    // 当前选中的位置
    this.selected = {area: "", id: -1}
  },

  resize: function() {
    this.w0 = adapt.W_100 * 5
    this.w1 = adapt.W_100 * 95
    this.h0 = adapt.H / 2 - adapt.W_100 *45
    this.h1 = adapt.H / 2 + adapt.W_100 *45
    this.w = adapt.W_100 * 90 / (this.rank + 2)
    // 重新开始按钮关键位置
    this.restartButton_w = adapt.W_100 * 20
    this.restartButton_w0 = adapt.W_2 - this.restartButton_w / 2
    this.restartButton_w1 = this.restartButton_w0 + this.restartButton_w
    this.restartButton_h0 = adapt.H_4 * 3 + adapt.W_4 - this.restartButton_w / 2
    this.restartButton_h1 = this.restartButton_h0 + this.restartButton_w
  },

  draw: function(play) {
    var id, i, j, num
    // 绘制棋格
    for (i = 1; i <= this.rank; i++) {
      for (j = 1; j <= this.rank; j++) {
        num = this.puzzle[i - 1][j - 1]
        ctx.fillStyle = this.colors[num]
        ctx.fillRect(
          this.w0 + j * this.w, this.h0 + i * this.w,
          this.w, this.w
        )
      }
    }
    // 绘制边框
    for (i = 1; i <= this.rank + 1; i++) {
      ctx.strokeStyle = i % this.rank === 1 ? "black" : "white"
      ctx.beginPath()
      ctx.moveTo(this.w0 + this.w, this.h0 + this.w * i)
      ctx.lineTo(this.w1 - this.w, this.h0 + this.w * i)
      ctx.moveTo(this.w0 + this.w * i, this.h0 + this.w)
      ctx.lineTo(this.w0 + this.w * i, this.h1 - this.w)
      ctx.closePath()
      ctx.stroke()
    }
    id = "restart1"
    // 绘制上下左右滑动行列的控制按钮
    for (i = 1; i <= this.rank; i++) {
      id = (this.selected.id === i && this.selected.area === "left") ? 
        "left1" : "left0"
      ctx.drawImage(Images[id], 
        this.w0, this.h0 + i * this.w, 
        this.w, this.w
      )
      id = (this.selected.id === i && this.selected.area === "up") ? 
        "up1" : "up0"
      ctx.drawImage(Images[id], 
        this.w0 + i * this.w, this.h0, 
        this.w, this.w
      )
      id = (this.selected.id === i && this.selected.area === "right") ? 
        "right1" : "right0"
      ctx.drawImage(Images[id], 
        this.w1 - this.w, this.h0 + i * this.w, 
        this.w, this.w
      )
      id = (this.selected.id === i && this.selected.area === "down") ? 
        "down1" : "down0"
      ctx.drawImage(Images[id], 
        this.w0 + i * this.w, this.h1 - this.w, 
        this.w, this.w
      )
    }
    // 绘制重新开始按钮
    id = this.selected.area === "restart" ? "restart1" : "restart0"
    ctx.drawImage(Images[id],
      this.restartButton_w0, this.restartButton_h0,
      this.restartButton_w, this.restartButton_w
    )
  },
  // 玩家滑动行列
  move: function(direct, c) {
    if (direct === "up") {
      var num = this.puzzle[0][c] 
      for (var i = 0; i < this.rank - 1; i++)
        this.puzzle[i][c] = this.puzzle[i + 1][c]
      this.puzzle[i][c] = num
    }
    else if (direct === "down") {
      var num = this.puzzle[this.rank - 1][c] 
      for (var i = this.rank - 1; i > 0; i--)
        this.puzzle[i][c] = this.puzzle[i - 1][c]
      this.puzzle[i][c] = num
    }
    else if (direct === "left") {
      var num = this.puzzle[c].shift()
      this.puzzle[c].push(num)
    }
    else if (direct === "right") {
      var num = this.puzzle[c].pop()
      this.puzzle[c].unshift(num)
    }
  },
  // 判断是否挑战成功
  check: function(play) {
    var rowEqual = true, colEqual = true
    for (var i = 0; i < this.rank - 1; i++) {
      if (!rowEqual) break
      for (var j = 0; j < this.rank; j++) {
        if (this.puzzle[i][j] !== this.puzzle[i + 1][j]) {
          rowEqual = false
          break
        }
      }
    }
    for (var i = 0; i < this.rank; i++) {
      if (!colEqual) break
      for (var j = 0; j < this.rank - 1; j++) {
        if (this.puzzle[i][j] !== this.puzzle[i][j + 1]) {
          colEqual = false
          break
        }
      }
    }
    if (rowEqual || colEqual) {
      play.result = 1
      play.stage = 2
    }
  },

  handle: function(play, e) {
    // 点击重新开始
    if (e.X > this.restartButton_w0 && e.X < this.restartButton_w1 &&
      e.Y > this.restartButton_h0 && e.Y < this.restartButton_h1
    ) {
      if (e.type === 1) this.selected = {area: "restart", id: 0}
      else if (e.type === 3 && 
        this.selected.area === "restart" && this.selected.id === 0
      ) play.stage = 0
    }
    // 点击顶部工具栏
    else if (e.X > this.w0 && e.Y > this.h0) {
      var i, j, area, id = 0
      i = parseInt((e.X - this.w0) / this.w)
      j = parseInt((e.Y - this.h0) / this.w)
      if (i === 0 && j > 0 && j <= this.rank) {
        area = "left"; id = j
      } else if (i === this.rank + 1 && j > 0 && j <= this.rank) {
        area = "right"; id = j
      } else if (j === 0 && i > 0 && i <= this.rank) {
        area = "up"; id = i
      } else if (j === this.rank + 1 && i > 0 && i <= this.rank) {
        area = "down"; id = i
      } 
      if (e.type === 1 && id > 0) this.selected = {area: area, id: id}
      else if (e.type === 3 && id > 0 &&
        this.selected.area === area && this.selected.id === id
      ) {
        this.move(this.selected.area, this.selected.id - 1)
        this.check(play)
      }
    }
    // 清除之前选定的内容
    if (e.type === 3) this.selected = {area: "", id: -1}
  }

}
