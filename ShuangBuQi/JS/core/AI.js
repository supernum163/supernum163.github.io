
AI = function() {
  this.rank = 6
  this.ctype = 3
}

AI.prototype = {

  init(PUZZLE, CAMP) {
    // 全局匹配时用的多分岔树
    this.idMat = {}
    // 博弈树根结点
    this.root = this.getNode(PUZZLE)
    this.root.step = 0
    this.root.score = this.getScore(puzzle, CAMP)
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
        if (j === 3 && PUZZLE[i][4] === 2 && PUZZLE[i][5] === 0) pos.push([i, 5])
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
  // 移动棋子,camp表示要移动的阵营，0为牛，1为猎人
  move(PUZZLE, CAMP) {
    var puzzles = [], chess = CAMP + 1
    for (var i = 0; i < this.rank; i++) {
      for (var j = 0; j < this.rank; j++) {
        if (PUZZLE[i][j] !== chess) continue
        var pos = this.availPos(PUZZLE, i, j, chess)
        for (var [m, n] of pos) {
          var puzzle = this.clone(PUZZLE)
          puzzle[i][j] = 0
          puzzle[m][n] = chess
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
    var dest1 = [[1, 5], [2, 5], [3, 5], [4, 5]]
    var dest2 = [[5, 1], [5, 2], [5, 3], [5, 4]]
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
    return (CAMP === 0) ? score : -score
  },
  // 检查某个阵营是否成功， 0为挑战继续，1为成功，2为失败，3为和局
  success(PUZZLE, CAMP) {
    var sucess = 3
    // 先手方是否获胜
    for (var m = 1; m < 5; m++) {
      if (PUZZLE[m][5] !== 1) { 
        sucess -= (CAMP === 0) ? 1 : 2 
        break 
      }
    }
    // 后手方是否获胜
    for (var n = 1; n < 5; n++) {
      if (PUZZLE[5][n] !== 2) { 
        sucess -= (CAMP === 0) ? 2 : 1 
        break 
      }
    }
    // 挑战继续
    return sucess
  },
  // 使用广度优先算法搜索答案，LOOPS表示需要考虑的回合数，LOOPS越大越智能
  smartMove(PUZZLE, CAMP, LOOPS, loop0) {
    this.init(PUZZLE, CAMP)
    for (var loop = 0; loop < LOOPS; loop ++) {
      var step = loop + 1, pointer
      this.steps[step] = []
      // 记录是否为AI回合，0、1 为AI走棋，2、3 为玩家走棋
      var round = (loop + loop0) % 4
      var camp = (round < 2) ? CAMP : 1 - CAMP
      // 获得回合内可以得到的所有情况
      for (var node of this.steps[loop]) {
        var success = this.success(node.P, camp)
        if (success > 0) {
          node.score += [0, 100, -100, 0][success]
          node.step = -1
        }
        if (node.step === -1) continue

        var pointer = node
        node.score = ( [0, 1].includes(round) ) ? -Infinity : Infinity

        var puzzles = this.move(node.P, camp)
        for (var puzzle of puzzles) {
          var newNode = this.getNode(puzzle) 
          newNode.score = this.getScore(puzzle, CAMP)
          if ( [0, 1].includes(round) ) {
            node.score = Math.max(node.score, newNode.score)
          } else {
            node.score = Math.min(node.score, newNode.score)
          }
          // a-b 剪枝
          if ( (round === 0 && node.score > pointer.score) ||
            (round === 2 && node.score < pointer.score) 
          ) {
            node.step = -1
            node.children.forEach(e => e.step = -1)
            break
          }

          // 避免走来回步
          if (newNode.step < step) continue
          node.children.push(newNode)
          if (newNode.step !== Infinity) continue
          newNode.step = step
          this.steps[step].push(newNode)
        }
        
        // min-max 剪枝
        if ( [0, 1].includes(round) ) {
          node.children.forEach(e => e.step = (e.score < node.score) ? -1 : node.step + 1 )
        } else {
          node.children.forEach(e => e.step = (e.score > node.score) ? -1 : node.step + 1 )
        }

      }
      var choices = 0
      this.steps[step].forEach(e => choices += (e.step > -1) ? 1 : 0)
      if (choices <= 1) break
    }
console.log(this.steps)
    // 判断最优着棋方案
    if (this.steps[1].length === 0) return PUZZLE
    for (var i = this.steps.length - 2; i >= 0 ; i--) {
      for (var node of this.steps[i]) {
        if (node.step < 0) continue
        if (!node.children.some(e => e.step > -1)) continue
        node.score = ((i + loop0) % 4 < 2)  ? -Infinity : Infinity
        for (var child of node.children) {
          if (child.step < 0) continue
          node.score = ((i + loop0) % 4 < 2)  ? 
            Math.max(node.score, child.score) : 
            Math.min(node.score, child.score)
        }
      }
    }
//  console.log(this.steps)
    pointer = null 
    for (var child of node.children) {
      if (child.step < 0 || child.score < node.score) continue
      if (pointer === null || Math.random() < 0.5) pointer = child
    }
    return pointer.P
  }

}


var puzzle = [
  [ 0, 1, 1, 1, 1, -1],
  [ 2, 0, 0, 0, 0,  0],
  [ 2, 0, 0, 0, 0,  0],
  [ 2, 0, 0, 0, 0,  0],
  [ 2, 0, 0, 0, 0,  0],
  [-1, 0, 0, 0, 0, -1],
]

/*
var ai = new AI()
ai.getScore(puzzle, 0)
ai.getShortPath(puzzle, 1, 0, 1, 5)

ai.smartMove(puzzle, 0, 4, 1)

*/