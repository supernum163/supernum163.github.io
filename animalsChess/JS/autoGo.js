
// 自动走棋，低等级
function autoGo0() {
  let i, j, chess, positions, directions, k, pos
  // 随机选择一个棋子移动
  positions = this.positions.concat()
  while (positions.length > 0) {
    k = parseInt(Math.random() * positions.length)
    pos = positions.splice(k, 1)[0]
    i = pos[0]; j = pos[1]
    chess = this.getChess(i, j)
    if (chess === 0) continue
    if (this.camp > 0 && parseInt(chess / 10) === this.camp) continue
    // 随机选择一个方向移动
    directions = [[i, j], [i - 1, j], [i + 1, j], [i, j + 1], [i, j - 1]]
    while (directions.length > 0) {
      k = parseInt(Math.random() * directions.length)
      pos = directions.splice(k, 1)[0]
      if (this.moveChess(i, j, chess, pos[0], pos[1], false)) return
    }
  }
}


function cloneBoard(board) {
  var newBoard = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]
  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) {
      newBoard[i][j] = board[i][j]
    }
  }
  return newBoard
}

// 判断将第一个棋子移动到第二个位置后的 “得分”
function scoreIfMove(board, i1, j1, chess1, i2, j2) {
  // 判断第二个位置是否无效，两个位置是否 “不近邻”
  if (i2 < 0 || i2 > 3 || j2 < 0 || j2 > 3 ||
    Math.abs(i1 - i2) + Math.abs(j1 - j2) != 1
  ) return -9
  // 获取第二个位置上的棋子
  var chess2 = board[i2][j2]
  // 判断第二个棋子是否未翻开，或两个棋子属于同一个阵营
  if (chess2 === 9 || parseInt(chess1 / 10) === parseInt(chess2 / 10)) 
    return -9
  // 判断第二个位置上是否没有棋子
  if (chess2 === 0) return 0
  // 判断移动后的 “得分”
  var chess1 = chess1 % 10; var chess2 = chess2 % 10
  if (chess1 === 7 && chess2 === 0) return -7
  if (chess1 === 0 && chess2 === 7) return 7
  if (chess1 === chess2) return [.1, .2, .3, .4, .5, .6, .7, .7][chess1 % 10]
  return chess1 > chess2 ? chess2 + 1 : -chess1 - 1
}

// 将棋盘中的棋子从一个位置移动到另一个位置
function updateBoard(board, i1, j1, chess1, i2, j2) {
  var board = board
  if (chess1 === board[i2][j2]) {
    board[i1][j1] = 0
    board[i2][j2] = 0
  } else {
    board[i1][j1] = 0
    board[i2][j2] = chess1
  }
  return board
}

// 获取所有已知棋子中，某一方的 “得分”
function getScore(board, camp) {
  var score = 0
  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) {
      if (board[i][j] < 10) continue
      score += parseInt(board[i][j] / 10) === camp ?
        board[i][j] % 10 : -board[i][j] % 10
    }
  }
  return score
}

// 按照 “吃掉” 及 “躲避” 原则，选择最佳走法
function smartMove(board, camp) {
  let i, j, chess, i1, j1, i2, j2, move, m
  // 获取棋盘中 “存活” 的棋子
  var survivors = []
  var allTurned = true
  for (i = 0; i < 4; i++) {
    for (j = 0; j < 4; j++) {
      if (board[i][j] === 9) { allTurned = false; continue }
      if (board[i][j] < 10) continue
      if (parseInt(board[i][j] / 10) != camp) continue
      survivors.push([i, j, board[i][j]])
    }
  }
  // 寻找移动那个棋子 “得分” 最高
  // [i, j, chess, i1, j1, score, dist]
  move = [0, 0, 0, 0, 0, -Infinity, -Infinity]
  for ([i, j, chess] of survivors) {
    // 寻找向那个方向移动 “得分” 最高
    m = [0, 0, 0, 0, 0, -Infinity, -Infinity]
    var chessValue = 0
    var directions = [[i - 1, j], [i + 1, j], [i, j - 1], [i, j + 1]]
    for ([i1, j1] of directions) {
      var score = scoreIfMove(board, i, j, chess, i1, j1)
      if (score === -9) continue
      if (score < 0) { chessValue = -score; continue }
      var dist = Math.abs(i1 - 1.5) + Math.abs(j1 - 1.5)
      if (score > m[5] || (score === m[5] && dist > m[6])) { 
        m = [i, j, chess, i1, j1, score]
        // 移动后如果棋子会被吃掉，则要减去相应的分数
        var newPos = [[m[3]- 1, m[4]], [m[3] + 1, m[4]], [m[3], m[4] - 1], [m[3], m[4] + 1]]
        for ([i2, j2] of newPos) {
          var newScore = scoreIfMove(board, i1, j1, chess, i2, j2)
          if (newScore < -7 || newScore > -1) continue
          score -= [1, 2, 3, 4, 5, 6, 7, 7][m[2] % 10]
          break
        }
      }
    }
    if (m[5] < 0) continue
    if (chessValue > 0) m[5] += chessValue
    if (allTurned && survivors.length === 1) m[5] += 0.01
    // 判断移动该棋子是否得分最高
    if (m[5] > move[5]) move = m
  }
  return move
}

// 自动走棋，普通等级
function autoGo1() {
  let i, j, chess, i1, j1, m, move
  // 遍历能走的每一步，然后用最优步骤反复走棋，判断最终 “得分”
  move = [0, 0, 0, 0, 0, -Infinity, 0]
  for ([i, j] of this.positions) {
    chess = this.board[i][j]
    if (chess < 10 || parseInt(chess / 10) === this.camp) continue
    var directions = [[i - 1, j], [i + 1, j], [i, j - 1], [i, j + 1]]
    for ([i1, j1] of directions) {
      var score = scoreIfMove(this.board, i, j, chess, i1, j1)
      if (score < 0) continue
      var newBoard = cloneBoard(this.board)
      newBoard = updateBoard(newBoard, i, j, chess, i1, j1)
      for (var step = 1; step < 16; step++) {
        m = smartMove(newBoard, (this.camp + step) % 2 + 1)
        if (m[5] <= 0) break
        newBoard = updateBoard(newBoard, m[0], m[1], m[2], m[3], m[4])
      }
      var finalScore = getScore(newBoard, this.camp % 2 + 1)
      if (finalScore > move[5] || 
        (finalScore === move[5] && step < move[6]) ||
        (finalScore === move[5] && step === move[6] && Math.random() > 0.5)
      ) move = [i, j, chess, i1, j1, finalScore, step]
    }
  }

  // 如果有最优步骤，则走最优步骤，否则随机走一步
  if (move[5] > -Infinity) {
    this.moveChess(move[0], move[1], move[2], move[3], move[4], false)
  } else {
    this.autoGo0()
  }
}