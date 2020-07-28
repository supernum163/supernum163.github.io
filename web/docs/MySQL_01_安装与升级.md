

## 1、windows安装MySQL

下载MySQL安装包 **https://dev.mysql.com/downloads/installer/**
根据安装界面向导完成安装

升级至新版本时，需要首先关闭现有的MySQL服务器，然后使用安装向导进行升级
```
  mysqladmin -u root shutdown
  net stop  mysqld_service_name
```


## 2、ubuntu安装MySQL

首先要删除旧版本的mysql
- 通过apt命令卸载所有旧版本的mysql程序（`sudo apt remove --purge mysql*`）
- 并将残留的配置文件删除（**/etc/my.cnf**、**/etc/mysql**）

下载并安装apt源自动配置包**https://dev.mysql.com/downloads/repo/apt/**
通过以下命令安装MySQL服务器和客户端
```
  sudo apt update
  sudo apt install -y mysql-server
  sudo apt install -y mysql-client
```

升级至新版本时，可以直接使用apt命令重新安装最新版

