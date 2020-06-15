
DLX = function() {
  // this.kMaxNodes = 1 + 81 * 4 + 9 * 9 * 9 * 4
  this.kMaxCols = 324
  this.kRow = 81
  this.kCol = 162
  this.kBox = 243
}

DLX.prototype = {
  init: function(puzzle, task, requiredAnswers) {
    this.puzzle = puzzle                    // 数独谜题
    this.task = task                        // 任务类型
    this.requiredAnswers = requiredAnswers  // 最多需要求几个解
    this.nodes = []                     // 记录所有节点，避免节点被回收
    this.cols = Array(this.kMaxCols)    // 记录所有列头
    this.root = this.newNode(-1)        // 记录根结点
    this.root.ncol = 0                  // 根结点记录精确覆盖矩阵有多少列
    this.root.nrow = 0                  // 根结点记录精确覆盖矩阵有多少行
    this.steps = []                     // 数独谜底：每一步需要填入的数字
    this.stepsList = []                 // 数独所有谜底的集合
    this.getLinks()
    this.dance()
  },
  // 新生城一个四向链接节点
  newNode: function(colID) {
    var node = {}
    node.up = node
    node.down = node
    node.left = node
    node.right = node
    node.col = node
    node.colID = colID
    return  node
  },
  // 将新节点 node2 放在节点 node1 的左边
  putLeft: function(node1, node2) {
    node2.left = node1.left
    node2.right = node1
    node1.left.right = node2
    node1.left = node2
  },
  // 将节点 node 放在 节点 col 的上方
  putUp: function(col, node) {
    node.up = col.up
    node.down = col
    col.up.down = node
    col.up = node
    col.size ++
    node.col = col
  },
  // 新建一个精确覆盖矩阵中的列头
  newCol: function(colID) {
    var col = this.newNode(colID)
    this.cols[colID] = col
    col.size = 0
    this.putLeft(this.root, col)
    this.nodes.push(col)
  },
  // 新建一个精确覆盖矩阵中的格子
  newCell: function(colID) {
    var cell = this.newNode(colID)
    cell.col = this.cols[colID]
    this.putUp(cell.col, cell)
    this.nodes.push(cell)
    return cell
  },
  // 删除、恢复精确覆盖矩阵中的某一列
  cover: function(col) {
    col.right.left = col.left
    col.left.right = col.right
    // this.root.ncol --
    for (var r = col.down; r !== col; r = r.down){
      for (var c = r.right; c !== r; c = c.right) { 
        c.down.up = c.up
        c.up.down = c.down
        c.col.size --
      }
    }
  },
  uncover: function(col) {
    col.right.left = col
    col.left.right = col
    // this.root.ncol ++
    for (var r = col.up; r !== col; r = r.up) {
      for (var c = r.left; c !== r; c = c.left) {
        c.down.up = c
        c.up.down = c
        c.col.size ++
      }
    }
  },
  // 将数独谜题转化为精确覆盖矩阵
  getLinks: function() {
    // 先寻找已填入的数字
    for (var i = 0; i < 9; i++) {
      for (var j = 0; j < 9; j++) {
        if (this.puzzle[i][j] === 0) continue
        var num = this.puzzle[i][j] - 1
        var b = parseInt(i / 3) * 3 + parseInt(j / 3)
        this.cols[i * 9 + j] = null
        this.cols[this.kRow + i * 9 + num] = null
        this.cols[this.kCol + j * 9 + num] = null
        this.cols[this.kBox + b * 9 + num] = null
      }
    }
    for (var colID = 0; colID < this.kMaxCols; colID ++) {
      if (this.cols[colID] === undefined) {
        this.newCol(colID)
        this.root.ncol ++
      }
    }
    // 再寻找空格及可供填入的数字
    for (var i = 0; i < 9; i++) {
      for (var j = 0; j < 9; j++) {
        if (this.puzzle[i][j] !== 0) continue
        // 0-8分别代表需要填入的数字1-9
        var nums = [0, 1, 2, 3, 4, 5, 6, 7, 8]
        if (this.task === "generate") {
          for (var k = 9; k > 0; k--) {
            var n = parseInt(Math.random() * k)
            var num = nums.splice(9 - k + n, 1)[0]
            nums.unshift(num)
          }
        } 
        for (var num of nums) {
          var b = parseInt(i / 3) * 3 + parseInt(j / 3)
          var IcolID = this.kRow + i * 9 + num
          var JcolID = this.kCol + j * 9 + num
          var BcolID = this.kBox + b * 9 + num
          if (this.cols[IcolID] === null ||
            this.cols[JcolID] === null || this.cols[BcolID] === null
          ) continue 
          var cell = this.newCell(i * 9 + j)
          this.putLeft(cell, this.newCell(IcolID))
          this.putLeft(cell, this.newCell(JcolID))
          this.putLeft(cell, this.newCell(BcolID))
          this.root.nrow ++
        }
      }
    }
  },
  // 寻找可能性最少的一列
  getMinCol: function() {
    var minCol = this.root.right
    var minSize = minCol.size
    for (var col = minCol.right; col !== this.root; col = col.right) {
      if (minSize <= 1) break
      if (minSize > col.size) {
        minCol = col
        minSize = col.size
      }
    }
    return minCol
  },
  // 寻找数独的前n个解
  dance: function() {
    // 运行到这里表示已经找到了一个数独谜底
    if (this.root.right === this.root) {
      this.stepsList.push(this.steps)
      this.steps = []
      return true
    }
    // 根据不同任务类型寻找需要优先处理的列
    var col
    if (this.task === "solve") col = this.getMinCol()
    else col = this.root.right
    // 递归寻找答案
    this.cover(col)
    for (var r = col.down; r !== col; r = r.down) { 
      this.steps.push(r)
      for (var c = r.right; c !== r; c = c.right) { 
        this.cover(c.col)
      }
      if (this.dance() && this.stepsList.length >= this.requiredAnswers) { 
        return true
      }
      this.steps.pop()
      for (var c = r.left; c !== r; c = c.left) {
        this.uncover(c.col)
      }
    }
    this.uncover(col)
    return false
  },
  // 获取数独的第一个谜底
  getAnswer: function() {
    var answer = []
    if (this.stepsList < 1) return answer
    // 先拷贝谜题
    for (var i = 0; i < 9; i++) {
      answer[i] = Array(9)
      for (var j = 0; j < 9; j++) {
        answer[i][j] = this.puzzle[i][j]
      }
    }
    // 再填写答案
    for (var step of this.stepsList[0]) {
      var pos = -1; num = -1
      while (pos === -1 || num === -1) {
        if (step.colID < this.kRow)  pos = step.colID
        else num = step.colID % 9 + 1
        step = step.right
      }
      var i = parseInt(pos / 9); j = pos % 9
      answer[i][j] = num
    }
    return answer
  },
  // 求数独谜底
  solve: function(puzzle) {
    this.init(puzzle, "solve", 1)
    return this.getAnswer()
  },
  // 检查数独是否有且只有一个谜底
  hasOnlyAnswer: function(puzzle) {
    this.init(puzzle, "hasOnlyAnswer", 2)
    if (this.stepsList.length !== 1) return false
    return true
  },
  // 生成数独谜底
  generate: function(difficulty = 0) {
    var minKeep = [40, 30, 17][difficulty]
    var minComplex = [4e4, 5e4, 6e4][difficulty]
    var puzzle = []
    for (var i = 0; i < 9; i++) puzzle[i] = Array(9).fill(0)
    this.init(puzzle, "generate", 1)
    var answer = this.getAnswer(), pos = [], keep = 81
    for (var i = 0; i < 9; i++) {
      for (var j = 0; j < 9; j++) {
        pos.push([i, j])
        puzzle[i][j] = answer[i][j]
      }
    }
    while (pos.length > 0 && keep > minKeep) {
      var n = parseInt(Math.random() * pos.length)
      var [i, j] = pos[n]
      puzzle[i][j] = 0
      pos.splice(n, 1)
      keep --
      if (keep > 72) continue
      if (!this.hasOnlyAnswer(puzzle)) {
        puzzle[i][j] = answer[i][j]
        keep ++
        continue
      }
      if (this.root.nrow * this.root.ncol > minComplex) break
    }
    return {puzzle: puzzle, answer: answer}
  },
}


/*

puzzle = [
  [8, 0, 0,  0, 0, 0,  0, 0, 0],
  [0, 0, 3,  6, 0, 0,  0, 0, 0],
  [0, 7, 0,  0, 9, 0,  2, 0, 0],

  [0, 5, 0,  0, 0, 7,  0, 0, 0],
  [0, 0, 0,  0, 4, 5,  7, 0, 0],
  [0, 0, 0,  1, 0, 0,  0, 3, 0],

  [0, 0, 1,  0, 0, 0,  0, 6, 8],
  [0, 0, 8,  5, 0, 0,  0, 1, 0],
  [0, 9, 0,  0, 0, 0,  4, 0, 0],
]

dlx = new DLX()

dlx.solve(puzzle)
dlx.hasOnlyAnswer(puzzle)
dlx.getComplex(puzzle)
dlx.generate(difficulty = 2)

*/

