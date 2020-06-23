setRefClass(
  "Relu",
  fields = c("zeros"),
  methods = list(
    forward = function(input) {
      zeros <<- input <= 0
      input[zeros] <- 0
      return(input)
    },
    backward = function(feedback) {
      feedback[zeros] <- 0
      return(feedback)
    }
  )
)

input <- matrix(c(-1, 2, 3, -4), nrow = 2)
relu <- new("Relu")
relu$backward(input)

setRefClass(
  "Sigmoid",
  fields = c("output"),
  methods = list(
    forward = function(input) {
      output <<- 1 / (1 + exp(-input))
      return(output)
    },
    backward = function(feedback) {
      feedback = feedback * (1 - output) * output
      return(feedback)
    }
  )
)

input <- matrix(c(-1, 2, 3, -4), nrow = 2)
sigmoid <- new("Sigmoid")
sigmoid$backward(input)

# 全连接层
setRefClass(
  "Affine",
  fields = c("weight", "bias", "input"),
  methods = list(
    initialize = function(weight, bias) {
      weight <<- weight          # m个节点（对应输出），每个节点n个权重（对应输入）
      bias <<- bias              # m个偏置
    },
    forward = function(input) {
      input <<- input
      output <- t(t(input %*% weight) + bias)
      return(output)
    },
    backward = function(feedback) {
      bias <<- bias - feedback
      weight <<- weight - t(input) %*% feedback
      feedback <- feedback %*% t(weight)
      return(feedback)
    }
  )
)

w <- 1:6
dim(w) <- c(3, 2)
b <- 1:2
a <- new("Affine", w, b)

input <- c(3, 5, 2, 4, 1, 2)
input <- matrix(input, ncol = 3, byrow = TRUE)
input <- 1:3
dim(input) <- c(1, 3)
a$forward(input)
a <- array(1:24, dim = c(2, 3, 4))

feedback = c(2, 3)
a$backward(feedback)    


a <- array(0, dim = c(2, 3, 4))
for (i in 0:1) {
  for (j in 0:2) {
    for (k in 0:3) {
    a[i+1, j+1, k+1] <- (i * 3 + j) * 4 + k   
    }
  }
}

softmax <- function(input) {
  if(length(dim(input)) == 2) {
    output <- t(apply(input, 1, function(x) {x - max(x)}))
    output <- t(apply(output, 1, function(x) {exp(x) / sum(exp(x))}))
  } else {
    output <- input - max(input)
    output <- exp(x) / sum(exp(x))
  }
  return(output)
}

crossEntropy <- function(yPred, yTrue) {
  batch = nrow(yTrue)
  # 加入微小值 1e-7 是为了防止 yPred = 0 时出现负无穷大
  return(-sum(yTrue * log(yPred + 1e-7)) / batch)
}

meanSquared <- function(yPred, yTrue) {
  batch = nrow(yTrue)
  return(sum((yTrue - yPred) ^ 2) / batch / 2)
}


setRefClass(
  "SoftmaxWithLoss",
  fields = c("output", "yTrue", "batch"),
  methods = list(
    forward = function(input, yTrue, oneHot = TRUE) {
      output <<- softmax(input)
      batch <<- nrow(output)
      classes <- ncol(output)
      if (oneHot) {
        y <- matrix(0, nrow = batch, ncol = classes)
        for (i in 1:classes) y[i, yTrue[i]] <- 1
      } 
      yTrue <<- y
      loss <- -sum(y * log(output)) / batch
      return(loss)
    },
    backward = function(feedback = 1) {
      feedback <- feedback * (output - yTrue) / batch
      return(feedback)
    }
  )
)

input <- matrix(c(1, 3, 2, 4), nrow = 2)
yTrue <- c(2, 1)
softmaxWithLoss <- new("SoftmaxWithLoss")
softmaxWithLoss$forward(input, yTrue)
softmaxWithLoss$backward()


setRefClass(
  "Dropout",
  fields = c("ratio", "dropout"),
  methods = list(
    initialize = function(ratio) {
      ratio <<- ratio          # 舍弃节点的比率
    },
    forward = function(input, drop = TRUE) {
      if (drop) {
        dropout <<- runif(ncol(input), 0, 1) > ratio
        output <- t(t(input) * dropout)
      } else {
        dropout <<- 1 - ratio
        output <- input * dropout
      }
      return(output)
    },
    backward = function(feedback) {
      feedback <- t(t(feedback) * dropout)
      return(feedback)
    }
  )
)

input <- matrix(c(1, 3, 2, 4), nrow = 2)
dropout <- new("Dropout", 0.3)
dropout$forward(input)
dropout$backward(input)

im2col <- function(input, filter_h, filter_w, stride = 1, pad = 0) {
  D <- dim(input)
}

    # N, C, H, W = input_data.shape
    out_h <- floor((D[3] + 2 * pad - filter_h) / stride) + 1
    out_w <- floor((D[4] + 2 * pad - filter_w) / stride) + 1

  padding <- matrix(0, ncol = pad, nrow = nrow(input))
  input <- cbind(padding, input, padding)
  padding <- matrix(0, ncol = ncol(input), nrow = pad)
  input <- cbind(padding, input, padding)
  col <- array(0, dim = c(D[0], D[1], filter_h, filter_w, out_h, out_w))
    # img = np.pad(input_data, [(0,0), (0,0), (pad, pad), (pad, pad)], 'constant')
    # col = np.zeros((N, C, filter_h, filter_w, out_h, out_w))

for (y in 1:filter_h) {
  y_start <- stride * (y - 1)
  for (x in 1:filter_w) {
    x_start <- stride * (x - 1)
    col[ , , y, x, , ] <- input[ , , 
      (y_start + 1):(ystart+filter_h), 
      (x_start + 1):(xstart+filter_w)
    ]
  }
}
    for y in range(filter_h):
        y_max = y + stride * out_h
        for x in range(filter_w):
            x_max = x + stride * out_w
            col[:, :, y, x, :, :] = img[:, :, y:y_max:stride, x:x_max:stride]

    col = col.transpose(0, 4, 5, 1, 2, 3).reshape(N * out_h * out_w, -1)
    return col



setRefClass(
  "Convolution",
  fields = c("W", "b", "stride", "pad", "input", "col", "colW"),
  methods = list(
    initialize = function(W, b, stride = 1, pad = 0) {
      W <<- W
      b <<- b
      stride <<- stride
      pad <<- pad
    },
    forward = function(input, drop = TRUE) {

    },
    backward = function(feedback) {

    }
  )
)


    def forward(self, x):
        FN, C, FH, FW = self.W.shape
        N, C, H, W = x.shape
        out_h = 1 + int((H + 2*self.pad - FH) / self.stride)
        out_w = 1 + int((W + 2*self.pad - FW) / self.stride)

        col = im2col(x, FH, FW, self.stride, self.pad)
        col_W = self.W.reshape(FN, -1).T

        out = np.dot(col, col_W) + self.b
        out = out.reshape(N, out_h, out_w, -1).transpose(0, 3, 1, 2)

        self.x = x        self.col = col
        self.col_W = col_W

        return out

    def backward(self, dout):
        FN, C, FH, FW = self.W.shape
        dout = dout.transpose(0,2,3,1).reshape(-1, FN)

        self.db = np.sum(dout, axis=0)
        self.dW = np.dot(self.col.T, dout)
        self.dW = self.dW.transpose(1, 0).reshape(FN, C, FH, FW)

        dcol = np.dot(dout, self.col_W.T)
        dx = col2im(dcol, self.x.shape, FH, FW, self.stride, self.pad)

        return dx



a <- matrix(c(
  0, 0, 0, 1, 
  0, 0, 1, 2, 
  0, 0, 2, 3, 
  0, 1, 0, 4, 
  0, 1, 1, 5, 
  0, 1, 2, 6
), ncol = 4, byrow = TRUE)
a <- as.data.frame(a)
colnames(a) <- c("v0", "v1", "v2", "v")
require(dplyr)

a <- a[, c(3, 2, 1, 4)]
colnames(a) <- c("v0", "v1", "v2", "v")
a %>% arrange(v0, v1, v2)

  v0 v1 v2 v
1  0  0  0 1
2  0  1  0 4
3  1  0  0 2
4  1  1  0 5
5  2  0  0 3
6  2  1  0 6

a = np.array([
  [
    [1, 2, 3],
    [4, 5, 6]
  ]
])
a.shape
