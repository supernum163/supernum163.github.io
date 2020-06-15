
const Utils = {
  // 返回 [start, end] 区间段内的随机整数
  random: function (start, end) {
    return parseInt(Math.random() * (end - start + 1)) + start
  },
  // 从 array 数组中随机抽取一个元素
  choose: function (array) {
    return array[parseInt(Math.random() * array.length)]
  },
  // 生成一个 n * m 的矩阵
  newMat: function(n = 4, m = 4) {
    let mat = []
    for (var i = 0; i < n; i++) {
      mat[i] = Array(m).fill(0)
    }
    return mat
  },
  // 将矩阵 mat2 从 [i2, j2] 开始，按照位置拷贝到矩阵 mat1 的 [i1, j1] 开始的范围
  copyMat: function(mat1, mat2, i1, j1, i2, j2) {
    for (var n1 = i1, n2 = i2; 
      n1 < mat1.length && n2 < mat2.length; 
      n1++, n2++
    ) {
      for (var m1 = j1, m2 = j2; 
        m1 < mat1[n1].length && m2 < mat2[n2].length; 
        m1++, m2++
      ) {
        mat1[n1][m1] = mat2[n2][m2]
      }
    }
  },

}
