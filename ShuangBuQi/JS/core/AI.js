
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
  // 由盘面生成博弈树结点，step表示盘面位于现有博弈树的第几层，没有则为Infinity
  getNode(PUZZLE) {
    var id = 0
    for (var i = 0; i < this.rank; i++) {
      for (var j = 0; j < this.rank; j++) {
        if (PUZZLE[i][j] === 0) continue
        id = id * 100 + (i* 6 + j) * PUZZLE[i][j]
      }
    }
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
  // 使用广度搜索，寻找从 [i, j] 移动到 [x, y] 最短需要多少步骤
  getShortPath(PUZZLE, i, j, x, y) {
    var chess = PUZZLE[i][j], maxLoop = 3 * this.rank - 5
    var steps = [[[i, j]]], idMat = [i * 6 + j]
    for (var loop = 0; loop < maxLoop; loop++) {
      steps[loop + 1] = []
      for (var s of steps[loop]) {
        if (s[0] === x && s[1] === y) return steps.length - 2
        for (var [istep, jstep] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          var m = s[0] + istep, n = s[1] + jstep
          if (m < 0 || m > this.rank - 1 || n < 0 || n > this.rank - 1) continue
          if (PUZZLE[m][n] === chess % 2 + 1) {
            if (chess === 1 && s[1] === 3 && n === 4) n = 5
            else if (chess === 2 && s[0] === 3 && m === 4) m = 5
            else continue
          }
          var id = m * 6 + n
          if ([5, 30, 35].includes(id)) continue
          if (idMat.includes(id)) continue
          idMat.push(id)
          steps[loop + 1].push([m, n])
        }
      }
      if (steps[loop + 1].length === 0) return maxLoop
    }
    return maxLoop
  },
  // 对当前局势的评价函数
  getScore(PUZZLE, CAMP) {
    var score = 0, sign, dest, minPath, minId
    var dest1 = [[5, 1], [5, 2], [5, 3], [5, 4]]
    var dest2 = [[1, 5], [2, 5], [3, 5], [4, 5]]
    for (var i = 0; i < this.rank; i++) {
      for (var j = 0; j < this.rank; j++) {
        if (PUZZLE[i][j] === 1) { dest = dest1; sign = -1 }
        else if (PUZZLE[i][j] === 2) { dest = dest2; sign = 1 }
        else continue
        minPath = Infinity
        for (d in dest) {
          var path = this.getShortPath(PUZZLE, i, j, dest[d][0], dest[d][1])
          if (path < minPath) { minPath = path; minId = d }
        }
        dest.splice(minId, 1)
        score += minPath * sign
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
  // 使用广度优先算法搜索答案，LOOPS表示需要考虑的回合数，LOOPS越大越智能
  smartMove(PUZZLE, CAMP, LOOPS, ROUND = 4) {
    this.init(PUZZLE, CAMP)
    for (var loop = 0; loop < LOOPS; loop ++) {
      var step = loop + 1
      this.steps[step] = []
      // ROUND记录是否为AI回合，玩家走棋1、2，AI走棋3、4
      var AImove = [0, 3].includes((loop + ROUND) % 4)
      var camp = AImove  ? CAMP : CAMP % 2 + 1
      // 获得回合内可以得到的所有情况
      for (var node of this.steps[loop]) {
        var success = this.success(node.P, camp)
        if (success > 0) {
          node.score += [0, 100, -100, 0][success]
          node.step = -1
        }
        if (node.step === -1) continue
        node.score = AImove ? -Infinity : Infinity
        var puzzles = this.move(node.P, camp)
        for (var puzzle of puzzles) {
          var newNode = this.getNode(puzzle) 
          newNode.score = this.getScore(puzzle, CAMP)
          // 避免走来回步
          if (newNode.step !== Infinity) continue
          node.children.push(newNode)
          newNode.step = step
          this.steps[step].push(newNode)
          // min-max 方法更新父节点得分
          if (AImove) {
            node.score = Math.max(node.score, newNode.score)
          } else {
            node.score = Math.min(node.score, newNode.score)
          }
        }
        // min-max 剪枝
        if (AImove) {
          node.children.forEach(e => e.step = (e.score < node.score) ? -1 : node.step + 1 )
        } else {
          node.children.forEach(e => e.step = (e.score > node.score) ? -1 : node.step + 1 )
        }
      }
      // 查询是否可以继续展开
      var choices = 0
      this.steps[step].forEach(e => choices += (e.step > -1) ? 1 : 0)
      if (choices <= 1) break
    }
// console.log(this.steps)
    // 更新搜索范围内所有节点的得分
    if (this.steps[1].length === 0) return PUZZLE
    for (var i = this.steps.length - 2; i >= 0 ; i--) {
      for (var node of this.steps[i]) {
        if (node.step < 0) continue
        if (!node.children.some(e => e.step > -1)) continue
        var AImove = [0, 3].includes((i + ROUND) % 4)
        node.score = AImove ? -Infinity : Infinity
        for (var child of node.children) {
          if (child.step < 0) continue
          node.score = AImove ? 
            Math.max(node.score, child.score) : 
            Math.min(node.score, child.score)
        }
      }
    }
//  console.log(this.steps)
    // 判断最优着棋方案
    var pointer = this.root.children[0]
    for (var child of this.root.children) {
      if (child.step < 0 || child.score < pointer.score) continue
      if (child.score > pointer.score) pointer = child
      else if (child.score === pointer.score && Math.random() < 0.5) pointer = child
    }
    if (pointer === null) return this.move(PUZZLE, CAMP)[0]
    return pointer.P
  }

}


/*
var puzzle = [
  [ 0, 1, 1, 1, 1, -1],
  [ 2, 0, 0, 0, 0,  2],
  [ 2, 0, 0, 0, 0,  2],
  [ 2, 0, 1, 0, 0,  2],
  [ 2, 0, 0, 0, 0,  2],
  [-1, 0, 1, 1, 1, -1],
]

var ai = new AI()
ai.success(puzzle, 1)

ai.smartMove(puzzle, 1, 4, 4)

ai.getScore(puzzle, 0)
ai.getShortPath(puzzle, 1, 0, 1, 5)


*/