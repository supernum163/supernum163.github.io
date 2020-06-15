
Adapt = function(width, height, ratioWH, ratioHW){
  this.width = width
  this.height = height
  this.ratioWH = ratioWH
  this.ratioHW = ratioHW
  this.init()
}
   
Adapt.prototype = {
  init: function() {
    this.resizeCanvas()
    this.posCanvas()
    this.W_2 = this.W / 2
    this.W_3 = this.W / 3
    this.W_4 = this.W / 4
    this.W_6 = this.W / 6
    this.W_12 = this.W / 12
    this.W_100 = this.W / 100
    this.H_2 = this.H / 2
    this.H_4 = this.H / 4
    this.H_10000 = this.H / 1e4
  },

  initCanvas: function() {
    canvas.width = 0
    canvas.height = 0
    canvas.style.left = "0px"
    canvas.style.top = "0px"
  },
     
  resizeCanvas: function() {
    this.PR = window.devicePixelRatio ? window.devicePixelRatio : 1
    this.width = this.width * this.PR 
    this.height = this.height * this.PR 
    this.W = Math.min(window.innerWidth, this.width)
    this.H = Math.min(window.innerHeight, this.height)
    if (this.W / this.H > this.ratioWH) this.W = this.H * this.ratioWH
    if (this.H / this.W > this.ratioHW) this.H = this.W * this.ratioHW
    canvas.width = this.W 
    canvas.height = this.H
  },
     
  posCanvas: function() {
    this.W0 = (window.innerWidth - this.W) / 2
    this.H0 = (window.innerHeight - this.H) / 2
    this.W0 = Math.max(this.W0, 0)
    this.H0 = Math.max(this.H0, 0)
    canvas.style.left = this.W0 + "px"
    canvas.style.top = this.H0 + "px"
  }

}