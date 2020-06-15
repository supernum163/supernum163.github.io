

// 生成一个n行m列，由元素0构成的矩阵
newMat = function(n, m) {
  let mat = []
  for (var i = 0; i < n; i++) {
    mat[i] = Array(m).fill(0)
  }
  return mat
}
// 寻找冲突域，包含行、列、宫
getNearby = function(i, j) {
  let x, y, nearby = [], m = parseInt(i / 3) * 3, n = parseInt(j / 3) * 3
  // 同一列
  for (x = 0; x < 9; x++) {
    if (x !== i) nearby.push([x, j])
  }
  // 同一行
  for (y = 0; y < 9; y++) {
    if (y !== j) nearby.push([i, y])
  }
  // 同一九宫格
  for (x = m; x < m + 3; x++) {
    for (y = n; y < n + 3; y++) {
      if (i !== x && j !== y) nearby.push([x, y])
    }
  }
  return nearby
}
// 计算草稿答案中 i,j 位置上的数字是否与其它位置上的数字冲突
conflict = function(answer, i, j, num) {
  // 同一列
  for (let x = 0; x < 9; x++) {
    if (x !== i && answer[x][j] === num)
      return true
  }
  // 同一行
  for (let y = 0; y < 9; y++) {
    if (y !== j && answer[i][y] === num)
    return true
  }
  // 同一九宫格
  let m = parseInt(i / 3) * 3, n = parseInt(j / 3) * 3
  for (x = m; x < m + 3; x++) {
    for (y = n; y < n + 3; y++) {
      if (i !== x && j !== y && answer[x][y] === num)
        return true
    }
  }
  return false
}
// 寻找可选项
getChoices = function(puzzle, i, j) {
  let  x, y, choices = [1, 2, 3, 4, 5, 6, 7, 8, 9]
  // 同一行
  for (y = 0; y < 9; y++) {
    if (y === j || puzzle[i][y] === 0) continue
    choices = choices.filter(e => e !== puzzle[i][y])
  }
  // 同一列
  for (x = 0; x < 9; x++) {
    if (x === i || puzzle[x][j] === 0) continue
    choices = choices.filter(e => e !== puzzle[x][j])
  }
  // 同一九宫格
  let m = parseInt(i / 3) * 3, n = parseInt(j / 3) * 3
  for (x = m; x < m + 3; x++) {
    for (y = n; y < n + 3; y++) {
      if ((i === x && j === y) || puzzle[x][y] === 0) continue
      choices = choices.filter(e => e !== puzzle[x][y])
    }
  }
  return choices
}
// 寻找必选项, 某些数字是否在该格子的邻近区域都不能填写
getRequired = function(puzzle, i, j, choices) {
  let x, y, required, Hrequired = [], Vrequired = [], Crequired = [],
    m = parseInt(i / 3) * 3, n = parseInt(j / 3) * 3
  
  for (num of choices) {
    // 同一行
    Hrequired.push(num)
    for (y = 0; y < 9; y++) {
      if (y === j || puzzle[i][y] !== 0)continue
      if (!conflict(puzzle, i, y, num)) {
        Hrequired.pop()
        break
      }
    }
    // 同一列
    Vrequired.push(num)
    for (x = 0; x < 9; x ++) {
      if (x === i || puzzle[x][j] !== 0) continue
      if (!conflict(puzzle, x, j, num)) {
        Vrequired.pop()
        break
      }
    }
    // 同一九宫格
    Crequired.push(num)
    for (let k = 0; k < 9; k++) {
      x = m + parseInt(k / 3)
      y = n + k % 3
      if ((i === x && j === y) || puzzle[x][y] !== 0) continue
      if (!conflict(puzzle, x, y, num)) {
        Crequired.pop()
        break
      }
    }
  }
  required = Hrequired.concat(Vrequired).concat(Crequired)
  required = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(e => required.includes(e))
  return required
}

// 使用穷举法解开数独谜题
solve = function(puzzle) {
  // 先拷贝puzzle
  let i, j, num, loops, answer = newMat(9, 9), steps = []
  for (i = 0; i < 9; i++) {
    for (j = 0; j < 9; j++) {
        answer[i][j] = puzzle[i][j]
    }
  }
  // 回溯穷举
  i = 0, j = 0, loops = 0
  while (i < 9 && j < 9) {
    // 一定要记录循环次数，避免死循环
    loops ++
    if (loops > 1e6) {
      return {success: false, steps: steps}
    }
    // 前进到下一个格子
    if (answer[i][j] !== 0) {
      j++
      if (j === 9) { j = 0; i++ }
      continue
    }
    if (steps.length === 0 || 
      steps[0].i !== i || steps[0].j !== j
    ) {
      steps.unshift({
        i: i, j: j,
        num: [1, 2, 3, 4, 5, 6, 7, 8, 9]
      })
    }
    num = steps[0].num.shift()
    if (conflict(answer, i, j, num)) {
      // 回溯到上一个可能值，可以回退多步
      while (steps[0].num.length === 0) {
        steps.shift()
        if (steps.length === 0) {
          return {success: false, loops: loops}
        } 
        i = steps[0].i
        j = steps[0].j
        answer[i][j] = 0
      } 
    } else {
      // 暂定 [i, j] 上的值为 num
      answer[i][j] = num
    }
  }
  return {success: true, loops: loops, answer: answer}
}


puzzle = [
  [0, 0, 0,  0, 0, 0,  0, 0, 0],
  [0, 0, 0,  0, 0, 0,  0, 0, 0],
  [0, 0, 0,  0, 0, 0,  0, 0, 0],

  [0, 0, 0,  0, 0, 0,  0, 0, 0],
  [0, 0, 0,  0, 0, 0,  0, 0, 0],
  [0, 0, 0,  0, 0, 0,  0, 0, 0],

  [0, 0, 0,  0, 0, 0,  0, 0, 0],
  [0, 0, 0,  0, 0, 0,  0, 0, 0],
  [0, 0, 0,  0, 0, 0,  0, 0, 0],
]

puzzle = [
  [4, 0, 0,  0, 5, 0,  1, 0, 0],
  [0, 9, 0,  0, 0, 0,  0, 3, 0],
  [0, 0, 6,  1, 0, 0,  0, 0, 5],

  [8, 0, 0,  0, 0, 3,  0, 0, 0],
  [0, 0, 2,  0, 0, 0,  0, 8, 6],
  [9, 0, 0,  0, 8, 0,  5, 0, 0],

  [0, 3, 7,  0, 0, 9,  0, 0, 8],
  [0, 4, 0,  0, 6, 0,  7, 2, 0],
  [0, 0, 0,  7, 0, 0,  0, 1, 0],
]

solve(puzzle)
