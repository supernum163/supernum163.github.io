
Starting = function() {

}

Starting.prototype = {
  resize: function() {
    this.cellW = adapt.W_6 * 5
    this.cellGap = adapt.W_100 * 20
    this.h0 = adapt.H_2 - this.cellGap
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
    ctx.textAlign = 'center'
    ctx.fillStyle = "black"
    ctx.font = 'bold ' + adapt.W_6 + 'px monospace'
    ctx.fillText("拼图", adapt.W_2, adapt.H_4)
    // 难易度选项
    for (var i = 0; i < 3; i++) {
      let h0 = this.h0 + this.cellGap *  i
      // 当前选中的选项
      if (play.difficulty === i) {
        ctx.fillStyle = "gray"
        ctx.fillRect(adapt.W_12, h0, this.cellW, adapt.W_6)
      }
      // 边框
      ctx.strokeStyle = "black"
      ctx.strokeRect(adapt.W_12, h0, this.cellW, adapt.W_6)
      //选项文字
      ctx.fillStyle = "black"
      ctx.font = 'normal ' + adapt.W_12 + 'px monospace'
      let msg = ["3 * 3", "4 * 4", "5 * 5"][i]
      ctx.fillText(msg, adapt.W_2, h0 + adapt.W_12)
    }
    // 开始游戏按钮
    ctx.strokeRect(adapt.W_12, adapt.H_4 * 3, this.cellW, adapt.W_6)
    ctx.fillText("开始游戏", adapt.W_2, adapt.H_4 * 3 + adapt.W_12)
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
    else if (e.X > adapt.W_12 && e.X < adapt.W_12 * 11) {    
      // 点击开始游戏
      if (e.Y > adapt.H_4 * 3 && e.Y < adapt.H_4 * 3 + adapt.W_6) {
        play.stage = 1
        return
      }
      // 修改难易度
      let Y = e.Y - this.h0, i = parseInt(Y / this.cellGap)
      if (e.Y > this.h0 && Y % this.cellGap < adapt.W_6 && i < 3) {
        play.difficulty = i
      }
    }
  }


}
