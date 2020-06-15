#include <math.h>
#include <vector>
#include <typeinfo>
#include <iostream>
using namespace std;


template <class T>
int length (T& arr) {
	return sizeof(arr) / sizeof(arr[0]);
}


struct Pos {
  int i;
  int j;
};

typedef vector<vector<int>> Puzzle;
struct Node {
  Puzzle P;
  Node* prev;
};





class BFS {

  private:
  vector<vector<Node>> steps;

  // 获取棋子形状 ["空白", "点形", "方形", "横", "竖"]
  int getShape(Puzzle puzzle, int i, int j) {
    return puzzle[i][j] / 10;
  };
  // 获取棋子坐标相对于棋子的位置, ["左上", "右上", "左下", "右下"]
  int getPos(Puzzle puzzle, int i, int j) {
    return puzzle[i][j] % 10;
  };
  // 检查是否成功
  bool success(Puzzle puzzle) {
    return (puzzle[4][1] == 22 && puzzle[4][2] == 23) ? 
      true : false;
  };
  // 检查当前棋盘与某棋盘的盘面是否一致
  bool identity(Puzzle puzzle1, Puzzle puzzle2) {
    for (int i = 0; i < 5; i++) {
      for (int j = 0; j < 4; j++){
        if (puzzle1[i][j] != puzzle2[i][j]) return false;
      };
    };
    return true;
  };
  // 检查历史步骤中是否有某个盘面
  bool anyIdentity(Puzzle puzzle) {
    for (int step = 0; step < steps.size(); step++) {
      for (int s = 0; s < steps[step].size(); s++) {
        if (identity(puzzle, steps[step][s].P)) return true;
      };
    };
    return false;
  };  
  

  public:

  // 克隆盘面
  Node clone(Node* node1) {
    Node node2; Puzzle puzzle;
    for (int i = 0; i < 5; i++) {
      vector<int> row;
      for (int j = 0; j < 4; j++){
        row.push_back(node1->P[i][j]);
      };
      puzzle.push_back(row);
    };
    node2.P = puzzle;
    node2.prev = node1;
    return node2;
  };

  // 移动棋子
  vector<Node> move(Node* node1) {
    // 先寻找所有空格
    vector<Node> nodes;
    Node node2 = clone(node1);
    vector<Pos> blanks;
    for (int i = 0; i < 5; i++) {
      for (int j = 0; j < 4; j++) {
        if (node1->P[i][j] != 0) continue;
        Pos b = {i: i, j: j};
        blanks.push_back(b);
      }
    }
    // 移动单个空格
    int direct[4][2] = {{-1, 0}, {1, 0}, {0, -1}, {0, 1}};
    for(int bid = 0; bid < 2; bid++) {
      Pos b = blanks[bid];
      for(int d = 0; d < 4; d++) {
        int istep = direct[d][0], jstep = direct[d][1];
        int i = b.i + istep, j = b.j + jstep;
        if (i < 0 || i > 4 || j < 0 || j > 3) continue;
        if (node2.P[i][j] == 10) {
          node2.P[b.i][b.j] = node2.P[i][j];
          node2.P[i][j] = 0;
        } else if (istep == 0 && getShape(node2.P, i, j) == 3) {
          node2.P[b.i][b.j] = node2.P[i][j];
          node2.P[i][j] = node2.P[i][j + jstep];
          node2.P[i][j + jstep] = 0;
        } else if (jstep == 0 && getShape(node2.P, i, j) == 4) {
          node2.P[b.i][b.j] = node2.P[i][j];
          node2.P[i][j] = node2.P[i + istep][j];
          node2.P[i + istep][j] = 0;
        } else continue;
        nodes.push_back(node2);
        node2 = clone(node1);
      }
    }
    // 上下移动两个横排空格
    if (blanks[0].i == blanks[1].i && abs(blanks[0].j - blanks[1].j) == 1) {
      Pos b = { i: blanks[0].i, j: min(blanks[0].j, blanks[1].j) };
      for (int istep = -1; istep < 2; istep+= 2) {
        int i = b.i + istep, j = b.j;
        if (i < 0 || i > 4 || j < 0 || j > 3) continue;
        if (node2.P[i][j] == 30) {
          node2.P[b.i][b.j] = node2.P[i][j];
          node2.P[b.i][b.j + 1] = node2.P[i][j + 1];
          node2.P[i][j] = 0;
          node2.P[i][j + 1] = 0;
        } else if (getShape(node2.P, i, j) == 2 && 
          getShape(node2.P, i, j + 1) == 2
        ) {
          node2.P[b.i][b.j] = node2.P[i][j];
          node2.P[b.i][b.j + 1] = node2.P[i][j + 1];
          node2.P[i][j] = node2.P[i + istep][j];
          node2.P[i][j + 1] = node2.P[i + istep][j + 1];
          node2.P[i + istep][j] = 0;
          node2.P[i + istep][j + 1] = 0;
        } else continue;
        nodes.push_back(node2);
        node2 = clone(node1);
      }
    }
    // 移动两个竖排空格
    if (blanks[0].j == blanks[1].j && abs(blanks[0].i - blanks[1].i) == 1) {
      Pos b = { i: min(blanks[0].i, blanks[1].i), j: blanks[0].j };
      for (int jstep = -1; jstep < 2; jstep+= 2) {
        int i = b.i, j = b.j + jstep;
        if (i < 0 || i > 4 || j < 0 || j > 3) continue;
        if (node2.P[i][j] == 40) {
          node2.P[b.i][b.j] = node2.P[i][j];
          node2.P[b.i + 1][b.j] = node2.P[i + 1][j];
          node2.P[i][j] = 0;
          node2.P[i + 1][j] = 0;
        } else if (getShape(node2.P, i, j) == 2 && 
          getShape(node2.P, i + 1, j)  == 2
        ) {
          node2.P[b.i][b.j] = node2.P[i][j];
          node2.P[b.i + 1][b.j] = node2.P[i + 1][j];

          node2.P[i][j] = node2.P[i][j + jstep];
          node2.P[i + 1][j] = node2.P[i + 1][j + jstep];
          node2.P[i][j + jstep] = 0;
          node2.P[i + 1][j + jstep] = 0;
        } else continue;
        nodes.push_back(node2);
        node2 = clone(node1);
      }
    }
    // 返回移动完成后生成的所有子盘面
    return nodes;
  };



  bool solve(Puzzle puzzle) {
    Node root; 
    for (int i = 0; i < 5; i++) {
      vector<int> row;
      for (int j = 0; j < 4; j++){
        row.push_back(puzzle[i][j] % 100);
      };
      root.P.push_back(row);
    };
    vector<Node> step;
    step.push_back(root);
    steps.push_back(step);
    // 进入广度优先搜索
    for (int loop = 0; loop < 1e3; loop++) {
// cout << "1、loop:" << loop << endl;
      vector<Node> step;
      steps.push_back(step);
      for (int s = 0; s < steps[loop].size(); s++) {
        Node node1 = steps[loop][s];
        vector<Node> nodes = move(&node1);
        for (int n = 0; n < nodes.size(); n++) {
          Node node2 = nodes[n];
/*
clock_t start = clock(); 
clock_t finish = clock();
double duration = (double)(finish - start) / CLOCKS_PER_SEC;
if (s == 0) cout << duration << '\t';
*/
          if (anyIdentity(node2.P)) continue;
          steps[loop + 1].push_back(node2);
          if (success(node2.P)) {
            // while (node2.prev != &root) node2 = *node2.prev;
            return true;
          };
        };
      };
// cout << endl << "2、step size:" << steps[loop + 1].size() << endl;
      if (steps[loop + 1].size() == 0) return false;
    };
    return false;
  };

  void print (Node node) {
    for (int i = 0 ; i < 5; i++) {
      for (int j = 0 ; j < 4; j++) {
        cout << node.P[i][j] << '\t';
      };
      cout << endl;
    };
    cout << "----------" << endl;
  };

};



int main() {
  Puzzle puzzle = {
    {440, 220, 221, 540},
    {442, 222, 223, 542},
    {640, 330, 331, 740},
    {642, 110, 110, 742},
    {110,   0,   0, 110}
  };

  BFS bfs;
  bfs.solve(puzzle);
  // cout << "solved: " << bfs.solve(puzzle) << endl;

};


