
AI = function() {
  this.rank = 6
  this.chessType = 3
}

AI.prototype = {

  init(PUZZLE, CAMP) {
    // 全局匹配时用的多分岔树
    this.idMat = {}
    // 博弈树根结点
    this.root = this.getNode(PUZZLE)
    this.root.step = 0
    this.root.score = this.getScore(PUZZLE, CAMP)
    // 博弈树
    this.steps = [[ this.root ]]
  },
  // 获取谜题对应的ID
  getPuzzleId(PUZZLE) {
    var vec = []
    for (var i = 0; i < this.rank; i++) {
      for (var j = 0; j < this.rank; j++) {
        if (PUZZLE[i][j] <= 0) continue
        vec.push(PUZZLE[i][j] * 100 + i * 10 + j)
      }
    }
    return vec.sort().toString()
  },
  // 由盘面生成博弈树结点，step表示盘面位于现有博弈树的第几层，没有则为Infinity
  getNode(PUZZLE) {
    var id = this.getPuzzleId(PUZZLE)
    if (this.idMat[id] === undefined) 
      this.idMat[id] = { P: PUZZLE, children: [], step: Infinity, score: undefined }
    return this.idMat[id]
  },
  // 克隆盘面
  clone(PUZZLE) {
    var puzzle = Array(this.rank)
    for (var i = 0; i < this.rank; i++) {
      puzzle[i] = Array(this.rank)
      for (var j = 0; j < this.rank; j++) {
        puzzle[i][j] = PUZZLE[i][j]
      }
    }
    return puzzle
  }, 
  availPos(PUZZLE, i, j, chess = PUZZLE[i][j]) {
    var pos = []
    if (i === 5 && PUZZLE[4][j] === 0) {
      pos.push([4, j])
    } else if (j === 5 && PUZZLE[i][4] === 0) {
      pos.push([i, 4])
    } else {
      if (chess === 1) {
        if (i === 3 && PUZZLE[4][j] === 2 && PUZZLE[5][j] === 0) pos.push([5, j])
        else if (i === 4 && PUZZLE[5][j] === 0) pos.push([5, j])
      } else {
        if (j === 3 && PUZZLE[i][4] === 1 && PUZZLE[i][5] === 0) pos.push([i, 5])
        else if (j === 4 && PUZZLE[i][5] === 0) pos.push([i, 5])
      }
      for (var [istep, jstep] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        var m = i + istep, n = j + jstep
        if (m < 0 || m >= this.rank - 1 || n < 0 || n >= this.rank - 1) continue
        if (PUZZLE[m][n] !== 0) continue
        pos.push([m, n])
      }
    }
    return pos
  },
  // 移动棋子,camp表示要移动的阵营
  move(PUZZLE, CAMP) {
    var puzzles = []
    for (var i = 0; i < this.rank; i++) {
      for (var j = 0; j < this.rank; j++) {
        if (PUZZLE[i][j] !== CAMP) continue
        var pos = this.availPos(PUZZLE, i, j, CAMP)
        for (var [m, n] of pos) {
          var puzzle = this.clone(PUZZLE)
          puzzle[i][j] = 0
          puzzle[m][n] = CAMP
          puzzles.push(puzzle)
        }
      }
    }
    return puzzles
  },
  // 对当前局势的评价函数
  getScore(PUZZLE, CAMP) {
    var score = 0
    for (var i = 0; i < this.rank; i++) {
      for (var j = 0; j < this.rank; j++) {
        if (PUZZLE[i][j] === 1) score -= 5 - i
        else if (PUZZLE[i][j] === 2) score += 5 - j
      }
    }
    return (CAMP === 1) ? score : -score
  },
  // 检查某个阵营是否成功， 0为挑战继续，1为成功，2为失败，3为和局
  success(PUZZLE, CAMP) {
    var sucess = 3
    // 先手方是否获胜
    for (var n = 1; n < 5; n++) {
      if (PUZZLE[5][n] !== 1) {
        sucess -= (CAMP === 1) ? 1 : 2 
        break
      }
    }
    // 后手方是否获胜
    for (var m = 1; m < 5; m++) {
      if (PUZZLE[m][5] !== 2) {
        sucess -= (CAMP === 1) ? 2 : 1
        break
      }
    }
    // 挑战继续
    return sucess
  },
  // 自动走棋，返回下一个盘面
  nextMove(PUZZLE, CAMP) {
    var puzzles = this.move(PUZZLE, CAMP)
    /* 按简单的最优策略走棋
    */
    if (puzzles.length === 0) return PUZZLE
    var scores = Array(puzzles.length)
    for (var i = 0; i < puzzles.length; i++) {
      scores[i] = this.getScore(puzzles[i], CAMP)
    }
    var i = 0
    for (var j = 1; j < puzzles.length; j++) {
      if (scores[j] > scores[i] || 
        (scores[j] === scores[i] && Math.random() < 0.5)  
      ) i = j
    }
    /* 完全随机走棋
    var i = 0
    for (var j = 1; j < puzzles.length; j++) {
      if (Math.random() < 0.5)  i = j
    }
    */
    // 返回下一步
    return (puzzles[i])
  },
  // 自动走棋，返回胜负
  autoMove(PUZZLE, CAMP, ROUND, maxStep = 150) {
    var puzzle = this.clone(PUZZLE)
    for (var i = 0; i < maxStep; i++) {
      ROUND = ROUND % 4 + 1
      camp = [1, 2].indexOf(ROUND) > -1 ? 1 : 2
      puzzle = this.nextMove(puzzle, camp)
      var success = this.success(puzzle, CAMP)
      if (success > 0) return [0, 1, -1][success]
    }
    return 0
  },
  // 使用广度优先算法搜索答案，LOOPS表示需要考虑的回合数，LOOPS越大越智能
  smartMove(PUZZLE, CAMP, ROUND = 4, LOOPS = 30) {
    var puzzles = this.move(PUZZLE, CAMP)
    if (puzzles.length === 0) return PUZZLE
    var scores = Array(puzzles.length).fill(0)
    for (var i = 0; i < puzzles.length; i++) {
      for (var j = 0; j < LOOPS; j++) {
        scores[i] += this.autoMove(puzzles[i], CAMP, ROUND)
      }
      scores[i] = scores[i] / LOOPS + this.getScore(puzzles[i]) / 20
    }
    var i = 0
    for (var j = 1; j < puzzles.length; j++) {
      if (scores[j] > scores[i] || 
        (scores[j] === scores[i] && Math.random() < 0.5)  
      ) i = j
    }
    console.log(scores)
    // 返回下一步
    return (puzzles[i])

  }

}



/*
var puzzle = [
  [ 0,  1,  1,  1,  1, -1],
  [ 2,  0,  0,  0,  0,  0],
  [ 2,  0,  0,  0,  0,  0],
  [ 2,  0,  0,  0,  0,  0],
  [ 2,  0,  0,  0,  0,  0],
  [-1,  0,  0,  0,  0, -1],
]

var ai = new AI()
ai.smartMove(puzzle, 1, 4, 4)

ai.getScore(puzzle, 1)
ai.getShortPath(puzzle, 1, 0, 1, 5)

*/
