

# 1、服务器启动管理

### 查看使用mysqld启动服务器时的命令行参数
```
shell> mysqladmin variables
shell> mysqladmin extended-status
mysql> SHOW VARIABLES;
mysql> SHOW STATUS;
```

### mysqld 启动参数
```shell
--validate-config     # 在不启动服务器的情况下，检查命令行参数是否有效
# 检查配置文件中的设置是否有效
shell> mysqld --defaults-file=./my.cnf-test --validate-config
```

### mysqld 相关命令读取toml配置文件中的参数段落
mysqld       `[mysqld]、[server]` 
mysqld_safe  `[mysqld]、[server]、[mysqld_safe]、[safe_mysqld]`
mysql.server `[mysqld]、[mysql.server]`

### mysqld 几种类型的参数
Cmd-Line 	      命令行参数
Option File 	  配置文件参数
System Var 	    系统变量，包括全局变量、会话变量、本地变量
Status Var 	    系统状态，是系统现在的运行状态参数，不可修改
```mysql
# 设置全局变量、会话变量、本地变量
SET GLOBAL sort_buffer_size = 10 * 1024 * 1024;
SET SESSION sort_buffer_size = 10 * 1024 * 1024;
SET LOCAL sort_buffer_size = 10 * 1024 * 1024;
# 默认设置绘画变量
SET sort_buffer_size = 10 * 1024 * 1024;
# 设置持久化的系统变量，相当于直接卸载配置文件中
SET PERSIST max_connections = 1000;
SET @@PERSIST.max_connections = 1000;
# 删除持久化的系统变量
RESET PERSIST IF EXISTS system_var_name;
# 查看系统变量
show variables like '%abc%';
# 查看系统状态
show status like '%abc%';
```

# 2、sql_mode系统变量

### ONLY_FULL_GROUP_BY
对于GROUP BY聚合操作，如果在SELECT中的列，没有在GROUP BY中出现，那么将认为这个SQL是不合法的，因为列不在GROUP BY从句中
### STRICT_TRANS_TABLES
在该模式下，如果一个值不能插入到一个事务表中，则中断当前的操作，对非事务表不做任何限制
### NO_ZERO_IN_DATE
在严格模式，不接受月或日部分为0的日期。如果使用IGNORE选项，我们为类似的日期插入'0000-00-00'。在非严格模式，可以接受该日期，但会生成警告。
### NO_ZERO_DATE
在严格模式，不要将 '0000-00-00'做为合法日期。你仍然可以用IGNORE选项插入零日期。在非严格模式，可以接受该日期，但会生成警告
### ERROR_FOR_DIVISION_BY_ZERO
在严格模式，在INSERT或UPDATE过程中，如果被零除(或MOD(X，0))，则产生错误(否则为警告)。如果未给出该模式，被零除时MySQL返回NULL。如果用到INSERT IGNORE或UPDATE IGNORE中，MySQL生成被零除警告，但操作结果为NULL。
### NO_AUTO_CREATE_USER
防止GRANT自动创建新用户，除非还指定了密码。
### NO_ENGINE_SUBSTITUTION
如果需要的存储引擎被禁用或未编译，那么抛出错误。不设置此值时，用默认的存储引擎替代，并抛出一个异常。

## mysql5.0以上版本支持三种sql_mode模式：
### ANSI模式
宽松模式，对插入数据进行校验，如果不符合定义类型或长度，对数据类型调整或截断保存，报warning警告。
### TRADITIONAL模式
严格模式，当向mysql数据库插入数据时，进行数据的严格校验，保证错误数据不能插入，报error错误。用于事物时，会进行事物的回滚。
### STRICT_TRANS_TABLES
严格模式，进行数据的严格校验，错误数据不能插入，报error错误。 


# 3、资源组

这里的资源组相当于某个计算机一定范围内的处理能力（读写运算等），备份时不能被写入二进制文件
```SQL
-- 创建资源组
CREATE RESOURCE GROUP Batch
  TYPE = USER
  VCPU = 2-3            -- assumes a system with at least 4 CPUs
  THREAD_PRIORITY = 10;
-- 查看资源组
SELECT * FROM INFORMATION_SCHEMA.RESOURCE_GROUPS
  WHERE RESOURCE_GROUP_NAME = 'Batch'\G
-- 为资源组分配某个线程
SET RESOURCE GROUP Batch [FOR thread_id];
-- 以某个资源组的身份执行命令
INSERT /*+ RESOURCE_GROUP(Batch) */ INTO t2 VALUES(2);
```


# 4、进程状态追踪
```SQL
DROP TABLE IF EXISTS test.t1;
CREATE TABLE test.t1 (i INT, f FLOAT);
-- 启用进程状态追踪，此时进程中数据发生改变是会打印log
SET @@SESSION.session_track_schema=ON;
SET @@SESSION.session_track_system_variables='*';
SET @@SESSION.session_track_state_change=ON;
USE information_schema;
SET NAMES 'utf8mb4';
SET @@SESSION.session_track_transaction_info='CHARACTERISTICS';
-- 使用回滚机制读写数据
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
SET TRANSACTION READ WRITE;
START TRANSACTION;
SELECT 1;
INSERT INTO test.t1 () VALUES();
INSERT INTO test.t1 () VALUES(1, RAND());
COMMIT;
```

# 5、关闭服务器
``` shell
# 关闭服务器，需要用户有shutdown权限
mysqladmin shutdown 
```

# 6、管理log

## mysql中的log类型
Error log               记录启动、运行、关闭mysqld时的语句
General query log 	    记录一般查询语句
Slow query log          记录查询时间超过`long_query_time`系统变量记录的值（秒）的语句
Binary log              记录修改数据时的语句，也会被备份服务器使用
Relay log               记录从分发服务器传来的修改数据信息
DDL log (metadata log) 	记录数据定义等语句

## 决定log的系统变量
--log_output            log存放位置
--general_log           开启 general_log
--slow_query_log        开启 slow_query_log
--general_log_file      设置 general_log 存放位置
--slow_query_log_file   设置 slow_query_log 存放位置
--log-bin[=file_name]   开启并设置 binary_log 存放位置
--log-error[=file_name] 开启并设置 error_log 存放位置
--sql_log_off           在session中关闭 general_log

### 备份log，并建立新的log文件
```
mv host_name.err host_name.err-old
mysqladmin flush-logs
mv host_name.err-old backup-directory
```


