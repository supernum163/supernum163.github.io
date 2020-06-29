
// 矩阵点积
matprod = function(A, B) {
  var l = A.length, m = B.length, n = B[0].length
  var C = Array(l)
  for(var i = 0 ;i < l; i++) {
    C[i] = Array(n).fill(0)
    for(var k = 0 ;k < m; k++) {
      var r = A[i][k]
      for(var j = 0; j < n; j++)
          C[i][j] += r * B[k][j]
    }
  }
  return C
}

// 高纬数组 A B 维度必须相同
apply = function(A, B, fun) {
  // if (["number", "string", "boolean"].indexOf(typeof(A)) > -1) {
  if (typeof(A) === "number") {
    return fun(A, B)
  }
  var C = Array(A.length)
  for (var i = 0; i < A.length; i++) {
    C[i] = apply(A[i], B[i], fun)
  }
  return C
}

