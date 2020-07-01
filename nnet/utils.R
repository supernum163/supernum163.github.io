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
  batch = nrow(yPred)
  # 加入微小值 KSI 是为了防止 yPred = 0 时出现负无穷大
  return(-sum(yTrue * log(yPred + KSI)) / batch)
}

meanSquared <- function(yPred, yTrue) {
  batch = nrow(yPred)
  return(sum((yTrue - yPred) ^ 2) / batch / 2)
}

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


