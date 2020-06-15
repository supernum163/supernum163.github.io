
BFS = function() {
 
}

BFS.prototype = {
  init(puzzle) {
    // 获取拼图游戏的行列数
    this.i = puzzle.length
    this.j = puzzle[0].length
    this.n = this.i * this.j
    this.blankId = this.n - 1
    // 全局匹配时用的多分岔树
    this.idMat = Array(this.n)
    var idMat = this.idMat
    for (var i = 0; i < this.i; i++) {
      for (var j = 0; j < this.j; j++){
        var p = puzzle[i][j]
        var n = (p === null) ? this.blankId : p.i * this.i + p.j
        puzzle[i][j] = n
        idMat[n] = Array(this.n)
        idMat = idMat[n]
      }
    }
    // 宽度搜索时用以保存每移动一步可以获得的艘有盘面
    this.steps = []
    this.steps.push([{P: puzzle, prev: null}])
  },
  // 检查历史步骤中是否有某个盘面
  anyIdentity(puzzle) {
    var idMat = this.idMat, identity = true
    for (var i = 0; i < this.i; i++) {
      for (var j = 0; j < this.j; j++){
        var n = puzzle[i][j]
        if (idMat[n] === undefined) {
          idMat[n] = Array(this.n)
          identity = false
        } 
        idMat = idMat[n]
      }
    }
    return identity
  },
  // 获取空格所在位置
  getBlank(puzzle) {
    for (var i = 0; i < this.i; i++) {
      for (var j = 0; j < this.j; j++) {
        if (puzzle[i][j] === this.blankId) return [i, j]
      }
    }
    return []
  },
  // 克隆盘面
  clone(puzzle) {
    var p = Array(this.i)
    for (var i = 0; i < this.i; i++) {
      p[i] = Array(this.j)
      for (var j = 0; j < this.j; j++) {
        p[i][j] = puzzle[i][j]
      }
    }
    return p
  },  
  // 移动棋子
  move(puzzle) {
    var [i, j] = this.getBlank(puzzle), puzzles = []
    for (var [istep, jstep] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      var m = i + istep, n = j + jstep
      if (m < 0 || m >= this.i || n < 0 || n >= this.j) continue
      var p = this.clone(puzzle)
      p[i][j] =  p[m][n] 
      p[m][n] = this.blankId
      puzzles.push(p)
    }
    return puzzles
  },
  // 检查是否成功
  success(puzzle) {
    for (var i = 0; i < this.i; i++) {
      for (var j = 0; j < this.j; j++){
        if (puzzle[i][j] !== i * this.i + j) return false
      }
    }
    return true
  },
  // 使用广度优先算法搜索答案
  solve(puzzle) {
    this.init(puzzle)
    for (var loop = 0; loop < 1e3; loop ++) {
      this.steps[loop + 1] = []
      for (var node of this.steps[loop]) {
        var puzzles = this.move(node.P)
        for (var puzzle of puzzles) {
          if (this.anyIdentity(puzzle)) continue
          var newNode = {P: puzzle, prev: node}
          this.steps[loop + 1].push(newNode)
          if (this.success(puzzle)) {
            // return true
            return this.getAnswer(newNode)
          }
        }
      }
      if (this.steps[loop + 1].length === 0) return false
    }
    return false
  },  
  // 获取正确解法下的每一步盘面
  getAnswer(newNode) {
    var answer = []
    while (newNode !== null) {
      answer.unshift(newNode.P)
      newNode = newNode.prev
    }
    return answer
  }

}

var puzzle = [
  [ {i: 0, j: 0}, {i: 0, j: 1}, {i: 0, j: 2} ],
  [ {i: 1, j: 0}, {i: 1, j: 1}, {i: 1, j: 2} ],
  [ {i: 2, j: 1}, {i: 2, j: 0}, null ],
]

var puzzle = [
  [ {i: 1, j: 2}, {i: 0, j: 1}, null ],
  [ {i: 0, j: 0}, {i: 1, j: 0}, {i: 0, j: 2} ],
  [ {i: 2, j: 0}, {i: 1, j: 1}, {i: 2, j: 1} ],
]

var bfs = new BFS()
bfs.solve(puzzle)

