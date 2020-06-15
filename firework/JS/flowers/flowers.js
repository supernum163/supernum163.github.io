
Flowers = function() {
  this.flowers = []
}

Flowers.prototype = {
  init: function() {
    for(var flower of this.flowers) {
      flower.life = -1
    }
  }, 

  add: function(X, Y, color) {
    let flower
    // 先考虑回收利用
    for(flower of this.flowers){
      if (flower.life < 0) {
        flower.init(X, Y, color)
        return 
      }
    }
    // 再考虑新建对象
    let n = Math.random()
    if (n < 0.2) {
      flower = new Flower1(X, Y, color)
    } else if (n < 0.5) {
      flower = new Flower2(X, Y, color)
    } else if (n < 0.7) {
      flower = new Flower3(X, Y, color)
    } else {
      flower = new Flower4(X, Y, color)
    }
    this.flowers.unshift(flower)
    return 
  },

  update: function() {
    for(var flower of this.flowers) {
      if (flower.life > 0) flower.life --
    }
  },

  draw: function() {
    for(var flower of this.flowers) {
      if (flower.life > 0) flower.draw()
    }
  }
  
}

