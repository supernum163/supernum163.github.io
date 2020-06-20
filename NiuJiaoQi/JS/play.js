
// 游戏主函数
Play = function() {
  this.board = new Board()
  this.starting = new Starting()
  this.endding = new Endding()
  this.camp = 0
  this.difficulty = 0
  this.result = 0
  // 游戏阶段， -1 加载界面，0 开始游戏界面，1 游戏过程，2 游戏结束
  this.stage = -1
  this.resize()
  // 绑定触摸事件处理函数
  this.handler = this.eventHandler.bind(this)
  canvas.addEventListener('touchstart', this.handler)
  window.addEventListener('mousedown', this.handler)
  // 实现帧动画
  this.loop = this.framesLoop.bind(this)
  this.loop()
}

Play.prototype = {
  resize: function() {
    this.board.resize()
    this.starting.resize()
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center'
  },

  drawBg: function() {
    ctx.fillStyle = 'white'
    ctx.clearRect(0, 0, adapt.W, adapt.H)
    ctx.fillRect(0, 0, adapt.W, adapt.H)
  },

  // 游戏画面主循环
  framesLoop: function() {
    if (this.stage === -1) {
      let progress = Loading.getProgress(Audios, Images)
      if (progress === 100) this.stage = 0
      Loading.draw(ctx, progress)
    } else {
      this.drawBg()
    } 

    if (this.stage === 0) {
      this.starting.draw(this)
    }
    else if (this.stage === 1) {
      this.board.draw(this)
    }
    else if (this.stage === 2){
      this.board.draw(this)
      if(this.aniId % 60 < 30) this.endding.draw(this)
    } 
    // 实现帧动画
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
    event = {type: type, X: X, Y: Y}

    if (this.stage === 0) {
      this.starting.handle(this, event)
      if (this.stage === 1) {
        this.board.init(this)
      }
    } else if (this.stage === 1) {
      this.board.handle(this, event)
    } else if (this.stage === 2) {
      this.endding.handle(this, event)
    } 
    
  }


}