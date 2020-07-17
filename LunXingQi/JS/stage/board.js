
Board = function() {
  this.ai = new AI()
  // 棋盘框线，[x0, y0, x1, y1]
  this.Blines = [
    [0, 0, 0, 8], [1, 1, 1, 7], [2, 0, 2, 8], [3, 1, 3, 7], [4, 0, 4, 8], 
    [2, 0, 4, 2], [0, 0, 4, 4], [0, 2, 4, 6], [0, 4, 4, 8], [0, 6, 2, 8], 
    [0, 2, 2, 0], [0, 4, 4, 0], [0, 6, 4, 2], [0, 8, 4, 4], [2, 8, 4, 6], 
  ]
}

Board.prototype = {
  init: function(play) {
    this.resize()
    // 6 * 6 棋盘，-1为不可到达位、0为空位、1为先手棋子、2为后手棋子
    this.puzzle = []
    // 决定自动走棋机器人需要考虑的回合数
    this.loops = [100, 1000][play.difficulty]
    // AI每次着棋间隔帧数
    this.AIwaits = 30
    // 轮到哪个棋子移动
    this.round = 0
    // AI的阵营
    this.camp = (play.camp + 1) % 2
    // 当前棋子可以移往的棋位
    this.availPos = this.ai.availPos(this.puzzle, this.round)
  },
  resize: function() {
    // 记录棋盘关键信息
    this.cellW_x = 0.2 * adapt.W
    this.cellW_y = Math.tan(Math.PI / 6) * this.cellW_x
    this.x0 = adapt.W_2 - 2 * this.cellW_x
    this.y0 = adapt.H_2 - 4 * this.cellW_y
    this.chessW = 0.12 * adapt.W
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
  // 判断是否轮到玩家着棋
  playerGo: function() {
    return this.round % 2 === play.camp
  },
  // 将棋位 [i, j] 转化为坐标点 [x, y]
  getXY: function(i, j) {
    return [this.x0 + i * this.cellW_x, this.y0 + j * this.cellW_y]
  },
  // 将坐标点 [x, y] 转化为棋位 [i, j]
  getPos: function(e) {
    for (var i = 0; i < 5; i++) {
      var [j0, j1] = (i % 2 === 0) ? [0, 8] : [1, 7]
      for (var j = j0; j <= j1; j += 2) {
        var [x, y] = this.getXY(i, j)
        if ((e.X - x) ** 2 + (e.Y - y) ** 2 < this.chessW_2 ** 2) return [i, j]
      }
    }
    return [-1, -1]
  },
  draw: function(play) {
    // 游戏标题
    ctx.textAlign = 'center'
    ctx.fillStyle = "black"
    ctx.font = 'bold ' + adapt.W_6 + 'px monospace'
    ctx.fillText("轮行棋", adapt.W_2, adapt.H * 0.15)
    // 绘制重新开始按钮
    ctx.drawImage(Images["restart"],
      this.Brestart_x0, this.Brestart_y0, this.buttonW, this.buttonW
    )
    // 绘制棋盘
    ctx.strokeStyle = "black"
    ctx.beginPath()
    for (var [i0, j0, i1, j1] of this.Blines) {
      ctx.moveTo(this.x0 + i0 * this.cellW_x, this.y0 + j0 * this.cellW_y)
      ctx.lineTo(this.x0 + i1 * this.cellW_x, this.y0 + j1 * this.cellW_y)
    }
    ctx.stroke()
    // 绘制棋子
    for (var n = 0; n < this.puzzle.length; n++) {
      var [i, j] = this.puzzle[n]
      var [x, y] = this.getXY(i, j)
      ctx.beginPath()
      ctx.arc(x, y, this.chessW_2, 0, Math.PI * 2)
      ctx.fillStyle = (n % 2 === 0) ? "red" : "blue"
      ctx.fill()
      ctx.fillStyle = "white"
      ctx.font = 'bold ' + this.chessW_2 + 'px monospace'
      ctx.fillText(n, x, y)
      ctx.strokeStyle = "black"
      ctx.stroke()
    }
    // 绘制回合按钮
    ctx.beginPath()
    ctx.arc(this.Bround_x, this.Bround_y, this.buttonW_2, 0, Math.PI * 2)
    ctx.fillStyle = (this.round % 2 === 0) ? "red" : "blue"
    ctx.fill()
    ctx.fillStyle = "white"
    ctx.font = 'bold ' + adapt.W_12 + 'px monospace'
    ctx.fillText(this.round, this.Bround_x, this.Bround_y)
    // 绘制可以移往的棋位
    if (this.availPos.length === 0) return
    ctx.strokeStyle =  (this.round % 2 === 0) ? "red" : "blue"
    for (var [i, j] of this.availPos) {
      var [x, y] = this.getXY(i, j)
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
    this.check(play, this.camp)
    this.AIwaits = 30
  },
  check: function(play, camp) {
    play.result = this.ai.success(this.puzzle, camp)
    if (play.result > 0) play.stage = 2
    this.availPos = []
    while (this.availPos.length <= 0) {
      this.round = (this.round + 1) % 10
      this.availPos = this.ai.availPos(this.puzzle, this.round)
    }
  },
  // 处理点击、拖动事件
  handle: function(play, e) {
    // 点击重新开始
    if (e.X > this.Brestart_x0 && e.X < this.Brestart_x1 &&
      e.Y > this.Brestart_y0 && e.Y < this.Brestart_y1
    ) { play.stage = 0; return }
    // 判断是否到玩家回合
    if (!this.playerGo()) return
    // 判断是否点击某个棋位
    var [i, j] = this.getPos(e)
    if (i < 0 || j < 0) return 
    // 将选中的棋子移动至某个棋位
    else if (this.availPos.some(e => e[0] === i && e[1] === j)) {
      this.puzzle[this.round] = [i, j]
      this.check(play, play.camp)
    }
  }

}
