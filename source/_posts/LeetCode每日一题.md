---
title: LeetCode每日一题
date: 2022-11-04 14:33:06
categories: 原理
tags: 
- 算法
- CPP
---

# 记录每日一题

## 2022.11.4

### 754.到达终点数字

#### 题干

在一根无限长的数轴上，你站在**0**的位置，终点在**target**的位置。

你可以做一些数量的移动 **numMoves** :

- 每次你可以选择向左或向右移动。
- 第 **i** 次移动（从  i == **1** 开始，到 i == **numMoves** ），在选择的方向上走 **i** 步。

给定整数 **target** ，返回：到达目标所需的最小移动次数(即最小 **numMoves**）

**示例**

```
输入: target = 2
输出: 3
解释:
第一次移动，从 0 到 1; 第二次移动，从 1 到 -1; 第三次移动，从 -1 到 2 。
```

```
输入: target = 3
输出: 2
解释:
第一次移动，从 0 到 1; 第二次移动，从 1 到 3 。
```

#### 解法

本题主要偏向于数学计算，代码性不强。

首先target关于0对称，因此正负与**numMoves**无关，为便于计算，将**target**统一为正数。

分析从最简单的情况开始：

- **向右走numMoves步**

1. 未达到**target**。那就继续走。
2. 正好达到**target**。此时**numMoves**为最小值，return。
3. 越过了**target**。

- **越过target后，到达dist。同有三种情况**

1. **dist**与**target**差值为偶数，最好解决，只需要将某些步的方向变为左，一加变一减，就可以弥补差值，正好到达target。此时返回值不变，仍为 **numMoves** 。
2. 差值为奇数，此时需要 **numMoves++** ，多走一步，若差值变为偶数（**此时差值为奇数，走的步长也为奇数，和就是偶数**），则问题转化为上1，返回值为 **numMoves + 1** 。
3. 多走一步，差值仍为奇数，此时再走一步，差值必然变为偶数（同上，**走两步的步长必然是一奇一偶，奇数+奇数必是偶数**），转化为上1，返回值为**numMoves + 2**。

以上，代码转化为判断**numMoves**当前的步长和是否越过了target，以及越过后与target的差值的奇偶。

#### 代码

```c++
int reachNumber(int target) {
    target = abs(target);
    int dist = 0, numMoves = 0;
    while(dist < target || (dist - target) % 2){
        numMoves++;
        dist += numMoves;
    }
    return numMoves;
}
```

#### 优化

<img src="LeetCode每日一题/image-20221104152911835.png" alt="image-20221104152911835" style="zoom:67%;" />

```c++
int reachNumber(int target) {
    target = abs(target);
    int n = ceil((-1 + sqrt(8L * target + 1)) / 2); // 注意 8*target 会超过 int 范围
    return (n * (n + 1) / 2 - target) % 2 == 0 ? n : n + 1 + n % 2;
}
```

