
AI = function() {
  this.rank = 6
}

AI.prototype = {
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
  // 选择
  select : function() {
    var node = this.root
    while(node.next.length > 0) {
      var tmp, score = 0
      for (n of node.next) {
        // 选择未扩展的节点
        if (n.N === 0) { tmp = n; break }
        // 选择 UCT 得分高的节点
        var s = n.Q / n.N + Math.sqrt(2 * Math.log(this.root.N) / n.N)
        if (s > score) { score = s; tmp = n }
      }
      node = tmp      
    }
    return node
  },
  // 扩展
  expand: function(node) {
    var camp = [1, 2].indexOf(node.R) > -1 ? 1 : 2
    var puzzles = this.move(node.P, camp)
    if (puzzles.length === 0) puzzles = [this.clone(node.P)]
    var round = node.R % 4 + 1
    for (var puzzle of puzzles) {
      var n = { P: puzzle, prev: node, next: [], Q: 0, N: 0, R: round }
      node.next.push(n)
    }
    var i = parseInt(Math.random() * node.next.length)
    return node.next[i]
  },
  // 模拟
  simulate: function(node) {
    var puzzle = this.clone(node.P)
    var round = node.R, success = 0
    for (var i = 0; i < 150; i++) {
      success = this.success(puzzle, 1)
      if (success > 0) break
      camp = [1, 2].indexOf(round) > -1 ? 1 : 2
      var puzzle = this.nextMove(puzzle, camp)
      round = round % 4 + 1
    }
    return success
  },
  // 回溯
  feedback: function(node, success) {
    for (var n = node; n !== null; n = n.prev) {
      n.N++
      if (success === 1 && [2, 3].indexOf(n.R) > -1) n.Q++
      else if (success === 2 && [4, 1].indexOf(n.R) > -1) n.Q++
    }
  },
  
  // 使用广度优先算法搜索答案，LOOPS表示需要考虑的回合数，LOOPS越大越智能
  smartMove(PUZZLE, ROUND = 4, LOOPS = 30) {
    this.root = { P: PUZZLE, prev: null, next: [], Q: 0, N: 0, R: ROUND }

    // 进行 LOOPS 次抽样
    for (var i = 0; i < LOOPS; i++) {
      var node = this.select()
      node = this.expand(node)
      var success = this.simulate(node)
      this.feedback(node, success)
    }
    // 选择最优着法
    var tmp, N = 0
    for (n of this.root.next) {
      if (n.N > N) { N = n.N; tmp = n }
    }
    return tmp.P

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
ai.smartMove(puzzle, 2, 1)
*/




