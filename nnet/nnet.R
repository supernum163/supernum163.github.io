setwd("nnet")

source("utils.R")
source("layers.R")
source("optimizer.R")


Nnet <- function(dim_input, dim_output, L2 = 0) {
  self <- new.env()
  # 层的集合
  self$layers <- list()
  self$layerId <- 0
  # 数据的集合
  self$data <- list()
  # 输入输出层的数据接口
  if (dim_input[1] != dim_output[1]) {
    stop("无法确定 batch size")
  } else {
    self$batch <- dim_input[1]
  }
  self$data$input0 <- array(0, dim_input)
  self$data$output <- array(0, dim_output)
  # 参数的集合，用于整体更新参数
  self$params <- c()
  self$Dparams <- c()
  # 全链接层权重的集合，配合L2系数可以避免该权重过大
  self$weights <- c()
  # 获取数据
  self$get <- function(name, id = NULL) {
    if (length(name) <= 0) return(NULL)
    name <- paste0(name, id)
    return(self$data[[name]])
  }
  self$set <- function(name, id = NULL, val) {
    if (length(name) <= 0) return(NULL)
    name <- paste0(name, id)
    self$data[[name]] <- val
  }
  self$train <- function(iters = 1000) {
    self.task <- "train"
    for (i in 1:iters) {
      self$fFeed(self)
      for (layer in self$layers) layer$forward()
      for (layer in rev(self$layers)) layer$backward()
      self$optimizer$optimise()
    }
  }
  
  return(self)
}



input <- matrix(c(-2, -1, 25, 6, 17, 4, -15, -6), nrow = 4, byrow = TRUE)
output = array(c(1, 0, 0, 1), dim = c(4, 1))

nnet <- Nnet(dim(input), dim(output))
Sigmoid(nnet, n = 2)
Sigmoid(nnet, n = 1)
MeanSquared(nnet)
optimizer <- SGD(nnet, lr = 0.1)
nnet$fFeed <- function(nnet) {
  nnet$data$input0 <- input
  nnet$data$output <- output
}
nnet$train(200)
nnet$loss
nnet$data$input4

nnet$data[nnet$params]
nnet$data[nnet$Dparams]
inputs <- ls(nnet$data, pattern = "input\\d+")
nnet$data[inputs]


