
Endding = function() {

}

Endding.prototype = {
  draw: function(play) {
    // 背景
    ctx.fillStyle = "white"
    ctx.fillRect(0, adapt.H_2 - adapt.W_12, adapt.W, adapt.W_6)
    // 上下边框
    ctx.strokeStyle = "black"
    ctx.beginPath()
    ctx.moveTo(0, adapt.H_2 - adapt.W_12)
    ctx.lineTo(adapt.W, adapt.H_2 - adapt.W_12)
    ctx.moveTo(0, adapt.H_2 + adapt.W_12)
    ctx.lineTo(adapt.W, adapt.H_2 + adapt.W_12)
    ctx.stroke()
    // 是否挑战成功
    ctx.textAlign = 'center'
    ctx.font = 'normal ' + adapt.W_12 + 'px monospace'
    ctx.fillStyle = ["white", "red", "red"][play.result]
    let msg = ["挑战继续", "恭喜获胜", "挑战失败"][play.result]
    ctx.fillText(msg, adapt.W_2, adapt.H_2)
  },

  handle: function(play, e) {
    if (e.type !== 1) return
    if (Math.abs(e.Y - adapt.H_2) < adapt.W_12) {
      play.stage = 0
    }
  }

}
