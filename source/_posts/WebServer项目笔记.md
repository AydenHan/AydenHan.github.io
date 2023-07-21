---
title: WebServer项目笔记
date: 2023-07-11 23:04:11
categories: 应用
tags:
- CPP
- 服务器
---

# WebServer项目

## 理论知识





## MySQL





## 环境配置

### 配置MySQL

#### 安装

```shell
sudo apt update
sudo apt install mysql-server
```

安装完成后，MySQL 服务将会自动启动。

查看 MySQL 服务器运行状态：

```shell
sudo systemctl status mysql
```

```shell
● mysql.service - MySQL Community Server
     Loaded: loaded (/lib/systemd/system/mysql.service; enabled; vendor preset: enabled)
     Active: active (running) since Tue 2023-07-11 06:28:50 PDT; 3min 22s ago
   Main PID: 4805 (mysqld)
     Status: "Server is operational"
      Tasks: 37 (limit: 6984)
     Memory: 364.6M
     CGroup: /system.slice/mysql.service
             └─4805 /usr/sbin/mysqld

Jul 11 06:28:49 ubuntu systemd[1]: Starting MySQL Community Server...
Jul 11 06:28:50 ubuntu systemd[1]: Started MySQL Community Server.
```



#### 设置密码

将密码插件修改为 `mysql_native_password`

```mysql
use mysql;
UPDATE user SET plugin='mysql_native_password' WHERE user='root';
FLUSH PRIVILEGES;
```

修改密码：

```mysql
ALTER USER 'root'@'localhost' IDENTIFIED BY '123456';
quit;
```

密码修改完成后，重启mysql服务：

```shell
sudo /etc/init.d/mysql restart
```



## 项目实现

### 代码架构

```shell
├── CGImysql							# CGI校验程序，用于用户数据与数据库数据的对比
│   ├── sql_connection_pool.cpp
│   └── sql_connection_pool.h
├── http								# http协议的连接、销毁等实现
│   ├── http_conn.cpp
│   └── http_conn.h
├── lock								# 封装互斥锁、信号量操作
│   └── locker.h
├── log									# 日志系统实现
│   ├── block_queue.h
│   ├── log.cpp
│   └── log.h
├── test_presure						# 压力测试webbench
│   └── ···
├── threadpool							# 线程池实现
│   └── threadpool.h
└── timer								# 定时器实现
|    └── lst_timer.h
├── root								# 静态网页数据、图片、视频等
│   └── ···
├── main.c								# 主函数入口
├── makefile							
├── server								# 生成的可执行文件
├── 2023_07_11_ServerLog				# 日志记录
```



### 项目框架

![img](WebServer%E9%A1%B9%E7%9B%AE%E7%AC%94%E8%AE%B0/v2-c16b9b3c7c2e279227204a88fc95d1bb_720w.webp)

![img](WebServer%E9%A1%B9%E7%9B%AE%E7%AC%94%E8%AE%B0/v2-fd0691122ac0c4213e790282d35083a5_720w.webp)



### 实现功能

- 使用 线程池 + 非阻塞socket + epoll(ET和LT均实现) + 事件处理(Reactor和模拟Proactor均实现) 的并发模型
- 使用状态机解析HTTP请求报文，支持解析GET和POST请求
- 访问服务器数据库实现web端用户注册、登录功能，可以请求服务器图片和视频文件
- 实现同步/异步日志系统，记录服务器运行状态
- 经Webbench压力测试可以实现上万的并发连接数据交换



### Epoll

#### I/O复用

**I/O是指网络中的I/O（即输入输出），多路是指多个TCP连接，复用是指一个或少量线程被重复使用。**连起来解就是，**用少量的线程来处理网络上大量的TCP连接中的I/O**。常见的I/O复用有以下三种：**select**、**poll**、**epoll**。

##### select

```cpp
#include <sys/select.h>
#include <sys/time.h>
int select(int maxfdpl,fd_set *readset,fd_set *writeset,fd_set *exceptset,const struct timeval *timeout);
```

函数第一个参数是**被监听的描述符的最大值+1**，select底层的数据结构是位数组，因此必须知道被监听的最大描述符才可以确定描述符的范围，否则就需要将整个数组遍历一遍。

函数第二、三、四个参数是被监听的事件，分别是**读、写、异常**事件。

函数的最后一个参数是**监听的时间**（NULL、0、正值）

**selct缺点：**

1. 从函数参数列表可见，select只能监听读、写、异常这三个事件
2. selct监听的描述符是有最大值限制的，在Linux内核中是1024
3. select的实现是每次将待检测的描述符放在位数组中，全部传给内核进行监听，内核监听之后会返回一个就绪描述符个数，并且修改了监听的事件值，以表示该事件就绪。内核再将修改后的数组传给用户空间。用户空间只能通过遍历所有描述符来处理就绪的描述符，之后再将描述符传给内核继续监听......很明显，这样在监听的描述符少的情况下并不影响效率，但是监听的描述符数量特别大的情况下，每次又只有少数描述符上有事件就绪，大量的换入换出会使得效率十分低下。



##### poll

```cpp
struct pollfd{  
  int fd;
  short events;
  short revents;
};
int poll(struct pollfd fdarray[], unsigned long nfds, int timeout);
```

第一个参数是个结构体数组，结构体中声明了被监听描述符和相应的事件，每个被监听的描述符对应一个结构体，数组表示可以监听多个描述符。

第二个参数是被监听描述符的个数。

第三个参数同select，只监听时间。

**poll缺点：**

**从函数参数来看，poll解决了select前两个问题，监听的描述符数量没有严格限制，监听的事件不止读、写、异常，但是第三个缺点依然存在，存在大量的换入换出。**



#### 函数分析

```cpp
#include <sys/epoll.h> 
int epoll_create(int size);
```

创建一个内核事件表，实际上就是创建文件，这其中包括文件描述符的分配、文件实体的分配等。文件描述符中有一个域很重要：**private_data域**，这是epoll的核心，其中有**内核时间表**、**就绪描述符队列**等信息。

![img](WebServer%E9%A1%B9%E7%9B%AE%E7%AC%94%E8%AE%B0/v2-bbe1af804032b9910917f046f2e1106b_720w.webp)

```cpp
int epoll_ctl(int epfd, int op, int fd, struct epoll_event *event);
```

- epfd：为`epoll_create`创建的句柄
- op：即操作，包含以下三个宏——
  1. **EPOLL_CTL_ADD** (注册新的fd到epfd)
  2. **EPOLL_CTL_MOD** (修改已经注册的fd的监听事件)
  3. **EPOLL_CTL_DEL** (从epfd删除一个fd)

- event：内核需要监听的事件，结构体如下——

```cpp
struct epoll_event {
  uint32_t events;		/* Epoll events */
  epoll_data_t data;	/* User data variable */
} __EPOLL_PACKED;
```

**events**描述事件类型，其中epoll事件类型主要有以下几种：

- EPOLLIN：表示对应的文件描述符**可以读**（包括对端SOCKET正常关闭）
- EPOLLOUT：表示对应的文件描述符**可以写**
- EPOLLPRI：表示对应的文件描述符有**紧急的数据可读**
- EPOLLERR：表示对应的文件描述符**发生错误**
- EPOLLHUP：表示对应的文件描述符**被挂断**；
- EPOLLET：将EPOLL设为**边缘触发(Edge Triggered)模式**，这是相对于**水平触发**(Level Triggered)而言的
- EPOLLONESHOT：只监听一次事件，当监听完这次事件之后，如果还需要继续监听这个socket的话，需要再次把这个socket加入到EPOLL队列里
- EPOLLRDHUP：表示读关闭，对端关闭，不是所有的内核版本都支持；
- ······



该函数主要是对内核事件表的操作，涉及插入（添加监听描述符）、删除（删除被监听的描述符）、修改（修改被监听的描述符）。主要有以下步骤：

1. 遍历内核事件表，看该描述符是否在内核事件表中。
2. 判断所要做的操作：插入、删除或是修改
3. 根据操作做相应处理

![img](WebServer%E9%A1%B9%E7%9B%AE%E7%AC%94%E8%AE%B0/v2-e5d595e4f6c400f5e69f5679ebd453c0_720w.webp)

```cpp
int epoll_wait(int epfd, struct epoll_event *events, int maxevents, int timeout);
```

- events：用来存储从内核得到的事件集合
- maxevents：告之内核这个events有多大，不能大于epoll_create()时的size；
- timeout：超时时间；
- return：成功返回有多少文件描述符就绪，时间到时返回0，出错返回-1；、



内核事件表的底层数据结构是红黑树，就绪描述符的底层数据结构是链表。

epoll_wait的功能就是不断查看就绪队列中有没有描述符，如果没有就一直检查、直到超时。如果有就绪描述符，就将就绪描述符通知给用户。



#### ET和LT

**ET**模式是高效模式，就绪描述符只通知用户一次，如果用户没做处理内核将不再进行通知；

**LT**模式比较稳定，如果用户没有处理就绪的描述符，内核会不断通知。

当为ET模式时，上边我们提到就绪描述符是用链表组织的，因此只需将**就绪部分断链发给用户**，而在LT模式下，用户没有处理就绪描述符时，内核会再次**将未处理的就绪描述符加入到就绪队列中重复提醒用户**空间。

由于内核对用户态的不信任,内核态和用户态的传输数据总是拷贝的。



### 线程池





### 登录和注册

页面跳转逻辑如下：

![img](WebServer%E9%A1%B9%E7%9B%AE%E7%AC%94%E8%AE%B0/640.jpeg)

首先需要从数据库中**获取所有的用户名和密码**（用户密码加密传输参考[用户登录实践](https://link.zhihu.com/?target=https%3A//blog.csdn.net/bjspo/article/details/90059325)），这些用户名和密码以某种数据结构（如哈希表）保存。当浏览器请求到达时，根据其请求访问，**返回对应的界面html或是错误提示**。

整个过程其实是一个**有限状态机**。



#### 有限状态机

状态机可归纳为4个要素，即**现态**、**条件**、**动作**、**次态**。“现态”和“条件”是因，“动作”和“次态”是果。

1. **现态**：是指当前所处的状态。
2. **条件**：又称为“事件”。当一个条件被满足，将会触发一个动作，或者执行一次状态的迁移。
3. **动作**：条件满足后执行的动作。动作执行完毕后，可以迁移到新的状态，也可以仍旧保持原状态。动作不是必需的，当条件满足后，也可以不执行任何动作，直接迁移到新状态。
4. **次态**：条件满足后要迁往的新状态。“次态”是相对于“现态”而言的，“次态”一旦被激活，就转变成新的“现态”。



#### Epoll





## Debug

### MySQL

#### 关于用户密码

**问题1：**root无需密码，或任何密码都可以登录

**原因：**

```mysql
select user,host,plugin from mysql.user;
```

查看用户插件信息，显示root插件为**auth_socket**，这种插件无需密码，所以设置任何密码都无效。

**解决：**

更改插件为`mysql_native_password` 或者`caching_sha2_password`

```mysql
use mysql;
UPDATE user SET plugin='mysql_native_password' WHERE user='root';
FLUSH PRIVILEGES;
```



**问题2：**修改密码时报错

`ERROR 1819 (HY000): Your password does not satisfy the current policy requirements`

**原因：**由于默认安装了validate_password插件，密码不符合**当前策略要求**

**解决：**

设置类似123456的简单密码时，要将密码策略设置为0（LOW），默认为1（MEDIUM），并修改长度（默认为8），最低为4。

首先查看当前设置内容：

```mysql
# method1  推荐
SHOW VARIABLES LIKE 'validate_password%';
# method2
SELECT @@validate_password.policy;
```

```shell
+--------------------------------------+-------+
| Variable_name                        | Value |
+--------------------------------------+-------+
| validate_password.check_user_name    | ON    |
| validate_password.dictionary_file    |       |
| validate_password.length             | 4     |
| validate_password.mixed_case_count   | 1     |
| validate_password.number_count       | 1     |
| validate_password.policy             | LOW   |
| validate_password.special_char_count | 1     |
+--------------------------------------+-------+
7 rows in set (0.00 sec)
```

注：5.7版本的mysql，变量为 `validate_password_policy`。

修改对应的值：

```mysql
# mysql8.0
set global validate_password.policy=0;
set global validate_password.length=1;	# 最低好像是4，不能
```



### 编译

#### 关于mysql.h

**问题：**`fatal error: mysql/mysql.h: No such file or directory`

**原因：**没有安装 **mysql**的**相关链接库**

**解决：**`sudo apt-get install libmysqlclient-dev`



#### 关于g++

**问题：**`make: g++: Command not found`

**原因：**没有安装 **g++** 编译器

**解决：**`sudo apt-get install build-essential`

**拓展：** **build-essential** 是 Ubuntu 软件源默认包含的一个软件包组，它包含了 GNU 编辑器集合，GNU 调试器，和其他编译软件所必需的开发库和工具，也包括 `gcc` ，`g++` 和 `make`。

