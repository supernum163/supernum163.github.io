
// 游戏主函数
Play = function() {
  this.R = [new Rat19()]
  this.limit = "time"
  this.difficulty = 0
  // 游戏阶段， -1 加载界面，0 开始游戏界面，1 游戏过程，2 游戏结束
  this.stage = -1
  this.resize()
  this.loop = this.framesLoop.bind(this)
  this.loop()
  // 绑定触摸事件处理函数
  this.handler = this.touchStartHandler.bind(this)
  canvas.addEventListener('touchstart', this.handler)
  canvas.addEventListener('mousedown', this.handler)
}

Play.prototype = {
  init: function() {
    this.holes = [0, 0, 1, 1, 1, 1, 1, 0, 0, 0]
    this.rats = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    this.time = this.limit === "time" ? Utils.time() : 0
    this.life = [20, 50][this.difficulty]
    this.prob = [0.2, 0.8][this.difficulty]
    this.skull = [120, 600][this.difficulty]
    this.result = 0
    this.frameId = 0
    this.timeLeft = 300
  },
  
  resize: function() {
    this.h_MSGbar = adapt.W_100 * 6
    this.MSGfontSize = adapt.W_100 * 5
    this.h_MSGfont = adapt.H - this.h_MSGbar / 2
    this.h_gameZone = adapt.H - this.h_MSGbar
    this.h_gameZone_2 = this.h_gameZone / 2
    this.cellW = Math.min(adapt.W / 3, this.h_gameZone / 4)
    this.cellW_2 = this.cellW / 2
    this.pos = [
      [adapt.W_4     - this.cellW_2, this.h_gameZone_2 - this.cellW * 2],
      [adapt.W_4 * 3 - this.cellW_2, this.h_gameZone_2 - this.cellW * 2],
      [adapt.W_6     - this.cellW_2, this.h_gameZone_2 - this.cellW],
      [adapt.W_2     - this.cellW_2, this.h_gameZone_2 - this.cellW],
      [adapt.W_6 * 5 - this.cellW_2, this.h_gameZone_2 - this.cellW],
      [adapt.W_4     - this.cellW_2, this.h_gameZone_2],
      [adapt.W_4 * 3 - this.cellW_2, this.h_gameZone_2],
      [adapt.W_6     - this.cellW_2, this.h_gameZone_2 + this.cellW],
      [adapt.W_2     - this.cellW_2, this.h_gameZone_2 + this.cellW],
      [adapt.W_6 * 5 - this.cellW_2, this.h_gameZone_2 + this.cellW],
    ]
    ctx.textBaseline = 'middle'
  },

  avilPos: function() {
    let a = Utils.where(this.holes, 1)
    let b = Utils.where(this.rats, 0)
    return a.filter(e => b.includes(e))
  },

  // 游戏界面添加气泡
  add: function(posId) {
    // 当用户点击屏幕时出现气泡
    if (!posId) {
      let positions = this.avilPos()
      if (positions.length === 0) return
      posId = Utils.choose(positions)
    }
    let choices = this.R[0].show ?
      [1, 1, 1, 1, 1, 2, 2, 3, 4, 5, 5, 6, 6, 7, 7, 8] :
      [1, 1, 1, 1, 1, 2, 2, 3, 4, 5, 5, 6, 6, 7, 7, 8, 9]
    let imageId = Utils.choose(choices) + 10
    
    this.rats[posId] = imageId
    // 先考虑回收利用
    for (var i = 0; i < this.R.length; i++) {
      if (this.R[i].show || this.R[i].imageId != imageId) continue
      this.R[i].init(this.frameId, posId)
      return
    }
    // 再考虑新建对象
    let rat
    if (imageId === 19) this.R[0].init(this.frameId, posId)
    else if (imageId === 11) rat = new Rat11(this.frameId, posId)
    else if (imageId === 12) rat = new Rat12(this.frameId, posId)
    else if (imageId === 13) rat = new Rat13(this.frameId, posId)
    else if (imageId === 14) rat = new Rat14(this.frameId, posId)
    else if (imageId === 15) rat = new Rat15(this.frameId, posId)
    else if (imageId === 16) rat = new Rat16(this.frameId, posId)
    else if (imageId === 17) rat = new Rat17(this.frameId, posId)
    else if (imageId === 18) rat = new Rat18(this.frameId, posId)
    this.R.push(rat)
  },

  // 检查挑战结果
  check: function() {
    if (this.skull <= 0) return 1
    if (this.limit === "life" && this.life <= 0) return 2
    if (this.limit === "time" && this.timeLeft <= 0) return 2
    return 0
  },

  // 绘制游戏过程
  draw: function() {
    ctx.clearRect(0, 0, adapt.W, adapt.H)
    // 背景颜色
    ctx.fillStyle = 'lawngreen'
    ctx.fillRect(0, 0, adapt.W, this.h_gameZone)
    // 绘制地鼠
    for (var i = 0; i < this.holes.length; i++) {
      if (this.holes[i] === 0) continue
      ctx.drawImage(Images[this.holes[i]],
        this.pos[i][0], this.pos[i][1], this.cellW, this.cellW
      )
    }
    for (var i = 0; i < this.rats.length; i++) {
      if (this.rats[i] === 0) continue
      ctx.drawImage(Images[this.rats[i]],
        this.pos[i][0], this.pos[i][1], this.cellW, this.cellW
      )
    }
    // 绘制底部信息栏
    ctx.fillStyle = 'black'
    ctx.fillRect(0, this.h_gameZone, adapt.W, this.h_MSGbar)
    // 剩余时间
    ctx.font = 'normal ' + this.MSGfontSize + 'px monospace'
    if (this.limit === "time") {
      ctx.textAlign = 'center'
      ctx.fillStyle = "cyan"
      let msg = parseInt(this.timeLeft / 60) + ": " + 
        Utils.int2str(this.timeLeft % 60, 2)
      ctx.fillText(msg, adapt.W_2, this.h_MSGfont)
    }
    // 剩余地鼠数量
    ctx.textAlign = 'left'
    ctx.fillStyle = "white"
    ctx.fillText("💀 " + this.skull, adapt.W_100, this.h_MSGfont)
    // 剩余尝试机会
    ctx.textAlign = 'right'
    ctx.fillStyle = "red"
    let msg = this.limit === "life" ? this.life : "∞"
    ctx.fillText(msg + " ❤", adapt.W_100 * 99, this.h_MSGfont)
  },

  // 绘制开始界面
  drawStarting: function() {
    ctx.clearRect(0, 0, adapt.W, adapt.H)
    // 背景颜色
    ctx.fillStyle = 'white'
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
    ctx.textAlign = 'center'
    ctx.fillStyle = "black"
    ctx.font = 'bold ' + adapt.W_6 + 'px monospace'
    ctx.fillText("快来打地鼠", adapt.W_2, adapt.H_4)
    // 挑战模式按钮
    ctx.font = 'normal ' + adapt.W_12 + 'px monospace'
    ctx.strokeRect(adapt.W_12, adapt.H_2 - adapt.W_6, adapt.W_6 * 5, adapt.W_6)
    ctx.fillText(this.limit === "time" ? "限时模式" : "限命模式", 
      adapt.W_2, adapt.H_2 - adapt.W_12
    )
    // 难易度按钮
    ctx.strokeRect(adapt.W_12, adapt.H_2 + adapt.W_12, adapt.W_6 * 5, adapt.W_6)
    ctx.fillText(this.difficulty === 0 ? "休闲模式" : "极限模式", 
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
    // 修改挑战模式
    else if (X > adapt.W_12 && X < adapt.W_12 * 11 && 
      Y > adapt.H_2 - adapt.W_6 && Y < adapt.H_2
    ) this.limit = this.limit === "time" ? "life" : "time"
    // 修改先后手
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
    // 背景
    ctx.fillStyle = "white"
    ctx.fillRect(0, adapt.H_2 - adapt.W_12, adapt.W, adapt.W_6)
    // 上下边框
    ctx.beginPath();
    ctx.moveTo(0,    adapt.H_2 - adapt.W_12)
    ctx.lineTo(adapt.W, adapt.H_2 - adapt.W_12)
    ctx.moveTo(0,    adapt.H_2 + adapt.W_12)
    ctx.lineTo(adapt.W, adapt.H_2 + adapt.W_12)
    ctx.stroke();
    // 是否挑战成功
    ctx.textAlign = 'center'
    ctx.font = 'normal ' + adapt.W_12 + 'px monospace'
    ctx.fillStyle = ["white", "black", "red"][this.result]
    let msg = ["挑战继续", "恭喜获胜", "挑战失败"][this.result]
    ctx.fillText(msg, adapt.W_2, adapt.H_2)
  },

  // 游戏画面主循环
  framesLoop: function() {
    if (this.stage === -1) {
      let progress = Loading.getProgress(Audios, Images)
      if (progress === 100) this.stage = 0
      Loading.draw(ctx, progress)
    }
    else if (this.stage === 0) this.drawStarting()
    else if (this.stage === 1) {
      this.draw()
      if (this.frameId % 20 === 0 && Math.random() < this.prob) this.add()
      this.R.forEach(r => r.update(this))
      this.result = this.check()
      if (this.result != 0) {
        Audios.playBoom(14)
        this.rats = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        for (var i = 0; i < this.holes.length; i++) {
          if (this.holes[i] === 5) this.holes[i] = 1
          else if (this.holes[i] === 6) this.holes[i] = 0
        }
        this.R.forEach(r => r.show = false)
        this.stage = 2
      }
      this.timeLeft = 300 + this.time - Utils.time()
      this.frameId ++
    }
    else if (this.stage === 2){
      this.draw()
      if(this.aniId % 60 < 30) this.drawEndding()
    } 
    // 实现帧动画
    this.aniId = window.requestAnimationFrame(this.loop, canvas)
  },

  // 触摸事件管理
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

    if (this.stage === 1) {
      for (var i = 0; i < this.R.length; i++) {
        if (!this.R[i].show) continue
        var [x, y] = this.pos[this.R[i].posId]
        if (X < x || Y < y || X > x + this.cellW || Y > y + this.cellW) {
          if (i > 0) continue
          Audios.playBoom(19)
          break
        }
        this.R[i].onHit(this)
      }
    } else if (this.stage === 0) {
      if (this.changeSettings(X, Y) !== 2) return
      this.stage = 1
      this.init()
    } else if (this.stage === 2) {
      if (Math.abs(Y - adapt.H_2) < adapt.W_12)
        this.stage = 0
    }
  }

}