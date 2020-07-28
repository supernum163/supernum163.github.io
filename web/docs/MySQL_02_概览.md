
## 1、连接与退出

```SQL
/* 建立连接 */
shell> mysql -h host -u user -p
Enter password: ********
/* 退出连接 */
mysql> QUIT
Bye
```

## 2、查询语句

```SQL
/* 查询当前用户、MySQL版本、当前时间、当前日期 */
mysql> SELECT USER() VERSION(), NOW(), CURRENT_DATE;
/* 使用 \c 放弃查询 */
mysql> SELECT
    -> USER()
    -> \c
```

## 3、创建、管理数据库

```SQL
/* 查询有哪些数据库 */
SHOW DATABASES;
/* 创建数据库 */
CREATE DATABASE dbname;
/* 使用某个数据库 */
USE dbname;
/* 赋予用户权限 */
GRANT ALL ON dbname.* TO 'username'@'host';
```

## 3、创建、管理表

```SQL
/* 查询有哪些表 */
SHOW TABLES;
/* 创建表 */
CREATE TABLE tbl (id VARCHAR(20), title VARCHAR(20),
  species VARCHAR(20), sex CHAR(1), birth DATE, death DATE
);
/* 查看表结构 */
DESCRIBE tbl;
/* 导入数据，txt文件中不包含表头、记录通过换行分割、字段通过“\t”分割、NULL值使用字符“\N”替代 */
LOAD DATA LOCAL INFILE '/path/tbl.txt' INTO TABLE tbl
  LINES TERMINATED BY '\r\n';
/* 插入数据 */
INSERT INTO tbl
  VALUES ('Puffball','Diane','hamster','f','1999-03-30',NULL);
```

## 4.1、日期时间管理

```SQL
/* 提取日期时间中的某一部分（月份） */
SELECT MONTH(date);
/* 计算时间差 */
SELECT TIMESTAMPDIFF(YEAR, CURDATE(), date);
/* 给特定日期时间加上一段时间 */
SELECT DATE_ADD(CURDATE(), INTERVAL 1 MONTH);
SELECT '2018-10-31' + INTERVAL 1 DAY;
```

## 4.2、模糊查询

```SQL
/* 模糊查询 */
SELECT * FROM tbl WHERE title LIKE '%abc%';
/* 模糊查询，匹配字数（5个字） */
SELECT * FROM tbl WHERE title LIKE '_____';
/* 使用正则匹配，区分大小写 */
SELECT * FROM tbl WHERE REGEXP_LIKE(title, '^b' COLLATE utf8mb4_0900_as_cs);
SELECT * FROM tbl WHERE REGEXP_LIKE(title, BINARY '^b');
SELECT * FROM tbl WHERE REGEXP_LIKE(title, '^b', 'c');
```
## 4.3、聚合查询

```SQL
/* 默认情况下，title没有被“聚合”，MySQL不会报错，而是返回任一条记录中的title */
mysql> SET sql_mode = '';
mysql> SELECT title, COUNT(*) FROM tbl;
/* ONLY_FULL_GROUP_BY模式下，title没有被“聚合”时会报错 */
mysql> SET sql_mode = 'ONLY_FULL_GROUP_BY';
```

## 4.4、查询警报/报错信息

```SQL
SHOW WARNINGS;
```
