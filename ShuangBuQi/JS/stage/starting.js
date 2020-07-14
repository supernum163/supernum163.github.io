
Starting = function() {

}

Starting.prototype = {
  resize: function() {
    this.w1 = adapt.W_3
    this.w2 = adapt.W_6 * 5
    this.h2 = adapt.W_6
    this.x1 = adapt.W_12
    this.x2 = this.x1 + this.w1
    this.x3 = adapt.W_12 * 7
    this.x4 = this.x3 + this.w1
    this.y1 = adapt.H_2 - adapt.W_12
    this.y2 = this.y1 + this.w1
    this.y3 = adapt.H_4 * 3
    this.y4 = this.y3 + this.h2
    this.fontSize = adapt.W_12
    this.text1_x = this.x1 + this.w1 / 2
    this.text1_y = this.y1 + this.w1 / 2
    this.text2_x = this.x3 + this.w1 / 2
    this.text3_y = this.y3 + this.h2 / 2
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
    ctx.strokeStyle = "black"
    ctx.font = 'bold ' + adapt.W_6 + 'px monospace'
    ctx.fillText("双步棋", adapt.W_2, adapt.H_4)
    // 开始游戏按钮
    ctx.font = 'normal '+ this.fontSize + 'px monospace'
    ctx.strokeRect(this.x1, this.y3, this.w2, this.h2)
    ctx.fillText("开始游戏", adapt.W_2, this.text3_y)
    // 难易度选项
    ctx.strokeRect(this.x1, this.y1, this.w1, this.w1)
    var msg = ["简单", "困难"][play.difficulty]
    ctx.fillText(msg, this.text1_x, this.text1_y)
    // 先后手选项
    // ctx.fillStyle = ["", "red", "blue"][play.camp]
    ctx.strokeRect(this.x3, this.y1, this.w1, this.w1)
    var msg = ["", "先手", "后手"][play.camp]
    ctx.fillText(msg, this.text2_x, this.text1_y)
  },

  handle: function(play, e) {
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
    else if (e.Y > this.y1 && e.Y < this.y2) {
      // 修改难易度
      if (e.X > this.x1 && e.X < this.x2)
        play.difficulty = (play.difficulty + 1) % 2
      // 修改先后手
      else if (e.X > this.x3 && e.X < this.x4) 
        play.camp = play.camp % 2 + 1
    } 
    // 点击开始游戏
    else if (e.Y > this.y3 && e.Y < this.y4 && 
      e.X > this.x1 && e.X < this.x4
    ) play.stage = 1
  }


}
