
Play = function() {
  // 游戏阶段， -1 加载界面，0 开始游戏界面，1 游戏过程，2 游戏结束
  this.stage = -1
  // 玩家的棋子类型， 0 代表 "○"， 1 代表 "×"
  this.offensive = 0
  // 游戏难度， 0 代表简单， 1 代表困难
  this.difficulty = 1
  this.resize()
  this.loop = this.framesLoop.bind(this)
  this.loop()
  this.handler = this.eventHandler.bind(this)
  canvas.ontouchstart = this.handler
  canvas.onmousedown = this.handler
}
  
Play.prototype = {
  init: function() {
    // 初始化棋盘，琦格中的 0 代表代表没有棋子，
    //  1 表示玩家下的棋子，-1 表示机器人下的棋子
    this.board = [0, 0, 0, 0, 0, 0, 0, 0, 0]
    this.result = ""
    this.autoGo = [this.autoGo0, this.autoGo1][this.difficulty]
  },
  
  resize: function() {
    // 棋盘横纵坐标起止位置
    this.border = adapt.W_100
    this.w0 = this.border
    this.w1 = adapt.W - this.border
    this.h0 = (adapt.H - adapt.W) / 2 + this.border
    this.h1 = (adapt.H + adapt.W) / 2 - this.border
    // 棋子距棋格的间距
    this.gap = adapt.W_12
    // 棋盘边长
    this.boardW = adapt.W - this.border * 2
    // 棋格边长
    this.cellW = this.boardW / 3 
    // 设置 ctx
    ctx.lineWidth = adapt.W_100 / 5
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center'
    ctx.strokeStyle = 'black'
  },
  
    // 玩家走棋
  playerGo: function(X, Y) {
    // 将像素点转化为棋格坐标
    var x = parseInt((X - this.w0) / this.cellW)
    var y = parseInt((Y - this.h0) / this.cellW)
    var z = x * 3 + y
    // 判断玩家是否点击了无效棋格
    if (X < this.w0 || Y < this.h0 || x > 2 || y > 2 ||
      this.board[z] !== 0
    ) return false
    // 将棋子放入相应棋格
    this.board[z] = 1
    return true
  },

  // 机器人自动走棋，低等级
  autoGo0: function() {
    // 寻找哪些位置没有棋子
    var tmp = []
    for (var i = 0; i < this.board.length; i++) {
      if (this.board[i] === 0) tmp.push(i)
    }
    // 从没有棋子的位置中随机选择一个着棋
    var p = tmp[parseInt(Math.random() * tmp.length)]
    this.board[p] = -1
  },

  // 机器人自动走棋，高等级
  autoGo1: function() {
    // 如果某条线上有两个棋子，则进行堵截或赢棋
    for (var line of Lines) {
      var lineSum = Utils.sumIndex(this.board, line)
      if (Math.abs(lineSum) != 2) continue;
      for (var l of line) {
        if (this.board[l] === 0) {
          this.board[l] = -1
          return
        }
      }
    }
    // 先中心、再角落、最后四边，检查空位落棋
    for (var p of Points) {
      if (this.board[p] === 0) {
        this.board[p] = -1
        return
      }
    }
  },

  // 检查是否有一方获胜，或和局
  check: function() {
    for (var line of Lines) {
      var lineSum = Utils.sumIndex(this.board, line)
      if (lineSum === 3) return "恭喜获胜"
      if (lineSum === -3) return "挑战失败"
    }
    if (this.board.every(x => x !== 0))
      return "和局"
    return ""
  },

  // 绘制开始游戏界面
  drawBg: function() {
    ctx.fillStyle = 'white'
    ctx.clearRect(0, 0, adapt.W, adapt.H)
    ctx.fillRect(0, 0, adapt.W, adapt.H)
  },
  
  // 绘制背景与棋盘
  draw: function() {
    this.drawBg()
    // 棋盘背景色
    ctx.fillStyle = 'burlywood'
    ctx.fillRect(0, this.h0 - this.border, adapt.W, adapt.W)
    // 棋盘外边框
    ctx.strokeRect(0, this.h0 - this.border, adapt.W, adapt.W)
    // 棋盘内边框
    ctx.strokeRect(this.w0, this.h0, this.boardW, this.boardW)
    // 棋盘网格线
    ctx.beginPath()
    for (var i = 1; i < 3; i++) {
      // 竖直线
      ctx.moveTo(this.w0 + this.cellW * i, this.h0)
      ctx.lineTo(this.w0 + this.cellW * i, this.h1)
      // 水平线
      ctx.moveTo(this.w0, this.h0 + this.cellW * i)
      ctx.lineTo(this.w1, this.h0 + this.cellW * i)
    }
    ctx.stroke()
    // 棋子
    for (var i = 0; i < 9; i++) {
      if (this.board[i] === 0) continue;
      var x = parseInt(i / 3), y = i % 3
      var chessType = [1, 0, 0, 1][this.board[i] + this.offensive + 1]
      ctx.drawImage(Images[chessType],
        this.w0 + this.cellW * x + this.gap, 
        this.h0 + this.cellW * y + this.gap, 
        this.cellW - this.gap * 2, 
        this.cellW - this.gap * 2
      )
    }
    // 玩家阵营
    ctx.drawImage(Images[this.offensive],
      adapt.W_2 - this.h0 * 0.2, this.h0 * 1.3 + this.boardW, this.h0 * 0.4, this.h0 * 0.4
    )
    // 比赛结果
    if (this.result !== "") {
      ctx.fillStyle = 'burlywood'
      ctx.fillRect(0, this.h0 * 0.5 - adapt.W_12, adapt.W, adapt.W_6)
      ctx.strokeRect(0, this.h0 * 0.5 - adapt.W_12, adapt.W, adapt.W_6)
      ctx.fillStyle = this.offensive ? "red" : "black"
      ctx.font = 'bold ' + adapt.W_12 + 'px monospace'
      ctx.fillText(this.result, adapt.W_2, this.h0 * 0.5)
    }
  },

  // 绘制开始游戏界面
  drawStarting: function() {
    this.drawBg()
    // 开关音频按钮
    ctx.drawImage(Images["bgm_paused_" + Audios.bgm.paused],
    adapt.W_100 * 3, adapt.W_100 * 3, adapt.W_100 * 7, adapt.W_100 * 7
    )
    // 开关全屏按钮
    if (document.fullscreenEnabled) {
      ctx.drawImage(Images["fullscreen_" + document.fullscreen],
        adapt.W_100 * 90, adapt.W_100 * 3, adapt.W_100 * 7, adapt.W_100 * 7
      )
    }
    // 难易度按钮
    ctx.drawImage(Images["difficulty" + this.difficulty],
      adapt.W_4 - adapt.W_6, adapt.H_2 - adapt.W_6, adapt.W_3, adapt.W_3
    )
    // 先后手按钮
    ctx.drawImage(Images["offensive" + this.offensive],
      adapt.W_4 * 3 - adapt.W_6, adapt.H_2 - adapt.W_6, adapt.W_3, adapt.W_3
    )
    // 开始游戏按钮
    ctx.fillStyle = 'burlywood'
    ctx.fillRect(adapt.W_12, adapt.H_4 * 3, adapt.W_6 * 5, adapt.W_6)
    ctx.strokeRect(adapt.W_12, adapt.H_4 * 3, adapt.W_6 * 5, adapt.W_6)
    ctx.fillStyle = 'black'
    ctx.font = 'bold ' + adapt.W_12 + 'px monospace'
    ctx.fillText("开始游戏", adapt.W_2, adapt.H_4 * 3 + adapt.W_12)
    // 游戏标题
    ctx.font = 'bold ' + adapt.W_6 + 'px monospace'
    ctx.fillText("井字棋", adapt.W_2, adapt.H_4)
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
    // 修改难易度
    else if (Math.pow(X - adapt.W_4, 2) + Math.pow(Y - adapt.H_2, 2) < 
      Math.pow(adapt.W_6, 2)
    ) this.difficulty = (this.difficulty + 1) % 2
    // 修改先后手
    else if (Math.pow(X - adapt.W_4 * 3, 2) + Math.pow(Y - adapt.H_2, 2) < 
      Math.pow(adapt.W_6, 2)
    ) this.offensive = (this.offensive + 1) % 2
    // 开始游戏
    else if (X > adapt.W_12 && X < adapt.W_12 * 11 &&
      Y > adapt.H_4 * 3 && Y < adapt.H_4 * 3 + adapt.W_6
    ) return 2
    else return 1
  },
  
  // 实现帧动画
  framesLoop: function() {
    if (this.stage === -1) {
      let progress = Loading.getProgress(Audios, Images)
      if (progress === 100) this.stage = 0
      Loading.draw(ctx, progress)
    }
    else if (this.stage === 0) this.drawStarting()
    else this.draw()
    this.aniId = window.requestAnimationFrame(this.loop, canvas) 
  },
  
  eventHandler: function(e) {
    e.preventDefault()
    
    let X, Y
    if (e.type === 'touchstart') {
      X = e.touches[0].clientX - adapt.W0
      Y = e.touches[0].clientY - adapt.H0
    } else if (e.type === 'mousedown') {
      X = e.clientX - adapt.W0
      Y = e.clientY - adapt.H0
    } else return

    if (this.stage === 0) {
      if (this.changeSettings(X, Y) !== 2) return
      // 开始游戏
      this.init()
      if (!this.offensive)
        this.autoGo()
      this.stage = 1
    } else if (this.stage === 1) {
      // 玩家下棋
      if (!this.playerGo(X, Y)) return
      var result = this.check()
      // 机器人下棋
      if (result === "") {
        this.autoGo()
        result =this.check()
      }
      // 检查结果
      if (result !== "") {
        this.result = result
        this.stage = 2
      }
    } else if (this.stage === 2) {
      this.stage = 0
    }
  }
  
}

