
const Utils = {
  // 返回 [start, end] 区间段内的随机整数
  random: function(start, end) {
    return parseInt(Math.random() * (end - start + 1)) + start
  },
  
  // 从 array 数组中随机抽取一个元素
  choose: function(array) {
    return array[parseInt(Math.random() * array.length)]
  },
  
}
  