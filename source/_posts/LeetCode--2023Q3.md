---
title: LeetCode--2023Q3
date: 2023-07-01 10:01:40
categories: 原理
tags: 
- 算法
- CPP
---

# 打卡7月LeetCode

## 2023.7.1

### 198.打家劫舍

#### 题干

你是一个专业的小偷，计划偷窃沿街的房屋。每间房内都藏有一定的现金，影响你偷窃的唯一制约因素就是相邻的房屋装有相互连通的防盗系统，**如果两间相邻的房屋在同一晚上被小偷闯入，系统会自动报警**。

给定一个代表每个房屋存放金额的非负整数数组，计算你 **不触动警报装置的情况下** ，一夜之内能够偷窃到的最高金额。

#### 解法

基本思路：**动态规划**

- **dp含义：**偷到第 i 家为止能得到的最大金额。
- **递推公式：**dp[i] = max(dp[i - 2] + nums[i], dp[i - 1]) 。在第 i 家，如果选择偷，就是不考虑 i-1，那就是在 i-2的基础上拿 i 的；如果不偷，就考虑是 i-1 的金额。
- **初始化：**很明显考虑到 i-2，需要初始化0，1。其中1需要取0、1中的较大值。

#### 代码

```cpp
class Solution {
public:
    int rob(vector<int>& nums) {
        if(nums.size() == 0)    return 0;
        if(nums.size() == 1)    return nums[0];
        int one = nums[0], two = max(nums[0], nums[1]), cur = two;
        for(int i = 2; i < nums.size(); ++i) {
            cur = max(one + nums[i], two);
            one = two;
            two = cur;
        }
        return cur;
    }
};
```

#### 相关题目

### 213.打家劫舍 Ⅱ

#### 题干

在198的基础上，房屋连成了环，其余不变。

#### 解法

基本思路：**动态规划**

这题主要是思路的转换，即怎么处理首尾相邻的情况。

首尾不能同时存在，那么**去掉其中一个**，剩余的就是198的逻辑了：即在 **[0, size)** 和 **[1, size - 1)** 区间内各自计算一遍最大金额，然后取两者中的最大值即可。

#### 代码

```cpp
class Solution {
public:
    int rob(vector<int>& nums) {
        if(nums.size() == 1)    return nums[0];
        auto maxCoins = [&](int l, int r) {
            if(l + 1 == r)  return nums[l];
            int one = nums[l], two = max(nums[l], nums[l+1]), cur = two;
            for(int i = l+2; i < r; ++i) {
                cur = max(one + nums[i], two);
                one = two;
                two = cur;
            }
            return cur;
        };
        return max(maxCoins(0, nums.size() - 1), maxCoins(1, nums.size()));
    }
};
```

### 337.打家劫舍 Ⅲ

#### 题干

小偷又发现了一个新的可行窃的地区。这个地区只有一个入口，我们称之为 `root` 。

除了 `root` 之外，每栋房子有且只有一个“父“房子与之相连。一番侦察之后，聪明的小偷意识到“这个地方的所有房屋的排列类似于一棵二叉树”。 如果 **两个直接相连的房子在同一天晚上被打劫** ，房屋将自动报警。

给定二叉树的 `root` 。返回 ***在不触动警报的情况下** ，小偷能够盗取的最高金额* 。

#### 解法

基本思路：**动态规划、树形DP**

这题的思路和前两题完全不同，算是二叉树遍历和动态规划的结合（树形DP）。首先很容易想到，在遍历的时候，必须**至少**隔一层才能偷一次，那么从叶节点开始遍历是相对更好的选择，可以将状态递推至根节点输出。因此遍历顺序选择**后序遍历**。

那么如何来设计dp数组呢，这里dp数组实际需要保存两个值（**当前节点偷、不偷的最高金额**），相当于两个dp了。于是原本的 dp[i] 需要修改为一组。在代码随想录中使用 **vector**来存储，相对消耗时空更多，这里选择用 **pair**来存储两个值，结构体相对更省时空。

为了得到每一层偷与不偷的递归状态，不能用同一个全局变量来存储，设置为递归返回值是较为方便的处理。

接下来确定递推公式，作为递归中的单层处理逻辑使用，置于左右子树递归的后面：

- **偷：**那么应该是两个子节点不偷时的最大金额加上当前节点值，即 **cur->val + no_robL + no_robR**
- **不偷：**那么应该是两个子节点返回的一对中更大的值的和，即 **max(robL, no_robL) + max(robR, no_robR)**为什么不是直接取子节点偷的和，是因为可能存在当前子节点偷了之后不一定就比没偷的金额更多（例：**[4,1,null,2,null,3]**）

最后遍历到空节点如何处理？也就是确定了终止条件：空节点什么都偷不到当然是返回 {0, 0} 。

最后遍历到根节点得到整棵树偷与不偷的状态，取最大值。

#### 代码

```cpp
class Solution {
public:
    int rob(TreeNode* root) {
        auto track = [ &,
            circle = [](auto&& self, TreeNode* cur) -> pair<int, int> {
                if(cur == nullptr)  return {0, 0};
                auto [robL, no_robL] = self(self, cur->left);
                auto [robR, no_robR] = self(self, cur->right);
                return {cur->val + no_robL + no_robR, max(robL, no_robL) + max(robR, no_robR)};
            }
        ]() { return circle(circle, root); };
        auto [rob, no_rob] = track();
        return max(rob, no_rob);
    }
};
```



### 714.买卖股票的最佳时机含手续费

#### 题干

给定一个整数数组 `prices`，其中 `prices[i]`表示第 `i` 天的股票价格 ；整数 `fee` 代表了交易股票的手续费用。

你可以无限次地完成交易，但是你每笔交易都需要付手续费。如果你已经购买了一个股票，在卖出它之前你就不能再继续购买股票了。返回获得**利润的最大值**。

**注意：**这里的一笔交易指买入持有并卖出股票的整个过程，每笔交易你只需要为支付一次手续费。

#### 解法

基本思路：**动态规划、树形DP**

这题的dp同样得分成两部分：第 i 天持有（dp[i] [0]）或不持有（dp[i] [1]）股票时所得最大现金。

**递推公式：**

- **dp[i] [0] = max(dp[i-1] [0], dp[i-1] [1] - prices[i])** ：前一天持有的现金和前一天不持有当天买入的最大值。
- **dp[i] [1] = max(dp[i-1] [1], dp[i-1] [0] + prices[i] - fee)** ：前一天不持有的现金和前一天持有当天卖出的最大值。

这里可以发现两个值都仅由上一天的状态推出，那就可以用常量替代二维数组节省空间，存在交叉使用的问题可以设置一个temp保存先被修改的那个变量之前的状态即可。最后输出的一定是不持有，因为卖出会得到更多钱。

#### 代码

```cpp
class Solution {
public:
    int maxProfit(vector<int>& prices, int fee) {
        int have = -prices[0], no = 0;
        for(int i = 1; i < prices.size(); ++i) {
            int temp = have;
            have = max(have, no - prices[i]);
            no = max(no, temp + prices[i] - fee);
        }
        return no;
    }
};
```



## 2023.7.2

### 121.买卖股票的最佳时机

#### 题干

给定一个数组 `prices` ，它的第 `i` 个元素 `prices[i]` 表示一支给定股票第 `i` 天的价格。你只能选择 **某一天** 买入这只股票，并选择在 **未来的某一个不同的日子** 卖出该股票。返回你可以从这笔交易中获取的**最大利润**。如果你不能获取任何利润，返回 `0` 。

#### 解法

基本思路：**动态规划**

因为只会买入和卖出一次，那么状态就比较好判断。dp：第 i 天持有（dp[i] [0]）或不持有（dp[i] [1]）股票时所得最大现金。可以用常量节省空间。

**递推公式：**

- **dp[i] [0] = max(dp[i-1] [0],  - prices[i])** 
- **dp[i] [1] = max(dp[i-1] [1], dp[i-1] [0] + prices[i])** 

#### 代码

```cpp
class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int have = -prices[0], no = 0;
        for(int i = 1; i < prices.size(); ++i) {
            no = max(no, prices[i] + have);
            have = max(have, -prices[i]);
        }
        return no;
    }
};
```

#### 相关题目

### 122.买卖股票的最佳时机 Ⅱ

#### 题干

给你一个整数数组 `prices` ，其中 `prices[i]` 表示某支股票第 `i` 天的价格。在每一天，你可以决定是否购买和/或出售股票。你在任何时候 **最多** 只能持有 **一股** 股票。你也可以先购买，然后在 **同一天** 出售。返回 **最大** 利润 。

#### 解法

基本思路：**动态规划**

因为会多次买入卖出，相对于上题121，买入的判断应为上一天就买入和上一天为买入-当天价格作比较。

**递推公式：**

- **dp[i] [0] = max(dp[i-1] [0], dp[i-1] [1] - prices[i])** 
- **dp[i] [1] = max(dp[i-1] [1], dp[i-1] [0] + prices[i])** 

#### 代码

```cpp
class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int have = -prices[0], no = 0;
        for(int i = 1; i < prices.size(); ++i) {
            int temp = have;
            have = max(have, no - prices[i]);
            no = max(no, prices[i] + temp);
        }
        return no;
    }
};
```

### 123.买卖股票的最佳时机 Ⅲ

#### 题干

给定一个数组，它的第 `i` 个元素是一支给定的股票在第 `i` 天的价格。计算你所能获取的最大利润。你最多可以完成 **两笔** 交易。**注意：**你不能同时参与多笔交易（你必须在再次购买前出售掉之前的股票）。

#### 解法

基本思路：**动态规划**

因为只买入两次，每一天的状态就不是两种而是四种：第一次持有、不持有和第二次的持有、不持有。

**递推公式：**要搞清楚每个状态和前一天的哪个状态相关。

- **dp[i] [0] = max(dp[i-1] [0], -prices[i])** 
- **dp[i] [1] = max(dp[i-1] [1], dp[i-1] [0] + prices[i])** 
- **dp[i] [2] = max(dp[i-1] [2], dp[i-1] [1] - prices[i])** 
- **dp[i] [3] = max(dp[i-1] [3], dp[i-1] [2] + prices[i])** 

#### 代码

```cpp
class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int have1 = -prices[0], have2 = -prices[0];
        int no1 = 0, no2 = 0;
        for(int i = 1; i < prices.size(); ++i) {
            int temp = have1;
            have1 = max(have1, -prices[i]);
            no2 = max(no2, have2 + prices[i]);
            have2 = max(have2, no1 - prices[i]);
            no1 = max(no1, temp + prices[i]);
        }
        return no2;
    }
};
```

