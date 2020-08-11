

主从服务器**master/slave**
使用系统变量**server_id**给分发/接收服务器（**source/replica**）分配唯一ID
使用**change master to**语句为接收服务器指定分发服务器

```shell
mysql> SET GLOBAL server_id = 2
# 设置接收服务器不记录日志
mysql> SET GLOBAL log_slave_updates 
# 创建用户并赋予分发/接收权限
mysql> CREATE USER 'repl'@'%.example.com' IDENTIFIED BY 'password';
mysql> GRANT REPLICATION SLAVE ON *.* TO 'repl'@'%.example.com';
# 可选，该权限允许查看主从服务器状态
mysql> GRANT REPLICATION CLIENT ON *.* TO 'repl'@'%.example.com';
# 建立分发机制前需要锁定表
mysql> FLUSH TABLES WITH READ LOCK;
# 可选，手动添加分发服务器时需要直到二进制文件及读写位置
mysql> SHOW MASTER STATUS;
mysql> SHOW SLAVE STATUS\G
# 使用 master-data 参数，可以使接收服务器在恢复数据时，自动配置分发服务器
# 相当于在备份文件中加入了 CHANGE MASTER TO 语句
mysqldump --all-databases --master-data > dbdump.db
# 解锁分发服务器
mysql> UNLOCK TABLES;
# 在接收服务器中恢复分发服务器中的初始数据 -h
shell> mysql < fulldb.dump
# 开始同步
mysql> START SLAVE;
# 手动设置分发源
mysql> CHANGE MASTER TO
    ->     MASTER_HOST='source_host_name',
    ->     MASTER_USER='replication_user_name',
    ->     MASTER_PASSWORD='replication_password',
    ->     MASTER_LOG_FILE='recorded_log_file_name',
    ->     MASTER_LOG_POS=recorded_log_position;
# 停止接收
mysql> STOP SLAVE;
```

使用系统变量 **gtid_executed_compression_period** ，设置**global transaction identifier**执行间隔（每隔多少条语句执行一次），开启这一模式后，日志文件中不含GTID的数据将不会被同步

```shell
# 设置服务器为只读状态
mysql> SET @@GLOBAL.read_only = ON;
# 等待二进制数据文件中所有不含有GTID的数据都被同步后，关闭主从服务器
shell> mysqladmin shutdown
# 添加以下参数到配置文件，重启服务器
gtid_mode=ON
enforce-gtid-consistency=ON
# 使用 --skip-slave-start 参数启动接收服务器
# 更新接收服务器的分发源
mysql> CHANGE MASTER TO
     >     MASTER_HOST = host,
     >     MASTER_PORT = port,
     >     MASTER_USER = user,
     >     MASTER_PASSWORD = password,
     >     MASTER_AUTO_POSITION = 1;
# 启动接收
mysql> START SLAVE;
# 解锁只读状态
mysql> SET @@GLOBAL.read_only = OFF;

# 手动设置GTID需要同步的位置
SET GTID_NEXT='aaa-bbb-ccc-ddd:N';
BEGIN;
COMMIT;
SET GTID_NEXT='AUTOMATIC';
# 手动刷新接收服务器的数据日志
FLUSH LOGS;
PURGE BINARY LOGS TO 'source-bin.00000N';

# 更简单的方法设置GTID同步位置
# 在数据日志中写入标记符 " /*!*/;"
mysql> DELIMITER ;
# 在接收服务器中自动寻找同步位置
mysql> SET GTID_NEXT=automatic;
mysql> RESET SLAVE;
mysql> START SLAVE;

# 不重启服务器的情况下设置GTID
SET @@GLOBAL.ENFORCE_GTID_CONSISTENCY = WARN;
SET @@GLOBAL.ENFORCE_GTID_CONSISTENCY = ON;
SET @@GLOBAL.GTID_MODE = OFF_PERMISSIVE;
SET @@GLOBAL.GTID_MODE = ON_PERMISSIVE;
SET @@GLOBAL.GTID_MODE = ON;
SHOW STATUS LIKE 'ONGOING_ANONYMOUS_TRANSACTION_COUNT';
CHANGE MASTER TO MASTER_AUTO_POSITION = 1 [FOR CHANNEL 'channel'];
STOP SLAVE [FOR CHANNEL 'channel'];
START SLAVE [FOR CHANNEL 'channel'];
RESET SLAVE [FOR CHANNEL 'channel'];
# 查看主从状态
SELECT * FROM performance_schema.replication_connection_status
[WHERE CHANNEL_NAME='source_1'] \G
SHOW SLAVE HOSTS;
SHOW SLAVE STATUS \G
SHOW PROCESSLIST \G
# 使用安全链接
mysql> CHANGE MASTER TO
    -> MASTER_HOST='source_hostname',
    -> MASTER_USER='repl',
    -> MASTER_PASSWORD='password',
    -> MASTER_SSL=1;
    -> MASTER_SSL_CA = 'ca_file_name',
    -> MASTER_SSL_CAPATH = 'ca_directory_name',
    -> MASTER_SSL_CERT = 'cert_file_name',
    -> MASTER_SSL_KEY = 'key_file_name',
    -> MASTER_SSL_VERIFY_SERVER_CERT=1,
    -> MASTER_SSL_CRL = 'crl_file_name',
    -> MASTER_SSL_CRLPATH = 'crl_directory_name',
    -> MASTER_SSL_CIPHER = 'cipher_list',
    -> MASTER_TLS_VERSION = 'protocol_list',
    -> MASTER_TLS_CIPHERSUITES = 'ciphersuite_list',

```

