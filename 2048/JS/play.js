
Play = function() {
  // 游戏阶段， -1 加载界面，0 开始游戏界面，1 游戏过程，2 游戏结束
  this.stage = -1
  this.resize()
  this.loop = this.framesLoop.bind(this)
  this.loop()
  this.Tstart = this.touchStartHandler.bind(this)
  this.Tend = this.touchEndHandler.bind(this)
  this.kewDown = this.keyDownHandler.bind(this)
  canvas.addEventListener('touchstart', this.Tstart)
  canvas.addEventListener('touchend', this.Tend)
  canvas.addEventListener('mousedown', this.Tstart)
  canvas.addEventListener('mouseup', this.Tend)
  window.addEventListener('keydown', this.kewDown)
}
  
Play.prototype = {
  init: function() {
    /*
    this.board = [
      [128, 64, 32, 16], 
      [16, 2, 4, 8], 
      [8, 4, 2, 16], 
      [256, 512, 1024, 2048], 
    ]
    */
    this.board = Utils.newMat()
    let i = Utils.random(0, 3)
    let j = Utils.random(0, 3)
    this.board[i][j] = 2
    // 棋盘中每个棋子是否合并过
    this.appends = Utils.newMat()
    // 棋盘整体的合并进度
    this.updated = 0
    // 滑动方向，0-4分别表示向上、左、下、右，其它为无效值
    this.direct = -1
    // 每个棋子的颜色
    this.colors = [
      "#FFA1A1", "#FF9494", "#FF8686", "#FF7979", 
      "#FF6B6B", "#FF5E5E", "#FF5151", "#FF4343", 
      "#FF3636", "#FF2828", "#FF1B1B", "#FF0D0D", 
      "#FF0000", "#FF0000", "#FF0000", "#FF0000",
    ]
    this.result = 0
    // 触摸开始的位置，根据触摸结束位置及该位置决定滑动方向
    this.TSP = []
  },
  
  resize: function() {
    // 棋盘横纵坐标起止位置
    this.w0 = adapt.W_100
    this.w1 = adapt.W - this.w0
    this.h0 = (adapt.H - adapt.W) / 2 + this.w0
    this.h1 = (adapt.H + adapt.W) / 2 - this.w0
    // 棋盘边长
    this.boardW = adapt.W - this.w0 * 2
    // 棋格边长
    this.cellW = this.boardW / 4 
    this.cellW_2 = this.cellW / 2
    // 棋子字体宽度
    this.fontSize = [this.cellW_2,
      this.cellW_2 / Math.log2(2), this.cellW_2 / Math.log2(3),
      this.cellW_2 / Math.log2(4), this.cellW_2 / Math.log2(5),
    ]
    // 线条宽度
    this.normalLineW = adapt.W_100 / 5
    this.boldLineW = adapt.W_100 / 2
    // 设置 ctx
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center'
    ctx.strokeStyle = 'black'
  },

  update: function() {
    // 合并的第一阶段，锁定合并状态，清除之前缓存的合并记录表
    if (this.updated === 0) {
      this.updated = 1
      this.appends.forEach(e => e.fill(0))
    }

    // 将现有棋子进行合并
    let [i0, j0, istep, jstep, mstep, nstep] = [
      [0, 0, 1, 1, 1, 0],
      [0, 0, 1, 1, 0, 1],
      [3, 0, -1, 1, -1, 0],
      [0, 3, 1, -1, 0, -1]
    ] [this.direct]
    let append = 0
    for (var i = i0; i in [0, 1, 2, 3]; i += istep) {
      for (var j = j0; j in [0, 1, 2, 3]; j += jstep) {
        var [m, n] = [i + mstep, j + nstep]
        if (m < 0 || m > 3 || n < 0 || n > 3) continue
        if (this.board[i][j] === 0) {
          if (this.board[m][n] === 0) continue
          this.board[i][j] = this.board[m][n]
          this.board[m][n] = 0
          append = 1
        } else if (this.board[i][j] === this.board[m][n]) {
          if (this.appends[i][j] !== 0 || this.appends[m][n] !== 0) continue
          this.board[i][j] *= 2
          this.board[m][n] = 0
          this.appends[i][j] = 1
          append = 1
        }
      }
    }
    // 检查是否挑战成功
    let avilPos = []
    for (var i = 0; i < 4; i++) {
      for (var j = 0; j < 4; j++) {
        if (this.board[i][j] >= 2048) {
          Audios.playBoom("success")
          return 1
        }
        if (this.board[i][j] === 0)
        avilPos.push([i, j])
      }
    }
    if (append === 0) {
      if (this.updated === 1) {
        // 判断是否挑战失败——没有空格，无法新增棋子
        if (avilPos.length === 0) {
          Audios.playBoom("fail")
          return 2
        }
        // 首次合并没有可以合并的棋子，直接返回
        this.updated =  0
        Audios.playBoom("boom0")
      }
      // 合并阶段完成，进入新增极端
      else if (this.updated === 2) this.updated =  3
      // 新增后的合并阶段也完成，返回移动最终完成
      else if (this.updated === 4) this.updated =  0
    } else if (this.updated === 1) {
      // 首次合并有可以合并的棋子，继续合并
      this.updated = 2
      Audios.playBoom("boom1")
    } 
    // 判断是否已经添加过新的棋子
    if (this.updated !== 3) return 0
    // 新增极端，向棋盘中添加棋子
    n = Utils.choose([1, 1, 1, 2, 2, 3, 4])
    for (m = Math.min(n, avilPos.length); m > 0; m--) {
      var p = Utils.random(0, avilPos.length - 1)
      var [i, j] = avilPos.splice(p, 1)[0]
      this.board[i][j] = 2
    }
    this.updated = 4
    // 默认挑战继续
    return 0
  },
  
  // 绘制棋盘
  draw: function() {
    ctx.fillStyle = 'white'
    ctx.clearRect(0, 0, adapt.W, adapt.H)
    ctx.fillRect(0, 0, adapt.W, adapt.H)
    // 棋子
    for (var i = 0; i < 4; i++) {
      for (var j = 0; j < 4; j++) {
        var chess = this.board[j][i]
        if (chess === 0) continue
        ctx.fillStyle = this.colors[Math.log2(chess)]
        ctx.fillRect(this.w0 + this.cellW * i, this.h0 + this.cellW * j,
          this.cellW, this.cellW
        )
        ctx.fillStyle = "white"
        ctx.font = 'normal ' + this.fontSize[chess.toString().length] + 'px Arial'
        ctx.fillText(chess, this.w0 + this.cellW * i + this.cellW_2,
          this.h0 + this.cellW * j + this.cellW_2
        )
      }
    }
    // 棋盘边框
    ctx.lineWidth = this.boldLineW
    ctx.strokeRect(this.w0, this.h0, this.boardW, this.boardW)
    // 棋盘网格线
    ctx.lineWidth = this.normalLineW
    ctx.beginPath()
    for (var i = 1; i < 4; i++) {
      ctx.moveTo(this.w0 + this.cellW * i, this.h0)
      ctx.lineTo(this.w0 + this.cellW * i, this.h1)
      ctx.moveTo(this.w0, this.h0 + this.cellW * i)
      ctx.lineTo(this.w1, this.h0 + this.cellW * i)
    }
    ctx.stroke()
  },

  // 绘制开始游戏界面
  drawStarting: function() {
    ctx.fillStyle = 'white'
    ctx.clearRect(0, 0, adapt.W, adapt.H)
    ctx.fillRect(0, 0, adapt.W, adapt.H)
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
    // 游戏标题
    ctx.drawImage(Images["title"],
      adapt.W_12, adapt.H_4 - adapt.W_12, adapt.W_6 * 5, adapt.W_6
    )
    // 小贴士
    ctx.drawImage(Images["tips"],
      adapt.W_12, adapt.H_2 - adapt.W_6, adapt.W_6 * 5, adapt.W_3
    )
    // 开始游戏按钮
    ctx.fillStyle = '#FF6B6B'
    ctx.fillRect(adapt.W_12, adapt.H_4 * 3 - adapt.W_12, adapt.W_6 * 5, adapt.W_6)
    ctx.lineWidth = this.boldLineW
    ctx.strokeRect(adapt.W_12, adapt.H_4 * 3 - adapt.W_12, adapt.W_6 * 5, adapt.W_6)
    ctx.fillStyle = 'white'
    ctx.font = 'bold ' + adapt.W_12 + 'px monospace'
    ctx.fillText("开始游戏", adapt.W_2, adapt.H_4 * 3)
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
    // 开始游戏
    else if (X > adapt.W_12 && X < adapt.W_12 * 11 &&
      Y > adapt.H_4 * 3 - adapt.W_12&& Y < adapt.H_4 * 3 + adapt.W_12
    ) return 2
    else return 1
  },

  // 绘制比赛结果
  drawEndding: function() {
    // 背景
    ctx.fillStyle = "white"
    ctx.fillRect(0, adapt.H_2 - adapt.W_12, adapt.W, adapt.W_6)
    // 上下边框
    ctx.lineWidth = this.normalLineW
    ctx.beginPath()
    ctx.moveTo(0,       adapt.H_2 - adapt.W_12)
    ctx.lineTo(adapt.W, adapt.H_2 - adapt.W_12)
    ctx.moveTo(0,       adapt.H_2 + adapt.W_12)
    ctx.lineTo(adapt.W, adapt.H_2 + adapt.W_12)
    ctx.stroke()
    // 是否挑战成功
    ctx.textAlign = 'center'
    ctx.font = 'normal ' + adapt.W_12 + 'px monospace'
    ctx.fillStyle = ["white", "red", "red"][this.result]
    var msg = ["挑战继续", "恭喜获胜", "挑战失败"][this.result]
    ctx.fillText(msg, adapt.W_2, adapt.H_2)
  },
  
  // 实现帧动画
  framesLoop: function() {
    if (this.stage === -1) {
      let progress = Loading.getProgress(Audios, Images)
      if (progress === 100) this.stage = 0
      Loading.draw(ctx, progress)
    }
    else if (this.stage === 0) this.drawStarting()
    else if (this.stage === 1) {
      this.draw()
      if (this.direct !== -1) {
        this.result = this.update()
        if (this.result !== 0) this.stage = 2
        if (this.updated === 0) this.direct = -1
      }
    }
    else if (this.stage === 2) {
      this.draw()
      if (this.aniId % 60 < 30) this.drawEndding()
    }
    this.aniId = window.requestAnimationFrame(this.loop, canvas) 
  },
  
  touchStartHandler: function(e) {
    e.preventDefault()
    if (this.stage != 1 || this.updated !== 0) {
      this.TSP = []
      return
    }
    if (e.type === 'touchstart') {
      let n = e.touches.length - 1
      this.TSP[0] = e.touches[n].clientX - adapt.W0
      this.TSP[1] = e.touches[n].clientY - adapt.H0
    } else if (e.type === 'mousedown') {
      this.TSP[0] = e.clientX - adapt.W0
      this.TSP[1] = e.clientY - adapt.H0
    } else return
  },
  
  touchEndHandler: function(e) {
    e.preventDefault()
    let X, Y
    if (e.type === 'touchend') {
      X = e.changedTouches[0].clientX - adapt.W0
      Y = e.changedTouches[0].clientY - adapt.H0
    } else if (e.type === 'mouseup') {
      X = e.clientX - adapt.W0
      Y = e.clientY - adapt.H0
    } else return
    
    if (this.stage === 0) {
      if (this.changeSettings(X, Y) !== 2) return
      // 开始游戏
      this.init()
      this.stage = 1
    } else if (this.stage === 1) {
      // 获取移动方向
      if (this.updated !== 0 || this.TSP.length !== 2) return
      let xdist = X - this.TSP[0], ydist = Y - this.TSP[1]
      if (Math.abs(xdist) > Math.abs(ydist)) 
        this.direct = xdist > 0 ? 3 : 1
      else  if (Math.abs(xdist) < Math.abs(ydist))
        this.direct = ydist > 0 ? 2 : 0
      this.TSP = []
    } else if (this.stage === 2) {
      if (Math.abs(Y - adapt.H_2) < adapt.W_12)
        this.stage = 0
    }

  },

  keyDownHandler: function(e) {
    if (this.stage !== 1 || this.updated !== 0) return
    if (["ArrowUp", "w", "W"].indexOf(e.key) > -1) this.direct = 0
    else if (["ArrowLeft", "a", "A"].indexOf(e.key) > -1) this.direct = 1
    else if (["ArrowDown", "s", "S"].indexOf(e.key) > -1) this.direct = 2
    else if (["ArrowRight", "d", "D"].indexOf(e.key) > -1) this.direct = 3
    else return
  }
  
}

