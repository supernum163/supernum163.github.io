
Board = function() {
  this.ai = new AI()
}

Board.prototype = {
  init: function(play) {
    this.resize()
    // 6 * 6 棋盘，-1为不可到达位、0为空位、1为先手棋子、2为后手棋子
    this.puzzle = [
      [ 0,  1,  1,  1,  1, -1],
      [ 2,  0,  0,  0,  0,  0],
      [ 2,  0,  0,  0,  0,  0],
      [ 2,  0,  0,  0,  0,  0],
      [ 2,  0,  0,  0,  0,  0],
      [-1,  0,  0,  0,  0, -1],
    ]
    // 决定自动走棋机器人需要考虑的回合数
    this.loops = [100, 1000][play.difficulty]
    // 自动走棋机器人的阵营
    this.camp = play.camp % 2 + 1
    // AI每次着棋间隔帧数
    this.AIwaits = 30
    // 开局0，先手走棋1、2，后手走棋3、4
    this.round = 2
    // 玩家选中的棋子和可以移往的棋位
    this.selected = []
    this.availPos = []
  },
  resize: function() {
    // 记录棋盘关键信息
    this.x0 = adapt.W_2
    this.y0 = adapt.H_2 + 0.45 * adapt.W
    this.y1 = adapt.H_2 - 0.45 * adapt.W
    this.cellW = 0.09 * adapt.W
    this.chessW = 0.1 * adapt.W
    this.chessW_2 = this.chessW / 2
    // 底部功能按钮宽度
    this.buttonW = 0.2 * adapt.W
    this.buttonW_2 = this.buttonW / 2
    // 重新开始按钮关键位置
    this.Brestart_x0 = adapt.W_3 - this.buttonW_2
    this.Brestart_x1 = this.Brestart_x0 + this.buttonW
    this.Brestart_y0 = adapt.H_4 * 3 + adapt.W_4 - this.buttonW_2
    this.Brestart_y1 = this.Brestart_y0 + this.buttonW
    // 回合按钮关键位置
    this.Bround_x = adapt.W_3 * 2
    this.Bround_y = adapt.H_4 * 3 + adapt.W_4
  },
  playerGo: function() {
    return Math.ceil(this.round / 2) === play.camp
  },
  draw: function(play) {
    // 游戏标题
    ctx.textAlign = 'center'
    ctx.fillStyle = "black"
    ctx.font = 'bold ' + adapt.W_6 + 'px monospace'
    ctx.fillText("双步棋", adapt.W_2, adapt.H * 0.15)
    // 绘制重新开始按钮
    ctx.drawImage(Images["restart"],
      this.Brestart_x0, this.Brestart_y0, this.buttonW, this.buttonW
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
    ctx.strokeStyle = "green"
    var playerChoose = this.playerGo() && this.selected.length === 0
    for (var i = 0; i < this.puzzle.length; i++) {
      for (j = 0; j < this.puzzle[i].length; j++) {
        var chess = this.puzzle[i][j]
        if (chess <= 0) continue
        var x = this.x0 + (i - j) * this.cellW
        var y = this.y0 - (i + j) * this.cellW
        ctx.beginPath()
        ctx.arc(x, y, this.chessW_2, 0, Math.PI * 2)
        ctx.fillStyle = ["white", "red", "blue"][chess]
        ctx.fill()
        if (playerChoose && play.camp === chess) ctx.stroke()
      }
    }
    // 绘制回合按钮
    ctx.beginPath()
    ctx.arc(this.Bround_x, this.Bround_y, this.buttonW_2, 0, Math.PI * 2)
    ctx.fillStyle = (this.round > 2) ? "blue" : "red"
    ctx.fill()
    ctx.fillStyle = "white"
    ctx.font = 'bold ' + adapt.W_12 + 'px monospace'
    ctx.fillText(this.round, this.Bround_x, this.Bround_y)
    // 强调被选中的棋子
    if (this.selected.length === 0) return
    var [i, j] = this.selected
    x = this.x0 + (i - j) * this.cellW
    y = this.y0 - (i + j) * this.cellW
    ctx.beginPath()
    ctx.arc(x, y, this.chessW_2, 0, Math.PI * 2)
    ctx.stroke()
    // 绘制可以移往的棋位
    for (var pos of this.availPos) {
      var [i, j] = pos
      x = this.x0 + (i - j) * this.cellW
      y = this.y0 - (i + j) * this.cellW
      ctx.beginPath()
      ctx.arc(x, y, this.chessW_2, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    }
  },
  // AI自动走棋 
  update: function(play) {
    if (this.playerGo()) return
    if (this.AIwaits > 0) { this.AIwaits--; return }
    this.puzzle = this.ai.smartMove(this.puzzle, this.round, this.loops)
    this.AIwaits = 30
    this.check(play, play.camp * 2)
  },
  check : function(play, finalRound) {
    var result = this.ai.success(this.puzzle, play.camp)
    if (play.result === 0 && result !== 0) {
      play.result = result
      if ([1, 3].indexOf(this.round) > -1) play.stage = 2
      else this.round = finalRound
    } else if (play.result !== 0) {
      play.result = result
      play.stage = 2
    } else {
      this.round = this.round % 4 + 1
    }
  },
  // 将坐标点 [x, y] 转化为棋位 [i, j]
  getPos: function(e) {
    for (var i = 0; i < this.puzzle.length; i++) {
      for (j = 0; j < this.puzzle[i].length; j++) {
        var chess = this.puzzle[i][j]
        if (chess < 0) continue
        var x = this.x0 + (i - j) * this.cellW
        var y = this.y0 - (i + j) * this.cellW
        if ( Math.pow(e.X - x, 2) + Math.pow(e.Y - y, 2) < 
          Math.pow(this.chessW_2, 2)
        ) return [i, j]
      }
    }
    return [i, j]
  },
  // 处理点击、拖动事件
  handle: function(play, e) {
    // 点击重新开始
    if (e.X > this.Brestart_x0 && e.X < this.Brestart_x1 &&
      e.Y > this.Brestart_y0 && e.Y < this.Brestart_y1
    ) { play.stage = 0; return }
    // 判断是否到玩家回合
    if (!this.playerGo()) return
    // 点击回合按钮时，跳过当前回合
    if (this.buttonW_2 ** 2 > 
      (e.X - this.Bround_x) ** 2 + (e.Y - this.Bround_y) ** 2
    ) { this.round = this.round % 4 + 1; return }
    // 判断是否点击某个棋位
    var [i, j] = this.getPos(e)
    // 点击空白区域
    if (i > 5 || j > 5) {
      this.selected = []
      return
    } 
    // 选中某个棋子
    if (this.puzzle[i][j] === play.camp) {
      this.selected = [i, j]
      this.availPos = this.ai.availPos(this.puzzle, i, j)
    }
    // 将选中的棋子移动至某个棋位
    else if (this.availPos.some(e => e[0] === i && e[1] === j)) {
      this.puzzle[i][j] = play.camp
      var [i, j] = this.selected
      this.puzzle[i][j] = 0
      this.selected = []
      this.check(play, this.camp * 2)
    }
  }

}
