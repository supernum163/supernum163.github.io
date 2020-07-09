
// 设定全局字体标准大小
var PR = PR = window.devicePixelRatio ? window.devicePixelRatio : 1
var rem = 14 * PR
var html = document.getElementsByTagName("html")[0]
html.style = "font-size: " + rem + "px"
// 记录关键节点
var gameId = 0; gamePerPage = 15, searchResult = [], list = "list"
var recommend = document.querySelector("#recommend > .games")
var gamelist = document.querySelector("#gamelist > .games")
var arrow_left = document.getElementById("arrow-left")
var arrow_right = document.getElementById("arrow-right")
var input = document.getElementById("input")
var search = document.getElementById("search")


// 向 where 中添加游戏介绍卡
function appendGames(where, array, i0, length) {
  length = Math.min(i0 + length, array.length)
  for(var i = i0; i < length; i++) {
    var game = array[i]
    // 获取游戏介绍卡图片
    var img = document.createElement("img")
    img.src = game.pic
    var span = document.createElement("span")
    span.id = game.id
    span.className = "game"
    span.append(img)
    // 获取游戏介绍卡详细信息
    var h3 = document.createElement("h3")
    h3.innerHTML = game.title
    var p = document.createElement("p")
    p.innerHTML = game.desc
    var a = document.createElement("a")
    a.href = game.link
    a.innerHTML = "开始游戏"
    let div = document.createElement("div")
    div.append(h3)
    div.append(p)
    div.append(a)
    /* 获取游戏制作完成时间
    var time = document.createElement("time")
    time.innerHTML = game.releaseDate
    div.append(time)
    */
    span.append(div)
    // 光标进入游戏介绍卡时显示详细信息，移出时显示图片
    span.onmouseenter = function() {div.style.zIndex = 2}
    span.onmouseleave = function() { div.style.zIndex = 0}
    // 将游戏介绍卡放入到上层结构中
    where.append(span)
  }
  return Math.max(length - i0, 0)
}

// 向游戏列表添加游戏介绍卡
function moregame(array, gameId) {
  var length = appendGames(gamelist, array, gameId, gamePerPage)
  var showmore = document.getElementById("showmore")
  if (showmore) showmore.parentNode.removeChild(showmore)
  var div = document.createElement("div")
  div.id = "showmore"
  var hr = document.createElement("hr")
  div.append(hr)
  var p = document.createElement("p")
  p.innerHTML = (gameId < array.length) ? "更多游戏" : "没有更多了"
  p.align="center"
  div.append(p)
  gamelist.parentNode.append(div)
  return length
}

// 搜索时显示推荐列表和搜索结果
function onSearch(text) {
  text = text.replace(" ", "|")
  if (["", "*"].indexOf(text) > -1) {
    list = "list"
    onList()
    return
  }
  list = "search"; searchResult = []
  for (var game of GAMES) {
    if (game.link.match(text) || 
      game.title.match(text) || game.desc.match(text)
    ) searchResult.push(game)
  }
  gamelist.innerHTML = ""
  gameId = moregame(searchResult, 0)
}

// 向下拉动时，显示更多游戏
function onScrollDown() {
  let clientHeight, scrollTop, scrollHeight
  if (document.documentElement.scrollTop !== 0) {
    clientHeight = document.documentElement.clientHeight
    scrollTop = document.documentElement.scrollTop
    scrollHeight = document.documentElement.scrollHeight
  } else if (document.body.scrollTop !== 0) {
    clientHeight = document.body.clientHeight
    scrollTop = document.body.scrollTop
    scrollHeight = document.body.scrollHeight
  } else return
  if (clientHeight + scrollTop >= scrollHeight - 100) {
    gameId += (list === "list" ?
      moregame(GAMES, gameId) : 
      moregame(searchResult, gameId)
    )
  }
}

// 左右移动推荐列表
function recommendMoveLeft() {
  var e = recommend.firstElementChild
  e.parentNode.removeChild(e)
  recommend.append(e)
}
function recommendMoveRight() {
  var e = recommend.lastElementChild
  e.parentNode.removeChild(e)
  recommend.insertBefore(e, recommend.firstElementChild)
}


/* 获取div元素上下左右边界
var t = recommend.offsetTop;
var b = recommend.offsetTop + recommend.offsetHeight;
var l = recommend.offsetLeft;
var r = recommend.offsetLeft + recommend.offsetWidth;
*/

/* 使用搜索框输出debug信息
window.onscroll = function() {
  input.placeholder = window.innerWidth
}
*/


// 页面完全加载时再执行
window.onload = function() {

  // 初始情况，推荐列表展示5个游戏，游戏列表最多展示15个游戏
  appendGames(recommend, GAMES, 0, 5)
  function onList() {
    gamelist.innerHTML = ""
    gameId = moregame(GAMES, 5) + 5
  }
  onList()
  // 提交搜索时显示搜索结果
  search.onclick = function() {onSearch(input.value)}
  input.onkeydown = function(e) {
    if (e.key !== "Enter") return
    onSearch(input.value)
  }
  // 下拉时获取更多游戏
  window.addEventListener('scroll', onScrollDown)

  // 自动移动推荐列表，光标进入推荐列表时则暂停
  recommend.recommendMove = true
  recommend.onmouseenter = function() {recommend.recommendMove = false}
  arrow_left.onmouseenter = function() {recommend.recommendMove = false}
  arrow_right.onmouseenter = function() {recommend.recommendMove = false}
  recommend.onmouseleave = function() {recommend.recommendMove = true}
  arrow_left.onmouseleave = function() {recommend.recommendMove = true}
  arrow_right.onmouseleave = function() {recommend.recommendMove = true}
  // setTimeout(recommendMove, 1000);
  setInterval(function() {
    if(!recommend.recommendMove) return
    recommendMoveLeft()
  }, 1000);
  // 点击左右箭头时推荐列表向左右移动
  arrow_left.onclick = recommendMoveLeft
  arrow_right.onclick = recommendMoveRight

}

