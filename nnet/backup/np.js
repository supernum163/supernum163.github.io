
// 激活函数
var activeFunctions = {
  // S型增长函数
  sigmoid: {
    f: function(x) { 
      return 1 / (1 + Math.exp(-x)) 
    },
    deriv: function(fx) {
      return fx * (1 - fx)
    },
  },
  // S型增长函数（扩展型）
  tansig : {
    f: function(x) {
      return 2 / (1 + Math.exp(-2 * x)) - 1 
    },
    deriv: function(fx) {
      return (1 / fx ** 2 - 1) / 2
    },
  },
  // 线性函数，用于输出层，预测连续型变量
  purelin : {
    f: function(x) {
      return x
    },
    deriv: function(fx) {
      return fx
    },
  },
  // 求分类概率函数，用于输出层，预测多分类变量
  softmax : {
    f: function(x, layer) {
      var total = 0
      for (var node of layer) {
        total += Math.exp(node.total)
      }
      return Math.exp(x) / total
    },
    deriv: function(fx) {
      return fx - 1
    },
  },
  // (Rectified Linear Unit)
  ReLU: {
    f: function(x) {
      return Math.max(x, 0)
    },
    deriv: function(fx) {
      return fx > 0 ? 1 : 0
    },
  },

}
// 求误差函数
var lossFunctions = {
  // 平方误差 (Mean Squared Error)
  MSE: {
    f: function(yTrue, yPred) {
      return (yTrue - yPred) ** 2
    },
    deriv: function(yTrue, yPred) {
      return -2 * (yTrue - yPred)
    },
  },
  // 交叉熵损失函数 (Cross Entropy Error)
  CEE: {
    f: function(yTrue, yPred) {
      return -yTrue * Math.log(yPred)
    },
    deriv: function(yTrue, yPred) {
      return -yTrue / yPred
    },
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
  epochs: 1000,
  // 可以允许的最小误差
  minLoss: 0.001,
  // 激活函数
  fActive: activeFunctions.sigmoid, 
  // 求误差函数
  fLoss: lossFunctions.MSE,
}

// 神经元节点
Nnode = function(layer, id, inputs, fActive) {
  // 处于神经网络那一层，0、1、2 分别为 输入层、隐层、输出层
  this.layer = layer,
  // 处于神经网络某一层的第几个位置
  this.id = id,
  // 权重与偏置
  this.weights = Array(inputs.length)
  this.weights.fill(Math.random())
  this.bias = Math.random()
  // 各项输出值
  this.total = 0
  this.active = 0
  this.deriv = 0
  // 激活函数
  this.fActive = fActive.f
  this.fDeriv = fActive.deriv
  // 该节点的上下层输入输出节点
  this.inputs = inputs
  this.outputs = []
}
Nnode.prototype = {
  // 记录向前传导时的各项输出值
  forward() {
    this.total = this.bias
    for (var i = 0; i < this.weights.length; i++) {
      this.total += this.weights[i] * this.inputs[i].active
    }
    this.active = this.fActive(this.total)
    this.deriv = this.fDeriv(this.active)
  },
  // 计算从当前节点到输出层节点直接的偏导数之积
  getPreDeriv() {
    if (this.outputs.length === 0) return 1
    var derivPre = 0
    this.outputs.forEach(o => {
      derivPre += o.deriv * o.weights[this.id] * o.getPreDeriv()
    })
    return derivPre
  },
  // 根据反馈的 “偏差” 更新当前节点的各项参数
  backward(feedback = learnRate * derivLoss) {
    feedback *= this.getPreDeriv() * this.deriv
    this.bias -= feedback
    for (var i = 0; i < this.weights.length; i++) {
      this.weights[i] -= this.inputs[i].active * feedback
    }
  }

}

// 神经元网络
Nnet = function(config) {
  // 输入层对接接口
  var len = config.input[0].length
  this.inputs = Array(len)
  for (var i = 0; i < this.inputs.length; i++) {
    this.inputs[i] = {active: 0, output: null}
  }
  // 神经元网络
  this.net = Array(config.layers.length)
  for (var i = 0; i < this.net.length; i++) {
    this.net[i] = Array(config.layers[i])
    // 创建第i层节点
    for (var j = 0; j < this.net[i].length; j++) {
      if (i === 0) {
        this.net[i][j] = new Nnode(0, j, this.inputs, config.fActive)
      } else if (i === config.layers.length - 1) {
        this.net[i][j] = new Nnode(2, j, this.net[i - 1], config.fActive)
      } else {
        this.net[i][j] = new Nnode(1, j, this.net[i - 1], config.fActive)
      }
    }
    // 更新上一层节点的输出层
    if (i === 0) this.inputs.forEach(e => e.outputs = this.net[i])
    else this.net[i - 1].forEach(e => e.outputs = this.net[i])
  }
  // 输出层节点
  // var i = this.net.length, j = this.net[i - 1].length
  this.outputs = Array(j)
  for (var n = 0; n < this.outputs.length; n++) {
    this.outputs[n] = {node: this.net[i - 1][n], loss: 0, deriv: 0}
  }
  // 总体误差
  this.totalLoss = 0
}

Nnet.prototype = {
  // 向前传导
  feed(id) {
    for (var i = 0; i < this.inputs.length; i++) {
      this.inputs[i].active = config.input[id][i]
    }
    for (var i = 0; i < this.net.length; i++) {
      for (var j = 0; j < this.net[i].length; j++) {
        this.net[i][j].forward()
      }
    }
  },
  // 向后传导，通过反馈更新各神经元参数
  learn(id) {
    this.totalLoss = 0
    for (var i = 0; i < this.outputs.length; i++) {
      var yTrue = config.output[id][i], yPred = this.outputs[i].node.active
      this.outputs[i].loss = config.fLoss.f(yTrue, yPred)
      this.outputs[i].deriv = config.fLoss.deriv(yTrue, yPred)
      this.totalLoss += this.outputs[i].loss
    }
    for (var o of this.outputs) {
      var feedback = config.learnRate * o.deriv
      for (var i = 0; i < this.net.length; i++) {
        for (var j = 0; j < this.net[i].length; j++) {
          this.net[i][j].backward(feedback)
        }
      }
    }
  },
  // 通过样本训练神经网络
  train: function() {
    for (var i = 0; i < config.epochs; i++) {
      for (var j = 0; j < config.input.length; j++) {
        this.feed(j)
        this.learn(j)
        if (i % 10 === 0 && j === 0) console.log(this.totalLoss)
        if (this.totalLoss < config.minLoss) return
      }
    }
  },
  // 通过神经网络预测结果
  predict: function(input) {
    var output = Array(input.length), vLen = this.outputs.length
    for (var i = 0; i < output.length; i++) {
      this.feed(input[i])
      if (vLen === 0) {
        output[i] = this.outputs[0].active
      } else {
        output[i] = Array(vLen)
        for (var i = 0; i < vLen; i++) {
          output[i][j] = this.outputs[j].active
        }
      }
    }
    return output
  }

}



config.input =  [
  [-2, -1],   // Alice
  [25, 6],    // Bob
  [17, 4],    // Charlie
  [-15, -6],  // Diana
]
config.output = [
  [1], 
  [0], 
  [0], 
  [1], 
]

var nnet = new Nnet(config)
//nnet.feed(0)
//nnet.learn()

nnet.train()

