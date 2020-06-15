
Play = function() {
  this.B = []
  // 游戏阶段， -1 加载界面，0 开始游戏界面，1 游戏过程，2 游戏结束
  this.stage = -1
  this.resize()
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
    this.B.forEach(b => b.show = false)
    this.time = Utils.time()
    this.timeLeft = 300
    this.money = 1000
    this.result = 0
    this.frame = 0
  },

  resize: function() {
    this.h_MSGbar = adapt.W_100 * 6
    this.MSGfontSize = adapt.W_100 * 5
    this.h_MSGfont = adapt.H - this.h_MSGbar / 2
    this.h_gameZone = adapt.H - this.h_MSGbar
    ctx.textBaseline = 'middle'
  },

  // 游戏界面添加气泡
  add: function(X, Y) {
    // 当用户点击屏幕时出现气泡
    if (!X || !Y) {
      var X = Math.random() * adapt.W, Y = 0
    }
    let imageId, r = Math.random()
    if (r > 0.9 && Utils.time() - this.time > 60) {
      imageId = Utils.choose([20, 20, 20, 21, 21, 22, 30, 30, 40, 40])
    } else {
      imageId = Utils.choose([10, 11, 12])
    }
    // 先考虑回收利用
    for (var b of this.B) {
      if (b.show || b.imageId != imageId) continue
      b.init(X, Y)
      return
    }
    // 再考虑新建对象
    let bubble
    if (imageId < 20) bubble = new Click(X, Y, imageId)
    else if (imageId < 30) bubble = new Press(X, Y, imageId)
    else if (imageId < 40) bubble = new Love(X, Y, imageId)
    else bubble = new Gold(X, Y, imageId)
    this.B.push(bubble)
  },

  // 游戏界面，更新气泡位置及大小
  update: function() {
    // 碰撞检测
    for (var i = 0; i < this.B.length; i++) {
      var b1 = this.B[i]
      if (!b1.show || b1.TStime != null) continue
      let xdict = [], ydict = [], xInEdge = false, yInEdge = false
      // 检测是否碰到边缘
      if (b1.x - b1.radius < 0) {
        b1.xSpeed = 0.5; xInEdge = true
      } else if (b1.x + b1.radius > adapt.W) {
        b1.xSpeed = -0.5; xInEdge = true
      }
      if (b1.y - b1.radius < 0) {
        b1.ySpeed = 0.5; yInEdge = true
      } else if (b1.y + b1.radius > this.h_gameZone) {
        b1.ySpeed = -0.5; yInEdge = true
      }
      if (xInEdge && yInEdge) break
      // 检测是否碰到其它气泡
      for (var j = 0; j < this.B.length; j++) {
        var b2 = this.B[j]
        if (i === j || !b2.show) continue
        var xdist = b1.x - b2.x
        var ydist = b1.y - b2.y
        if (xdist ** 2 + ydist ** 2 <
          (b1.radius + b2.radius) ** 2
        ) {
          xdict.push(xdist)
          ydict.push(ydist)
        }
      }
      if (xdict.length === 0 || ydict.length === 0) continue
      var xdist = xdict.reduce((a, b) => a + b)
      var ydist = ydict.reduce((a, b) => a + b)
      var dist = Math.abs(xdist) + Math.abs(ydist)
      if (!xInEdge) b1.xSpeed = xdist / dist
      if (!yInEdge) b1.ySpeed = ydist / dist
    }
    // 更新气泡位置
    this.B.forEach(b => {
      if (!b.show) return
      if (b.TStime != null) {
        if (b.x - b.radius < 0) b.x = b.radius
        else if (b.x + b.radius > adapt.W) b.x = adapt.W - b.radius
        if (b.y - this.radius < 0) b.y = b.radius
        else if (b.y + b.radius > this.h_gameZone) b.y = this.h_gameZone - b.radius
      } else {
        b.x += b.xSpeed
        b.y += b.ySpeed
      }
      b.radius += 0.05
    })
    // 更新系统时间
    this.timeLeft = 300 + this.time - Utils.time()
  },

  // 检查挑战结果
  check: function() {
    // 检测是否挑战成功
    if (this.money >= 1e6) return 10
    // 检测是否破产或超时
    if (this.money <= 0) return 21
    if (this.timeLeft <= 0) return 22
    // 检测气泡是否已经严重重叠（不能弹开）
    for (var i = 0; i < this.B.length; i++) {
      var b1 = this.B[i]
      if (!b1.show) continue
      for (var j = i + 1; j < this.B.length; j++) {
        var b2 = this.B[j]
        if (!b2.show) continue
        if ((b1.x - b2.x) ** 2 + (b1.y - b2.y) ** 2 <
          (b1.radius + b2.radius) ** 2 - 900
        ) return 20
      }
    }
    // 继续挑战
    return 0
  },

  drawBg: function() {
    ctx.fillStyle = 'white'
    ctx.clearRect(0, 0, adapt.W, adapt.H)
    ctx.fillRect(0, 0, adapt.W, adapt.H)
  },

  // 绘制游戏过程
  draw: function() {
    this.drawBg()
    // 绘制气泡
    for (var b of this.B) {
      if (!b.show) continue
      ctx.drawImage(Images[b.imageId],
        b.x - b.radius, b.y - b.radius,
        b.radius * 2, b.radius * 2
      )
    }
    // 绘制底部信息栏
    ctx.fillStyle = 'black'
    ctx.fillRect(0, this.h_gameZone, adapt.W, this.h_MSGbar)
    ctx.font = 'normal 15px monospace'
    var msg = parseInt(this.timeLeft / 60) + ": " + 
      Utils.int2str(this.timeLeft % 60, 2)
    ctx.textAlign = 'left'
    ctx.fillStyle = "cyan"
    ctx.fillText(msg, adapt.W_100 * 3, this.h_MSGfont)
    var s1 = parseInt(this.money / 1e4)
    var s2 = parseInt(this.money % 1e4).toString()
    var msg = (s1 != 0 ? s1 + "万 " + Array(5 - s2.length).join("0"): "") + s2
    ctx.textAlign = 'right'
    ctx.fillStyle = "gold"
    ctx.fillText(msg, adapt.W_100 * 97, this.h_MSGfont)
  },

  // 绘制开始界面
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
    ctx.fillStyle = "red"
    ctx.textAlign = 'center'
    ctx.font = 'bold ' + adapt.W_6 + 'px monospace'
    ctx.fillText("气泡模拟器", adapt.W_2, adapt.H_4)
    // 小贴士
    ctx.drawImage(Images["tip"],
      adapt.W_12, adapt.H_2 - adapt.W_12 * 2.5, 
      adapt.W_6 * 5, adapt.W_12 * 5
    )
    // 开始按钮
    ctx.font = 'bold ' + adapt.W_12 + 'px monospace'
    ctx.fillText("开始游戏", adapt.W_2, adapt.H_4 * 3 + adapt.W_12)
    ctx.strokeRect(adapt.W_12, adapt.H_4 * 3, adapt.W_6 * 5, adapt.W_6)
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
    // 点击开始游戏
    else if (X > adapt.W_12 && X < adapt.W_12 * 11 && 
      Y > adapt.H_4 * 3 && Y < adapt.H_4 * 3 + adapt.W_6
    ) return 2
    else return 1
  },

  // 绘制比赛结果
  drawEndding: function() {
    this.drawBg()
    // 是否挑战成功
    ctx.fillStyle = "red"
    ctx.textAlign = 'center'
    ctx.font = 'normal ' + adapt.W_100 * 10 + 'px monospace'
    let status = parseInt(this.result / 10)
    // 上边框
    ctx.beginPath()
    if (status === 1) {
      ctx.moveTo(0,       adapt.H_2 - adapt.W_100 * 10)
      ctx.lineTo(adapt.W, adapt.H_2 - adapt.W_100 * 10)
      ctx.moveTo(0,       adapt.H_2 + adapt.W_100 * 10)
      ctx.lineTo(adapt.W, adapt.H_2 + adapt.W_100 * 10)
      ctx.fillText("恭喜获胜", adapt.W_2, adapt.H_2)
    } else if (status === 2) {
      ctx.moveTo(0,       adapt.H_2 - adapt.W_100 * 15)
      ctx.lineTo(adapt.W, adapt.H_2 - adapt.W_100 * 15)
      ctx.moveTo(0,       adapt.H_2 + adapt.W_100 * 15)
      ctx.lineTo(adapt.W, adapt.H_2 + adapt.W_100 * 15)
      ctx.fillText("挑战失败", adapt.W_2, adapt.H_2 - adapt.W_100 * 5)
      // 挑战失败的原因
      ctx.font = 'normal ' + adapt.W_100 * 6 + 'px monospace'
      let msg = ["（ 气泡重叠 ）", "（ 破产 ）", "（ 超时 ）"][this.result % 10]
      ctx.fillText(msg, adapt.W_2, adapt.H_2 + adapt.W_100 * 7)
    }
    ctx.stroke()
  },

  // 游戏画面主循环
  framesLoop: function() {
    if (this.stage === -1) {
      let progress = Loading.getProgress(Audios, Images)
      if (progress === 100) this.stage = 0
      Loading.draw(ctx, progress)
    }
    else if (this.stage === 0) this.drawStarting()
    else if (this.stage === 3) this.drawEndding()
    else if (this.stage === 1) {
      this.result = this.check()
      if (this.result != 0) this.stage = 2
      if (this.frame % 90 === 0) this.add()
      this.B.forEach(b => b.grow(this))
      this.update()
      this.draw()
      this.frame ++
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
      for (var b of this.B) {
        if (!b.show ||
          (b.x - X) ** 2 + (b.y - Y) ** 2 > b.radius ** 2
        ) continue
        b.TStime = e.timeStamp
        b.xSpeed = 0
        b.ySpeed = 0
        return
      }
      this.add(X, Y)
    } else if (this.stage === 0) {
      if (this.changeSettings(X, Y) !== 2) return
      this.stage = 1
      this.init()
    } else if (this.stage === 2) {
      this.stage = 3
    } else if (this.stage === 3) {
      this.stage = 0
    }
  },

  touchMoveHandler: function(e) {
    if (this.stage != 1) return
    e.preventDefault()
    let X, Y
    if (e.type === 'touchmove') {
      X = e.touches[0].clientX - adapt.W0
      Y = e.touches[0].clientY - adapt.H0
    } else if (e.type === 'mousemove') {
      X = e.clientX - adapt.W0
      Y = e.clientY - adapt.H0
    } else return

    for (var b of this.B) {
      if (!b.show || b.TStime === null ||
        (b.x - X) ** 2 + (b.y - Y) ** 2 > b.radius ** 2
      ) continue
      if (X - b.radius < 0) X = b.radius
      else if (X + b.radius > adapt.W) X = adapt.W - b.radius
      if (Y - b.radius < 0) Y = b.radius
      else if (Y + b.radius > this.h_gameZone) Y = this.h_gameZone - b.radius
      b.x = X
      b.y = Y
      break
    }
  },

  touchEndHandler: function(e) {
    if (this.stage != 1) return
    e.preventDefault()
    let X, Y
    if (e.type === 'touchend') {
      X = e.changedTouches[0].clientX - adapt.W0
      Y = e.changedTouches[0].clientY - adapt.H0
    } else if (e.type === 'mouseup') {
      X = e.clientX - adapt.W0
      Y = e.clientY - adapt.H0
    } else return

    for (var b of this.B) {
      if (!b.show || b.TStime === null ||
        (b.x - X) ** 2 + (b.y - Y) ** 2 > b.radius ** 2
      ) continue
      Audios.playBoom(b.imageId % 10)
      b.show = false
      break
    }
  }

}