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

### 互斥锁

在多任务操作系统中，同时运行的多个任务可能都需要使用同一种资源。例如，*同一个文件，可能一个线程会对其进行写操作，而另一个线程需要对这个文件进行读操作。如果写线程还没有写结束，而此时读线程开始了，或者读线程还没有读结束而写线程开始了，那么最终的结果显然会是混乱的。*

在多线程中使用**互斥锁**（**mutex**）保护共享资源。互斥锁是一种简单的加锁的方法来控制对共享资源的访问，互斥锁只有两种状态，即**上锁**（lock）和**解锁**（unlock）。

#### 特点

1. **原子性**：把一个互斥量锁定为一个原子操作，这意味着如果一个线程锁定了一个互斥量，没有其他线程在同一时间可以成功锁定这个互斥量；

2. **唯一性**：如果一个线程锁定了一个互斥量，在它解除锁定之前，没有其他线程可以锁定这个互斥量；

3. **非繁忙等待**：如果一个线程已经锁定了一个互斥量，第二个线程又试图去锁定这个互斥量，则第二个线程将**被挂起**（不占用任何cpu资源），直到第一个线程解除对这个互斥量的锁定为止，第二个线程则被唤醒并继续执行，同时锁定这个互斥量。

#### 创建与初始化

**创建**

在使用互斥锁之前，需要先创建一个互斥锁的对象。 互斥锁的类型是 **pthread_mutex_t** ，这是一个联合体，存储了互斥锁的相关信息，所以定义一个变量就是创建了一个互斥锁。

```cpp
#include <pthread.h>
pthread_mutex_t _mutex;
```

**初始化**

有两种方式，第一种是调用函数。

```cpp
pthread_mutex_init(&_mutex，NULL);	// 第二个参数为 NULL，则互斥锁的属性会设置为默认属性
```

第二种是使用宏定义初始化赋值，因为这个互斥锁变量本质就是个联合体。

```cpp
# define PTHREAD_MUTEX_INITIALIZER \
   { { 0，0，0，0，0，0，{ 0，0 } } }	// 在 pthread.h 中，对该宏的定义
pthread_mutex_t _mutex = PTHREAD_MUTEX_INITIALIZER;
```

#### 上锁

**阻塞调用**

```cpp
pthread_mutex_lock(&mtx);
```

如果这个锁此时正在被其它线程占用， 那么 `pthread_mutex_lock()` 调用会进入锁的排队队列中，并进入阻塞状态， 直到拿到锁之后才会返回。*若该锁此时已被当前线程占用，则会发生死锁。*

**非阻塞调用**

若不想阻塞，只想尝试获取一下，锁被占用就不用，没被占用就用， 可以使用 `pthread_mutex_trylock()` 函数。 这个函数和 pthread_mutex_lock() 用法一样，只不过当请求的锁正在被占用的时候， 不会进入阻塞状态，而是立刻返回，并返回一个错误代码 `EBUSY`。*若该锁此时已被当前线程占用，同样会发生死锁。*

```cpp
if(0 != pthread_mutex_trylock(&_mutex)) {
    //The mutex could not be acquired because it was already locked.
}
```

**超时调用**

如果不想不断的调用 pthread_mutex_trylock() 来测试互斥锁是否可用， 而是想阻塞调用，但是增加一个超时时间，可以使用 `pthread_mutex_timedlock()` 来实现：

```cpp
struct timespec {
    __time_t tv_sec;        /* Seconds。 */
    long int tv_nsec;       /* Nanoseconds。 */
};
struct timespec abs_timeout;
abs_timeout.tv_sec = time(NULL) + 1;
abs_timeout.tv_nsec = 0;

if(0 != pthread_mutex_timedlock(&_mutex，&abs_timeout)) {
    //The mutex could not be locked before the specified timeout expired.
}
```

 阻塞等待线程锁，但只等待1秒钟，1秒钟后若还未拿到锁， 就返回一个错误代码 `ETIMEDOUT`。

*注意的是，这个函数里面调用的时间是**绝对时间**，所以这里用 time() 函数返回的时间增加了 1 秒。*

#### 解锁

```cpp
pthread_mutex_unlock(&_mutex);
```

#### 销毁

```cpp
pthread_mutex_destroy(&_mutex)
```

被销毁的线程锁可以被再次初始化使用。

*对一个处于已初始化但未锁定状态的线程锁进行销毁是安全的。尽量避免对一个处于锁定状态的线程锁进行销毁操作。*

#### std::mutex

本质就是对 `pthread.h` 中的 **pthread_mutex_t** 的封装。

```cpp
class mutex {
    pthread_mutex_t _M_mutex;
public:
    mutex() { _M_mutex = PTHREAD_MUTEX_INITIALIZER; }
    ~mutex() { pthread_mutex_destroy(&_M_mutex); }
    void lock() { pthread_mutex_lock(&_M_mutex); }
    bool try_lock() { return pthread_mutex_trylock(&_M_mutex) == 0; }
    void unlock() { pthread_mutex_unlock(&_M_mutex); }
}
```



### 信号量

#### 函数

除了初始化之外，其余的函数使用基本类同上述互斥锁：

**初始化**：`int sem_init (sem_t *sem，int pshared，unsigned int value)`

**sem**为指向信号量结构的一个指针；**pshared**不为０时此信号量在进程间共享，否则只能为当前进程的所有线程共享；**value**给出了信号量的初始值。

**销毁**： `int sem_destroy(sem_t *sem)`

**信号增量：**`int sem_post( sem_t *sem )`

用来增加信号量的值。当有线程阻塞在这个信号量上时，调用这个函数会使其中的一个线程不在阻塞，选择机制同样是由线程的调度策略决定的。

**信号等待：**同互斥锁，含有阻塞、非阻塞、定时阻塞三个版本

```cpp
int sem_wait( sem_t *sem );
int sem_trywait( sem_t *sem );
int sem_timedwait(sem_t *sem，const struct timespec *abs_timeout);
```

以上函数**调用成功均会返回0**。

#### 封装

```cpp
class SemS {
public:
    SemS() { sem_init(&_sem，0，0); }
    SemS(int val) { sem_init(&_sem，0，val); }
    ~SemS() { sem_destroy(&_sem); }
    bool wait() { sem_wait(&_sem) == 0; }
    bool post() { sem_post(&_sem) == 0; }
private:
    sem_t _sem;
};
```



### 条件变量

- 条件变量是线程可用的**另一种同步机制**
- 条件变量**给多个线程**提供了一个会合的场所
- 条件变量**与互斥量一起使用**时，允许线程以**无竞争的方式等待**特定的条件发生

#### 使用场景

- 条件变量要与互斥量一起使用，条件本身是由互斥量保护的。线程在**改变条件状态之前**必须首**先锁住**互斥量
- 其他线程在获得互斥量之前**不会察觉**到这种改变，因为互斥量必须在锁定以后才能计算条件

#### 函数

condition的函数使用也与互斥锁的使用基本类似。

**等待条件变量**

```cpp
int pthread_cond_wait(pthread_cond_t* restrict cond,pthread_mutex_t* restrict mutex);
int pthread_cond_timedwait(pthread_cond_t* cond,pthread_mutex_t* restrict mutex,const struct timespec* restrict tsptr);
```

- 参数mutex互斥量提前锁定（*使用mutex的lock函数*），然后该互斥量对条件进行保护，等待参数cond条件变量变为真。在等待条件变量变为真的过程中，此函数一直处于阻塞状态。但是处于阻塞状态的时候，**mutex互斥量被解锁**（因为其他线程需要使用到这个锁来使条件变量变为真）
- 当pthread_cond_wait函数返回时，互斥量再次被锁住

**发送信号**

```cpp
int pthread_cond_signal(pthread_cond_t* cond);
int pthread_cond_broadcast(pthread_cond_t* cond);
```

这两个函数用于通知线程条件变量已经满足条件（变为真）。调用这两个函数时，是在给线程或者条件发信号。



#### 常用方法

```cpp
lock(&mutex);
while(value<=0) 	// 需要value > 0 所以 value <= 0 就条件不满足
    pthread_cond_wait(&cond，&mutex);
unlock(&mutex);
```

这里在等待时用的while，是为了防止**虚假唤醒**。signal原本意图是唤醒一个等待的线程，但是在多核处理器下，可能会激活多个等待的线程，导致继续执行后资源不足。因此用while在wait返回后再做一次判断。

```cpp
lock(&mutex);
if(value==0)
	value++;
if(value>0)
	pthread_cond_signal(&cond);
unlock(&mutex);
```



#### 注意事项1

***传入前为何要锁，传入后为何要释放，返回时又为何再次锁？***

<img src="WebServer%E9%A1%B9%E7%9B%AE%E7%AC%94%E8%AE%B0/20190506080943669.png" alt="在这里插入图片描述"  />

**1.传入前锁mutex是为了保证线程从条件判断到进入pthread_cond_wait前，条件不被改变。**

若没有传入前的锁，会出现如下情况：

1. 线程A判断条件不满足（进入while循环）之后，调用`pthread_cond_wait`之前，A因为休眠或多线程下多个线程执行顺序和快慢的因素，令线程B更改了条件，使得条件满足。
2. 但此时线程A还没有调用`pthread_cond_wait`，但是线程B的通知信号`pthread_cond_signal`已经来了，这就造成了**信号丢失**问题。
3. 等到线程A进入`pthread_cond_wait`后虽然条件满足，但却错过了通知信号的唤醒，就会一直阻塞下去。

**2.传入后解锁是为了条件能够被改变**

传入后的解锁，是因为另一个线程需要*先加锁更改条件*后才调用`pthread_cond_signal`。（更改条件与等待条件满足，都是针对条件这一个资源的竞争，所以调用`pthread_cond_wait`和调用`pthread_cond_signal`的两个线程需要同一把锁）。

如果不对`mutex`解锁，那么在调用`pthread_cond_wait`后，其他线程就不能更改条件，就会一直阻塞。

**3.返回前再次锁**

- **保证线程从pthread_cond_wait返回后 到 再次条件判断前不被改变。**
- **保证在pthread_cond_signal之后与解锁mutex之间可能需要的其他语句能够执行**

对于1，理由与第一点差不多。如果不锁，那么线程A调用`pthread_cond_wait`后，条件满足，线程A被唤醒返回。线程B在此时更改了条件，使得条件不满足。但线程A不知道条件又被更改，以为条件满足，就可能出错。

对于2，只要线程B在`pthread_cond_signal`之后与**解锁mutex**之间有其他语句需要执行。由于mutex在这时已经被这个线程锁，还没有解锁，所以在`pthread_cond_wait`返回前的锁mutex的行为就会阻塞，直到线程B剩余的语句执行完并解锁，线程A才会返回。

#### 注意事项2

**pthread_cond_signal的两种写法**

1.*写在加锁和解锁中间*

```cpp
lock(&mutex);
//一些操作
pthread_cond_signal(&cond);
//一些操作
unlock(&mutex);
```

优点：安全

缺点：在某些线程的实现中，会造成等待线程从内核中唤醒（由于cond_signal)回到用户空间，因为返回前需要加锁，但是发现锁没有被释放，又回到内核空间所以一来一回会有性能的问题。

但是在LinuxThreads或者NPTL里面，就不会有这个问题，因为在Linux线程中，有两个队列，分别是cond_wait队列和mutex_lock队列， cond_signal只是让线程从cond_wait队列移到mutex_lock队列，而不用返回到用户空间，不会有性能的损耗。所以**Linux中这样用没问题。**

2.*写在解锁后*

优点：没有上述性能损耗

缺点：如果unlock之后signal之前，发生进程交换，另一个进程（不是等待条件的进程）拿到这把梦寐以求的锁后加锁操作，那么等最终切换到等待条件的线程时锁被别人拿去还没归还，只能继续等待。**不安全。**



### 生产者-消费者问题

生产者-消费者问题描述：

- **生产者**在生成数据后，放在一个缓冲区中；
- **消费者**从缓冲区取出数据处理；
- 任何时刻，**只能有一个**生产者或消费者可以访问缓冲区；

我们对问题分析可以得出：

- 任何时刻只能有一个线程操作缓冲区，说明操作缓冲区是临界代码，**需要互斥**；
- 缓冲区空时，消费者必须等待生产者生成数据；缓冲区满时，生产者必须等待消费者取出数据。说明生产者和消费者**需要同步**。

那么我们需要三个信号量，分别是：

- 互斥信号量 `mutex`：用于互斥访问缓冲区，初始化值为 1；
- 资源信号量 `fullBuffers`：用于消费者询问缓冲区是否有数据，有数据则读取数据，初始化值为 0（表明缓冲区一开始为空）；
- 资源信号量 `emptyBuffers`：用于生产者询问缓冲区是否有空位，有空位则生成数据，初始化值为 n （缓冲区大小）；

具体的实现代码：

![img](WebServer%E9%A1%B9%E7%9B%AE%E7%AC%94%E8%AE%B0/v2-30a45d5e797dc9ef999ee1fca7388345_720w.png)



### 常见同步问题

见 [常见同步问题]([(26 封私信 / 80 条消息) 如何理解互斥锁和信号量，以及他们在系统编程中是如何配合使用的？ - 知乎 (zhihu.com)](https://www.zhihu.com/question/40562993))

- 「哲学家进餐问题」对于互斥访问有限的竞争问题（如 I/O 设备）一类的建模过程十分有用。
- 「读者-写者」，它为数据库访问建立了一个模型。



### Socket

#### socket()

该函数建立一个协议族为domain、协议类型为type、协议编号为protocol的套接字文件描述符。

```cpp
#include<sys/socket.h>
int socket(int domain，int type，int protocol);
```

**domain**

最常用的参数为 `AF_INET / PF_INET` 均表示**IPv4 Internet协议**。其中 AF = Address Family，PF = Protocol Family。在windows系统中两者完全一致，在Linux系统中，也基本一致（对于BSD,是**AF**,对于POSIX是**PF**）

所以在实际使用时，根据命名释义，在初始化时选择 `PF_INET`，后面调用设置地址的函数时选用 `AF_INET`。

**type**

常用的有两种：

- **SOCK_STREAM**：TCP连接，提供序列化的、可靠的、双向连接的字节流。支持带外数据传输。
- **SOCK_DGRAM：**支持UDP连接（无连接状态的消息）

**protocol**

用于制定某个协议的特定类型，即type类型中的某个类型。通常某协议中只有一种特定类型，这样protocol参数仅能设置为0；但是有些协议有多种特定的类型，就需要设置这个参数来选择特定的类型。**TCP设置为0**。

**返回值**

成功，会返回一个标识这个套接字的文件描述符；失败的时候返回-1。 



#### sockaddr_in

**sockaddr**在头文件`#include <sys/socket.h>`中定义，sockaddr的缺陷是：sa_data把目标地址和端口信息混在一起了，如下：

```cpp
struct sockaddr {  
    sa_family_t sin_family;	//地址族
    char sa_data[14]; 		//14字节，包含套接字中的目标地址和端口信息               
}; 
```

**sockaddr_in**在头文件`#include<netinet/in.h>或#include <arpa/inet.h>`中定义，该结构体解决了sockaddr的缺陷，把port和addr 分开储存在两个变量中，如下：

![这里写图片描述](WebServer%E9%A1%B9%E7%9B%AE%E7%AC%94%E8%AE%B0/20161125160930613.png)

`sockaddr_in` 是internet环境下套接字的地址形式。所以在网络编程中我们会对sockaddr_in结构体进行操作，使用sockaddr_in来建立所需的信息，最后使用类型转化就可以了。**sockaddr_in用于socket定义和赋值；sockaddr用于函数参数。**

![这里写图片描述](WebServer%E9%A1%B9%E7%9B%AE%E7%AC%94%E8%AE%B0/20161124222509661.png)

在给地址和端口赋值时注意要把值转为NBO（**网络字节序**），这样在发送网络数据时才能接收到正确值。

```cpp
struct sockaddr_in address;
bzero(&address，sizeof(address));
address.sin_family = AF_INET;
address.sin_addr.s_addr = htonl(INADDR_ANY);
address.sin_port = htons(port);
```



#### setsockopt()

[setsockopt函数功能及参数详解](https://www.cnblogs.com/cthon/p/9270778.html)

```cpp
int reuse_addr_ctl = 1;
setsockopt(listenfd，SOL_SOCKET，SO_REUSEADDR，&reuse_addr_ctl，sizeof(reuse_addr_ctl));
```

在本项目中，由于**大规模并发的TCP连接**，就需要控制socket的地址复用。

1. **SO_REUSEADDR**允许启动一个监听服务器并捆绑其众所周知端口，即使以前建立的将此端口用做他们的本地端口的连接仍存在。这通常是重启监听服务器时出现，若不设置此选项，则bind时将出错。
2. 允许在同一端口上启动同一服务器的多个实例，只要每个实例捆绑一个不同的本地IP地址即可。对于TCP，我们根本不可能启动捆绑相同IP地址和相同端口号的多个服务器。

3. 允许单个进程捆绑同一端口到多个套接口上，只要每个捆绑指定不同的本地IP地址。一般不用于TCP服务器。

4. 允许完全重复的捆绑：当一个IP地址和端口绑定到某个套接口上时，还允许此IP地址和端口捆绑到另一个套接口上。一般来说，这个特性仅在支持多播的系统上才有，而且只对UDP套接口而言（TCP不支持多播）。

这个套接字选项通知内核，如果端口忙，但TCP状态位于 `TIME_WAIT` （端口释放后可能出现），可以重用端口。如果端口忙，而TCP状态位于其他状态，重用端口时依旧得到一个错误信息，指明"地址已经使用中"。

**端口复用最常用的用途应该是防止服务器重启时之前绑定的端口还未释放或者程序突然退出而系统没有释放端口。这种情况下如果设定了端口复用，则新启动的服务器进程可以直接绑定端口。如果没有设定端口复用，绑定会失败。**



#### bind()

服务端用于把用于通信的地址和端口绑定到 socket上。

`bind(listenfd，(sockaddr*)&address，sizeof(address));`



#### listen()

侦听功能将套接字置于**侦听传入连接**的状态。`int listen (int __fd，int __n);`

第二个参数为相应socket**可以排队的最大连接个数**。(*例：有100个用户链接请求，但是系统一次只能处理20个，剩下的80个不能不理，所以系统创建队列记录这些暂时不能处理、一会儿处理的连接请求，依先后顺序处理*)

socket()函数创建的socket默认是一个主动类型的，listen函数将socket变为**被动**类型的，**等待客户的连接请求**。



#### accept()

TCP服务器端依次调用socket()、bind()、listen()之后，就会监听指定的socket地址了。TCP客户端依次调用socket()、connect()之后向TCP服务器发送一个连接请求。TCP服务器监听到这个请求之后，就会调用accept()函数取接收请求，此时连接建立成功。之后就可以开始网络I/O操作了，即类同于普通文件的读写I/O操作。

`int accept(int sockfd，struct sockaddr *addr，socklen_t *addrlen);`

- 第一个参数为服务器的socket描述字；
- 第二个参数为指向struct sockaddr *的指针，用于返回客户端的协议地址；
- 第三个参数为客户端协议地址的长度。
- 如果accpet成功，那么其返回值是由内核自动生成的一个全新的描述字，代表与客户的TCP连接。若出现错误，返回值小于0。

一个服务器通常通常仅仅只创建一个监听socket描述字，它在该服务器的生命周期内一直存在。内核为每个由服务器进程接受的客户连接创建了一个已连接socket描述字，当服务器完成了对某个客户的服务，相应的已连接socket描述字就被关闭。



#### socketpair()

```cpp
#include <sys/socket.h>
int socketpair(int d，int type，int protocol，int sv[2])；
```

用于**创建一对无名的、相互连接的套接字**（匿名管道）。 如果函数成功，则返回0，创建好的套接字分别是sv[0]和sv[1]；否则返回-1，错误码保存于errno中。

- **domain**：表示协议族，在Linux下只能为PF_LOCAL或PF_UNIX（ `#define PF_UNIX  PF_LOCAL`）（自从Linux 2.6.27后也支持SOCK_NONBLOCK和SOCK_CLOEXEC）。
- **type**：表示协议，可以是`SOCK_STREAM`或者`SOCK_DGRAM`。SOCK_STREAM是基于TCP的，而SOCK_DGRAM是基于UDP的
- **protocol**：表示类型，只能为0
- **sv[2]**：套节字柄对，该两个句柄作用相同，均能进行读写双向操作

**基本用法：** 

1. 这对套接字可以用于**全双工通信**，每一个套接字既可以读也可以写。例如，可以往sv[0]中写，从sv[1]中读；或者从sv[1]中写，从sv[0]中读； 
2. 如果往一个套接字(如sv[0])中写入后，再从该套接字读时会阻塞，只能在另一个套接字中(sv[1])上读成功； 
3. 读、写操作可以位于同一个进程，也可以分别位于不同的进程，如父子进程。如果是父子进程时，一般会功能分离，一个进程用来读，一个用来写。因为文件描述副sv[0]和sv[1]是进程共享的，所以读的进程要关闭写描述符，反之，写的进程关闭读描述符。 

**注意：**

1. 该函数只能用于UNIX域（LINUX）下。
2. 只能用于有亲缘关系的进程（或线程）间通信。
3. 所创建的套节字对作用是一样的，均能够可读可写（而管道PIPE只能进行单向读或写）。
4. 在读的时候，管道内必须有内容，否则将会阻塞；简而言之，该函数是阻塞的。



#### recv()

**函数原型**：`int recv(int __fd, void *__buf, size_t __n, int __flags);`

**功能**：不论是客户还是服务器应用程序都用该函数从TCP连接的另一端接收数据。

**参数**：1.接收端套接字；2.数组，存放从缓冲区取到的数据；3.数组2的长度；4.一般置为0。

**同步Socket的recv函数的执行流程：**

当应用程序调用recv函数时，recv先等待 fd 的发送缓冲中的数据被协议传送完毕。如果协议在传送 fd 的发送缓冲中的数据时出现**网络错误**，那么recv函数返回`SOCKET_ERROR`；如果 fd 的发送缓冲中没有数据或者数据被协议成功发送完毕后，recv先检查套接字 fd 的接收缓冲区，如果 fd **接收**缓冲区中**没有数据或者协议正在接收数据**，那么recv就**一直等待**，直到协议把数据接收完毕；

当协议把数据接收完毕，recv函数就把 fd 的**接收缓冲中的数据copy到buf中**（注意协议接收到的数据可能大于buf的长度，所以在这种情况下要调用几次recv函数才能把 fd 的接收缓冲中的数据copy完。recv函数仅仅是copy数据，真正的接收数据是协议来完成的）。

recv函数**返回其实际copy的字节数**；如果recv在copy时出错，那么它返回`SOCKET_ERROR`；如果recv函数在等待协议接收数据时**网络中断**了，那么它返回 0。



#### send()

**函数原型**：`int send(int __fd, const void *__buf, size_t __n, int __flags);`

**功能**：不论是客户还是服务器应用程序都用send函数来向TCP连接的另一端发送数据。客户程序一般用send函数向服务器发送请求，而服务器则通常用send函数来向客户程序发送应答。

**参数**：同 `recv()` 函数。

**同步Socket的send函数的执行流程：**

当调用该函数时，send先比较待发送数据的长度len和套接字 fd 的发送缓冲的长度（因为待发送数据是要copy到套接字 fd 的发送缓冲区的，注意并不是send把 fd 的发送缓冲中的数据传到连接的另一端的，而是协议传的，send仅仅是把buf中的数据copy到 fd 的发送缓冲区的剩余空间里）：

1. 如果**len大于 fd 的发送缓冲区**的长度，该函数返回`SOCKET_ERROR`；
2. 如果**len小于或者等于 fd 的发送缓冲区**的长度，那么send先检查协议是否正在发送 fd 的发送缓冲中的数据，如果是就等待协议把数据发送完，如果协议还没有开始发送 fd 的发送缓冲中的数据或者 fd 的发送缓冲中没有数据，那么 send就比较**fd** 的发送缓冲区的剩余空间和**len**：
   1. 如果len大于剩余空间大小send就**一直等待**协议把 fd 的发送缓冲中的数据发送完；
   2. 如果len小于剩余空间大小send就仅仅把buf中的数据**copy**到剩余空间里。
3. 如果send函数copy数据成功，就**返回实际copy的字节数**，如果send在copy数据时出现**错误**或在等待协议传送数据时**网络断开**，那么send就返回`SOCKET_ERROR`。

send函数把buf中的数据成功copy到 fd 的发送缓冲区后就返回了，但此时这些数据并不一定马上被传到连接的另一端。如果协议在后续的传送过程中出现网络错误，那么下一个Socket函数就会返回`SOCKET_ERROR`。(每一个除send外的Socket函数在执行的最开始总要先等待套接字的发送缓冲中的数据被协议传送完毕才能继续，如果在等待时出现网络错误，那么该Socket函数就返回 SOCKET_ERROR）。



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

**select缺点：**

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
int poll(struct pollfd fdarray[]，unsigned long nfds，int timeout);
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

创建一个epoll实例。返回值为epoll实例的文件描述符，参数size标识该实例监听的最大数目。

- 当创建好epoll句柄后，它就是会占用一个fd值，在linux下如果查看/proc/进程id/fd/，是能够看到这个fd的，所以在使用完epoll后，必须调用close()关闭，否则可能导致fd被耗尽。
- size参数只是告诉内核这个 epoll对象会处理的事件大致数目，而不是能够处理的事件的最大个数。在 Linux最新的一些内核版本的实现中，这个 size参数没有任何意义。

内核事件表：包括文件描述符的分配、文件实体的分配等。文件描述符中有一个域很重要：**private_data域**，这是epoll的核心，其中有**内核事件表**、**就绪描述符队列**等信息。

![img](WebServer%E9%A1%B9%E7%9B%AE%E7%AC%94%E8%AE%B0/v2-bbe1af804032b9910917f046f2e1106b_720w.webp)

```cpp
int epoll_ctl(int epfd，int op，int fd，struct epoll_event *event);
```

- epfd：为`epoll_create`创建的句柄
- op：即操作，包含以下三个宏——
  1. **EPOLL_CTL_ADD** (注册新的fd到epfd)
  2. **EPOLL_CTL_MOD** (修改已经注册的fd的监听事件)
  3. **EPOLL_CTL_DEL** (从epfd删除一个fd)

- fd：需要监听的fd

- event：内核需要监听什么类型的事件，结构体如下——

```cpp
typedef union epoll_data {
    void *ptr;
    int fd;
    __uint32_t u32;
    __uint64_t u64;
} epoll_data_t;
struct epoll_event {
    uint32_t events;		/* Epoll events */
    epoll_data_t data;		/* User data variable */
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
int epoll_wait(int epfd，struct epoll_event *events，int maxevents，int timeout);
```

- **events**：分配好内存的 epoll_event结构体数组，epoll将会把发生的事件复制到 events数组中（events不可以是空指针，内核只负责把数据复制到这个 events数组中，不会去帮助我们在用户态中分配内存。内核这种做法效率很高）。
- **maxevents**：本次可返回的最大事件数目，通常 maxevents参数与预分配的events数组的大小是相等的。
- **timeout**：超时时间；为0，则表示 epoll_wait在 rdllist链表中为空，立刻返回，不会等待。为-1，则表示一直在等待，直至有事件发生。
- **return**：成功返回有多少文件描述符就绪，时间到时返回0，出错返回-1；



内核事件表的底层数据结构是红黑树，就绪描述符的底层数据结构是链表。

epoll_wait的功能就是不断查看就绪队列中有没有描述符，如果没有就一直检查、直到超时。如果有就绪描述符，就将就绪描述符通知给用户。



#### ET和LT

**ET**模式是高效模式，就绪描述符只通知用户一次，如果用户没做处理内核将不再进行通知；

**LT**模式比较稳定，如果用户没有处理就绪的描述符，内核会不断通知。

当为ET模式时，上边我们提到就绪描述符是用链表组织的，因此只需将**就绪部分断链发给用户**，而在LT模式下，用户没有处理就绪描述符时，内核会再次**将未处理的就绪描述符加入到就绪队列中重复提醒用户**空间。

由于内核对用户态的不信任,内核态和用户态的传输数据总是拷贝的。

区别在于：

当一个新的事件到来时，ET模式下当然可以从 epoll_wait调用中获取到这个事件，可是如果这次没有把这个事件对应的套接字缓冲区处理完，在这个套接字没有新的事件再次到来时，在 ET模式下是无法再次从 epoll_wait调用中获取这个事件的；而 LT模式则相反，只要一个事件对应的套接字缓冲区还有数据，就总能从 epoll_wait中获取这个事件。因此，在 LT模式下开发基于 epoll的应用要简单一些，不太容易出错，而在 ET模式下事件发生时，如果没有彻底地将缓冲区数据处理完，则会导致缓冲区中的用户请求得不到响应。默认情况下，Nginx是通过 ET模式使用 epoll的。



#### 阻塞与非阻塞

```cpp
#include <fcntl.h>
int fcntl(int fd，int cmd，long arg);
```

`fcntl()`针对文件描述符提供控制。参数fd是被参数cmd操作的描述符。

-  **F_SETFL** 设置arg标志参数，可选的几个标志是：O_APPEND、O_NONBLOCK、O_SYNC、O_ASYNC。
- **F_GETFL**  取得fd的文件状态标志,同上述(arg被忽略)   

**cmd常用例：**用命令`F_GETFL`和`F_SETFL`设置文件标志，比如阻塞与非阻塞。

```cpp
flags = fcntl(fd，F_GETFL);
flags |= O_NONBLOCK;
fcntl(fd，F_SETFL，flags);
```



### Linux信号

信号就是由用户、系统或进程发送给**目标进程**的信息，以通知目标进程中某个状态的改变或是异常。

#### sigaction 结构体

```cpp
struct sigaction {
    void     (*sa_handler)(int);
    void     (*sa_sigaction)(int，siginfo_t *，void *);
    sigset_t   sa_mask;
    int        sa_flags;
    void     (*sa_restorer)(void);
};
```

**1.sa_handler：指定信号关联函数**

输入为一个函数指针（函数名），即用户指定的信号处理函数。除此之外，还可以赋值为常数`SIG_IGN`表示**忽略信号**，赋值为常数`SIG_DFL`表示**执行系统默认动作**(采用缺省的处理方式)。

`typedef void (*__sighandler_t) (int);`

赋值为一个函数指针表示用自定义函数捕捉信号，或者说向内核注册了一个信号处理函数，该函数返回值为void，带一个int参数，通过参数可以得知当前信号的编号，这样就可以用同一个函数处理多种信号。

**2.sa_sigaction指定信号关联函数**

由`_sa_sigaction`是指定的信号处理函数带有三个参数，是为**实时信号**而设的（当然同样支持非实时信号），它指定一个3参数信号处理函数。第一个参数为信号值，第二个参数是指向siginfo_t结构的指针，结构中包含信号携带的数据值，第三个参数没有使用（posix没有规范使用该参数的标准）。

**sa_handler**主要用于不可靠信号（实时信号当然也可以，只是不能带信息），**sa_sigaction**用于实时信号可以带信息(siginfo_t)，两者不能同时出现（如果设置了`SA_SIGINFO`标志位，则会使用`sa_sigaction`处理函数，否则使用`sa_handler`处理函数。）。

**3.sa_mask存放需要手动屏蔽的信号**

指定在信号处理程序执行过程中，哪些信号应当**被阻塞**。缺省情况下当前信号本身被阻塞，防止信号的嵌套发送，除非指定`SA_NODEFER`或者`SA_NOMASK`标志位，处理程序执行完后，被阻塞的信号开始执行。

**4.sa_flags指定一组修改信号行为的标志**

**5.sa_restorer**：已过时，POSIX不支持它，不应再被使用。



#### sigfillset()

`int sigfillset (sigset_t *set);`

初始化一个满的信号集，集合当中有所有的信号，所有的信号都被添加到这个集合中了。用于初始化上述结构体中的 `sa_mask`。



#### sigaction()

**检查或修改指定信号的设置(或同时执行)**

`int sigaction(int signum,const struct sigaction *act,const struct sigaction *old);`

- **signum：**为信号的值，可以为除`sigkill`及`sigstop`外的任何一 个特定有效的信号（为这两个信号定义自己的处理函数，将导致信号安装错误）
- **act：**要设置的对信号的新处理方式(传入)
- **oldact：**原来对信号的处理方式(传出)
- 如果act指针非空，则要改变指定信号的处理方式，如果oldact指针非空 则系统将此前指定信号的处理方式引入 oldact。
- 返回值:函数成功返回0，失败返回-1。



#### alarm()

`unsigned int alarm(unsigned int seconds);`

设置定时器(闹钟)。在指定seconds后，内核会给当前进程发送**SIGALRM**信号。进程收到该信号，默认动作终止。每个进程都有且只有唯一的一个定时器。

返回0或剩余的秒数，无失败。

取消定时器`alarm(0)`，返回旧闹钟余下秒数。

alarm使用的是自然定时法，与进程状态无关，就绪、运行、挂起(阻塞、暂停)、终止、僵尸…无论进程处于何种状态，alarm都计时。



#### SIGPIPE信号

当服务器close一个连接时，若client端接着发数据，根据TCP协议的规定，会收到一个RST响应，client再往这个服务器发送数据时，系统会发出一个SIGPIPE信号给进程，告诉进程这个连接已经断开了，不要再写了。

 对一个对端已经关闭的socket调用两次write，第二次将会生成**SIGPIPE**信号，该信号的**缺省处理方法为结束进程**。为了避免进程退出，需要重载这个信号的处理方法。

结合TCP的"四次握手"关闭：TCP是全双工的信道，可以看作两条单工信道，TCP连接两端的两个端点各负责一条。当对端调用close时，虽然本意是关闭整个两条信道，但本端只是收到FIN包。按照TCP协议的语义，表示对端只是关闭了其所负责的那一条单工信道，仍然可以继续接收数据。也就是说，因为TCP协议的限制，一个端点无法获知对端的socket是调用了close还是shutdown。

因此第一次对其调用write方法时，如果发送缓冲没问题，会返回正确写入(发送)。但发送的报文会导致对端发送RST报文，因为对端的socket已经调用了close，完全关闭，既不发送，也不接收数据。所以，第二次调用write方法(假设在收到RST之后)，会生成**SIGPIPE**信号，导致进程退出。

为了避免进程退出，可以捕获**SIGPIPE**信号，或者忽略它，给它设置**SIG_IGN**信号处理函数。这样，第二次调用write方法时，会返回-1，同时errno置为**SIGPIPE**。程序便能知道对端已经关闭。



#### SIGALRM信号

在进行阻塞式系统调用时，为避免进程陷入无限期的等待，可以为这些阻塞式系统调用设置定时器。Linux提供了上述的`alarm`系统调用和**SIGALRM**信号实现这个功能。

如果客户端长时间没有与服务器进行交互，需要服务器在一定时间之后主动关闭socket连接。在这种场景下，就可以在服务器收到客户端的socket的连接时，设置一个定时信号，然后在定时信号到来时，关闭掉socket连接。



#### SIGTERM信号

SIGINT、SIGKILL、SIGTERM，三者都是结束/终止进程运行，但略微有区别。

**SIGINT**

- 产生方式：键盘Ctrl+C
- 产生结果：只对当前前台进程，和他的所在的进程组的每个进程都发送`SIGINT`信号，之后这些进程会执行信号处理程序再终止。

**SIGKILL**

- 产生方式：和任何控制字符无关,用`kill`函数发送。
- 本质：相当于`shell> kill -9 pid`。
- 产生结果：当前进程收到该信号（该信号无法被捕获），也就是说进程无法执行信号处理程序，会直接发送默认行为——直接退出。这也是为何`kill -9 pid`一定能杀死程序的原因。故这也造成了进程被结束前无法清理或者关闭已分配的资源，这样是不好的。

**SIGTERM**

- 产生方式：和任何控制字符无关，用`kill`函数发送。
- 本质：相当于`shell> kill`不加-9时 pid。
- 产生结果：当前进程会收到信号，而其子进程不会收到。如果当前进程被kill(即收到SIGTERM)，则其子进程的父进程将为init，即pid为1的进程。
- 与SIGKILL的不同：SIGTERM**可以被阻塞、忽略、捕获**，即可以进行信号处理程序，那么这样就可以让进程很好的终止，允许清理和关闭文件。



### MySQL

#### mysql_init()

`MYSQL* mysql_init(MYSQL *mysql)`

**返回值**: 返回MYSQL结构体对象。如果无足够内存以分配新的对象，返回`nullptr`。

**说明：**

如果输入是 `nullptr`，该函数将分配、初始化、并返回新对象。否则，将初始化对象，并返回对象的地址。

如果分配了新的对象，应当在程序中调用mysql_close() 来关闭连接，以释放对象。



#### mysql_real_connect()

尝试与运行在主机上的MySQL数据库引擎建立连接。

```cpp
MYSQL* mysql_real_connect(MYSQL *mysql, const char *host, const char *user, const char *passwd, const char *db, unsigned int port, const char *unix_socket, unsigned long client_flag); 
```

**返回值：**如果连接成功，返回MYSQL*连接句柄（与第一个输入相同）。如果连接失败，返回 `nullptr`。

**参数：**

**host**：MYSQL服务器的地址；如果为空或字符串"localhost"，连接将被视为与本地主机的连接。如果操作系统支持套接字（Unix）或命名管道（Windows），将使用它们而不是TCP/IP连接到服务器。

**user**：登录用户名；如果为空，用户将被视为当前用户。在UNIX环境下，它是当前的登录名。

**db**：要连接的数据库，如果db为空，连接会将默认的数据库设为该值。

**unix_socket**：unix连接方式。如果unix_socket不是NULL，该字符串描述了应使用的套接字或命名管道。注意，“host”参数决定了连接的类型。

**client_flag**：Mysql运行为ODBC数据库的标记，一般取0。



#### mysql_close()

关闭前面打开的连接。如果句柄是由`mysql_init()`或`mysql_connect()`自动分配的，`mysql_close()`还将解除分配由mysql指向的连接句柄。

`void mysql_close(MYSQL *mysql);`



#### mysql_query()

执行query语句，查询数据库表中的内容。

`int mysql_query(MYSQL *mysql, const char *query);`

正常情况下，字符串必须包含1条SQL语句，而且不应为语句添加终结分号（‘;’）或“\g”。

如果允许多语句执行，字符串可包含多条由分号隔开的语句。（“多查询执行的C API处理”）

不能用于包含二进制数据的查询。



#### mysql_store_result()

将 mysql_query 查询的全部结果读取到客户端，`分配1个MYSQL_RES结构`，并将结果置于该结构中。

`MYSQL_RES *mysql_store_result(MYSQL *mysql);`

使用说明：

- 对于成功检索了数据的每个查询（SELECT、SHOW、DESCRIBE、EXPLAIN、CHECK TABLE等），必须调用mysql_store_result() 或 mysql_use_result() 。
- 如果希望了解查询是否应返回结果集，可使用 **mysql_field_count**() 进行检查。
- 如果查询未返回结果集，将返回*Null指针*（例如，如果查询是INSERT语句）。
- 如果读取结果集失败，会返回*Null指针*。通过检查 **mysql_error**() 是否返回非空字符串，**mysql_errno**() 是否返回非0值，或 **mysql_field_count**() 是否返回0，可以检查是否出现了错误。
- 如果未返回行，将返回*空的结果集*。（空结果集设置不同于作为返回值的空指针）。
- 一旦获得了*不是Null指针的结果*，可调用 **mysql_num_rows**() 来获取结果集中的行数。
- 可以调用 **mysql_fetch_row**() 来获取结果集中的行，或调用 **mysql_row_seek**() 和**mysql_row_tell**() 来获取或设置结果集中的当前行位置。
- 一旦完成了对结果集的操作，必须调用 **mysql_free_result**()。



#### mysql_fetch_row()

从结果集中获取下一行，若没有下一行，返回空指针。

```cpp
typedef char** MYSQL_ROW;
MYSQL_ROW mysql_fetch_row(MYSQL_RES* result);
```

- 行内值的数目由mysql_num_fields(result)给出。如果行中保存了调用mysql_fetch_row()返回的值，将按照row[0]到row[mysql_num_fields(result)-1]，访问这些值的指针。
- 可以通过调用mysql_fetch_lengths()来获得行中字段值的长度。对于空字段以及包含NULL的字段，长度为0。通过检查字段值的指针，能够区分它们。如果指针为NULL，字段为NULL，否则字段为空。



### HTTP

#### 请求报文

![在这里插入图片描述](WebServer%E9%A1%B9%E7%9B%AE%E7%AC%94%E8%AE%B0/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAMl9QUQ==,size_20,color_FFFFFF,t_70,g_se,x_16.png)

#### 响应报文

![在这里插入图片描述](WebServer%E9%A1%B9%E7%9B%AE%E7%AC%94%E8%AE%B0/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAMl9QUQ==,size_20,color_FFFFFF,t_70,g_se,x_16-16909889143773.png)

#### 请求方法

![img](WebServer%E9%A1%B9%E7%9B%AE%E7%AC%94%E8%AE%B0/73b3056eeb3fe6bc8cbbb54ec1fcf0a7.jpeg)

#### 状态码

![在这里插入图片描述](WebServer%E9%A1%B9%E7%9B%AE%E7%AC%94%E8%AE%B0/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAMl9QUQ==,size_20,color_FFFFFF,t_70,g_se,x_16-16909895342368.png)



### Reactor模式

详情参考 [Proactor模式&Reactor模式详解 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/622210396)



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
     Loaded：loaded (/lib/systemd/system/mysql.service; enabled; vendor preset：enabled)
     Active：active (running) since Tue 2023-07-11 06:28:50 PDT; 3min 22s ago
   Main PID：4805 (mysqld)
     Status："Server is operational"
      Tasks：37 (limit：6984)
     Memory：364.6M
     CGroup：/system.slice/mysql.service
             └─4805 /usr/sbin/mysqld

Jul 11 06:28:49 ubuntu systemd[1]：Starting MySQL Community Server...
Jul 11 06:28:50 ubuntu systemd[1]：Started MySQL Community Server.
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



### 线程池

#### 概念

线程池是一种并发编程技术，它能有效地管理并发的线程、减少资源占用和提高程序的性能。

线程池在系统启动时即创建大量空闲的线程。程序将一个任务传给线程池，线程池就会启动一条线程来执行这个任务，执行结束以后，该线程并不会死亡，而是再次返回线程池中成为空闲状态,在这里说是空闲状态其实是被条件变量阻塞了，等待执行下一个任务。

#### 优势

**1.提高性能与资源利用率**

线程池主要解决两个问题：**线程创建与销毁的开销**以及**线程竞争造成的性能瓶颈**。通过预先创建一组线程并复用它们，线程池有效地降低了线程创建和销毁的时间和资源消耗。同时，通过管理线程并发数量，线程池有助于减少线程之间的竞争，增加资源利用率，并提高程序运行的性能。

**2.线程创建开销解决**

多线程环境下，每当需要执行一个任务时，创建与销毁线程都需要额外的系统资源。线程池通过预先创建一定数量的线程，可以减少这种资源消耗。

**3.线程竞争问题解决**

过多的线程可能导致线程竞争，影响系统性能。线程池通过维护一个可控制的并发数量，有助于减轻线程之间的竞争。例如，当CPU密集型任务和I/O密集型任务共存时，可以通过调整线程池资源，实现更高效的负载平衡。



#### 1.线程池初始化

##### 线程创建

维护一个指定大小 `_thread_num` 的线程id的数组 `_threads`，存储所有创建的线程。

循环调用 `pthread_create` 和 `pthread_detach` 库函数，创建线程。

```cpp
int pthread_create(pthread_t *thread，const pthread_attr_t *attr,
           		   		void *(*start_routine) (void *)，void *arg);
```

- **thread**：传递存储线程（pthread_t变量）的地址
- **attr**：手动设置新建线程的属性，如线程的调用策略、线程所能使用的栈内存的大小等。默认为NULL
- **start_routine**：以函数指针的方式指明新建线程需要执行的函数，该函数的参数最多有 1 个（可以省略不写），形参和返回值的类型都必须为 void\* 类型。*如果该函数有返回值，则线程执行完函数后，函数的返回值可以由 pthread_join() 函数接收。*
- **arg**：指定传递给 `start_routine` 函数的实参，当不需要传递任何数据时，将 arg 赋值为 NULL 即可。
- **返回值**：成功返回0。失败返回非0值，常见有：
  1. **EINVAL** == 22：传递给 pthread_create() 函数的 attr 参数无效。
  2. **EAGAIN** == 11：系统资源不足，无法提供创建线程所需的资源。

定义一个静态函数作为第三个参数传入，用于**运行工作线程**（从任务队列中取任务并执行）。为了使得函数能正常访问其他非静态成员变量，将`this`指针（**本实例**）作为第四个参数传入，实现在静态函数中调用实例的方法（具体的工作线程运行实现）。

```cpp
int pthread_detach (pthread_t __th)		// 返回值：0 - 成功；非0 - 失败 
```

pthread有两种状态：**joinable**状态和**unjoinable**状态。

- **joinable**状态：当线程函数自己返回退出时或pthread_exit时都不会释放线程所占用堆栈和线程描述符。只有当你调用了`pthread_join`之后这些资源才会被释放。默认为此状态。
- **unjoinable**状态：这些资源在*线程函数退出*时或`pthread_exit`时**自动会被释放**。

unjoinable属性可以在`pthread_create`前指定，或在线程创建后在线程中`pthread_detach`。

##### 配置参数

```cpp
std::vector<pthread_t> _threads;    // 存储线程的数组，大小为 _thread_num
int _thread_num;                    // 线程池中的线程数
std::atomic<bool> _run;             // 原子布尔变量，标记线程终止运行

int _max_requests;                  // 请求队列中允许的最大请求数
std::list<T*> _taskqueue;           // 请求任务队列

MutexS _queue_mutex;                // 保护请求队列的互斥锁
SemS _queue_sem;                    // 通知线程的信号量
```

##### 任务队列初始化

1. 维护一个**任务队列** `list<T*>` 管理待执行任务；
2. 维护一个**互斥锁**（自实现），保护请求队列；
3. 维护一个**xin'hao量**（自实现），告诉线程池是否有任务需要处理。



#### 2.任务调度

**任务队列管理**

线程池需要提供添加任务的接口，将接收到的任务加入任务队列。在添加任务的过程中，需使用互斥量锁住任务队列以实现同步访问。任务添加成功后，通知等待中的线程有新任务可以执行。

```cpp
template <typename T>
bool ThreadPool<T>::append(T *req) {
    _queue_mutex.lock();
    if (_taskqueue.size() >= _max_requests) {
        _queue_mutex.unlock();
        return false;
    }
    _taskqueue.push_back(req);
    _queue_mutex.unlock();
    _queue_sem.post();
    return true;
}
```

##### 线程取任务执行

线程执行体应按照预设策略从任务队列中获取任务并执行。获取任务时，需要在条件变量上等待，直到有新任务或线程池被终止。任务获取成功后，线程从队列中移除任务并执行。执行完成后，线程可以被再次复用。

```cpp
template <typename T>
void ThreadPool<T>::work() {
    while (true) {
        _queue_sem.wait();
        _queue_mutex.lock();
        if (_taskqueue.empty()) {
            _queue_mutex.unlock();
            continue;
        }
        T* request = _taskqueue.front();
        _taskqueue.pop_front();
        _queue_mutex.unlock();
        if (!request)
            continue;
        // handle
    }
}
```

##### 任务状态跟踪

为了确保任务的执行正确性和完整性，可以使用一定机制来跟踪任务的状态。例如：

- 任务开始时，记录任务运行的开始时间。
- 任务执行期间，跟踪任务的进度，如百分比、耗时等。
- 任务结束时，记录任务的结束状态，如正常完成、出错等。

通过跟踪任务状态，可以调整线程池的执行策略，以适应不同类型的任务需求。同时及时发现并处理任务执行中的异常，提高线程池的稳定性和可靠性。



#### 3.线程池的终止

##### 标记线程池终止状态

在线程池类中，添加一个原子布尔类型的成员变量 `_run`，当线程池需要终止时，将其设置为 `false`。在线程取任务的过程中，会检查 `_run` 变量，根据其值决定继续执行或退出。(*替换2.2中while的判断条件*)

##### 等待线程执行完成

在线程池析构函数中，需要等待所有线程执行完成。将`_run`标记设置为`false`，线程函数执行完一遍后即跳出循环，因为之前已被**detach**，因此会由系统自动释放资源。



#### 4.动态调整线程数

##### 增加线程数

```cpp
bool ThreadPool<T>::append_thread(int new_num) {
    if(!_dynamic_ctl)   return false;
    _threads.resize(_thread_num + new_num);
    for(int i = 0; i < new_num; ++i) {
        if(pthread_create(&_threads[_thread_num + i]，NULL，transfer，(void*)this)) {
            return false;
        }
        if(pthread_detach(_threads[_thread_num + i])) {
            return false;
        }
    }
    _thread_num += new_num;
    return true;
}
```

##### 减少线程数 TODO

不太好搞，可以通过设置一个信号量判断还需要删除几个线程。在删除函数中，循环对该信号量`post`，并添加一个空任务到任务队列中。在工作线程中，取出空的任务时，使用`trywait` 判断是否需要删除该线程，若删除则直接break掉while循环，退出函数后**该线程自动释放**。

问题也就在这里，当线程释放后，其id依旧保留在线程数组中，那么何时去更新这个数组才能保证那些线程都退出释放了呢？又如何判断哪个线程id是被释放了需要删除呢（pthread库中找不到`pthread_kill`函数了，且该函数也不稳定）？

这是因为线程被`detach`了的缘故，如果是 joinable 模式，用join释放可能比较容易一些？



#### 5.自定义任务调度策略 TODO

设置任务优先级，使用优先队列实现。但是这样无法实现线程池的泛型了？



#### 6.监控线程池状态

```cpp
int get_thread_num() const { return _thread_num; }
int get_task_num() const { return _taskqueue.size(); }
int get_completed_task_num() const { return _completed_tasknum.load(); }
double get_run_time() const { 
    std::chrono::duration<double> diff = std::chrono::steady_clock::now() - start_time; 
    return diff.count();
}
```



### 定时器

如果一个客户端与服务器长时间连接，并且不进行数据的交互，这个连接就没有存在的意义还占据了服务器的资源。在这种情况下，服务器就需要一种手段检测无意义的连接，并对这些连接进行处理。除了处理非活跃的连接之外，服务器还有一些定时事件，比如关闭文件描述符等。为实现这些功能，服务器就需要为各事件分配一个定时器。

该项目使用SIGALRM信号来实现定时器，首先每一个定时事件都处于一个升序链表上，**通过alarm()函数周期性触发SIGALRM信号**，而后信号回调函数利用管道通知主循环，主循环接收到信号之后对升序链表上的定时器进行处理：若一定时间内无数据交换则关闭连接。



### 数据库连接池

每一次数据访问请求都必须经过下面几个步骤：建立数据库连接，打开数据库，对数据库中的数据进行操作，关闭数据库连接。而建立数据库连接和打开数据库是一件很消耗资源并且费时的工作，如果在系统中很频繁的发生这种数据库连接，必然会影响到系统的性能，甚至会导致系统的崩溃。

在系统初始化阶段，建立一定数量的数据库连接对象(Connection)，并将其存储在连接池中定义的容器中。

1. 当有数据库访问请求时，就从连接池中的这个容器中拿出一个连接。
2. 当容器中的连接已用完，且还未达到系统定义的最大连接数时，可以再创建一个新的连接。（不一定实现）
3. 当当前使用的连接数达到最大连接数时，就要等待其他访问请求将连接放回容器后才能使用。
4. 当使用完连接的时候，必须将连接放回容器中。

这样不同的数据库访问请求就可以共享这些连接，通过重复使用这些已经建立的数据库连接，可以解决频繁建立连接的缺点，从而提高了系统的性能。**数据库连接池跟线程池的思想基本是一致的**。

#### 单例模式

因为池子只需要一个，所以采用**单例模式**。

单例模式属于创建型模式，它提供了一种创建对象的最佳方式。这种模式涉及到一个单一的类，该类负责创建自己的唯一的对象。该对象外界可以获取到，但是不能创建和拷贝。

通俗的讲：单例模式就是说每一个类只有单一的一个对象，并且这个对象由**该对象自己创建**。如果让外部调用构造函数或者拷贝构造函数等，很难保证外部只创建了一个实例对象。

**单例模式的最佳方式：**

C++11规定了local static在多线程条件下的初始化行为，要求编译器保证了内部静态变量的线程安全性。在C++11标准下，《Effective C++》提出了一种更优雅的单例模式实现，使用函数内的 **local static 对象**。这样，只有当第一次访问`getInstance()`方法时才创建实例。。C++0x之后该实现是线程安全的，C++0x之前仍需加锁。

```cpp
class Singleton {
private:
	Singleton() { };
	~Singleton() { };
public:
	static Singleton& getInstance() {
		static Singleton instance;
		return instance;
	}
};
```

在该项目中不仅实现了数据库连接池，还将数据库连接的获取与释放通过RAII机制封装，避免手动释放。



### HTTP处理流程

HTTP的处理流程分为以下三个步骤：

1. **连接处理：**浏览器端发出http连接请求，主线程创建http对象接收请求并将所有数据读入对应buffer，将该对象插入任务队列，等待工作线程从任务队列中取出一个任务进行处理。
2. **解析请求报文：**工作线程取出任务后，调用进程处理函数，通过主、从状态机对请求报文进行解析。
3. **生成响应报文：**解析完之后，明确用户想要进行的操作（跳转到对应的界面、添加用户名、验证用户等等）并将相应的数据写入响应报文。
4. **返回响应报文给客户端：**将响应报文发回给客户端。

#### Reactor模式-TODO

本项目采用 **多 Reactor 多线程**的方案。[Proactor模式&Reactor模式详解 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/622210396)

![img](WebServer项目笔记/v2-4855471687db6a2bd80f1cbd7186414a_720w.webp)

#### 1.连接处理

- 主线程是**基于事件驱动的loop**，通过 epoll 监控连接建立、断开和读取、发送事件。
- 主线程阻塞于`epoll_wait`，当有事件发生后，分为以下几种状态：
  1. 接受到**连接建立**事件，主线程通过 `accept` 获取连接，并将该TCP连接加入内核事件表，初始化该连接的http类对象，设置该连接的定时器并加入定时器管理链表中；
  2. 接受到**连接断开**事件，主线程通过定时器回调函数关闭该连接，并从内核事件表中删除。
  3. 接收到**读取、发送**事件，将该连接的http类对象加入线程池的任务队列中，等待空闲线程处理。

*多 Reactor 多线程*的方案虽然看起来复杂的，但实现时比*单 Reactor 多线程*的方案要简单的多，原因如下：

- 主线程和子线程分工明确，主线程只负责接收新连接，子线程负责完成后续的业务处理。
- 主线程和子线程的交互很简单，主线程只需要把新连接传给子线程，子线程无须返回数据，直接就可以在子线程将处理结果发送给客户端。



#### 2.解析报文请求

[最新版Web服务器项目详解 - 05 http连接处理（中） (qq.com)](https://mp.weixin.qq.com/s?__biz=MzAxNzU2MzcwMw==&mid=2649274278&idx=7&sn=d1ab62872c3ddac765d2d80bbebfb0dd&chksm=83ffbefeb48837e808caad089f23c340e1348efb94bef88be355f4d9aedb0f9784e1f9e072b1&cur_album_id=1339230165934882817&scene=189#wechat_redirect)



#### 3.生成响应报文

[最新版Web服务器项目详解 - 06 http连接处理（下） (qq.com)](https://mp.weixin.qq.com/s?__biz=MzAxNzU2MzcwMw==&mid=2649274278&idx=8&sn=a6b011ad877d865608dcec7130df0c2f&chksm=83ffbefeb48837e838ec4e001e5ad05dd1930d821ad4114c10d4b59bfabb166bc25b0db1f71b&cur_album_id=1339230165934882817&scene=189#wechat_redirect)



#### 4.返回响应报文

[最新版Web服务器项目详解 - 06 http连接处理（下） (qq.com)](https://mp.weixin.qq.com/s?__biz=MzAxNzU2MzcwMw==&mid=2649274278&idx=8&sn=a6b011ad877d865608dcec7130df0c2f&chksm=83ffbefeb48837e838ec4e001e5ad05dd1930d821ad4114c10d4b59bfabb166bc25b0db1f71b&cur_album_id=1339230165934882817&scene=189#wechat_redirect)



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

`ERROR 1819 (HY000)：Your password does not satisfy the current policy requirements`

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

**问题：**`fatal error：mysql/mysql.h：No such file or directory`

**原因：**没有安装 **mysql**的**相关链接库**

**解决：**`sudo apt-get install libmysqlclient-dev`



#### 关于g++

**问题：**`make：g++：Command not found`

**原因：**没有安装 **g++** 编译器

**解决：**`sudo apt-get install build-essential`

**拓展：** **build-essential** 是 Ubuntu 软件源默认包含的一个软件包组，它包含了 GNU 编辑器集合，GNU 调试器，和其他编译软件所必需的开发库和工具，也包括 `gcc` ，`g++` 和 `make`。



# 面经

https://www.nowcoder.com/discuss/419276598265827328

## 项目简述

项目总体的框架采用的是单Reactor多线程模型。主线程通过IO多路复用监听多个文件描述符上的事件。在负责连接的建立和断开的同时完成事件的分发，将读写和逻辑处理任务加入线程池里的任务队列，并唤醒线程负责完成相应操作，实现任务的并行处理。在应用层面实现心跳机制，通过定时器来清除不活跃的连接减少高并发场景下不必要的系统资源的占用【文件描述符的占用、维护一个TCP连接所需要的资源】 。对于读取的HTTP报文，采用了有限状态机和正则表达式进行解析，资源的响应则通过集中写（writev）和内存映射（mmap）的方式进行传输。



## 项目难点

项目的整体规划、框架设计，以及围绕高并发进行的一系列优化。（线程安全）

**如何解决？**

通过采用从局部到整体的设计思想。先使用单一线程完成串行的HTTP连接建立、HTTP消息处理和HTTP应答发送，然后围绕高并发这个核心扩展多个模块。首先就是引入IO多路复用实现单线程下也能在一次系统调用中同时监听多个文件描述符，再进一步搭配线程池实现多客户多任务并行处理，这是高并发的核心部分。在这个基础上做一点优化，在应用层实现了心跳机制，通过定时器实现非活跃连接的一个检测和中断，减少系统资源（内存）不必要的浪费。最后将所有模块整合起来，实现一个单Reactor多线程的网络设计模式，将多个模块串联起来实现完整高并发的服务器程序。

线程安全这块是通过不断将锁的粒度降低，平衡性能和安全。一开始采用粒度较粗的锁实现互斥（通常是整个操作），然后慢慢分析将一些不共享的代码移出临界区，慢慢调整慢慢优化。



## 项目瓶颈

瓶颈在于整个框架网络设计模式的选择以及线程池的设定。首先网络设计模式采用的的是单Reactor模型，在主线程里使用一个复用IO承担了**所有事件的监听**，包括读写事件和新连接的到来。这样的一个缺点就是当瞬间并发量高的时候，往往新连接不能被及时处理【epoll_wait调用返回的数据存放在用户指定的缓冲区，这部分缓冲区有一定的上限】。然后另一方面是关于线程池的线程数量这一块，线程池线程数量是在构造时就确定的，不能根据机器的核心数量动态调整（需要修改源码去设定），固定的线程数量在核心过少或者过多的机器上都会有性能损失（可以通过使用普通线程和核心线程进行优化）。

**如何改进？**

首先是单Reactor模型，可以采用Proactor模型或者多Reactor模型进行改进。Proactor模型对异步IO有要求，而在Linux上没有相关的异步IO系统调用，一般都是采用同步模拟（由主线程完成IO操作）去实现，相比之下强行模拟的效果不如采用单Reactor（这个时候主线程承担了太多工作）。另一个改良方案采用多Reactor模型，主线程只负责新连接到达的监听以及新连接的建立，对于**新到达的连接通过****生产者消费者模型****分发给子Reactor（另起线程），由子Reactor完成已建立连接的读写事件监听任务**。这样当有瞬间的高并发连接时，也不会出现新连接丢失的情况。

另一个是关于线程池线程数量设定的优化。可以通过普通线程（临时创建用来响应多余的任务）和核心线程（一直存在）来优化【实现较为复杂】



## 设计模式

### Reactor和Proctor区别

**Reactor**是采用IO多路复用监听事件，对于到达的时间根据类型进行任务分发，通常是交给线程池处理。（即负责监听和分发事件）

**Proctor**模型采用的是异步IO，只负责发起IO操作，真正的IO实现由操作系统处理。然后任务池从指定的缓冲区取出数据进行操作，只考虑逻辑处理不需要处理IO操作。



### 同步IO和异步IO的区别

同步IO和异步IO的区别主要在于获取数据的方式不同。

**同步IO**是内核通知用户可以进行读写操作，需要用户手动使用函数进行系统调用陷入内核，将内核数据拷贝到用户缓冲区。

**异步IO**则是通过系统调用向内核发起通知，告知要进行的IO操作并指明存放的缓冲区，当内核完成IO操作时再通知用户（通常是回调函数实现），此时用户得到的是已经准备好的数据，没有中间阻塞的IO操作。



### 什么是Reactor模型？

Reactor 模型是一种用于处理并发 I/O 操作的设计模式，主要用于构建高性能的网络服务器和应用程序。它将事件处理分为两个关键部分：事件的监控和事件的分发。

- 通常使用epoll来监控各个事件源（网络套接字、文件描述符、定时器等，它们会产生各种事件，如连接建立、数据可读、数据可写等）。
- Reactor 是一个事件循环，它负责等待事件发生，并在事件发生时通知相应的事件处理器。Reactor 通常是单线程或者有限数量线程。
- 事件处理器是具体的业务逻辑代码，它们负责处理特定类型的事件。每个事件处理器都注册到 Reactor 中，以便在相应的事件发生时得到通知，并执行相应的操作。事件处理器可以是回调函数、对象方法或者其他形式的处理代码。



## IO多路复用

### select、poll、epoll 的区别

![img](WebServer项目笔记/16978990259002.png)

- 当有事件触发时，select和poll需要用户自己去遍历文件描述符找出触发的事件，而epoll能够直接返回所有的触发事件；
- 每次调用select和poll都需要将文件描述符集合拷贝到内核空间，返回时再拷贝一次。而epoll只需要拷贝需要修改的文件描述符而不需要集体的拷贝；

### epoll一定高效吗？

epoll适用于需要**观察大量事件**的场景。

- select能够监听的事件数量有最大文件描述符的上限，一般是1024个，而且每次调用时都需要将文件描述符集合在内核和用户之间进行拷贝。poll没有文件描述符数量的限制，不过和select一样，每次调用都要将文件描述符集合在内核和用户之间进行拷贝，每次有事件触发时，需要遍历所有文件描述符找出触发的事件；
- 而epoll只需要往内核空间里的红黑树添加修改或者删除指定的文件描述符和事件，不需要每次都拷贝所有的文件描述符集合到内核当中去，同时也能够通过链表维护的就绪事件列表，直接返回就绪事件无需重复遍历文件描述符集合。

所以在需要监听多个文件描述符上的事件的时候，选用epoll更有效率，内核直接返回触发事件。

但是当需要监听的文件描述符数量少且较为活跃的情况下，select和poll相比epoll更有效率，因为其省去了触发感兴趣事件时的函数回调操作（将数据从红黑树上添加到就绪链表中）。



## 为什么使用非阻塞 socket

### listenfd

对于监听socket来说，主要是为了避免`accept()`函数的阻塞——当监听到新连接到来但双方未能成功建立连接，则会导致阻塞在accept函数中，程序死机。

### clientfd

对于客户端socket来说，主要是避免`send()`和`recv()`函数的阻塞。epoll返回读写事件，但不一定真的可读写。

在Linux下，`select()` 可能会将一个 socket 文件描述符报告为 “准备读取”，而后续的读取块却没有。例如，当数据已经到达，但经检查后发现有错误的校验和而被丢弃时，就会发生这种情况。也有可能在其他情况下，文件描述符被错误地报告为就绪。此时，就会导致程序阻塞在读写函数中，导致程序死机。

另外，socket是否阻塞只会影响socket相关的API函数，即 connect / accept / send / recv 。而`epoll_wait()`是否阻塞取决于其输入参数`timeout`。若设置为0则表示就绪列表为空时，直接返回；而设置为-1则表示为列表空时阻塞，项目中使用的是**阻塞态**。



## 定时器

基于升序链表实现。定时器以超时时间作为升序，越靠前的节点越接近超时。

设置ALARM信号触发回调函数，通过双向管道给主线程发送信息。主线程接收到该信息后，将遍历链表删除所有的超时连接。而当主线程接收到读、写事件时，根据哈希表（key是文件描述符）找到对应的定时器节点并更新超时时间。



## HTTP

### 如何实现对POST请求的解析？

。。。。。。



### 有用到mmap吗？

主要用于有文件资源请求时的文件传输。

**好处？**

1. **零拷贝**（Zero-Copy）： `mmap` 允许在文件和内存之间进行零拷贝操作。传统的文件读取和修改通常涉及从文件到用户空间缓冲区的数据复制，然后再将数据从用户空间缓冲区复制到内核缓冲区。`mmap` 允许文件内容直接映射到进程的地址空间，从而避免了这两次数据复制，提高了文件传输的效率。
2. **减少系统调用**： 使用 `mmap` 时，文件可以视为内存的一部分，而不必频繁地使用 `read` 或 `write` 等系统调用来进行读取和写入操作。这减少了系统调用的次数，减少了上下文切换，从而提高了性能。
3. **延迟加载**： `mmap` 允许文件的部分内容在需要时才加载到内存中。当你访问映射的文件的某个部分时，只有那部分数据才会被加载到内存，这对于大型文件非常有用，因为不必一次性将整个文件加载到内存中。
4. 

### writev() 函数？

使用read()将数据读到**不连续的**内存、使用write()将**不连续的内存发送出去**，要经过**多次的调用。**

如果要从文件中读一片连续的数据至进程的**不同**区域，有两种方案，write同理：

- ①使用read()一次将它们读至一个较大的缓冲区中，然后将它们分成若干部分复制到不同的区域；
- ②调用read()若干次分批将它们读至不同区域。

但是多次系统调用+拷贝会带来较大的开销，所以UNIX提供了另外两个函数—readv()和writev()，它们**只需一次系统调用**就可以实现在文件和进程的**多个缓冲区之间**传送数据，免除了多次系统调用或复制数据的开销。

在一次函数调用中：

- writev以顺序iov[0]、iov[1]至iov[iovcnt-1]从各缓冲区中聚集输出数据到fd。
- readv则将从fd读入的数据按同样的顺序散布到各缓冲区中，readv总是先填满一个缓冲区，然后再填下一个。

![img](WebServer项目笔记/16978990259001.png)



## GDB调试

进入gdb前需要在编译可执行文件时加上 `-g` 选项，编译器为了生成尽可能小的可执行文件默认是不带的。

之后通过 `gdb 可执行文件名` 进入调试模式。

- **b**：打断点（b 函数名或者b 文件:行号）
- **r**：运行
- **k**：结束
- **n**：单步调试不进入
- **s**：单步调试进入
- **bt**：查看函数调用栈
- **info b**：查看所有断点信息
- **info r**：查看寄存器的值
- **d num**：删除序号为num的断点（可以通过info b查看）
- **clear**：清空断点
- **watch**：监控变量（前提是在执行到当前时该变量存在），运行后每当该变量值改变就停下
- **回车**：执行上一个命令
- **layout src**：显示代码的图形界面
- **layout** **asm**：显示汇编代码的图形界面
