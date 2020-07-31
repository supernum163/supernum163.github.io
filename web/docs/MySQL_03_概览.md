
## 1、连接与退出
```
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
mysql> SELECT USER(), VERSION(), NOW(), CURDATE(), CURRENT_DATE;
/* 字段名含有特殊字符时，用反引号强制将字符转为字段名 */
mysql> SELECT host, `host` FROM mysql.user; 
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

## 4、创建、管理表
```SQL
/* 查询有哪些表 */
SHOW TABLES;
/* 创建表 */
CREATE TABLE tbl (id VARCHAR(20), title VARCHAR(20),
  species VARCHAR(20), sex CHAR(1), birth DATE, death DATE
);
/* 查看表结构 */
DESCRIBE tbl;
SHOW CREATE TABLE tbl \G
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
SET sql_mode = '';
SELECT title, COUNT(*) FROM tbl;
/* ONLY_FULL_GROUP_BY模式下，title没有被“聚合”时会报错 */
SET sql_mode = 'ONLY_FULL_GROUP_BY';
```

## 4.4、查询警报/报错信息
```SQL
SHOW WARNINGS;
```

## 5、批处理
```
# 在系统命令行使用批处理
shell>  mysql -e "batch-file" > mysql.out
shell>  mysql < batch-file | more
# mysql命令行使用批处理
mysql> source batch-file;
mysql> \. batch-file
```

## 6、高级查询
```SQL
/* 分组（article）查询某个字段（price）最大值所在的记录*/

/* 方案一、子查询 + inner join */
SELECT s1.article, dealer, s1.price
FROM shop AS s1
JOIN (
  SELECT article, MAX(price) AS price
  FROM shop
  GROUP BY article
) AS s2
ON s1.article = s2.article AND s1.price = s2.price
ORDER BY article;

/* 方案二、匹配每条记录的组内最大值 */
SELECT article, dealer, price
FROM   shop AS s1
WHERE  price = (
  SELECT MAX(s2.price)
  FROM shop AS s2
  WHERE s1.article = s2.article
)
ORDER BY article;

/* 方案三、左连接并过滤所有存在组内某个值比该值大的记录 */
SELECT s1.article, s1.dealer, s1.price
FROM shop AS s1
LEFT JOIN shop AS s2 
ON s1.article = s2.article AND s1.price < s2.price
WHERE s2.article IS NULL
ORDER BY s1.article;

/* 方案三、分组排序法 */
WITH s1 AS (
  SELECT article, dealer, price,
    RANK() OVER (PARTITION BY article ORDER BY price DESC) AS `Rank`
  FROM shop
)
SELECT article, dealer, price
FROM s1
WHERE `Rank` = 1
ORDER BY article;


/* 使用临时变量 */
SELECT @min_price := MIN(price), @max_price := MAX(price) FROM shop;
SELECT * FROM shop WHERE price = @min_price OR price = @max_price;


/* 使用外键，表拼接时更便捷， 注意使用DESCRIBE等查看表信息时，不会显示外键 */

CREATE TABLE person (
    id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name CHAR(60) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE shirt (
    id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    style ENUM('t-shirt', 'polo', 'dress') NOT NULL,
    color ENUM('red', 'blue', 'orange', 'white', 'black') NOT NULL,
    /* 外键 */
    FK SMALLINT UNSIGNED NOT NULL REFERENCES person(id),
    PRIMARY KEY (id)
);
/* 向 person 表插入数据 */
INSERT INTO person VALUES (NULL, 'Antonio Paz');
/* 获取上一条记录插入时，自动补全的ID值 */
SELECT @last := LAST_INSERT_ID();
/* 向 shirt 表插入数据 */
INSERT INTO shirt VALUES
(NULL, 'polo', 'blue', @last),
(NULL, 'dress', 'white', @last),
(NULL, 't-shirt', 'blue', @last);


/* 设置主键自增长的步长 */
/* 主键由多个字段构成时，自增长的字段会在组内（其它字段取特定值时）自增长 */
ALTER TABLE tbl AUTO_INCREMENT = 100;
```