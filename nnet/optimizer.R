# 随机梯度下降法（Stochastic Gradient Descent）
SGD <- function(nnet, lr = 0.01) {
  self <- new.env()
  self$nnet <- nnet
  nnet$optimizer <- self
  self$lr <- lr
  self$optimise <- function() {
    for (i in 1:length((self$nnet$params))) {
      param <- self$nnet$get(self$nnet$params[i])
      Dparam <- self$nnet$get(self$nnet$Dparams[i])
      param <- param - self$lr * Dparam
      self$nnet$set(self$nnet$params[i], val = param)
    }
  }
}


# 动量更新法
Momentum <- function(nnet, lr = 0.01, momentum = 0.9) {
  self <- new.env()
  self$nnet <- nnet
  nnet$optimizer <- self
  self$lr <- lr
  self$momentum <- momentum
  self$v <- as.list(rep(0, length(nnet$params)))
  self$optimise <- function() {
    for (i in 1:length((self$nnet$params))) {
      param <- self$nnet$get(self$nnet$params[i])
      Dparam <- self$nnet$get(self$nnet$Dparams[i])
      self$v[[i]] <- self$momentum * self$v[[i]] - self$lr * Dparam
      param <- param  + self$v[[i]]
      self$nnet$set(self$nnet$params[i], val = param)
    }
  }
}



Nesterov <- function(nnet, lr = 0.01, momentum = 0.9) {
  self <- new.env()
  self$nnet <- nnet
  nnet$optimizer <- self
  self$lr <- lr
  self$momentum <- momentum
  self$v <- as.list(rep(0, length(nnet$params)))
  self$optimise <- function() {
    for (i in 1:length((self$nnet$params))) {
      param <- self$nnet$get(self$nnet$params[i])
      Dparam <- self$nnet$get(self$nnet$Dparams[i])
      self$v[[i]] <- self$momentum * self$v[[i]] - self$lr * Dparam
      param <- param + self$v[[i]] * self$momentum ^ 2 - (1 + self$momentum) * self$lr * Dparam
      self$nnet$set(self$nnet$params[i], val = param)
    }
  }
}



AdaGrad <- function(nnet, lr = 0.01) {
  self <- new.env()
  self$nnet <- nnet
  nnet$optimizer <- self
  self$lr <- lr
  self$h <- as.list(rep(0, length(nnet$params)))
  self$optimise <- function() {
    for (i in 1:length((self$nnet$params))) {
      param <- self$nnet$get(self$nnet$params[i])
      Dparam <- self$nnet$get(self$nnet$Dparams[i])
      self$h[[i]] <- self$h[[i]] + Dparam ^ 2
      param <- param - self$lr * Dparam / (sqrt(self$h[[i]]) + KSI)
      self$nnet$set(self$nnet$params[i], val = param)
    }
  }
}



RMSprop <- function(nnet, lr = 0.01, decay = 0.99) {
  self <- new.env()
  self$nnet <- nnet
  nnet$optimizer <- self
  self$lr <- lr
  self$decay <- decay
  self$h <- as.list(rep(0, length(nnet$params)))
  self$optimise <- function() {
    for (i in 1:length((self$nnet$params))) {
      param <- self$nnet$get(self$nnet$params[i])
      Dparam <- self$nnet$get(self$nnet$Dparams[i])
      self$h[[i]] <- self$decay * self$h[[i]] + (1 - self$decay) * Dparam ^ 2
      param <- param - self$lr * Dparam / (sqrt(self$h[[i]]) + KSI)
      self$nnet$set(self$nnet$params[i], val = param)
    }
  }
}



Adam <- function(nnet, lr = 0.01, beta1 = 0.9, beta2 = 0.999) {
  self <- new.env()
  self$nnet <- nnet
  nnet$optimizer <- self
  self$lr <- lr
  self$iter <- 0
  self$beta1 <- beta1
  self$beta2 <- beta2
  self$m <- as.list(rep(0, length(nnet$params)))
  self$v <- as.list(rep(0, length(nnet$params)))
  self$optimise <- function() {
    self$iter <- self$iter + 1
    lr_t <- self$lr * sqrt(1 - self$beta2 ^ self$iter) / (1 - self$beta1 ^ self$iter)
    for (i in 1:length((self$nnet$params))) {
      param <- self$nnet$get(self$nnet$params[i])
      Dparam <- self$nnet$get(self$nnet$Dparams[i])
      self$m[[i]] <- self$beta1 * self$m[[i]] + (1 - self$beta1) * Dparam
      self$v[[i]] <- self$beta2 * self$v[[i]] + (1 - self$beta2) * Dparam ^ 2
      param <- param - lr_t * self$m[[i]] / (sqrt(self$v[[i]]) + KSI)
      self$nnet$set(self$nnet$params[i], val = param)
    }
  }
}



OPTIMIZER = list(
  SGD = SGD, Momentum = Momentum, Nesterov = Nesterov, 
  AdaGrad = AdaGrad, RMSprop = RMSprop, Adam = Adam
)


