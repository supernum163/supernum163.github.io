# 可以忽略不计的微小值，用于避免求除数或log遇到0时，出现 Inf 的情况
KSI <- 1e-7



# 当激活函数为 sigmoid 或 tanh 等 S 型曲线函数时,初始值使用 Xavier 初始值
# 当激活函数使用 ReLU 时,权重初始值使用 He 初始值
fInitWeight <- function(m, n, outLayer) {
  k <- ifelse(outLayer == "ReLU", 2, 1)
  weight <-rnorm(m * n, sd = sqrt(k / m))
  dim(weight) <- c(m, n)
  return(weight)
}

fInitBias <- function(n) {
  bias <- rep(0, n)
  return(bias)
}



# 求输出层预测概率
softmax <- function(input) {
  Di <- dim(input)
  if(length(Di) == 2) {
    output <- input - apply(input, 1, max)
    output <- exp(output)
    output <- output / apply(output, 1, sum)
  } else {
    output <- input - max(input)
    output <- exp(output)
    output <- output / sum(output)
  }
  return(output)
}

# 求交叉熵误差
crossEntropy <- function(yPred, yTrue) {
  batch = nrow(yPred)
  return(-sum(yTrue * log(yPred + KSI)) / batch)
}

# 求均平误差
meanSquared <- function(yPred, yTrue) {
  batch = nrow(yPred)
  return(sum((yTrue - yPred) ^ 2) / batch / 2)
}



# 高纬数组的维度之间进行互换
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

# 将4维图片对象转化为便于卷积的2维矩阵
img2col <- function(input, Di, Df, out_h, out_w, stride = 1, pad = 0) {
  if (pad > 0) {
    data <- array(0, dim = c(Di[1], Di[2], Di[3] + pad * 2, Di[4] + pad * 2))
    data[ , , (pad + 1):(Di[3] + pad), (pad + 1):(Di[4] + pad)] <- input
  } else {
    data <- input
  }
  col <- array(0, dim = c(Di[1], Df[2], Df[3], Df[4], out_h, out_w))
  for (y in 1:Df[3]) {
    y_max <- y + stride * out_h - 1
    for (x in 1:Df[4]) {
      x_max <- x + stride * out_w - 1
      col[ , , y, x, , ] <- data[ , , seq(y, y_max, stride), seq(y, y_max, stride)]
    }
  }
  col <- transpos(col, c(1, 5, 6, 2, 3, 4))
  dim(col) <- c(Di[1] * out_h * out_w, Df[2] * Df[3] * Df[4])
  return(col)
}

# 将卷积后的2维矩阵还原为4维图片对象
col2img <- function(col, Di, Df, out_h, out_w, stride = 1, pad = 0) {
  dim(col) <- c(Di[1], out_h, out_w, Df[2], Df[3], Df[4])
  col <- transpos(col, c(1, 4, 5, 6, 2, 3))
  img <- array(0, dim = c(Di[1], Di[2], Di[3] + pad * 2, Di[4] + pad * 2))
  for (y in 1:Df[3]) {
    y_max <- y + stride * out_h - 1
    for (x in 1:Df[4]) {
      x_max <- x + stride * out_w - 1
      img[ , , seq(y, y_max, stride), seq(y, y_max, stride)] <- 
      img[ , , seq(y, y_max, stride), seq(y, y_max, stride)] + col[ , , y, x, , ]
    }
  }
  img <- img[ ,  , (pad + 1):(Di[3] + pad), (pad + 1):(Di[4] + pad), drop = FALSE]
  return(img)
}


