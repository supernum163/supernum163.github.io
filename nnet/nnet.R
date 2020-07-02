
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
  # 记录每次循环的损失值
  self$losses <- c()
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
  # 训练神经网络
  self$train <- function(iters = 1000) {
    self$task <- "train"
    for (i in 1:iters) {
      self$fFeed(self)
      for (layer in self$layers) layer$forward()
      for (layer in rev(self$layers)) layer$backward()
      self$optimizer$optimise()
      self$losses <- append(self$losses, self$loss)
    }
  }
  # 预测结果
  self$predict <- function(input) {
    self$task <- "predict"
    self$data$input0 <- input
    self$batch <- dim(input)[1]
    for (layer in self$layers) layer$forward()
    output <- self$get("input", self$layerId)
    return(output)
  }
  # 返回对象自身
  return(self)
}


