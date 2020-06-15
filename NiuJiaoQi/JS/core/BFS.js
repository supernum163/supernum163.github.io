
BFS = function() {
 
}

BFS.prototype = {

  init(PUZZLE, CAMP) {
    // 宽度搜索时用以保存每移动一步可以获得的艘有盘面
    var score = [0, 1, -1] [ this.success(PUZZLE, CAMP) ]
    this.root = { P: PUZZLE, children: [], score: score }
    this.steps = [[ this.root ]]
    // 全局匹配时用的多分岔树
    this.idMat = Array(10)
    var pointer = this.idMat
    for (var i = 0; i < 3; i++) {
      var n = PUZZLE[i]
      pointer[n] = (i === 2) ? this.root : Array(10)
      pointer = pointer[n]
    }
  },
  // 检查历史步骤中是否有某个盘面
  getUniqueNode(NODE) {
    var pointer = this.idMat, unique = false
    for (var i = 0; i < 3; i++) {
      var n = NODE.P[i]
      if (pointer[n] === undefined) {
        pointer[n] = (i === 2) ? NODE : Array(10)
        unique = true
      } 
      pointer = pointer[n]
    }
    return { node: pointer, unique: unique }
  },
  // 克隆盘面
  clone(PUZZLE) {
    var puzzle = Array(3)
    for (var i = 0; i < 3; i++) {
      puzzle[i] = PUZZLE[i]
    }
    return puzzle
  }, 
  availPos(PUZZLE, CHESSID) {
    var pos = [], i = PUZZLE[CHESSID]
    for (var j of [-2, -1, 1, 2]) {
      var p = i + j
      if (p < 0 || p > 9 || PUZZLE.some(e => e === p)) continue
      if (CHESSID > 0) {
        if (j > 1) continue
        if (j > 0 && i % 2 === 1) continue
      }
      pos.push(p)
    }
    return pos
  },
  // 移动棋子,camp表示要移动的阵营，0为牛，1为猎人
  move(PUZZLE, CAMP) {
    var puzzles = [], isteps, jsteps
    if (CAMP === 0) {
      isteps = [0]; jsteps = [-2, -1, 1, 2]
    } else {
      isteps = [1, 2]; jsteps = [-2, -1, 1]
    }
    for (var i of isteps) {
      for (var j of jsteps) {
        var p = PUZZLE[i] + j
        if (p < 0 || p > 9 || PUZZLE.some(e => e === p)) continue
        if (j > 0 && CAMP === 1 && PUZZLE[i] % 2 === 1) continue
        var puzzle = this.clone(PUZZLE)
        puzzle[i] = p
        puzzles.push(puzzle)
      }
    }
    return puzzles
  },
  // 检查某个阵营是否成功， 0为挑战继续，1为成功，2为失败
  success(PUZZLE, CAMP) {
    // 牛方获胜
    if (PUZZLE[0] === 8 || PUZZLE[0] === 9 || 
      (PUZZLE[0] > PUZZLE[1] && PUZZLE[0] > PUZZLE[2]) || 
      PUZZLE[1] + PUZZLE[2] < 3
    ) return (CAMP === 0) ? 1 : 2
    // 猎人方获胜
    else if (PUZZLE[0] === 0 && PUZZLE[1] + PUZZLE[2] === 3) 
      return (CAMP === 0) ? 2 : 1
    // 挑战继续
    return 0
  },
  // 使用广度优先算法搜索答案，LOOPS表示需要考虑的回合数，LOOPS越大越智能，20回合左右即可考虑到全部局面
  smartMove(PUZZLE, CAMP, LOOPS) {
    this.init(PUZZLE, CAMP)
    // 获得 LOOPS 回合内可以得到的所有情况
    for (var loop = 0; loop < LOOPS; loop ++) {
      this.steps[loop + 1] = []
      for (var node of this.steps[loop]) {
        if (node.score !== 0) continue
        var puzzles = this.move(node.P, (loop + CAMP) % 2)
        for (var puzzle of puzzles) {
          var newNode = { P: puzzle, children: [], step: loop + 1 }
          var result = this.getUniqueNode(newNode)
          if (result.node.step < loop + 1) continue
          node.children.push(result.node)
          if (!result.unique) continue
          result.node.score = [0, 1, -1] [ this.success(puzzle, CAMP) ]
          this.steps[loop + 1].push(result.node)
        }
      }
      if (this.steps[loop + 1].length === 0) break
    }
    // 判断最优着棋方案
    if (this.steps[1].length === 0) return null
    for (var i = this.steps.length - 2; i > 0 ; i--) {
      for (var node of this.steps[i]) {
        if (node.children.length === 0) continue
        node.score = node.children[0].score
        for (var child of node.children) {
          node.score = (i % 2 === 1) ? 
          Math.min(node.score, child.score) : 
          Math.max(node.score, child.score)
        }
      }
    }
    // console.log(this.steps)
    var pointer = this.steps[1][0]
    for (var node of this.steps[1]) {
      if (node.score > pointer.score) pointer = node
      else if (node.score < pointer.score) continue
      else if (Math.random() < 0.5) pointer = node
    }
    return pointer.P
  }

}

/*
var puzzle = [ 0, 8, 9 ]

var bfs = new BFS()
bfs.smartMove(puzzle, 0, 16)
*/
