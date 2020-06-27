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



transpos <- function(arr, pos) {
  old_dim <- dim(arr)
  new_dim <- old_dim[pos]
  dim_len <- length(old_dim)
  vec <- as.vector(arr)
  for (i in dim_len:1) {
    times <- 1
    j <- i - 1
    while (j >= 1) {
      times <- times * old_dim[j]
      j = j - 1
    }
    repeats <- 1
    j <- i + 1
    while (j <= dim_len) {
      repeats <- repeats * old_dim[j]
      j = j + 1
    }
    d <- 1:old_dim[i]
    d <- rep(d, each = times)
    d <- rep(d, repeats)
    vec <- vec[order(d)]
  }
  vec <- array(vec, new_dim)
  return(vec)
}

arr <- 1:6
dim(arr) <- c(1, 2, 3)
pos <- c(3, 2, 1)
a<-transpos(arr, pos)


img2col <- function(input, Di, Dw, out_h, out_w, stride = 1, pad = 0) {
  if (pad > 0) {
    data <- array(0, dim = c(Di[1], Di[2], Di[3] + pad * 2, Di[4] + pad * 2))
    data[ , , (pad + 1):(Di[3] + pad), (pad + 1):(Di[4] + pad)] <- input
  } else {
    data <- input
  }
  col <- array(0, dim = c(Di[1], Dw[2], Dw[3], Dw[4], out_h, out_w))
  for (y in 1:Dw[3]) {
    y_max <- y + stride * out_h - 1
    for (x in 1:Dw[4]) {
      x_max <- x + stride * out_w - 1
      col[ , , y, x, , ] <- data[ , , seq(y, y_max, stride), seq(y, y_max, stride)]
    }
  }
  col <- transpos(col, c(1, 5, 6, 2, 3, 4))
  dim(col) <- c(Di[1] * out_h * out_w, Dw[2] * Dw[3] * Dw[4])
  return(col)
}

col2img <- function(col, Di, Dw, out_h, out_w, stride = 1, pad = 0) {
  dim(col) <- c(Di[1], out_h, out_w, Dw[2], Dw[3], Dw[4])
  col <- transpos(col, c(1, 4, 5, 6, 2, 3))
  img <- array(0, dim = c(Di[1], Di[2], Di[3] + pad * 2, Di[4] + pad * 2))
  for (y in 1:Dw[3]) {
    y_max <- y + stride * out_h - 1
    for (x in 1:Dw[4]) {
      x_max <- x + stride * out_w - 1
      img[ , , seq(y, y_max, stride), seq(y, y_max, stride)] <- 
      img[ , , seq(y, y_max, stride), seq(y, y_max, stride)] + col[ , , y, x, , ]
    }
  }
  img <- img[ ,  , (pad + 1):(Di[3] + pad), (pad + 1):(Di[4] + pad)]
  return(img)
}


setRefClass(
  "Convolution",
  fields = c(
    "weight", "bias", "stride", "pad", 
    "Di", "Dw", "out_h", "out_w",
    "col", "col_W"
  ),
  methods = list(
    initialize = function(weight, bias, stride = 1, pad = 0) {
      weight <<- weight
      bias <<- bias
      stride <<- stride
      pad <<- pad
      Dw <<- dim(weight)
    },
    forward = function(input) {
      Di <<- dim(input)
      out_h <<- floor((Di[3] + 2 * pad - Dw[3]) / stride) + 1
      out_w <<- floor((Di[4] + 2 * pad - Dw[4]) / stride) + 1
      
      col <<- img2col(input, Di, Dw, out_h, out_w, stride, pad)
      col_W <<- weight
      dim(col_W) <<- c(Dw[1], Dw[2] * Dw[3] * Dw[4])
      col_W <<- t(col_W)

      output <- t(t(col %*% col_W) + bias)
      dim(output) <- c(Di[1], out_h, out_w, Dw[1])
      output <- transpos(output, c(1, 4, 2, 3))
      return(output)
    },
    backward = function(feedback) {
      feedback <- transpos(feedback, c(1, 3, 4, 2))
      dim(feedback) <- c(Di[1] * out_h * out_w , Dw[1])

      Dbias <- feedback
      dim(Dbias) <- c(Dw[1], Di[1] * out_h * out_w)
      bias <<- bias - apply(Dbias, 1, sum)
      Dweight <- t(col) %*% feedback
      Dweight <- transpos(Dweight, c(2, 1))
      dim(Dweight) <- Dw
      weight <<- weight - Dweight

      feedback <- feedback %*% t(col_W)
      feedback <- col2img(feedback, Di, Dw, out_h, out_w, stride, pad)
      return(feedback)
    }
  )
)

# 简单维度
Di <- c(1, 1, 5, 5)
Dw <- c(1, 1, 3, 3)
input <- array(1:25, dim = Di)
weight <- array(1:9, dim = Dw)
bias <- 1
# 复杂维度
Di <- c(2, 3, 5, 5)
Dw <- c(1, 3, 2, 2)
input <- array(1:150, dim = Di)
weight <- array(1:12, dim = Dw)
bias <- 1

stride <- 1; pad <- 0
out_h <- floor((Di[3] + 2 * pad - Dw[3]) / stride) + 1
out_w <- floor((Di[4] + 2 * pad - Dw[4]) / stride) + 1
img2col(input, Di, Dw, out_h, out_w)
conv <- new("Convolution", weight, bias)
output <- conv$forward(input)
conv$backward(output)



setRefClass(
  "MaxPool",
  fields = c(
    "pool_h", "pool_w", "stride", "pad", 
    "Di", "Dw", "out_h", "out_w", 
    "input", "arg_max", "pool_size"
  ),
  methods = list(
    initialize = function(pool_h, pool_w, stride = 1, pad = 0) {
      pool_h <<- pool_h
      pool_w <<- pool_w
      stride <<- stride
      pad <<- pad
      pool_size <<- pool_h * pool_w
    },
    forward = function(input) {
      Di <<- dim(input)
      Dw <<- c(1, Di[2], pool_h, pool_w)
      out_h <<- floor(1 + (Di[3] - pool_h) / stride)
      out_w <<- floor(1 + (Di[4] - pool_w) / stride)

      col <- img2col(input, Di, Dw, out_h, out_w, stride, pad)
      dim(col) <- c(Di[1] * out_h * out_w * Di[2], pool_size)
      arg_max <<- apply(col, 1, which.max)
      input <<- input
      out <- apply(col, 1, max)
      dim(out) <- c(Di[1], out_h, out_w, Di[2])
      out <- transpos(out, c(1, 4, 2, 3))
      return(out)
    },
    backward = function(feedback) {
      feedback <- transpos(feedback, c(1, 3, 4, 2))
      dmax <- array(0, dim = c(length(feedback), pool_size))
      index <- 1:length(feedback) + (arg_max - 1) * pool_size
      dmax[index] <- as.vector(feedback)
      dim(dmax) <- c(Di[1] * Di[2] * Dw[3] * Dw[4] , out_h * out_w)
      feedback <- col2img(dmax, Di, Dw, out_h, out_w, stride, pad)
      return(feedback)
    }
  )
)

pool_h = Dw[3]; pool_w = Dw[4]
pool_size <- pool_h * pool_w
pool <- new("MaxPool", pool_h, pool_w)
output <- pool$forward(input)
pool$backward(output)

