
Starting = function() {

}

Starting.prototype = {
  resize: function() {
    this.cellW = adapt.W_100 * 10
    this.cellW_2 = this.cellW / 2
    this.cellGap = adapt.W_100 * 14
    this.w0 = adapt.W_100 * 10
    this.h0 = adapt.H_2 - adapt.W_100 * 42
  },

  draw: function(play) {
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
    ctx.fillStyle = "black"
    ctx.font = 'bold ' + adapt.W_6 + 'px monospace'
    ctx.fillText("华容道", adapt.W_2, adapt.H_6)
    // 关卡选项
    ctx.lineWidth = 1
    for (var i = 0; i < 6; i++) {
      for (var j = 0; j < 7; j++) {
        var num = i + j * 6 + 1 
        var w0 = this.w0 + this.cellGap * i
        var h0 = this.h0 + this.cellGap *  j
        // 当前选中的选项
        if (play.level === num - 1) {
          ctx.fillStyle = "gray"
          ctx.fillRect(w0, h0, this.cellW, this.cellW)
        }
        // 边框
        ctx.strokeStyle = "black"
        ctx.strokeRect(w0, h0, this.cellW, this.cellW)
        //选项文字
        ctx.fillStyle = "black"
        ctx.font = 'normal ' + this.cellW_2 + 'px monospace'
        var msg = num < 10 ? '0' + num : '' + num
        ctx.fillText(msg, w0 + this.cellW_2, h0 + this.cellW_2)
      }
    }
    // 开始游戏按钮
    ctx.strokeRect(adapt.W_12, adapt.H_6 * 5, adapt.W_6 * 5, adapt.W_6)
    ctx.font = 'normal ' + adapt.W_12 + 'px monospace'
    ctx.fillText("开始游戏", adapt.W_2, adapt.H_6 * 5 + adapt.W_12)
  },

  handle: function(play, e) {
    if (e.type !== 1) return
    // 开关音频
    if (e.X > adapt.W_100 * 3 && e.X < adapt.W_100 * 10 &&
      e.Y > adapt.W_100 * 3 && e.Y < adapt.W_100 * 10
    ) Audios.bgm.paused ? Audios.bgm.play() : Audios.bgm.pause()
    // 请求全屏
    else if (document.fullscreenEnabled &&
      e.X > adapt.W_100 * 90 && e.X < adapt.W_100 * 97 &&
      e.Y > adapt.W_100 * 3 && e.Y < adapt.W_100 * 10
    ) document.fullscreen ? document.exitFullscreen() :
      document.documentElement.requestFullscreen()
    // 点击开始游戏
    else if (e.X > adapt.W_12 && e.X < adapt.W_12 * 11 && 
      e.Y > adapt.H_6 * 5 && e.Y < adapt.H_6 * 5 + adapt.W_6
    ) play.stage = 1
    // 修改关卡
    else if (e.X > this.w0 && e.Y > this.h0 &&
      (e.X - this.w0) % this.cellGap < this.cellW &&
      (e.Y - this.h0) % this.cellGap < this.cellW 
    ) {
      var i = parseInt((e.X - this.w0) / this.cellGap) 
      var j = parseInt((e.Y - this.h0) / this.cellGap)
      play.level = i + j * 6
    }
  }

}
