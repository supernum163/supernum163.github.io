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
      output <- t(t(input %*% weight)  + bias)
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
array(1:24, dim = c(2, 3, 4))

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
