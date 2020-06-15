
// 激活函数
var activeFunctions = {
  sigmoid: {
    active: function(x) { 
      return 1 / (1 + Math.exp(-x)) 
    },
    deriv: function(x) {
      var fx = sigmoid.active(x)
      return fx * (1 - fx)
    },
  },

}
// 求误差函数
var lossFunctions = {
  // 均方误差
  MSE: function(yTrue, yPred) {
    var loss = 0
    var len = (typeof(yTrue) === "number") ? 1 : yTrue.length
    for (var i = 0; i < len; i++) {
      loss += (yTrue[i] - yPred[i]) ** 2
    }
    return loss / yTrue.length
  },

}

// 全局配置变量
var config = {
  // 输入值矩阵
  input: null, 
  // 输出值向量
  output: null, 
  // 神经网络每层节点数量
  layers: [2, 1], 
  // 学习速率
  learnRate: 0.1,
  // 单个样本学习次数
  learnTimes: 1000,
  // 可以允许的最小误差
  minLoss: 0.1,
  // 激活函数
  fActive: activeFunctions.sigmoid, 
  // 求误差函数
  fLoss: lossFunctions.MSE,
}

// 神经元节点
Nnode = function(inputs, layer) {
  // 权重与偏置
  this.weights = Array(inputs.length)
  this.weights.fill(Math.random())
  this.bias = Math.random()
  // 各项输出值
  this.total = 0
  this.active = 0
  this.deriv = 0
  // 处于神经网络那一层，0、1、2 分别为 输入层、隐层、输出层
  this.layer = layer
  // 该节点的上下层输入输出节点
  this.inputs = inputs
  this.outputs = []
}
Nnode.prototype = {
  // 记录向前传导时的各项输出值
  forward() {
    this.total = this.bias
    for (var i in this.weights) {
      this.total += this.weights[i] * this.inputs[i].active
    }
    this.active = config.fActive.active(this.total)
    this.deriv = config.fActive.deriv(this.total)
  },
  // 计算从当前节点到输出层节点直接的偏导数之积
  getDerivPre() {
    var derivPre = 1
    if (this.outputs.length === 0) return derivPre
    this.outputs.forEach(o => {
      derivPre += derivPre * o.deriv * o.getDerivPre()
    })
    return derivPre
  },
  // 根据反馈的 “偏差” 更新当前节点的各项参数
  backward(feedback = learnRate * derivLoss) {
    feedback *= this.deriv * this.getDerivPre()
    this.bias -= feedback
    for (var i in this.weights) {
      this.weights[i] -= this.weights[i] * feedback
    }
  }

}

// 神经元网络
Nnet = function() {
  // 输入层对接接口
  var len = config.input[0].length
  this.active = Array(len)
  for (var i in this.active) {
    this.active[i] = {active: 0}
  }
  // 神经元网络
  this.net = Array(config.layers.length)
  for (var i = 0; i < this.net.length; i++) {
    this.net[i] = Array(config.layers[i])
    if (i > 0) this.net[i - 1].forEach(e => e.output = this.net[i])
    for (var j = 0; j < this.net[i]; j++) {
      if (i === 0) {
        this.net[i][j] = new Node(this.active, 0)
      } else if (i === config.layers.length - 1) {
        this.net[i][j] = new Node(this.net[i - 1], 2)
      } else {
        this.net[i][j] = new Node(this.net[i - 1], 1)
      }
    }
  }
  // 输出层节点，这里只有一个输出层
  this.Onode = this.net[i - 1][j - 1]

}

Nnet.prototype = {
  // 向前传导
  feed(id) {
    for (var i in this.active) {
      this.active[i].active = config.input[id][i]
    }
    for (var i = 0; i < this.net.length; i++) {
      for (var j = 0; j < this.net[i]; j++) {
        this.net[i][j].forward()
      }
    }
  },
  // 向后传导，通过反馈更新各神经元参数
  learn(id) {
    this.loss = config.fLoss(config.output[id], this.Onode.active)
    var derivLoss = 2 * (this.loss - 1)
    var feedback = config.learnRate * derivLoss
    for (var i = 0; i < this.net.length; i++) {
      for (var j = 0; j < this.net[i]; j++) {
        this.net[i][j].backward(feedback)
      }
    }
  },
  // 通过样本训练神经网络
  train: function() {
    for (var i = 0; i < config.learnTimes; i++) {
      for (var j = 0; j < config.input.length; j++) {
        this.feed(j)
        this.learn(j)
        if (this.loss < config.minLoss) return
      }
    }
  },
  // 通过神经网络预测结果
  predict: function(input) {
    var output = Array(input.length)
    for (var i in output) {
      this.feed(input[i])
      output[i] = this.Onode.active
    }
    return output
  }

}

