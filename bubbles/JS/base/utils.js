
const Utils = {

  // 返回 [start, end] 区间段内的随机整数
  random: function (start, end) {
    return parseInt(Math.random() * (end - start + 1)) + start
  },

  // 从 array 数组中随机抽取一个元素
  choose: function (array) {
    return array[parseInt(Math.random() * array.length)]
  },

  // 获取以秒表示的当前时间
  time: function () {
    return parseInt((new Date()).getTime() / 1000)
  },

  // 将整数转化为长度固定的字符串，长度不足时前面补 0
  int2str: function (int, length) {
    if (int < 0) int = -int
    var str = int.toString()
    var n = length - str.length
    str = n > 0 ? Array(n + 1).join("0") + str : str
    return str
  },

}

