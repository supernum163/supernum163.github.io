
// 使用广度优先算法求解华容道
BFS = function() {

}

BFS.prototype = {
  init(PUZZLE) {
    // 全局匹配时用的多分岔树
    this.idMat = []
    var idMat = this.idMat, puzzle = Array(5)
    for (var i = 0; i < 5; i++) {
      puzzle[i] = Array(4)
      for (var j = 0; j < 4; j++){
        puzzle[i][j] = PUZZLE[i][j] % 100
        var idCell = {value: puzzle[i][j], next:[]}
        idMat.push(idCell)
        idMat = idCell.next
      }
    }
    // 宽度搜索时用以保存每移动一步可以获得的艘有盘面
    this.steps = []
    this.steps.push([{P: puzzle, prev: null}])
  },
  // 获取棋子形状 ["空白", "点形", "方形", "横", "竖"]
  getShape(puzzle, i, j) {
    return parseInt(puzzle[i][j] / 10)
  },
  // 获取棋子坐标相对于棋子的位置, ["左上", "右上", "左下", "右下"]
  getPos(puzzle, i, j) {
    return puzzle[i][j] % 10
  },
  // 检查是否成功
  success(puzzle) {
    return (puzzle[4][1] === 22 && puzzle[4][2] === 23) ? 
      true : false
  },
  /*
  // 检查当前棋盘与某棋盘的盘面是否一致
  identity(puzzle1, puzzle2) {
    for (var i = 0; i < 5; i++) {
      for (var j = 0; j < 4; j++){
        if (puzzle1[i][j] !== puzzle2[i][j]) return false
      }
    }
    return true
  },
  // 检查历史步骤中是否有某个盘面
  anyIdentity(puzzle) {
    for (var step of this.steps) {
      for (var node of step) {
        if (this.identity(puzzle, node.P)) return true
      }
    }
    return false
  },
  */
  // 检查历史步骤中是否有某个盘面
  anyIdentity(puzzle) {
    var idMat = this.idMat, identity = true
    for (var i = 0; i < 5; i++) {
      for (var j = 0; j < 4; j++){
        var idCell, cellIdentity = false
        for (idCell of idMat) {
          if (idCell.value === puzzle[i][j]) {
            cellIdentity = true
            break
          }
        }
        if (!cellIdentity) {
          idCell = {value: puzzle[i][j], next:[]}
          idMat.push(idCell)
          identity = false
        }
        idMat = idCell.next
      }
    }
    return identity
  },
  // 克隆盘面
  clone(PUZZLE) {
    var puzzle = Array(5)
    for (var i = 0; i < 5; i++) {
      puzzle[i] = Array(4).fill(0)
      for (var j = 0; j < 4; j++){
        puzzle[i][j] = PUZZLE[i][j]
      }
    }
    return puzzle
  },
  // 移动棋子
  move(PUZZLE) {
    // 先寻找所有空格
    var puzzle = this.clone(PUZZLE)
    var puzzles = [], blanks = []
    for (var i = 0; i < 5; i++) {
      for (var j = 0; j < 4; j++) {
        if (puzzle[i][j] === 0) blanks.push({i: i, j: j})
      }
    }
    // 移动单个空格
    for (var b of blanks) {
      for (var [istep, jstep] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        var i = b.i + istep, j = b.j + jstep
        if (i < 0 || i > 4 || j < 0 || j > 3) continue
        if (puzzle[i][j] === 10) {
          puzzle[b.i][b.j] = puzzle[i][j]
          puzzle[i][j] = 0
        } else if (istep === 0 && this.getShape(puzzle, i, j) === 3) {
          puzzle[b.i][b.j] = puzzle[i][j]
          puzzle[i][j] = puzzle[i][j + jstep]
          puzzle[i][j + jstep] = 0
        } else if (jstep === 0 && this.getShape(puzzle, i, j) === 4) {
          puzzle[b.i][b.j] = puzzle[i][j]
          puzzle[i][j] = puzzle[i + istep][j]
          puzzle[i + istep][j] = 0
        } else continue
        puzzles.push(puzzle)
        puzzle = this.clone(PUZZLE)
      }
    }
    // 上下移动两个横排空格
    if (blanks[0].i === blanks[1].i && Math.abs(blanks[0].j - blanks[1].j) === 1) {
      var b = { i: blanks[0].i, j: Math.min(blanks[0].j, blanks[1].j) }
      for (var istep of [-1, 1]) {
        var i = b.i + istep, j = b.j
        if (i < 0 || i > 4 || j < 0 || j > 3) continue
        if (puzzle[i][j] === 30) {
          puzzle[b.i][b.j] = puzzle[i][j]
          puzzle[b.i][b.j + 1] = puzzle[i][j + 1]
          puzzle[i][j] = 0
          puzzle[i][j + 1] = 0
        } else if (this.getShape(puzzle, i, j) === 2 && 
          this.getShape(puzzle, i, j + 1) === 2
        ) {
          puzzle[b.i][b.j] = puzzle[i][j]
          puzzle[b.i][b.j + 1] = puzzle[i][j + 1]
          puzzle[i][j] = puzzle[i + istep][j]
          puzzle[i][j + 1] = puzzle[i + istep][j + 1]
          puzzle[i + istep][j] = 0
          puzzle[i + istep][j + 1] = 0
        } else continue
        puzzles.push(puzzle)
        puzzle = this.clone(PUZZLE)
      }
    }
    // 移动两个竖排空格
    if (blanks[0].j === blanks[1].j && Math.abs(blanks[0].i - blanks[1].i) === 1) {
      var b = { i: Math.min(blanks[0].i, blanks[1].i), j: blanks[0].j }
      for (var jstep of [-1, 1]) {
        var i = b.i, j = b.j + jstep
        if (i < 0 || i > 4 || j < 0 || j > 3) continue
        if (puzzle[i][j] === 40) {
          puzzle[b.i][b.j] = puzzle[i][j]
          puzzle[b.i + 1][b.j] = puzzle[i + 1][j]
          puzzle[i][j] = 0
          puzzle[i + 1][j] = 0
        } else if (this.getShape(puzzle, i, j) === 2 && 
          this.getShape(puzzle, i + 1, j)  === 2
        ) {
          puzzle[b.i][b.j] = puzzle[i][j]
          puzzle[b.i + 1][b.j] = puzzle[i + 1][j]
          puzzle[i][j] = puzzle[i][j + jstep]
          puzzle[i + 1][j] = puzzle[i + 1][j + jstep]
          puzzle[i][j + jstep] = 0
          puzzle[i + 1][j + jstep] = 0
        } else continue
        puzzles.push(puzzle)
        puzzle = this.clone(PUZZLE)
      }
    }
    // 返回移动完成后生成的所有子盘面
    return puzzles
  },  
  // 使用广度优先算法搜索答案
  solve(PUZZLE) {
    this.init(PUZZLE)
    // 进入广度优先搜索
    for (var step = 0; step < 1e3; step++) {
      this.steps[step + 1] = []
      for (var node of this.steps[step]) {
        var puzzles = this.move(node.P)
        for (var puzzle of puzzles) {
          if (this.anyIdentity(puzzle)) continue
          var newNode = {P: puzzle, prev: node}
          this.steps[step + 1].push(newNode)
          if (this.success(puzzle)) {
            return true
            // return this.getAnswer(newNode)
          }
        }
      }
      if (this.steps[step + 1].length === 0) return false
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

// 百位数表示棋子名称，十位数表示棋子形状，个位数表示位置
// ["空白"， "兵", "曹操", "关羽", "张飞", "赵云", "马超", "黄忠"]
// ["空白", "点形", "方形", "横", "竖"]
// ["左上", "右上", "左下", "右下"]
var puzzle = [
  [440, 220, 221, 540],
  [442, 222, 223, 542],
  [640, 330, 331, 740],
  [642, 110, 110, 742],
  [110,   0,   0, 110]
]

var bfs = new BFS()
bfs.solve(puzzle)
