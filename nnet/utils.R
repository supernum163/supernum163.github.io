# 可以忽略不计的微小值，用于避免求除数或log遇到0时，出现 Inf 的情况
KSI <- 1e-7

# 当激活函数为 sigmoid 或 tanh 等 S 型曲线函数时,初始值使用 Xavier 初始值
# 当激活函数使用 ReLU 时,权重初始值使用 He 初始值
initWeight <- function(m, n, type = c("Xavier", "He")) {
  type <- match.arg(type)
  k <- c(Xavier = 1, He = 2)[type]
  weight <-rnorm(m * n, sd = sqrt(k / m))
  dim(weight) <- c(m, n)
  return(weight)
}
initBias <- function(n) {
  bias <- rep(0, n)
  return(bias)
}
