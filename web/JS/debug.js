
const Debug = {
  // 在画面中打印信息
  log: function(msg, x = adapt.W_2, y = adapt.W_100) {
    if (msg instanceof Array)
      msg = msg.join(", ")
    ctx.fillText(msg, x, y)
  },

  // 获取设备DPI
  getDPI: function() {
    let DPI
    if (window.deviceXDPI) {
      DPI = [window.screen.deviceXDPI, window.screen.deviceYDPI]
    } else {
      let d = document.createElement( "DIV" );
      d.style.cssText = "width: 1in; height: 1in; position: absolute; left: 0px; top: 0px; z-index: 0; visibility: hidden;"
      document.body.appendChild( d )
      DPI = [parseInt(d.offsetWidth), parseInt(d.offsetHeight)]
      d.parentNode.removeChild( d )
    }
    return DPI
  },

  // 获取设备旋转方向
  getOrientation: function() {
    let o = window.orientation
    if (o === 0 || o === 180) {
      return "portrait"
    } else if (o === 90 || o === -90) {
      return "landscape"
    }
  }

}
