
Board = function() {
  this.bfs = new BFS()
}

Board.prototype = {
  init: function(play) {
    // 初盘各棋子所在位置，棋子类型分别为 ["牛", "猎人1", "猎人2"]
    this.puzzle = [0, 8, 9]
    // 自动走棋机器人的阵营
    this.camp = (play.camp + 1) % 2
    // 决定自动走棋机器人需要考虑的回合数
    this.loops = [4, 8, 20][play.difficulty]
    this.selected = -1
    this.availPos = []
    this.resize()
    if (play.camp !== 0) this.autoGo(play)
  },

  resize: function() {
    // 两条弧线 a, b 构成牛角左右边
    this.a_d = 2 * Math.atan(1 / 4)
    this.a_r = 0.8 * adapt.W / Math.sin(this.a_d)
    this.a_x = 0.4 * adapt.W - this.a_r
    this.ab_y = 0.4 * adapt.W + adapt.H_2
    this.b_d = 2 * Math.atan(3 / 4)
    this.b_r = 0.8 * adapt.W / Math.sin(this.b_d)
    this.b_x = 0.8 * adapt.W - this.b_r
    this.pos = Array(10)
    // 记录牛角棋中的每个棋位，共10个
    var x, y
    for (var i = 0; i < 5; i++) {
      x = this.a_x + Math.cos(this.a_d / 4 * i) * this.a_r
      y = this.ab_y - Math.sin(this.a_d / 4 * i) * this.a_r
      this.pos[8 - i * 2] = [x, y]
      x = this.b_x + Math.cos(this.b_d / 5 * i) * this.b_r
      y = this.ab_y - Math.sin(this.b_d / 5 * i) * this.b_r
      this.pos[9 - i * 2] = [x, y]
    }
    // 记录棋子大小
    this.chessW = 0.1 * adapt.W
    this.chessW_2 = this.chessW / 2
    // 重新开始按钮关键位置
    this.restartButton_w = adapt.W_100 * 20
    this.restartButton_w0 = adapt.W_2 - this.restartButton_w / 2
    this.restartButton_w1 = this.restartButton_w0 + this.restartButton_w
    this.restartButton_h0 = adapt.H_4 * 3 + adapt.W_4 - this.restartButton_w / 2
    this.restartButton_h1 = this.restartButton_h0 + this.restartButton_w
  },
  draw: function(play) {
    // 游戏标题
    ctx.textAlign = 'center'
    ctx.fillStyle = "black"
    ctx.font = 'bold ' + adapt.W_6 + 'px monospace'
    ctx.fillText("牛角棋", adapt.W_2, adapt.H * 0.15)    
    // 绘制重新开始按钮
    ctx.drawImage(Images["restart"],
      this.restartButton_w0, this.restartButton_h0,
      this.restartButton_w, this.restartButton_w
    )
    // 绘制棋盘
    ctx.strokeStyle = "black"
    ctx.beginPath()
    ctx.arc(this.a_x, this.ab_y, this.a_r, -this.a_d, 0)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(this.b_x, this.ab_y, this.b_r, -this.b_d, 0)
    ctx.stroke()
    ctx.beginPath()
    for (var i = 1; i < 10; i++) {
      var [x, y] = this.pos[i]
      ctx.lineTo(x, y)
    }
    ctx.stroke()
    // 绘制棋子
    for (var i = 0; i < 3; i++) {
      var [x, y] = this.pos[this.puzzle[i]]
      var img = (i === 0) ? Images["cow"] : Images["hunter"]
      ctx.drawImage(img, x - this.chessW_2, y - this.chessW_2, 
        this.chessW, this.chessW
      )
      // 绘制棋子边框
      ctx.strokeStyle = (i === this.selected) ? 
        "hsl(210, 100%, 50%)" : "black"
      ctx.beginPath()
      ctx.arc(x, y, this.chessW_2, 0, Math.PI * 2)
      ctx.stroke()
    }
    // 绘制某个棋子被选中时，其可以移动的位置
    if (this.selected < 0) return
    ctx.fillStyle = "white"
    ctx.strokeStyle = "hsl(210, 100%, 50%)"
    for (var p of this.availPos) {
      ctx.beginPath()
      var [x, y] = this.pos[p]
      ctx.arc(x, y, this.chessW_2, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    }
  },
  //计算机自动走棋 
  autoGo: function(play) {
    var puzzle = this.bfs.smartMove(this.puzzle, this.camp, this.loops)
    if (puzzle === null) play.result = 1
    else this.puzzle = puzzle
  },
  // 处理点击、拖动事件
  handle: function(play, e) {
    // 点击重新开始
    if (e.X > this.restartButton_w0 && e.X < this.restartButton_w1 &&
      e.Y > this.restartButton_h0 && e.Y < this.restartButton_h1
    ) play.stage = 0
    // 判断是否点击某个棋位
    for (var i = 0; i < this.pos.length; i++) {
      var [x, y] = this.pos[i]
      if (Math.abs(e.X - x) < this.chessW_2 && 
        Math.abs(e.Y - y) < this.chessW_2
      ) break
    }
    // 点击空白区域
    if (i >= this.pos.length) {
      this.selected = -1
      return
    } 
    // 选中某个棋子
    if (this.selected < 0) {
      // 判断是否点击某个棋子
      for (var j = 0; j < this.puzzle.length; j++) {
        if (this.puzzle[j] === i) break
      }
      if (j >= this.puzzle.length || play.camp !== [0, 1, 1][j]) return 
      this.selected = j
      this.availPos = this.bfs.availPos(this.puzzle, j)
    } 
    // 将选中的棋子移动至某个棋位
    else if (this.availPos.some(e => e === i)) {
      this.puzzle[this.selected] = i
      this.selected = -1
      play.result = this.bfs.success(this.puzzle, play.camp)
      if (play.result !== 0) { play.stage = 2; return }
      this.autoGo(play)
      if (play.result !== 0) { play.stage = 2; return }
      play.result = this.bfs.success(this.puzzle, play.camp)
      if (play.result !== 0) { play.stage = 2; return }
    }
    
  }

}
