
# 1、用户管理

```SQL
-- 刷新权限
flush privileges;
-- 创建用户
CREATE USER 'user'@'198.51.100.0/255.255.255.0';
CREATE  USER  'user'@'localhost'  IDENTIFIED  BY  'password'  
  -- 可允许的尝试登陆次数，值为0表示取消该设置
  FAILED_LOGIN_ATTEMPTS  3
  -- 登陆失败后锁定多少天
  PASSWORD_LOCK_TIME 3
  -- 密码每间隔多少天过期一次
  EXPIRE INTERVAL 90 DAY;
CREATE USER 'user'@'localhost' IDENTIFIED BY 'frank' WITH 
  MAX_QUERIES_PER_HOUR 20
  MAX_UPDATES_PER_HOUR 10
  MAX_CONNECTIONS_PER_HOUR 5
  MAX_USER_CONNECTIONS 2;
-- 重命名用户
RENAME USER ''@'localhost' TO 'user'@'localhost';
-- 修改密码
set password for 'user'@'localhost' = password('new_password');
-- 锁定密码
ALTER USER 'user'@'localhost' ACCOUNT LOCK;
-- 使密码过期
ALTER USER 'user'@'localhost' PASSWORD EXPIRE;
-- 密码每间隔180天过期一次
SET PERSIST default_password_lifetime = 180;
-- 记录6个历史密码，设置365天内不能重新使用历史密码
SET PERSIST password_history = 6;
SET PERSIST password_reuse_interval = 365;
-- 修改密码时需要验证当前密码
SET PERSIST password_require_current = ON;
-- 查看创建的用户
SET print_identified_with_as_hex = ON;
SHOW CREATE USER 'user'@'localhost'\G
-- 给用户赋权
GRANT ALL ON *.*
  TO 'user'@'localhost'
  -- 决定该用户是否能够将自己的权限赋给别的用户
  WITH GRANT OPTION;
-- 回收用户的权限
REVOKE ALL ON *.*
  FROM 'user'@'localhost';
-- 查看用户权限
SHOW GRANTS FOR 'user'@'localhost';
-- 删除用户
DROP USER 'user'@'localhost';
-- 创建角色
CREATE ROLE 'role'
-- 设置持久化的角色
SET PERSIST mandatory_roles = 'role1,role2@localhost,role3@%.example.com';
-- 给角色赋权后，为用户分配角色
GRANT 'role' TO 'user'@'localhost';
-- 查看使用某个角色的用户所拥有的权限
SHOW GRANTS FOR 'user'@'localhost' USING 'role';
-- 设置默认角色
SET DEFAULT ROLE ALL TO 'user'@'localhost';
SET ROLE NONE;
SET ROLE DEFAULT; 
SET ROLE ALL EXCEPT 'role'; 
SELECT CURRENT_ROLE();
-- 回收用户对应的角色
REVOKE role FROM user;
-- 删除角色
DROP ROLE 'role';
-- 创建被代理用户，避免直接登陆
CREATE USER 'proxied_user'@'localhost'
  IDENTIFIED WITH mysql_no_login;
-- 允许/撤销代理用户通过被代理用户的身份使用服务器
GRANT PROXY ON 'proxied_user' FROM 'proxy_user';
REVOKE PROXY ON 'proxied_user' FROM 'proxy_user';
```
### 四个保留用户
- 'root'@'localhost': 系统管理员
- 'mysql.session'@'localhost': 管理当前线程，不能用于客户端连接服务器
- 'mysql.sys'@'localhost': 管理 **sys** 数据库，不能用于客户端连接服务器
- 'mysql.infoschema'@'localhost': 管理 **information_schema** 数据库，不能用于客户端连接服务器

# 2、权限说明

### 静态权限
ALL [PRIVILEGES]        全部
ALTER                   修改
ALTER ROUTINE           修改存储过程、函数等
CREATE 	                创建数据库和表（创建权限一般都包含修改、查询、删除权限）
CREATE VIEW 	          创建视图
CREATE TABLESPACE       创建表空间（相当于一系列表的集合）
CREATE TEMPORARY TABLES 创建临时表
CREATE ROUTINE 	        创建存储过程、函数等
CREATE ROLE 	          创建角色
CREATE USER 	          创建用户
SELECT                  查询
SHOW DATABASES          列举数据库
SHOW VIEW               列举视图
UPDATE 	                更新记录
INSERT 	                插入数据
DELETE                  删除记录
DROP                    删除数据库、表、视图等
DROP ROLE 	            删除角色
EXECUTE 	              执行存储过程、函数等
INDEX 	                管理索引
REFERENCES 	            管理外键
LOCK TABLES 	          锁定表格
GRANT                   为其他用户赋权
PROXY 	                允许作为代理用户
EVENT                   管理事件（触发器、定时任务等）
TRIGGER 	              管理触发器
FILE 	                  管理服务器端的文件
PROCESS 	              查看所有线程的信息
RELOAD 	                允许使用FLUSH，包括刷新权限、日志、服务器等
REPLICATION CLIENT 	    管理分发服务器
REPLICATION SLAVE 	    管理接收服务器
SHUTDOWN 	              关闭服务器
SUPER 	                超级管理员，可以细分为动态权限
USAGE                   无权限

### 动态权限
APPLICATION_PASSWORD_ADMIN 	  设置辅助密码
AUDIT_ADMIN 	                审计log文件
BACKUP_ADMIN                  执行备份相关语句
BINLOG_ADMIN                  管理数据库对应的二进制文件（备份和同步）
BINLOG_ENCRYPTION_ADMIN       加密数据库对应的二进制文件
CLONE_ADMIN                   克隆实例
CONNECTION_ADMIN              管理链接
ENCRYPTION_KEY_ADMIN          表空间加密
TABLE_ENCRYPTION_ADMIN        表加密
FIREWALL_ADMIN                防火墙管理员
FIREWALL_USER                 防火墙用户
RESOURCE_GROUP_ADMIN 	        资源组管理员
RESOURCE_GROUP_USER 	        资源组用户
ROLE_ADMIN 	                  角色管理员
SET_USER_ID                   设置有效用户ID
SYSTEM_USER                   系统用户
GROUP_REPLICATION_ADMIN       管理分发/接收服务器集群
REPLICATION_APPLIER           管理分发服务器
REPLICATION_SLAVE_ADMIN       管理接收服务器
INNODB_REDO_LOG_ARCHIVE       启动物理日志（redo log，相当于备份文件）
NDB_STORED_USER               NDB集群数据分享和同步
PERSIST_RO_VARIABLES_ADMIN    管理读写系统变量（mysqld-auto.cnf中的变量）
SYSTEM_VARIABLES_ADMIN        设置系统变量
SESSION_VARIABLES_ADMIN       设置线程变量
SHOW_ROUTINE                  查看存储过程和存储函数
VERSION_TOKEN_ADMIN           允许执行版本标记用户定义的函数 
XA_RECOVER_ADMIN              允许执行 XA RECOVER语句

