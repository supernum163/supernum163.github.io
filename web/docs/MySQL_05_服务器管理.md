

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
System Var 	    系统变量，包括全局变量、会话变量
Status Var 	    系统状态，是系统现在的运行状态参数，不可修改
```mysql
# 设置全局变量和会话变量
SET GLOBAL sort_buffer_size = 10 * 1024 * 1024;
SET SESSION sort_buffer_size = 10 * 1024 * 1024;
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

