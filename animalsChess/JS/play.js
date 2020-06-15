
Play = function() {
  // 记录棋盘中所有的棋格
  this.positions = [
    [0, 0], [0, 1], [0, 2], [0, 3],  [1, 0], [1, 1], [1, 2], [1, 3],
    [2, 0], [2, 1], [2, 2], [2, 3],  [3, 0], [3, 1], [3, 2], [3, 3]
  ]
  // 自动走棋机器人
  this.autoGo0 = autoGo0.bind(this)
  this.autoGo1 = autoGo1.bind(this)
  this.offensive = true
  this.difficulty = 0
  // 游戏阶段， -1 加载界面，0 开始游戏界面，1 游戏过程，2 游戏结束
  this.stage = -1
  this.resize()
  // 全局帧动画
  this.loop = this.framesLoop.bind(this)
  this.loop()
  // 绑定触摸事件处理函数
  this.Tstart = this.touchStartHandler.bind(this)
  this.Tmove = this.touchMoveHandler.bind(this)
  this.Tend = this.touchEndHandler.bind(this)
  canvas.addEventListener('touchstart', this.Tstart)
  canvas.addEventListener('touchmove', this.Tmove)
  canvas.addEventListener('touchend', this.Tend)
  canvas.addEventListener('mousedown', this.Tstart)
  canvas.addEventListener('mousemove', this.Tmove)
  canvas.addEventListener('mouseup', this.Tend)

}

Play.prototype = {
  init: function() {
    // 根据难易度匹配机器人
    this.autoGo = [this.autoGo0, this.autoGo1][this.difficulty]
    // 棋格中：0 表示没有棋子；9 表示未翻开的棋子
    //  10至17 表示黑方棋子；20至27 表示红方棋子
    this.board = [
      [9, 9, 9, 9],
      [9, 9, 9, 9],
      [9, 9, 9, 9],
      [9, 9, 9, 9],
    ]
    // 每局重置时16个未翻开的棋子
    this.chesses = [
      10, 11, 12, 13, 14, 15, 16, 17, 
      20, 21, 22, 23, 24, 25, 26, 27, 
    ]
    // 玩家当前拖动的棋子，格式为 [i, j, chess, x, y]
    this.MVchess = []
    // 玩家阵营：1 表示黑色；2 表示红色
    this.camp = 0
    // 比赛结果，0 表示和局；1 表示恭喜获胜；2 表示挑战失败
    this.result = null
  },
  
  resize: function() {
    this.cellW = adapt.W_100 * 20
    this.cellW_2 = this.cellW / 2
    this.gap = adapt.W_100 * 4
    this.w0 = this.gap
    this.w = this.cellW + this.gap
    this.h0 = (adapt.H - adapt.W) / 2 + this.gap
    this.hFooter = adapt.H_4 * 3 + adapt.W_4
    ctx.strokeStyle = 'black'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
  },

  // 根据位置获取棋子
  getChess: function(i, j) {
    if (i < 0 || i > 3 || j < 0 || j > 3) return null
    return this.board[i][j]
  },

  // 根据位置修改棋子
  setChess: function(i, j, chess) {
    if (i < 0 || i > 3 || j < 0 || j > 3) return false
    this.board[i][j] = chess
    return true
  },

  // 判断将第一个棋子移动到第二个位置后的 “得分”
  scoreOfMove: function(i1, j1, chess1, i2, j2) {
    // 判断两个位置是否 “不近邻”
    if (Math.abs(i1 - i2) + Math.abs(j1 - j2) != 1) return -9
    // 获取第二个位置上的棋子
    var chess2 = this.getChess(i2, j2)
    // 判断第二个棋子是否未翻开，或两个棋子属于同一个阵营
    if (chess2 === null || chess2 === 9 ||
      parseInt(chess1 / 10) === parseInt(chess2 / 10)
    ) return -9
    // 判断第二个位置上是否没有棋子
    if (chess2 === 0) return 0.1
    // 判断移动后的 “得分”
    var chess1 = chess1 % 10; var chess2 = chess2 % 10
    if (chess1 === 7 && chess2 === 0) return -7
    if (chess1 === 0 && chess2 === 7) return 7
    if (chess1 === chess2) return 0
    return chess1 > chess2 ? chess2 + 1 :-chess1 - 1
  },

  // 将棋子翻面，或者从一个位置移动到另一个位置
  moveChess: function(i1, j1, chess1, i2, j2, playerGo) {
    // 将棋子翻面
    if (chess1 === 9) {
      if (i1 != i2 || j1 != j2) return false
      var i = parseInt(Math.random() * this.chesses.length)
      var chess = this.chesses.splice(i, 1)[0]
      this.setChess(i1, j1, chess)
      // 判断玩家阵营是否确立
      if (this.camp === 0)
        this.camp = (parseInt(chess / 10) + playerGo) % 2 + 1
      return true
    }
    // 将棋子从一个位置移动到另一个位置
    var score = this.scoreOfMove(i1, j1, chess1, i2, j2)
    // 判断第一个棋子是否能和第二个棋子 “同归于尽”
    if (score === 0) {
      this.setChess(i1, j1, 0)
      this.setChess(i2, j2, 0)
      return true
    }
    // 判断第一个棋子是否能走到第二个位置
    if (score > 0) {
      this.setChess(i1, j1, 0)
      this.setChess(i2, j2, chess1)
      return true
    }
    // 其它情况，如第一个棋子无法走到第二个位置
    return false
  },

  // 判断是否有一方获胜，0 表示挑战继续；1 表示恭喜获胜，2 表示挑战失败，3 表示和局
  check: function() {
    // 获取棋盘中 “存活” 的棋子
    var survivors = []
    for (var i = 0; i < 4; i++) {
      for (var j = 0; j < 4; j++) {
        if (this.board[i][j] === 9) return 0
        if (this.board[i][j] === 0) continue
        survivors.push([i, j, this.board[i][j]])
      }
    }
    // 判断黑色和红色是否有一方无路可走
    var canMove = 0
    for (var k = 0; k < survivors.length; k++) {
      var i = survivors[k][0]; var j = survivors[k][1]
      var chess = survivors[k][2]
      if (canMove === parseInt(chess / 10)) continue
      var directions = [[i - 1, j], [i + 1, j], [i, j + 1], [i, j - 1]]
      while (directions.length > 0) {
        var pos = directions.splice(0, 1)[0]
        if (this.scoreOfMove(i, j, chess, pos[0], pos[1]) < 0) continue
        canMove += parseInt(chess / 10)
        break
      }
      if (canMove === 3) break
    }
    if (canMove === 0) return 3
    if (canMove === this.camp) return 1
    if (canMove === this.camp % 2 + 1) return 2
    // 如果有两个不同阵营的 “存活” 的棋子，且无法角逐胜负，则和局
    if (survivors.length === 2 && 
      (survivors[0][0] + survivors[0][1] - survivors[1][0] - survivors[1][1]) % 2 === 0
    ) return 3
    // 可以继续下棋
    return 0
  },

  // 绘制背景
  drawBg: function() {
    ctx.fillStyle = 'white'
    ctx.clearRect(0, 0, adapt.W, adapt.H)
    ctx.fillRect(0, 0, adapt.W, adapt.H)
  },

  // 绘制下棋过程
  draw: function() {
    this.drawBg()
    // 4 * 4 棋格
    for (var i = 0; i < 4; i++) {
      for (var j = 0; j < 4; j++) {
        ctx.drawImage(Images[this.board[i][j]],
          this.w0 + this.w * i, this.h0 + this.w * j,
          this.cellW, this.cellW
        )
      }
    }
    // 玩家阵营与重新开始按钮
    if (this.camp > 0) {
      ctx.drawImage(Images["camp" + this.camp],
        adapt.W_6, this.hFooter - adapt.W_12, adapt.W_3 * 2, adapt.W_6
      )
    }
    // 玩家当前拖动的棋子
    if (this.MVchess.length === 5) {
      ctx.drawImage(Images[this.MVchess[2]],
        this.MVchess[3] - this.cellW_2,
        this.MVchess[4] - this.cellW_2,
        this.cellW, this.cellW
      )
    }
  },

  // 将像素点转化为棋格坐标
  transPos: function(X, Y) {
    if (X < this.w0 || Y < this.h0) return []
    var i = parseInt((X - this.w0) / this.w)
    var j = parseInt((Y - this.h0) / this.w)
    if (i > 3 || j > 3) return []
    return [i, j]
  },

  // 玩家走棋
  playerGo: function() {
    // 获取 “正在移动的棋子”
    var m = this.MVchess
    if (m.length != 5) return false
    // 将像素点转化为棋格坐标
    var pos = this.transPos(m[3], m[4])
    if (pos.length != 2) return false
    // 移动棋子
    return this.moveChess(m[0], m[1], m[2], pos[0], pos[1], true)
  },

  // 判断玩家是否点击了重新开始按钮
  restart: function(X, Y) {
    if (X > adapt.W_2 - 38 && X < adapt.W_2 + 97 &&
      Y > this.hFooter - 30 && Y < this.hFooter + 30
    ) return true
    return false
  },

  // 绘制开始界面
  drawStarting: function() {
    this.drawBg()
    // 游戏标题
    ctx.textAlign = 'center'
    ctx.fillStyle = "black"
    ctx.font = 'bold ' + adapt.W_6 + 'px monospace'
    ctx.fillText("斗兽棋", adapt.W_2, adapt.H_4)
    // 先后手按钮
    ctx.font = 'normal ' + adapt.W_12 + 'px monospace'
    ctx.strokeRect(adapt.W_12, adapt.H_2 - adapt.W_6, adapt.W_6 * 5, adapt.W_6)
    ctx.fillText(this.offensive ? "先手" : "后手", 
      adapt.W_2, adapt.H_2 - adapt.W_12
    )
    // 难易度按钮
    ctx.strokeRect(adapt.W_12, adapt.H_2 + adapt.W_12, adapt.W_6 * 5, adapt.W_6)
    ctx.fillText(this.difficulty === 0 ? "简单" : "普通", 
      adapt.W_2, adapt.H_2 + adapt.W_6
    )
    // 开始按钮
    ctx.strokeRect(adapt.W_12, adapt.H_4 * 3, adapt.W_6 * 5, adapt.W_6)
    ctx.fillText("开始游戏", adapt.W_2, adapt.H_4 * 3 + adapt.W_12)
  },

  // 修改游戏设定，null表示修改了某些设定，1表示什么也没有修改，2表示点击开始游戏
  changeSettings: function(X, Y) {
    // 开关音频
    if (X > adapt.W_100 * 3 && X < adapt.W_100 * 10 &&
      Y > adapt.W_100 * 3 && Y < adapt.W_100 * 10
    ) Audios.bgm.paused ? Audios.bgm.play() : Audios.bgm.pause()
    // 请求全屏
    else if (document.fullscreenEnabled &&
        X > adapt.W_100 * 90 && X < adapt.W_100 * 97 &&
        Y > adapt.W_100 * 3 && Y < adapt.W_100 * 10
    ) document.fullscreen ? document.exitFullscreen() :
      document.documentElement.requestFullscreen()
    // 修改先后手
    else if (X > adapt.W_12 && X < adapt.W_12 * 11 && 
      Y > adapt.H_2 - adapt.W_6 && Y < adapt.H_2
    ) this.offensive = !this.offensive
    // 修改难易度
    else if (X > adapt.W_12 && X < adapt.W_12 * 11 && 
      Y > adapt.H_2 + adapt.W_12 && Y < adapt.H_2 + adapt.W_4
    ) this.difficulty = (this.difficulty + 1) % 2
    // 点击开始游戏
    else if (X > adapt.W_12 && X < adapt.W_12 * 11 && 
      Y > adapt.H_4 * 3 && Y < adapt.H_4 * 3 + adapt.W_6
    ) return 2
    else return 1
  },

  // 绘制比赛结果
  drawEndding: function() {
    this.drawBg()
    // 上下边框
    ctx.beginPath()
    ctx.moveTo(0,       adapt.H_2 - adapt.W_12)
    ctx.lineTo(adapt.W, adapt.H_2 - adapt.W_12)
    ctx.moveTo(0,       adapt.H_2 + adapt.W_12)
    ctx.lineTo(adapt.W, adapt.H_2 + adapt.W_12)
    ctx.stroke()
    // 是否挑战成功
    ctx.textAlign = 'center'
    ctx.font = 'normal ' + adapt.W_12 + 'px monospace'
    ctx.fillStyle = ["white", "black", "red", "black"][this.result]
    var msg = ["挑战继续", "恭喜获胜", "挑战失败", "和局"][this.result]
    ctx.fillText(msg, adapt.W_2, adapt.H_2)
  },

  framesLoop: function() {
    if (this.stage === -1) {
      let progress = Loading.getProgress(Audios, Images)
      if (progress === 100) this.stage = 0
      Loading.draw(ctx, progress)
    }
    else if (this.stage === 0) this.drawStarting()
    else if (this.stage === 3) this.drawEndding()
    else this.draw()
    this.aniId = window.requestAnimationFrame(this.loop, canvas)
  },

  touchStartHandler: function(e) {
    e.preventDefault()
    let X, Y
    if (e.type === 'touchstart') {
      X = e.touches[e.touches.length - 1].clientX - adapt.W0
      Y = e.touches[e.touches.length - 1].clientY - adapt.H0
    } else if (e.type === 'mousedown') {
      X = e.clientX - adapt.W0
      Y = e.clientY - adapt.H0
    } else return

    // 游戏起始界面，允许调整先后手及难易度
    if (this.stage === 0) {
      if (this.changeSettings(X, Y) !== 2) return
      // 点击 “开始游戏”
      this.stage = 1
      this.init()
      if (!this.offensive)
        this.autoGo()
    }
    // 游戏结束时，点击绘制比赛结果
    else if (this.stage === 2) this.stage = 3
    // 比赛结果界面，或者玩家点击了重新开始按钮
    else if (this.stage === 3 || 
      (this.stage === 1 && this.restart(X, Y))
    ) this.stage = 0
    // 将像素点转化为棋格坐标
    else {
      var pos = this.transPos(X, Y)
      if (pos.length != 2) return
      // 记录 “正在移动的棋子”
      var chess = this.getChess(pos[0], pos[1])
      if (chess === 0) return
      if (chess != 9 && parseInt(chess / 10) != this.camp) return
      this.MVchess = [pos[0], pos[1], chess, X, Y]
      this.setChess(pos[0], pos[1], 1)
    }

  },

  touchMoveHandler: function(e) {
    let m = this.MVchess
    if (this.stage != 1 || m.length != 5) return
    e.preventDefault()
    if (e.type === 'touchmove') {
      m[3] = e.touches[0].clientX - adapt.W0
      m[4] = e.touches[0].clientY - adapt.H0
    } else if (e.type === 'mousemove') {
      m[3] = e.clientX - adapt.W0
      m[4] = e.clientY - adapt.H0
    } else return
  },

  touchEndHandler: function(e) {
    let m = this.MVchess
    if (this.stage != 1 || m.length != 5) return
    e.preventDefault()
    if (e.type === 'touchend') {
      m[3] = e.changedTouches[0].clientX - adapt.W0
      m[4] = e.changedTouches[0].clientY - adapt.H0
    } else if (e.type === 'mouseup') {
      m[3] = e.clientX - adapt.W0
      m[4] = e.clientY - adapt.H0
    } else return

    // 玩家走棋
    if (!this.playerGo()) {
      this.setChess(m[0], m[1], m[2])
      this.MVchess = []
      return
    }
    // 玩家走棋成功之后，也要清除 “正在移动的棋子”
    this.MVchess = []
    // 自动走棋
    this.result = this.check()
    if (this.result === 0) this.autoGo()
    // 判断胜负
    this.result = this.check()
    if (this.result != 0) this.stage = 2
  }

}
