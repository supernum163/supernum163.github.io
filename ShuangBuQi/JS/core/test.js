
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


matsum = function(A, B, fun) {
  var l = Math.max(A.length, B.length)
  var C = Array(l)
  if (typeof(A) === typeof(B) === "number") 
    return fun(A, B)
  for (var i = 0; i < l; i++) {
    var m = i % A.length; n = i % B.length
    C[i] = matsum(A[m], B[n], fun)
  }
}



