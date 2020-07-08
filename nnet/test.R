
setwd("nnet")

source("utils.R")
source("layers.R")
source("optimizer.R")
source("nnet.R")



# 两层全链接神经网络
input <- matrix(c(-2, -1, 25, 6, 17, 4, -15, -6), nrow = 4, byrow = TRUE)
output = array(c(1, 0, 0, 1), dim = c(4, 1))

nnet <- Nnet(dim(input), dim(output))
LAYER$Affine(nnet, n = 2, "Sigmoid")
LAYER$Sigmoid(nnet)
LAYER$Affine(nnet, n = 1, "Sigmoid")
LAYER$Sigmoid(nnet)
LAYER$LAST$MeanSquared(nnet)
OPTIMIZER$Adam(nnet, lr = 0.1)
nnet$fFeed <- function(nnet) {
  nnet$data$input0 <- input
  nnet$data$output <- output
}
nnet$train(500)
plot(nnet$losses)



# 基于minist数据集，数字识别
n <- 100
dim_input <- c(n, 1, 28, 28)
dim_output <- c(n)
nnet <- Nnet(dim_input, dim_output)
LAYER$Convolution(nnet, filter_h = 5, filter_w = 5)
LAYER$ReLU(nnet)
LAYER$MaxPool(nnet, filter_h = 2, filter_w = 2, stride = 2, castToMat = TRUE)
LAYER$Affine(nnet, n = 100, "ReLU")
LAYER$ReLU(nnet)
LAYER$Affine(nnet, n = 10, "ReLU")
LAYER$LAST$SoftmaxWithLoss(nnet)
OPTIMIZER$Adam(nnet, lr = 0.001)
nnet$fFeed <- function(nnet, n = 100) {
  label <- file("data/labels", open = "r+b", raw = TRUE)
  train <- file("data/images", open = "r+b", raw = TRUE)
  ids <- sample(1:6000 - 1, n)
  for (i in seq_along(ids)) {
    id <- ids[i]
    seek(label, 8 + id, origin = "start")
    yTrue <- readBin(label, "raw", n = 1)
    nnet$data$output[i] <- as.numeric(yTrue) + 1
    seek(train, 16 + id * 28 * 28, origin = "start")
    img <- readBin(train, "raw", n = 28 * 28)
    img <- as.numeric(img)
    img <- matrix(img, nrow = 28, ncol = 28, byrow = TRUE)
    dim(img) <- c(1, 28, 28)
    nnet$data$input0[i, , , ] <- img
  }
  close(label)
  close(train)
}
nnet$train(1000)
plot(nnet$losses)

pred <- nnet$predict(nnet$data$input0)
pred <- apply(pred, 1, which.max)
sum(nnet$data$output == pred) / nnet$batch



# 神经网络中的关键信息
nnet$layers
nnet$data[nnet$params]
nnet$data[nnet$Dparams]
inputs <- ls(nnet$data, pattern = "input\\d+")
nnet$data[inputs]
nnet$get("input", nnet$layerId)
nnet$get("output")
self <- nnet$layers[[3]]
input <- nnet$get("input", nnet$layerId - 1)


