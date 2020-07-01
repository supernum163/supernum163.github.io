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
      self$nnet$set(self$nnet$params[i], val = param - lr * Dparam)
    }
  }
  return(self)
}

setRefClass(
  "SGD",
  fields = c("lr"),
  methods = list(
    initialize = function(lr = 0.01) {
      lr <<- lr
    },
    optimise = function(params, grads) {
      for (i in 1:length((params))) {
        params[i] <- params[i] - lr * grads[i]
      }
      return(params)
    }
  )
)



# 动量更新法
setRefClass(
  "Momentum",
  fields = c("lr", "momentum", "v"),
  methods = list(
    initialize = function(lr = 0.01, momentum = 0.9) {
      v <<- numeric(0)
      lr <<- lr
      momentum <<- momentum
    },
    optimise = function(params, grads) {
      if (length(v) == 0) {
        v <<- rep(0, length(params))
      }
      for (i in 1:length((params))) {
        v[i] <<- momentum * v[i] - lr * grads[i] 
        params[i] <- params[i] + v[i]
      }
      return(params)
    }
  )
)



setRefClass(
  "Nesterov",
  fields = c("lr", "momentum", "v"),
  methods = list(
    initialize = function(lr = 0.01, momentum = 0.9) {
      v <<- numeric(0)
      lr <<- lr
      momentum <<- momentum
    },
    optimise = function(params, grads) {
      if (length(v) == 0) {
        v <<- rep(0, length(params))
      }
      for (i in 1:length((params))) {
        v[i] <<- momentum * v[i] - lr * grads[i] 
        params[i] <- params[i] + v[i] * momentum ^ 2 - (1 + momentum) * lr * grads[i]
      }
      return(params)
    }
  )
)



setRefClass(
  "AdaGrad",
  fields = c("lr", "h"),
  methods = list(
    initialize = function(lr = 0.01) {
      h <<- numeric(0)
      lr <<- lr
    },
    optimise = function(params, grads) {
      if (length(h) == 0) {
        h <<- rep(0, length(params))
      }
      for (i in 1:length((params))) {
        h[i] <<- h[i] + grads[i] ^ 2
        params[i] <- params[i] - lr * grads[i] / (sqrt(h[i]) + 1e-7)
      }
      return(params)
    }
  )
)



setRefClass(
  "RMSprop",
  fields = c("lr", "decay", "h"),
  methods = list(
    initialize = function(lr = 0.01, decay = 0.99) {
      h <<- numeric(0)
      lr <<- lr
      decay <<- decay
    },
    optimise = function(params, grads) {
      if (length(h) == 0) {
        h <<- rep(0, length(params))
      }
      for (i in 1:length((params))) {
        h[i] <<- decay * h[i] + (1 - decay) * grads[i] ^ 2
        params[i] <- params[i] - lr * grads[i] / (sqrt(h[i]) + 1e-7)
      }
      return(params)
    }
  )
)



setRefClass(
  "Adam",
  fields = c("lr", "beta1", "beta2","iter", "m", "v"),
  methods = list(
    initialize = function(lr = 0.001, beta1 = 0.9, beta2 = 0.999) {
      iter <<- 0
      m <<- numeric(0)
      v <<- numeric(0)
      lr <<- lr
      beta1 <<- beta1
      beta2 <<- beta2
    },
    optimise = function(params, grads) {
      if (length(m) == 0) {
        m <<- rep(0, length(params))
        v <<- rep(0, length(params))
      }
      iter <<- iter + 1
      lr_t <- lr * sqrt(1 - beta2 ^ iter) / (1 - beta1 ^ iter)               
      for (i in 1:length((params))) {
        m[i] <<- beta1 * m[i] + (1 - beta1) * grads[i]
        v[i] <<- beta2 * v[i] + (1 - beta2) * grads[i] ^ 2
        params[i] <- params[i] - lr_t * m[i] / (sqrt(v[i]) + 1e-7)
      }
      return(params)
    }
  )
)


# OPTIMIZER = list(sgd = SGD, momentum = Momentum, nesterov = Nesterov, 
#  adagrad = AdaGrad, rmsprpo = RMSprop, adam = Adam
# )
