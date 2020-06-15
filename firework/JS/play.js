
Play = function() {
  // 游戏阶段， -1 加载界面，0 开始游戏界面，1 游戏过程，2 游戏结束,3 测试阶段
  this.stage = -1
  this.difficulty = 0
  this.flowers = new Flowers()
  this.rects = new Rects()
  this.fire = new Fire()
  this.fireEnding = new FireEnding()
  this.resize()

  this.loop = this.framesLoop.bind(this)
  this.loop()
  this.handler = this.eventHandler.bind(this)
  canvas.addEventListener('touchstart', this.handler)
  canvas.addEventListener('touchmove', this.handler)
  canvas.addEventListener('touchend', this.handler)
  window.addEventListener('mousedown', this.handler)
  window.addEventListener('mousemove', this.handler)
  window.addEventListener('mouseup', this.handler)
}

Play.prototype = {
  init: function() {
    this.time = Utils.time()
    this.timeLeft = 300
    this.money = 0
    this.prob1 = [0.1, 0.2][this.difficulty]
    this.prob2 = [0.17, 0.34][this.difficulty]
    this.rectLife = [500, 300][this.difficulty]
    this.flowers.init()
    this.rects.init()
    this.fire.init()
  },

  resize: function() {
    this.h_MSGbar = adapt.W_100 * 6
    this.MSGfontSize = adapt.W_100 * 5
    this.h_MSGfont = this.h_MSGbar / 2
    ctx.textBaseline = 'middle'
  },

  // 检查是否挑战成功
  check: function() {
    if (this.timeLeft > 0) {
      this.result = 0
      return
    }
    if (this.money < 0) {
      this.result = 1
      return
    }
    if (this.money > 0) {
      this.result = 2
    } else {
      this.result = 3
    }
    Audios.endding.play()
  },

  // 游戏主流程中更新信息
  update: function() {
    this.rects.update(this)
    this.flowers.update()
    this.fire.update(this)
    let prob = this.aniId % 3600 < 3000 ? this.prob1 : this.prob2
    if(this.aniId % 20 === 0 && Math.random() < prob) 
      this.rects.add(this.rectLife)
    this.timeLeft = Math.max(300 + this.time - Utils.time(), 0)
  },

  // 绘制背景
  drawBg: function() {
    ctx.fillStyle = 'black'
    ctx.strokeStyle = 'white'
    ctx.clearRect(0, 0, adapt.W, adapt.H)
    ctx.fillRect(0, 0, adapt.W, adapt.H)
  },

  // 绘制信息栏
  drawMSGbar: function() {
    ctx.fillStyle = 'gray'
    ctx.fillRect(0, 0, adapt.W, this.h_MSGbar)
    // 剩余时间
    ctx.font = 'normal ' + this.MSGfontSize + 'px monospace'
    ctx.textAlign = 'left'
    ctx.fillStyle = "cyan"
    var msg = parseInt(this.timeLeft / 60) + ": " + 
       Utils.int2str(this.timeLeft % 60, 2)
    ctx.fillText(msg, adapt.W_100 * 3, this.h_MSGfont)
    // 剩余金币
    ctx.textAlign = 'right'
    ctx.fillStyle = "gold"
    ctx.fillText(this.money.toString(), adapt.W_100 * 97, this.h_MSGfont)
  },

  // 绘制游戏主流程
  draw: function() {
    this.drawBg()
    this.rects.draw()
    this.flowers.draw()
    this.fire.draw()
    this.drawMSGbar()
  },

  // 绘制游戏开始界面
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
    // 游戏标题
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.font = 'bold ' + adapt.W_6 + 'px monospace'
    ctx.fillText("模拟烟花", adapt.W_2, adapt.H_4)
    // 难易度按钮
    ctx.font = 'normal ' + adapt.W_12 + 'px monospace'
    ctx.strokeRect(adapt.W_12, adapt.H_2, adapt.W_6 * 5, adapt.W_6)
    ctx.fillText(this.difficulty === 0 ? "休闲模式" : "欢快模式", 
      adapt.W_2, adapt.H_2 + adapt.W_12
    )
    // 开始按钮
    ctx.strokeRect(adapt.W_12, adapt.H_2 + adapt.W_4, adapt.W_6 * 5, adapt.W_6)
    ctx.fillText("开始游戏", adapt.W_2, adapt.H_2 + adapt.W_3)
    // 烟花筒列表
    this.fire.drawBoxes()
  },

  // 修改游戏设定
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
    // 点击无效区域
    else if (X < adapt.W_12 || X > adapt.W_12 * 11) return 1
    // 修改难易度
    else if (Y > adapt.H_2 && Y < adapt.H_2 + adapt.W_6) {
      this.difficulty += 1
      this.difficulty %= 2
    }
    // 修改烟花筒列表
    else if (Y > adapt.H - adapt.W_6 && Y < adapt.H) {
      var n = parseInt((X - adapt.W_12) / adapt.W_6)
      this.fire.boxes[n].id %= 3 
      this.fire.boxes[n].id += 1
    }
    // 点击开始游戏
    else if (Y > adapt.H_2 + adapt.W_4 && 
      Y < adapt.H_2 + adapt.W_12 * 5
    ) return 2
    else return 1
  },

  // 绘制游戏结束界面
  drawEndding: function() {
    this.drawBg()
    // 盈利时放烟花
    if (this.result > 1) {
      this.fireEnding.draw()
      this.flowers.draw()
    }
    this.fire.drawBoxes()
    this.drawMSGbar()
    // 是否挑战成功
    if(this.aniId % 60 > 30) return
    ctx.strokeStyle = "white"
    ctx.strokeRect(-1, adapt.H_2 - adapt.W_12, adapt.W + 1, adapt.W_6)
    ctx.fillStyle = "black"
    ctx.fillRect(0, adapt.H_2 - adapt.W_12, adapt.W, adapt.W_6)
    ctx.textAlign = 'center'
    ctx.font = 'normal ' + adapt.W_12 + 'px monospace'
    ctx.fillStyle = ["black", "red", "red", "white"][this.result]
    let msg = ["挑战继续", "破产", "盈利", "收支平衡"][this.result]
    ctx.fillText(msg, adapt.W_2, adapt.H_2)
  },

  // 游戏画面主循环
  framesLoop: function() {
    if (this.stage === -1) {
      let progress = Loading.getProgress(Audios, Images)
      if (progress === 100) this.stage = 0
      Loading.draw(progress)
    } else if (this.stage === 0) {
      this.drawStarting()
    } else if (this.stage === 1) {
      this.update()
      this.check()
      this.draw()
      if (this.result > 0) this.stage = 2
    } else if (this.stage === 2) {
      this.flowers.update()
      this.fireEnding.update(this)
      if(Math.random() < 0.1) this.fireEnding.add()
      this.drawEndding()
    }
    this.aniId = window.requestAnimationFrame(this.loop, canvas)
  },
  
  eventHandler: function(e) {
    e.preventDefault()
    let X, Y, type
    if (e.type === 'touchend') {
      X = e.changedTouches[0].clientX - adapt.W0
      Y = e.changedTouches[0].clientY - adapt.H0
      type = 3
    } else if (["touchstart", "touchmove"].indexOf(e.type) > -1) {
      X = e.touches[0].clientX - adapt.W0
      Y = e.touches[0].clientY - adapt.H0
      type = {"touchstart": 1, "touchmove": 2}[e.type]
    } else if (["mousedown", "mousemove", "mouseup"].indexOf(e.type) > -1) {
      X = e.clientX - adapt.W0
      Y = e.clientY - adapt.H0
      type = {"mousedown": 1, "mousemove": 2, "mouseup": 3}[e.type]
    } 

    if (this.stage === 1) {
      this.fire.handle({type: type, X: X, Y: Y})
    } else if (type !== 3) {
      return
    } else if (this.stage === 0) {
      if (this.changeSettings(X, Y) !== 2) return
      this.stage = 1
      this.init()
    } else if (this.stage === 2) {
      if (Math.abs(Y - adapt.H_2) > adapt.W_12) return
      Audios.endding.pause()
      this.stage = 0
    } 
  },

}
