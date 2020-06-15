
  
// 获取空格所在位置
getBlank = function(puzzle, rank) {
  for (var i = 0; i < rank; i++) {
    for (var j = 0; j < rank; j++) {
      if (puzzle[i][j] === null) return [i, j]
    }
  }
  return []
}
// 随机生成 rank 阶拼图迷面
genPuzzle = function(rank) {
  // 先生成拼图终局
  var puzzle = Array(rank)
  for (var i = 0; i < rank; i++) {
    puzzle[i] = Array(rank)
    for (var j = 0; j < rank; j++) {
      if (i === rank - 1 && j === rank - 1) {
        puzzle[i][j] = null 
      } else puzzle[i][j] = {i: i, j: j}
    }
  }
  // 再随机把拼图打乱
  var maxLoop = (1 + parseInt(Math.random() * 2)) * rank * 20
  for (var loop = 0; loop < maxLoop; loop++) {
    var [i, j] = getBlank(puzzle, rank)
    var directs = [[-1, 0], [1, 0], [0, -1], [0, 1]]
    for (var d = 0; d < 4; d++) {
      var direct = parseInt(Math.random() * directs.length)
      var [istep, jstep] = directs[direct]
      directs.splice(direct, 1)
      var m = i + istep, n = j + jstep
      if (m < 0 || m >= rank || n < 0 || n >= rank) continue
      puzzle[i][j] =  puzzle[m][n] 
      puzzle[m][n] = null
      break
    }
  }
  return puzzle
}

genPuzzle(3)
