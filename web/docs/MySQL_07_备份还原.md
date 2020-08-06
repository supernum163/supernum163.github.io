

使用系统参数 **--log-bin** 指定二进制日志文件存放位置，该文件和数据文件不同，数据文件损坏时可以通过二进制日志文件恢复。

```shell
# 拷贝表文件时，首先锁定表
mysql> FLUSH TABLES WITH READ LOCK
shell> mount vxfs snapshot
mysql> UNLOCK TABLES
# 复制 snapshot 并进行 unmount

# mysqldump备份
shell>  mysqldump --single-transaction --master-data --all-databases > backup.sql
shell>  mysqldump --flush-logs --single-transaction --master-data=2 --all-databases > backup.sql
# 只在备份开始时锁定表格，避免因备份时间过长锁死表格
--single-transaction
# 备份所有数据库
-all-databases
# 在输出SQL中记录下完全备份后新日志文件的名称
--master-data=2
# 指定备份数据库
--databases db1 db2 db3

# 强制刷新二进制数据文件，此时mysql会将数据变化写入新的日志文件，拷贝二进制文件进行差异备份
shell> mysqldump --flush-logs
# 先将内存中的表写入磁盘
mysql> FLUSH TABLES;
mysql> FLUSH LOGS;
# 通过二进制文件还原数据，这里的 mysqlbinlog 命令相当于将二进制文件转化为 sql 文件
shell> mysqlbinlog binlog_files | mysql -u root -p
# mysqlbinlog 命令还可以还原指定范围内的数据，如：
--start-datetime="2020-03-11 20:05:00" 
--stop-datetime="2020-03-11 20:08:00" 
--start-position=355

# 从备份中恢复
shell> mysql < backup.sql
mysql> source backup.sql
shell> mysqlbinlog diff-01.bin | mysql

# 将 dbname 库中的表逐一以 csv 格式（换行符为 "\r\n"）导出到 tmp 文件夹内
shell> mysqldump --tab=/tmp --fields-terminated-by=,
  --fields-enclosed-by='"' --lines-terminated-by=0x0d0a dbname
# 通过备份的 csv 文件还原表
shell> mysqlimport --fields-terminated-by=,
  --fields-enclosed-by='"' --lines-terminated-by=0x0d0a dbname table.txt

# 备份还原数据库
shell> mysqldump db1 > dump.sql
shell> mysqladmin create db2
shell> mysql db2 < dump.sql

# mysqldump 以下参数还可以设置是否备份数据库中的事件、存储过程和函数、触发器
--events
--routines
--triggers
--skip-events
--skip-routines
-skip-triggers
# 设置不备份数据、不备份表结构
--no-data
--no-create-info

# 使用 myisamchk 修复表之前需要先锁定表
mysql> flush tables tablename with read lock;
# 检查表
shell> myisamchk -im --verbose /path/to/database_dir/*.MYI
# 修复表
shell> myisamchk -rq  /path/to/database_dir/*.MYI
shell> myisamchk -Br  /path/to/database_dir/*.MYI  
shell> myisamchk -o   /path/to/database_dir/*.MYI
```



