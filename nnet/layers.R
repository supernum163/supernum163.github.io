
Affine <- function(nnet, n, outLayer = NULL) {
  self <- new.env()
  self$nnet <- nnet
  nnet$layerId <- nnet$layerId + 1
  self$layerId <- nnet$layerId
  nnet$layers[paste0("Affine", self$layerId)] <- list(self)
  input <- nnet$get("input", self$layerId - 1)
  m <- dim(input)[2]
  nnet$set("weight", self$layerId, fInitWeight(m, n, outLayer))
  nnet$set("bias", self$layerId, rep(0, n))
  output <- array(0, dim = c(nnet$batch, n))
  nnet$set("input", self$layerId, output)
  nnet$params <- append(nnet$params, paste0("weight", self$layerId))
  nnet$Dparams <- append(nnet$Dparams, paste0("Dweight", self$layerId))
  nnet$params <- append(nnet$params, paste0("bias", self$layerId))
  nnet$Dparams <- append(nnet$Dparams, paste0("Dbias", self$layerId))
  nnet$weights <- append(nnet$weights, paste0("weight", self$layerId))

  self$forward <- function() {
    self$input <<- self$nnet$get("input", self$layerId - 1)
    weight <- nnet$get("weight", self$layerId)
    bias <- nnet$get("bias", self$layerId)
    output <- t(t(self$input %*% weight) + bias)
    self$nnet$set("input", self$layerId, output)
  }
  self$backward <- function() {
    feedback <- self$nnet$get("feedback", self$layerId)
    weight <- self$nnet$get("weight", self$layerId)
    self$nnet$set("Dbias", self$layerId, apply(feedback, 2, sum))
    self$nnet$set("Dweight", self$layerId, t(self$input) %*% feedback)
    self$nnet$set("feedback", self$layerId - 1, feedback %*% t(weight))
  }
}



ReLU <- function(nnet, n = 5) {
  Affine(nnet, n, "ReLU")
  self <- new.env()
  self$nnet <- nnet
  nnet$layerId <- nnet$layerId + 1
  self$layerId <- nnet$layerId
  nnet$layers[paste0("ReLU", self$layerId)] <- list(self)
  input <- self$nnet$get("input", self$layerId - 1)
  nnet$set("input", self$layerId, input)
  self$forward <- function() {
    input <- self$nnet$get("input", self$layerId - 1)
    self$zeros <- (input <= 0)
    input[zeros] <- 0
    self$nnet$set("input", self$layerId, input)
  }
  self$backward <- function() {
    feedback <- self$nnet$get("feedback", self$layerId)
    feedback[self$zeros] <<- 0
    self$nnet$set("feedback", self$layerId - 1, feedback)
  }
}



Sigmoid <- function(nnet, n = 5) {
  Affine(nnet, n, "Sigmoid")
  self <- new.env()
  self$nnet <- nnet
  nnet$layerId <- nnet$layerId + 1
  self$layerId <- nnet$layerId
  nnet$layers[paste0("Sigmoid", self$layerId)] <- list(self)
  input <- self$nnet$get("input", self$layerId - 1)
  nnet$set("input", self$layerId, input)
  self$forward <- function() {
    input <- self$nnet$get("input", self$layerId - 1)
    self$output <- 1 / (1 + exp(-input))
    self$nnet$set("input", self$layerId, self$output)
  }
  self$backward <- function() {
    feedback <- self$nnet$get("feedback", self$layerId)
    feedback <- feedback * (1 - self$output) * self$output
    self$nnet$set("feedback", self$layerId - 1, feedback)
  }
}



SoftmaxWithLoss <- function(nnet, oneHot = TRUE) {
  self <- new.env()
  self$nnet <- nnet
  nnet$layerId <- nnet$layerId + 1
  self$layerId <- nnet$layerId
  nnet$layers[paste0("SoftmaxWithLoss", self$layerId)] <- list(self)
  self$oneHot <- oneHot
  self$forward <- function() {
    input <- self$nnet$get("input", self$layerId - 1)
    self$output <- softmax(input)
    self$nnet$set("input", self$layerId, self$output)
    yTrue <- self$nnet$get("output")
    if (oneHot) {
      classes <- dim(input)[2]
      self$y <- array(0, dim = c(self$nnet$batch, classes))
      for (i in 1:classes) self$y[i, yTrue[i]] <- 1
    } 
    self$nnet$loss <- -sum(self$y * log(self$output + KSI)) / self$nnet$batch
  }
  self$backward <- function() {
    feedback <- (self$output - self$y) / self$nnet$batch
    self$nnet$set("feedback", self$layerId - 1, feedback)
  }
}



MeanSquared <- function(nnet) {
  self <- new.env()
  self$nnet <- nnet
  nnet$layerId <- nnet$layerId + 1
  self$layerId <- nnet$layerId
  nnet$layers[paste0("MeanSquared", self$layerId)] <- list(self)
  self$forward <- function() {
    self$output <- self$nnet$get("input", self$layerId - 1)
    self$yTrue <- self$nnet$get("output")
    self$nnet$loss <- sum((self$yTrue - self$output) ^ 2) / self$nnet$batch / 2
  }
  self$backward <- function() {
    feedback <- self$output - self$yTrue
    self$nnet$set("feedback", self$layerId - 1, feedback)
  }
}



BatchNormalization <- function(nnet, gamma = numeric(0), beta = numeric(0), 
  momentum = 0.9, Mavg = numeric(0), Mvar = numeric(0)
) {
  self <- new.env()
  self$nnet <- nnet
  nnet$layerId <- nnet$layerId + 1
  self$layerId <- nnet$layerId
  nnet$layers[paste0("BatchNormalization", self$layerId)] <- list(self)
  input <- self$nnet$get("input", self$layerId - 1)
  nnet$set("input", self$layerId, input)
  self$momentum <- momentum
  self$Noutput <- length(input) / nnet$batch

  if (length(gamma) == 0) {
    gamma <- rep(1, self$Noutput)
    beta <- rep(0, self$Noutput)
  }
  nnet$set("gamma", self$layerId, gamma)
  nnet$set("beta", self$layerId, beta)
  nnet$params <- append(nnet$params, paste0("gamma", self$layerId))
  nnet$Dparams <- append(nnet$Dparams, paste0("Dgamma", self$layerId))
  nnet$params <- append(nnet$params, paste0("beta", self$layerId))
  nnet$Dparams <- append(nnet$Dparams, paste0("Dbeta", self$layerId))
  if (length(Mavg) == 0) {
    self$Mavg <- rep(0, self$Noutput)
    self$Mvar <- rep(0, self$Noutput)
  } else {
    self$Mavg <- Mavg
    self$Mvar <- Mvar
  }
  self$forward <- function() {
    input <- self$nnet$get("input", self$layerId - 1)
    self$Di <- dim(input)
    if (length(self$Di) != 2) {
      dims(input) <- c(shape[1], self$Noutput)
    } 
    if (self$nnet$task == "train") {
      self$mu <- apply(input, 2, mean)
      self$xc <- t(t(input) - self$mu)
      self$var <- apply(self$xc, 2, function(x) {mean(x ^ 2)})
      self$std <- sqrt(self$var + KSI)
      self$xn <- t(t(self$xc) / self$std)
      self$Mavg <- self$momentum * self$Mavg + (1 - self$momentum) * self$mu
      self$Mvar <- self$momentum * self$Mvar + (1 - self$momentum) * self$var  
    } else {
      self$xc <- input - self$Mavg
      self$xn <- self$xc / sqrt(self$Mvar + KSI)
    }
    gamma <- self$nnet$get("gamma", self$layerId)
    beta <- self$nnet$get("beta", self$layerId)
    output <- t(gamma * t(self$xn) + beta) 
    dim(output) <- self$Di
    self$nnet$set("input", self$layerId, output)
  }
  self$backward <- function() {
    feedback <- self$nnet$get("feedback", self$layerId)
    if (length(self$Di) != 2) {
      dims(feedback) <- c(shape[1], self$Noutput)
    }
    nnet$set("Dgamma", self$layerId, apply(self$xn * feedback, 2, sum))
    nnet$set("Dbeta", self$layerId, apply(feedback, 2, sum))
    gamma <- self$nnet$get("gamma", self$layerId)
    dxn <- gamma * feedback
    dxc <- dxn / self$std
    dstd <- -apply(dxn * self$xc / self$std ^ 2, 2, sum)
    dvar <- 0.5 * dstd / self$std
    dxc <- dxc + 2 / shape[1] * self$xc * dvar
    dmu <- apply(dxc, 2, sum)
    feedback <- dxc - dmu / shape[1]
    dim(feedback) <- shape
    self$nnet$set("feedback", self$layerId - 1, feedback)
  }
}



Dropout <- function(ratio, drop = TRUE) {
  self <- new.env()
  self$nnet <- nnet
  nnet$layerId <- nnet$layerId + 1
  self$layerId <- nnet$layerId
  nnet$layers[paste0("Dropout", self$layerId)] <- list(self)
  input <- self$nnet$get("input", self$layerId - 1)
  nnet$set("input", self$layerId, input)
  self$ratio <- ratio
  self$drop <- drop
  self$forward <- function() {
    input <- self$nnet$get("input", self$layerId - 1)
    if (self$drop) {
      self$dropout <- runif(ncol(input), 0, 1) > ratio
      output <- t(t(input) * dropout)
    } else {
      self$dropout <- 1 - ratio
      output <- input * dropout
    }
    self$nnet$set("input", self$layerId, output)
  }
  self$backward <- function() {
    feedback <- self$nnet$get("feedback", self$layerId)
    feedback <- t(t(feedback) * self$dropout)
    self$nnet$set("feedback", self$layerId - 1, feedback)
  }
}



Convolution <- function(filter, bias, stride = 1, pad = 0) {
  self <- new.env()
  self$nnet <- nnet
  nnet$layerId <- nnet$layerId + 1
  self$layerId <- nnet$layerId
  nnet$layers[paste0("Convolution", self$layerId)] <- list(self)
  input <- self$nnet$get("input", self$layerId - 1)
  nnet$set("filter", self$layerId, filter)
  nnet$set("bias", self$layerId, bias)
  nnet$params <- append(nnet$params, paste0("filter", self$layerId))
  nnet$Dparams <- append(nnet$Dparams, paste0("Dfilter", self$layerId))
  nnet$params <- append(nnet$params, paste0("bias", self$layerId))
  nnet$Dparams <- append(nnet$Dparams, paste0("Dbias", self$layerId))
  self$stride <- stride
  self$pad <- pad
  self$Di <- dim(input)
  self$Df <- dim(filter)
  self$out_h <- floor((self$Di[3] + 2 * self$pad - self$Df[3]) / self$stride) + 1
  self$out_w <- floor((self$Di[4] + 2 * self$pad - self$Df[4]) / self$stride) + 1
  output <- array(0, dim(Di[1], Df[1], self$out_h, self$out_w))
  self$col_W <- filter
  dim(self$col_W) <- c(self$Df[1], self$Df[2] * self$Df[3] * self$Df[4])
  self$col_W <- t(self$col_W)
  nnet$set("input", self$layerId, output)
  self$forward <- function() {
    input <- self$nnet$get("input", self$layerId - 1)
    bias <- self$nnet$get("bias", self$layerId)
    self$Di <- dim(input)
    self$col <- img2col(input, self$Di, self$Df, self$out_h, self$out_w, self$stride, self$pad)
    output <- t(t(self$col %*% self$col_W) + bias)
    dim(output) <- c(Di[1], out_h, out_w, Df[1])
    output <- transpos(output, c(1, 4, 2, 3))
    self$nnet$set("input", self$layerId, output)
  }
  self$backward <- function() {
    feedback <- self$nnet$get("feedback", self$layerId)
    feedback <- transpos(feedback, c(1, 3, 4, 2))
    dim(feedback) <- c(self$Di[1] * self$out_h * self$out_w , self$Df[1])
    Dbias <- feedback
    dim(Dbias) <- c(self$Df[1], self$Di[1] * self$out_h * self$out_w)
    Dbias <- apply(Dbias, 1, sum)
    self$nnet$set("Dbias", self$layerId, Dbias)
    Dfilter <- t(self$col) %*% feedback
    Dfilter <- transpos(Dfilter, c(2, 1))
    dim(Dfilter) <- Df
    self$nnet$set("Dfilter", self$layerId, Dfilter)
    feedback <- feedback %*% t(self$col_W)
    feedback <- col2img(feedback, self$Di, self$Df, self$out_h, self$out_w, self$stride, self$pad)
    self$nnet$set("feedback", self$layerId - 1, feedback)
  }
}



MaxPool <- function(pool_h, pool_w, stride = 1, pad = 0) {
  self <- new.env()
  self$nnet <- nnet
  nnet$layerId <- nnet$layerId + 1
  self$layerId <- nnet$layerId
  nnet$layers[paste0("MaxPool", self$layerId)] <- list(self)
  input <- self$nnet$get("input", self$layerId - 1)
  self$pool_h <- pool_h
  self$pool_w <- pool_w
  elf$stride <- stride
  self$pad <- pad
  self$pool_size <- pool_h * pool_w
  self$Di <- dim(input)
  self$Df <- c(1, Di[2], pool_h, pool_w)
  self$out_h <- floor((self$Di[3] + 2 * self$pad - pool_h) / self$stride) + 1
  self$out_w <- floor((self$Di[4] + 2 * self$pad - pool_w) / self$stride) + 1
  output <- array(0, dim(Di[1], Di[2], self$out_h, self$out_w))
  nnet$set("input", self$layerId, output)
  self$forward <- function() {
    input <- self$nnet$get("input", self$layerId - 1)
    self$Di <- dim(input)
    col <- img2col(input, self$Di, self$Df, self$out_h, self$out_w, self$stride, self$pad)
    col <- img2col(input, Di, Dw, out_h, out_w, stride, pad)
    dim(col) <- c(self$Di[1] * self$out_h * self$out_w * self$Di[2], self$pool_size)
    self$arg_max <- apply(col, 1, which.max)
    self$input <- input
    output <- apply(col, 1, max)
    dim(output) <- c(self$Di[1], self$out_h, self$out_w, self$Di[2])
    output <- transpos(output, c(1, 4, 2, 3))
    self$nnet$set("input", self$layerId, output)
  }
  self$backward <- function() {
    feedback <- self$nnet$get("feedback", self$layerId)
    feedback <- transpos(feedback, c(1, 3, 4, 2))
    dmax <- array(0, dim = c(length(feedback), self$pool_size))
    index <- 1:length(feedback) + (self$arg_max - 1) * self$pool_size
    dmax[index] <- as.vector(feedback)
    dim(dmax) <- c(self$Di[1] * self$Di[2] * self$Dw[3] * self$Dw[4] , self$out_h * self$out_w)
    feedback <- col2img(self$dmax, self$Di, self$Dw, self$out_h, self$out_w, self$stride, self$pad)
    self$nnet$set("feedback", self$layerId - 1, feedback)
  }
}

LAYER <- list(
  Convolution = Convolution, MaxPool = MaxPool, 
  Affine = Affine, ReLU = ReLU, Sigmoid = Sigmoid, 
  BatchNormalization = BatchNormalization, Dropout = Dropout,
  LAST = list(MeanSquared = MeanSquared, SoftmaxWithLoss = SoftmaxWithLoss)
)
