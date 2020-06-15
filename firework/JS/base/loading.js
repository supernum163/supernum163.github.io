
Loading = {
  getProgress: function() {
    let total = 0, loaded = 0
    for (var arg of arguments) {
      for(var key in arg) {
        if (typeof(arg[key]) === 'function') continue
        if (arg[key].loaded === true) loaded ++
        total ++
      }
    }
    this.progress = parseFloat(loaded / total * 100)
    return this.progress
  },
  
  draw: function(progress) {
    ctx.fillStyle = 'white'
    ctx.clearRect(0, 0, adapt.W, adapt.H)
    ctx.fillRect(0, 0, adapt.W, adapt.H)
    // 加载进度
    ctx.font = 'normal '+ adapt.W_100 * 5 + 'px monospace'
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center'
    ctx.fillStyle = "black"
    var msg = "loading...  " + progress.toFixed(2) + " %"
    ctx.fillText(msg, adapt.W_2, adapt.H_2)
  }

}
