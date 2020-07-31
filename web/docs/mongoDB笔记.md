

## 数据类型

# 常量
undefined null Infinity NAN

# 基础类型
Boolean() Integer() Number() String() Array() Object()

# 默认ID，包含日期时间
ObjectId() MinKey() MaxKey()

# 日期时间
Date() ISODate() Timestamp()


## 操作库
show dbs		# 列举库
use dbName		# 使用库
db.dropDatabase()	# 删除库


# 列举集合
show tables
show collections

# 使用集合
use collectName
db.getCollection("collectName")

# 创建集合，空间大小 6142800 KB, 文档最大个数为 10000 个
db.createCollection("collectName", { capped : false, autoIndexId : false, size : 6142800, max : 10000 } )

# 删除集合
db.collectName.drop()


# 向集合中写入数据
db.collectName.insert({"name" : "value"})	# 向集合中插入数据
db.collectName.save({"name" : "value"})		# 如果 _id 主键存在则更新数据，如果不存在就插入数据
db.collectName.replaceOne() 			# 更新一条记录
db.collectName.insertOne()			# 插入一条记录
db.collectName.insertMany()			# 插入多条记录


# 向集合中更新数据
db.collectName.update(
   	<query>,			# 需要查询的条件，如 {'title': 'abc'},
   	<update>,			# 需要提交的更新，如 {$set: {'title': 'def'}}
   	{
     		upsert: <boolean>,	# 查询语句不存在时，是否插入数据
     		multi: <boolean>	# 查询语句对应多条记录时，是否更新所有记录
	}
）

# 更新favorites字段的artist子字段等于"Picasso"的文档
# 将food子字段设为"pie", 将type字段设为3，并更新最后一次修改时间到lastModified字段中
db.users.updateOne(
   { "favorites.artist": "Picasso" },
   {
     $set: { "favorites.food": "pie", type: 3 },
     $currentDate: { lastModified: true }
   }
)


# 从集合中删除数据
db.collectName.remove(
	<query>,			# 满足什么条件时需要删除数据
	<justOne>			# 是否只删除一条数据
)
db.collectName.remove({})		# 删除所有数据


# 从集合中查询数据
db.collectName.find(
	<query>, 			# 查询条件，如 {$or: [{likes: {$gt:50, $lte: 100}}, {name: "value"}]}
	<projection>			# 需要返回那些字段，如 {name: false, likes: true}，默认返回全部字段
)
db.collectName.find().pretty()			# 查询所有数据，并以更美观的方式展示
db.collectName.find().skip(2).limit(1)		# 跳过两条数据后查询第一条数据
db.collectName.find().sort({"name": -1})	# 按照name字段对查询结果排序，1为正序，-1为倒序
db.collectName.findOne()			# 查找第一条文档


# 更新并查询更新结果
db.collectName.findAndModify({
	query: <query>,
        update: <update>,
        new: <boolean>
})


# 查询函数
$gt						# 大于
$gte						# 大于等于	
$lt						# 小于
$lte						# 小于等于
$ne						# 不等于
$eq						# 等于
$in						# 在某个列表中
name: /value/					# 模糊查询，name字段中包含value
name: /^value/					# 模糊查询，name字段中以value开头
name: /value$/					# 模糊查询，name字段中以value结尾
name: {$type : 'string'}			# 匹配数据类型，查询name字段中数据类型为string的数据


# 聚合操作
db.collectName.aggregate(
	<operate>		# 需要进行的聚合操作
				# 如分组统计记录数	{$group : {_id : "$groupName", count: {$sum : 1}}}
)

# 聚合函数
$sum		# 汇总
$avg		# 求均值
$min		# 最小值
$max		# 最大值
$first		# 按排序获取第一个数据
$last		# 按排序获取最后一个数据
$push		# 在结果中插入一个数据
$addToSet	# 在结果中插入一个数据，但不创建重复值

# 管道操作
$project	# 修改输入文档的结构。可以用来重命名、增加或删除域，也可以用于创建计算结果以及嵌套文档。
$match		# 用于过滤数据，只输出符合条件的文档。$match使用MongoDB的标准查询操作。
$limit		# 用来限制MongoDB聚合管道返回的文档数。
$skip		# 在聚合管道中跳过指定数量的文档，并返回余下的文档。
$unwind		# 将文档中的某一个数组类型字段拆分成多条，每条包含数组中的一个值。
$group		# 将集合中的文档分组，可用于统计结果。
$sort		# 将输入文档排序后输出。
$geoNear	# 输出接近某一地理位置的有序文档。
$inc		# 将某个字段增加特定值，如 { $inc: {value: 1} } 相当于 value += 1


db.articles.aggregate([
	{ $match : { score : { $gt : 70, $lte : 90 } } },	
	{ $group: { _id: null, count: { $sum: 1 } } },
	{ $skip : 5 }
])


# 创建索引
db.collectName.createIndex(
	<index>, 				# 需要创建的索引及排序方式，如 {"index": 1}
	<options>				# 可选参数，如 {"background", true}
)

# 索引选项
background		# 是否在后台创建（避免阻塞其它数据库操作）
unique			# 索引取值是否唯一
name			# 索引名称，默认为 "字段名_排序方式"
dropDups		# 创建唯一索引时，是否删除重复值
sparse			# 创建索引时，如果文档中不包含索引字段是否略过
expireAfterSeconds	# 设定集合生存时间，以秒为单位
v			# 索引版本号
weights			# 索引相对于其它索引的权重
default_language	# 创建文本索引时，文本使用的语言，默认为英语
language_override	# 覆盖默认的语言设置

# 查询索引
db.collectName.getIndexes()			# 查看集合索引
db.collectName.totalIndexSize()			# 查看集合索引占用空间，Bit
db.collectName.dropIndexes()			# 删除集合所有索引
db.collectName.dropIndex("indexName")		# 删除集合指定索引


## mongoDB管理

# 建立服务器
mongod  --port 27017 			# 设定服务器端口
	--dbpath=mongoDB/mongo 		# 数据存放路径
	--logpath=mongoDB/mongo.log 	# log文档
	--logappend			# 是否合并log
	--fork				# 创建守护进程
	--shardsvr			# 作为shard服务器，分片存储数据
	--configsvr			# 作为config服务器，管理分片数据
	--replSet=rs0			# 服务器副本集名称

# 连接服务器
mongo localhost:27017/test		# 连接到本地服务器，并使用test库

# 建立服务器副本集
首先建立两个服务器，假设端口分别为 27027、27037，服务器副本集名称必须相同
进入主服务器 27027 ，设置 rs.initiate(); rs.add("host:27037") 
主从自动切换至少需要建立三个服务器

var cfg = {_id: "rs0", menbers: [
	{_id: 0, host: "localhost:27027", priority: 2}.
	{_id: 1, host: "localhost:27037", priority: 1}.
	{_id: 2, host: "localhost:27037", arbiterOnly: true}
]}

rs.initiate(cfg)	# 初始化服务器集群
rs.add(host:port)	# 添加副本集
rs.conf()		# 查看副本集的配置
rs.status()		# 查看副本集状态
rs.isMaster()		# 查询是否为主服务器


## 建立服务器集群
# 建立分片服务器
mongod  --port 27020 --dbpath=mongoDB/shard0 --logpath=mongoDB/shard0.log --logappend --shardsvr --fork --replSet=shard0
# 建立分片管理服务器
mongod  --port 27010 --dbpath=mongoDB/conf0 --logpath=mongoDB/conf0.log --logappend --configsvr --fork --replSet=conf
# 建立路由服务器，推荐至少有三个分片管理服务器，分片管理服务器必须初始化副本集
mongos --port 27000 --configdb <conf>/localhost:27010,localhost:27011 --fork --logpath=mongoDB/route.log --logappend --chunkSize 500

# 登录服务器集群
mongo --port 27000

#使用admin数据库
user admin
# 串联路由服务器与分配副本集
sh.addShard("shard0/192.168.1.10:27020,192.168.1.11:27021,192.168.1.12:27022")
sh.addShard("shard1/192.168.1.11:27020,192.168.1.12:27021,192.168.1.10:27022")
sh.addShard("shard2/192.168.1.12:27020,192.168.1.10:27021,192.168.1.11:27022")
# 查看集群状态
sh.status()

# 指定对testdb库分片生效
db.runCommand( { enablesharding :"testdb"} );
# 指定需要分片的集合和分片使用的主键
db.runCommand( { shardcollection : "testdb.table1", key : {id: 1} } )


# 关闭服务器
use admin
db.shutdownServer()
# 强制关闭所有mongo服务
killall mongod
killall mongos


# 备份
mongodump -h hostname[:port] -d dbname -c collectionName -o <path>

# 还原
mongorestore -h hostname[:port] -d dbname -c collectionName <path>

# 状态监控
mongostat 10	# 统计当前数据库各项状态，增删改查数据量等,10表示间隔10秒统计一次
mongotop 10	# 统计每个集合读写资源占用比例


## 权限管理

# 决定用户权限所在的数据库
use admin
# 创建用户
db.createUser( { user: "root", pwd: "password", roles: [ "root", "userAdminAnyDatabase" ] } )
db.createUser( { 
	user: "wly", pwd: "password", 
	roles: [ 
		{ role: "readWrite", db: "wly"}, 
		{ role: "read", db: "admin"}
	] 
} )
# 撤销用户的权限
db.revokeRolesFromUser( "wly", [{ role: "read", db: "admin" }] )
# 给用户赋新的权限
db.grantRolesToUser( "wly", [{ role: "read", db: "admin" }] )
# 验证用户，相当于登录
db.auth("root", "password")
# 删除用户
db.removeUser("root")

# 查询所有用户
show users
db.system.users.find()

# 以特定用户身份登录
mongo -u username -p password --authenticationDatabase admin host[:port]
# 避免本地登录
db.getSiblingDB('admin').runCommand( { setParameter: 1, enableLocalhostAuthBypass: false} )

# mongoDB用户角色
1. 数据库用户角色	read、readWrite; 
2. 数据库管理角色	dbAdmin、dbOwner、userAdmin；
3. 集群管理角色		clusterAdmin、clusterManager、clusterMonitor、hostManager； 
4. 备份恢复角色		backup、restore； 
5. 所有数据库角色	readAnyDatabase、readWriteAnyDatabase、userAdminAnyDatabase、dbAdminAnyDatabase 
6. 超级用户角色		root 

Read			允许用户读取指定数据库
readWrite		允许用户读写指定数据库
dbAdmin			允许用户在指定数据库中执行管理函数，如索引创建、删除，查看统计或访问system.profile
userAdmin		允许用户向system.users集合写入，可以找指定数据库里创建、删除和管理用户
clusterAdmin		只在admin数据库中可用，赋予用户所有分片和复制集相关函数的管理权限。
readAnyDatabase		只在admin数据库中可用，赋予用户所有数据库的读权限
readWriteAnyDatabase	只在admin数据库中可用，赋予用户所有数据库的读写权限
userAdminAnyDatabase	只在admin数据库中可用，赋予用户所有数据库的userAdmin权限
dbAdminAnyDatabase	只在admin数据库中可用，赋予用户所有数据库的dbAdmin权限。
root			只在admin数据库中可用。超级账号，超级权限




#### 配置文件 ####

# 数据及日志存储位置，这里数据路径必须存在
dbpath = mongoDB/mongodb/shard0/data/
logpath = mongoDB/shard3/shard0.log
logappend = true
# 记录pid的文件
pidfilepath = mongoDB/shard3/shard0.pid
# 通过命令行生成密匙：openssl rand -base64 755 > mongo.key
keyFile = mongo.key
# 启用登录验证
auth = true

# 绑定IP与端口
bind_ip = 0.0.0.0
port = 27020
# 作为守护进程启动
fork = true
# 副本集名称
replSet=shard0

# 作为分片服务器
shardsvr = true
# 作为分片管理服务器
# configsvr = true
# 为服务器集群指定分片管理服务器
# configdb = <config replset name>/localhost:27010,localhost:27011,localhost:27012

# 打开web监控
httpinterface=true
rest=true
# 设置最大连接数
maxConns=2000



# ubuntu 安装mongoDB4.2.8
# https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/
sudo apt-get install gnupg
wget -qO - https://www.mongodb.org/static/pgp/server-4.2.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.2.list
sudo apt-get update
sudo apt-get install -y mongodb-org



# windows下注册mongoDB服务
mongod -f <full path of config file> --serviceName mongoDB --install
# 启动mongoDB服务，需要管理员权限
net start mongoDB
# 关闭mongoDB服务
net stop mongoDB



