
Board = function() {
  this.ai = new AI()
}

Board.prototype = {
  init: function(play) {
    // 初盘各棋子所在位置，i * 6 + j, 前四位为先手方，后四位为后手方
    this.puzzle = [1, 2, 3, 4, 6, 12, 18, 24]
    // 自动走棋机器人的阵营
    this.camp = (play.camp + 1) % 2
    // 决定自动走棋机器人需要考虑的回合数
    this.loops = [4, 8, 20][play.difficulty]
    // 开局0，玩家走棋1、2，AI走棋3、4，一方胜利5，终局6
    this.progress = 0
    this.selected = []
    this.lastMove = []
    this.availPos = []
    this.resize()
    if (play.camp !== 0) {
      this.autoGo(play)
      this.progress = 1
    }
  },

  resize: function() {
    // 记录棋盘关键信息
    this.x0 = 0.5 * adapt.W
    this.y0 = 0.5 * adapt.H + 0.45 * adapt.W
    this.y1 = 0.5 * adapt.H - 0.45 * adapt.W
    this.cellW = 0.09 * adapt.W
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
    ctx.fillText("双步棋", adapt.W_2, adapt.H * 0.15)    
    // 绘制重新开始按钮
    ctx.drawImage(Images["restart"],
      this.restartButton_w0, this.restartButton_h0,
      this.restartButton_w, this.restartButton_w
    )
    // 绘制棋盘
    ctx.strokeStyle = "black"
    ctx.beginPath()
    for (var i = 0; i < 5; i++) {
      var xr0 = this.x0 + i * this.cellW
      var xl0 = this.x0 - i * this.cellW
      var y0 = this.y0 - i * this.cellW
      var length = (i === 0) ? 4 : 5
      var xr1 = xr0 - length * this.cellW
      var xl1 = xl0 + length * this.cellW
      var y1 = y0 - length * this.cellW
      ctx.moveTo(xl0, y0)
      ctx.lineTo(xl1, y1)
      ctx.moveTo(xr0, y0)
      ctx.lineTo(xr1, y1)
    }
    ctx.stroke()
    // 绘制棋子
    for (var n in this.puzzle) {
      var i = parseInt(this.puzzle[n] / 6)
      var j = this.puzzle[n] % 6
      var x = this.x0 + (i - j) * this.cellW
      var y = this.y0 - (i + j) * this.cellW
      // 红黑阵营
      ctx.fillStyle = (n < 4) ? "red" : "blue"
      ctx.beginPath()
      ctx.arc(x, y, this.chessW_2, 0, Math.PI * 2)
      ctx.fill()
    }

  },
  //计算机自动走棋 
  autoGo: function(play) {
    var puzzle = this.ai.smartMove(this.puzzle, this.camp, this.loops)
    if (puzzle === null) play.result = 1
    else this.puzzle = puzzle
  },
  // 处理点击、拖动事件
  handle: function(play, e) {
    // 点击重新开始
    if (e.X > this.restartButton_w0 && e.X < this.restartButton_w1 &&
      e.Y > this.restartButton_h0 && e.Y < this.restartButton_h1
    ) { play.stage = 0; return }
    if (this.progress >= 3) return
    // 判断是否点击某个棋位
    for (var n = 0; n < 36; n++) {
      if ( n === 5 || n === 30) continue
      var i = parseInt(n / 6), j = n % 6
      var x = this.x0 + (i - j) * this.cellW
      var y = this.y0 - (i + j) * this.cellW
      if ( Math.pow(e.X - x, 2) + Math.pow(e.Y - y, 2) < 
      Math.pow(this.chessW_2, 2)
      ) break
    }
    // 点击空白区域
    if (n >= 36) return 
    var POS = i * 6 + j
    // 选中某个棋子
    if (this.selected === -1) {
      // 判断是否点击某个棋子
      for (var n = 0; n < 4; n++) {
        var p = this.puzzle[play.camp * 4 + n]
        if (p != POS) continue 
        this.selected = POS
        this.availPos = this.ai.availPos(this.puzzle, this.selected)
      }
      if (this.selected === -1) return 
    } 
    // 将选中的棋子移动至某个棋位
    else if (this.availPos.some(e => e === POS)) {
      this.puzzle[this.selected] = POS
      this.selected = -1
      play.result = this.ai.success(this.puzzle, play.camp)
      if (play.result !== 0) { play.stage = 2; return }
      this.autoGo(play)
      if (play.result !== 0) { play.stage = 2; return }
      play.result = this.ai.success(this.puzzle, play.camp)
      if (play.result !== 0) { play.stage = 2; return }
    }
    
  }

}
