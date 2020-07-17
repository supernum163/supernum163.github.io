
AI = function() {
  this.chesses = 10
}

AI.prototype = {
  // 克隆盘面
  clone(PUZZLE) {
    var puzzle = Array(PUZZLE.length)
    for (var i = 0; i < PUZZLE.length; i++) {
      puzzle[i] = Array(2)
      for (var j = 0; j < 2; j++) {
        puzzle[i][j] = PUZZLE[i][j]
      }
    }
    return puzzle
  }, 
  // 检查某个阵营是否成功， 0为挑战继续，1为成功，2为失败
  success(PUZZLE, CAMP) {
    if (PUZZLE.length < 10) return 0
    // 先手方是否获胜
    var vec = []
    for (var n = 0; n < 10; n += 2) vec.push( PUZZLE[n].toString() ) 
    if (vec.sort().toString() === "0,8,1,7,2,8,3,7,4,8")
      return (CAMP === 0) ? 1 : 2
    // 后手方是否获胜
    var vec = []
    for (var n = 1; n < 10; n += 2) vec.push( PUZZLE[n].toString() ) 
    if (vec.sort().toString() === "0,0,1,1,2,0,3,1,4,0")
      return (CAMP === 1) ? 1 : 2
    // 挑战继续
    return 0
  },
  // 获取 [i, j] 棋位上的棋子下一步能够走到哪些棋位
  availPos(PUZZLE, ROUND) {
    var pos = []
    // 布棋阶段
    if (PUZZLE.length < 10) {
      pos = (ROUND % 2 === 0) ?
        [ [0, 0], [1, 1], [2, 0], [3, 1], [4, 0] ] :
        [ [0, 8], [1, 7], [2, 8], [3, 7], [4, 8] ]
    } 
    // 走子阶段
    else {
      var [i, j] = PUZZLE[ROUND]
      pos = [
        [i, j - 2], [i, j + 2], 
        [i - 1, j - 1], [i - 1, j + 1], 
        [i + 1, j - 1], [i + 1, j + 1], 
      ]
      pos = pos.filter(function(p) {
        if (p[0] < 0 || p[0] > 4) return false
        var [j0, j1] = (p[0] % 2 === 0) ? [0, 8] : [1, 7]
        if (p[1] < j0 || p[1] > j1) return false
        return true
      })
    }
    pos = pos.filter(p => !PUZZLE.some(P => P[0] === p[0] && P[1] === p[1]))
    return pos
  },
  // 移动棋子,camp表示要移动的阵营
  move(PUZZLE, ROUND) {
    var puzzles = []
    var pos = this.availPos(PUZZLE, ROUND)
    for (var p of pos) {
      var puzzle = this.clone(PUZZLE)
      puzzle[ROUND] = p
      puzzles.push(puzzle)
    }
    return puzzles
  },
  // 对当前局势的评价函数
  getScore(PUZZLE, CAMP) {
    if (PUZZLE.length < 10) return 0
    var score = -40
    for (var p of PUZZLE) score += p[1] 
    return (CAMP === 0) ? score : -score
  },
  // 自动走棋，返回下一个盘面
  nextMove(PUZZLE, ROUND) {
    var puzzles = this.move(PUZZLE, ROUND)
    var camp = (ROUND % 2 === 0) ? 0 : 1
    /* 按简单的最优策略走棋 */
    if (puzzles.length === 0) return PUZZLE
    var scores = Array(puzzles.length)
    for (var i = 0; i < puzzles.length; i++) {
      scores[i] = this.getScore(puzzles[i], camp)
    }
    var i = 0
    for (var j = 1; j < puzzles.length; j++) {
      if (scores[j] > scores[i] || 
        (scores[j] === scores[i] && Math.random() < 0.5)  
      ) i = j
    }
    // 返回下一步
    return (puzzles[i])
  },
  // 选择
  select : function() {
    var node = this.root
    while(node.next.length > 0) {
      var tmp, score = -1
      for (n of node.next) {
        // 选择未扩展的节点
        if (n.N === 0) { tmp = n; break }
        // 选择 UCT 得分高的节点
        var s = n.Q / n.N + Math.sqrt(2 * Math.log(this.root.N) / n.N)
        if (s > score) { score = s; tmp = n }
      }
      node = tmp
      if (node === undefined) console.log("select", this.root)
    }
    return node
  },
  // 扩展
  expand: function(node) {
    var puzzles = this.move(node.P, node.R)
    if (puzzles.length === 0) puzzles = [this.clone(node.P)]
    var round = (node.R + 1) % 10
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
      success = this.success(puzzle, 0)
      if (success > 0) break
      var puzzle = this.nextMove(puzzle, round)
      round = (round + 1) % 10
    }
    return success
  },
  // 回溯
  feedback: function(node, success) {
    for (var n = node; n !== null; n = n.prev) {
      n.N++
      if (success === 1 && n.R % 2 === 1) n.Q++
      else if (success === 2 && n.R % 2 === 0) n.Q++
    }
  },
  // 使用蒙特卡洛树搜索最佳着法，LOOPS表示需要进行多少次抽样，LOOPS越大结果越可信
  smartMove(PUZZLE, ROUND = 0, LOOPS = 30) {
    // 建立根节点
    this.root = { P: PUZZLE, prev: null, next: [], Q: 0, N: 0, R: ROUND }
    // 进行 LOOPS 次抽样
    for (var i = 0; i < LOOPS; i++) {
      var node = this.select()
      node = this.expand(node)
      var success = this.simulate(node)
      this.feedback(node, success)
    }
    // 选择最优着法
    var tmp = null, N = 0
    for (n of this.root.next) {
      if (n.N > N) { N = n.N; tmp = n }
    }
    // 避免空指针错误，找不到最佳解法时返回原盘面
    return (tmp === null) ? PUZZLE : tmp.P
  }

}


/*
var puzzle = [
  [0, 0], [0, 8], 
  [1, 1], [1, 7], 
  [2, 0], [2, 8], 
  [3, 1], [3, 7], 
  [4, 0], [4, 8],
]

var puzzle = [
      [2, 8], [4, 0], 
      [2, 6], [0, 8], 
      [1, 5], [4, 8], 
      [3, 5], [1, 7], 
      [1, 3], [4, 6],
]

var ai = new AI()
ai.availPos(puzzle, 5)
ai.success(puzzle, 0)
ai.smartMove(puzzle, 0, 1)
*/


