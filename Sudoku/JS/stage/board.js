
Board = function() {
  /* 固定值灰色, 选中半透明淡蓝色，冲突红色，默认白色、存疑黄色、青色、紫色
    col = {red: 0, yellow: 50, cyan: 170, purple: 290}
    hsv(col / 360, 25 / 100, 100 / 100)
  */
  this.colors = [
    "lightgray", "hsl(210, 100%, 50%, 0.25)", "#FFBFBF", 
    "white", "#FFF4BF", "#BFFFF4", "#F4BFFF", 
  ]
  this.status = Utils.newMat()
  this.dlx = new DLX()
}

Board.prototype = {
  init: function(difficulty) {
    this.resize()
    var d = this.dlx.generate(difficulty)
    this.puzzle = d.puzzle
    this.answer = d.answer
    for (var i = 0; i < 9; i++) {
      for (var j = 0; j < 9; j++) {
        if (this.puzzle[i][j] === 0) {
          this.status[i][j] = 3
        } else {
          this.status[i][j] = 0
        }
      }
    }
    // 历史记录管理器
    this.curr = -1
    this.steps = []
    this.maxSteps = 100
    // 填写格子时的默认状态：正常、存疑
    this.defaultStatus = 3
    // 当前选中的位置
    this.i = 9; this.j = 9
    this.selected = {area: "", id: -1}
  },

  resize: function() {
    this.w0 = adapt.W_100 * 5
    this.w1 = adapt.W_100 * 95
    this.h0 = adapt.H / 2 - adapt.W_100 *45
    this.h1 = adapt.H / 2 + adapt.W_100 *45
    this.cellW = adapt.W_100 * 10
    this.cellW_2 = this.cellW / 2
    // 顶部工具栏关键位置
    this.header_CellW = adapt.W_100 * 15
    this.header_CellGap = adapt.W_100 * 25
    this.header_h0 = adapt.H_4 - adapt.W_4 - this.header_CellW / 2
    this.header_h1 = this.header_h0 + this.header_CellW
    // 数字输入框关键位置
    this.footer_CellW = adapt.W_100 * 14
    this.footer_CellW_2 = this.footer_CellW / 2
    this.footer_w0 = adapt.W_100 * 25
    this.footer_w1 = this.footer_w0 + this.footer_CellW * 5
    this.footer_h0 = adapt.H_4 * 3 + adapt.W_4 - this.footer_CellW
    this.footer_h1 = this.footer_h0 + this.footer_CellW * 2
    // 调色板关键位置
    this.pavarte_CellW = this.footer_CellW / 4
    this.pavarte_w0 = this.w0
    this.pavarte_w1 = this.pavarte_w0 + this.footer_CellW
    this.pavarte_h0 = adapt.H_4 * 3 + adapt.W_4 - this.footer_CellW_2
    this.pavarte_h1 = this.pavarte_h0 + this.footer_CellW
  },

  draw: function(play) {
    // 绘制棋格
    ctx.font = 'normal ' + this.cellW_2 + 'px monospace'
    for (var i = 0; i < 9; i++) {
      for (var j = 0; j < 9; j++) {
        var s = this.status[i][j]
        ctx.fillStyle = this.colors[s]
        ctx.fillRect(
          this.w0 + this.cellW * j, 
          this.h0 + this.cellW * i, 
          this.cellW, this.cellW
        )
        // 当前被选中的格子
        if (this.i === i && this.j === j) {
          ctx.fillStyle = this.colors[1]
          ctx.fillRect(
            this.w0 + this.cellW * j, 
            this.h0 + this.cellW * i, 
            this.cellW, this.cellW
          )
        } 
        // 格子中的数字
        if (this.puzzle[i][j] === 0) continue
        ctx.fillStyle = "black"
        ctx.fillText(
          this.puzzle[i][j],
          this.w0 + this.cellW * (j + 0.5),
          this.h0 + this.cellW * (i + 0.5)
        )
      }
    }
    
    // 绘制边框
    for (var i = 0; i < 10; i++) {
      ctx.strokeStyle = i % 3 === 0 ? "black" : "lightgray"
      ctx.beginPath()
      ctx.moveTo(this.w0, this.h0 + this.cellW * i)
      ctx.lineTo(this.w1, this.h0 + this.cellW * i)
      ctx.moveTo(this.w0 + this.cellW * i, this.h0)
      ctx.lineTo(this.w0 + this.cellW * i, this.h1)
      ctx.closePath()
      ctx.stroke()
    }

    // 绘制顶部工具栏
    for (var i = 0; i < 4; i++) {
      var id = ["withdraw0", "redo0", "clearAll0", "restart0"][i]
      if (this.selected.area === "toolBar" && this.selected.id === i) {
        id = ["withdraw1", "redo1", "clearAll1", "restart1"][i]
      } 
      ctx.drawImage(Images[id],
        this.w0 + this.header_CellGap * i, this.header_h0, 
        this.header_CellW, this.header_CellW
      )
    }

    // 绘制数字输入框
    for (var i = 0; i < 5; i++) {
      for (var j = 0; j < 2; j++) {
        var num = i + j * 5
        if (this.selected.area === "number" && this.selected.id === num) {
          ctx.fillStyle = "lightgray"
          ctx.fillRect(
            this.footer_w0 + this.footer_CellW * i,
            this.footer_h0 + this.footer_CellW * j,
            this.footer_CellW, this.footer_CellW
          )
        }
        if (num === 0) continue
        ctx.fillStyle = "black"
        ctx.font = 'bold ' + this.footer_CellW_2 + 'px monospace'
        ctx.fillText(num, 
          this.footer_w0 + this.footer_CellW * (i + 0.5) ,
          this.footer_h0 + this.footer_CellW * (j + 0.5) ,
        )
      }
    }
    for (var i = 0; i < 6; i++) {
      ctx.strokeStyle = i % 5 === 0 ? "black" : "lightgray"
      ctx.beginPath()
      var x = this.footer_w0 + this.footer_CellW * i
      ctx.moveTo(x, this.footer_h0)
      ctx.lineTo(x, this.footer_h1)
      ctx.closePath()
      ctx.stroke()
    }
    for (var j = 0; j < 3; j++) {
      ctx.strokeStyle = j % 2 === 0 ? "black" : "lightgray"
      ctx.beginPath()
      var y = this.footer_h0 + this.footer_CellW * j
      ctx.moveTo(this.footer_w0, y)
      ctx.lineTo(this.footer_w1, y)
      ctx.closePath()
      ctx.stroke()
    }

    // 绘制调色板
    ctx.strokeStyle = "black"
    ctx.fillStyle = this.colors[this.defaultStatus]
    ctx.fillRect(
      this.w0, this.pavarte_h0, 
      this.footer_CellW, this.footer_CellW
    )
    for (var i = 0; i < 4; i++) {
      ctx.fillStyle = this.colors[i + 3]
      ctx.fillRect(
        this.w0 + this.pavarte_CellW * i, this.pavarte_h0, 
        this.pavarte_CellW, this.pavarte_CellW
      )
      ctx.strokeRect(
        this.w0 + this.pavarte_CellW * i, this.pavarte_h0, 
        this.pavarte_CellW, this.pavarte_CellW
      )
    }
    ctx.strokeRect(
      this.w0, this.pavarte_h0, 
      this.footer_CellW, this.footer_CellW
    )

  },

  // 计算草稿答案中 i,j 位置上的数字是否与其它位置上的数字冲突
  conflict: function(i, j) {
    var num = this.puzzle[i][j]
    if (num === 0) return false
    // 同一列
    for (var x = 0; x < 9; x++) {
      if (x !== i && this.puzzle[x][j] === num)
        return true
    }
    // 同一行
    for (var y = 0; y < 9; y++) {
      if (y !== j && this.puzzle[i][y] === num)
      return true
    }
    // 同一九宫格
    var m = parseInt(i / 3) * 3, n = parseInt(j / 3) * 3
    for (x = m; x < m + 3; x++) {
      for (y = n; y < n + 3; y++) {
        if (i !== x && j !== y && this.puzzle[x][y] === num)
          return true
      }
    }
    return false
  },
  //填写数字
  setCell: function(i, j, num, status) {
    this.puzzle[i][j] = num
    if (this.conflict(i, j)) {
      this.status[i][j] = 2
    } else if (num === 0) {
      this.status[i][j] = 3
    } else {
      this.status[i][j] = status
    }
    // 更新冲突域中所有格子的冲突状态
    for (var x = 0; x < 9; x++) {
      if (x !== i && this.status[x][j] === 2 &&
        !this.conflict(x, j)
      ) this.status[x][j] = 3
    }
    for (var y = 0; y < 9; y++) {
      if (y !== j && this.status[i][y] === 2 &&
        !this.conflict(i, y)
      ) this.status[i][y] = 3
    }
    var m = parseInt(i / 3) * 3, n = parseInt(j / 3) * 3
    for (x = m; x < m + 3; x++) {
      for (y = n; y < n + 3; y++) {
        if (x !== i && y !== j && this.status[x][y] === 2 &&
          !this.conflict(x, y)
        ) this.status[x][y] = 3
      }
    }
  },
  // 玩家输入数字
  playerGo: function(num) {
    if (this.i >= 9 || this.j >= 9 || 
      this.status[this.i][this.j] === 0
    ) return
    // 清除重复填写的数字0，或重复填入的数字及状态（颜色）
    if (this.puzzle[this.i][this.j] === num && num === 0) return
    if (this.puzzle[this.i][this.j] === num &&
      this.status[this.i][this.j] === this.defaultStatus
    ) return
    // 如果点击了下一步之后再填写数字，需要清除缓存的历史记录
    if(this.steps.length > this.curr + 1) 
      this.steps.splice(this.curr + 1, this.steps.length)
    // 如果没有历史记录或者跨格填写，需要记录格子的初始状态
    if (this.steps.length === 0 || 
      this.i !== this.steps[this.curr].i ||
      this.j !== this.steps[this.curr].j
    ) {
      this.steps.push({
        i: this.i, j: this.j,
        num: this.puzzle[this.i][this.j],
        status: this.status[this.i][this.j]
      })
      this.curr ++
    }
    // 记录格子当前的状态
    this.steps.push({
      i: this.i, j: this.j, 
      num: num,
      status: this.defaultStatus
    })
    this.curr ++
    // 如果历史纪录超出可允许的最大记录量，则删除最开始的记录
    if (this.steps > this.maxSteps) {
      this.steps.shift()
      this.curr --
    }
    this.setCell(this.i, this.j, num, this.defaultStatus)
  },
  // 上一步
  withDraw: function() {
    if (this.curr < 1 || this.curr >= this.steps.length) return
    var s1 = this.steps[this.curr]
    this.curr --
    var s2 = this.steps[this.curr]
    this.setCell(s2.i, s2.j, s2.num, s2.status)
    if (s1.i === s2.i && s1.j === s2.j) return
    if (this.curr < 1) return
    this.curr --
    var s3 = this.steps[this.curr]
    this.setCell(s3.i, s3.j, s3.num, s3.status)
  },
  // 下一步
  redo: function() {
    if (this.curr < -1 || this.curr > this.steps.length - 2) return
    var s1 = this.steps[this.curr + 1]
    this.setCell(s1.i, s1.j, s1.num, s1.status)
    this.curr ++
    if (this.curr > this.steps.length - 2) return
    var s2 = this.steps[this.curr + 1]
    if (s1.i === s2.i && s1.j === s2.j) return
    this.setCell(s2.i, s2.j, s2.num, s2.status)
    this.curr ++
  },
  // 清空全部
  clearAll: function() {
    for (var i = 0; i < 9; i++) {
      for (var j = 0; j < 9; j++) {
        if (this.status[i][j] === 0) continue
        this.puzzle[i][j] = 0
        this.status[i][j] = 3
      }
    }
    this.steps.splice(0, this.steps.length)
    this.curr = -1
  },
  // 判断是否挑战成功
  check: function(play) {
    for (var i = 0; i < 9; i++) {
      for (var j = 0; j < 9; j++) {
        if (this.puzzle[i][j] !== this.answer[i][j])
          return
      }
    }
    // 挑战成功
    play.result = 1
    play.stage = 2
  },

  handle: function(play, e) {
    // 通过键盘输入数字
    if (e.type === 5) {
      var num = parseInt(e.key)
      if (num >= 0 && num <= 9) {
        this.playerGo(e.num)
        this.check(play)
      }
    }
    // 点击数字输入框
    else if (e.X > this.footer_w0 && e.X < this.footer_w1 &&
      e.Y > this.footer_h0 && e.Y < this.footer_h1
    ) {
      var num = parseInt((e.X - this.footer_w0) / this.footer_CellW) +
        parseInt((e.Y - this.footer_h0) / this.footer_CellW) * 5
      if (e.type === 1) {
        this.selected = {area: "number", id: num}
      }
      else if (e.type === 3 && 
        this.selected.area === "number" && this.selected.id === num
      ) {
        this.playerGo(num)
        this.check(play)
      }
    }
    // 点击顶部工具栏
    else if (e.X > this.w0 &&
      (e.X - this.w0) % this.header_CellGap < this.header_CellW &&
      e.Y > this.header_h0 && e.Y < this.header_h1
    ) {
      var id = parseInt((e.X - this.w0) / this.header_CellGap)
      if (e.type === 1) {
        this.selected = {area: "toolBar", id: id}
      }
      else if (e.type === 3 && 
        this.selected.area === "toolBar" && this.selected.id === id
      ) {
        if (id === 0) this.withDraw()
        else if (id === 1) this.redo()
        else if (id === 2) this.clearAll()
        else if (id === 3) play.stage = 0
      }
    } 
    else if (e.type !== 1) { }
    // 点击数独棋盘
    else if (e.X > this.w0 && e.X < this.w1 &&
      e.Y > this.h0 && e.Y < this.h1  
    ) {
      this.j = parseInt((e.X - this.w0) / this.cellW)
      this.i = parseInt((e.Y - this.h0) / this.cellW)
    } 
    // 点击调色板
    else if (e.X > this.pavarte_w0 && e.X < this.pavarte_w1 &&
      e.Y > this.pavarte_h0 && e.Y < this.pavarte_h1
    ) {
      if (e.Y - this.pavarte_h0 < this.pavarte_CellW) {
        this.defaultStatus = parseInt((e.X - this.pavarte_w0) / this.pavarte_CellW) + 3
      } else {
        this.defaultStatus += 1
        if (this.defaultStatus > 6) this.defaultStatus = 3
      }
    }
    // 点击空白区域
    else { this.i = 9; this.j = 9 }
    // 清除之前选定的内容
    if (e.type === 3) this.selected = {area: "", id: -1}
  }

}
