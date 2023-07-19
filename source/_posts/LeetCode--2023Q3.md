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

### 188.买卖股票的最佳时机 Ⅳ

#### 题干

给定一个整数数组 `prices` ，它的第 `i` 个元素 `prices[i]` 是一支给定的股票在第 `i` 天的价格，和一个整型 `k` 。计算你所能获取的最大利润。最多可以买 `k` 次，卖 `k` 次。**注意：**你不能同时参与多笔交易（你必须在再次购买前出售掉之前的股票）。

#### 解法

基本思路：**动态规划**

在上题123的基础上进一步拓展，由两次改为不定次，那就通过循环解决，递推中，每次都是取**前一天的当前状态值**与**前一天的上一状态值（+ / -）prices[i]** 中的最大值。

#### 代码

```cpp
class Solution {
public:
    int maxProfit(int k, vector<int>& prices) {
        vector<int> dp(k * 2, 0);
        for(int i = 0; i < k; ++i)
            dp[i * 2] = -prices[0];
        for(int i = 0; i < prices.size(); ++i) {
            for(int j = k * 2 - 1; j > 0; --j) 
                dp[j] = max(dp[j], dp[j - 1] + prices[i] * (j % 2 ? 1 : -1));
            dp[0] = max(dp[0], -prices[i]);
        }
        return dp[k * 2 - 1];
    }
};
```

### 309.买卖股票最佳时机含冷冻期

#### 题干

给定一个整数数组`prices`，其中第 `prices[i]` 表示第 `i` 天的股票价格 。计算出最大利润。在满足以下约束条件下，你可以尽可能地完成更多的交易（多次买卖一支股票）:卖出股票后，你无法在第二天买入股票 (即冷冻期为 1 天)。

**注意：**你不能同时参与多笔交易（你必须在再次购买前出售掉之前的股票）。

#### 解法

基本思路：**动态规划**

代码随想录中的方法是增加状态，即**达到买入股票状态**、**达到保持卖出股票状态**、**达到今天就卖出股票状态**、**达到冷冻期状态**四种状态。

但个人认为不需要考虑过于复杂，实际上冷冻期一天，在递推中也就是买入时的计算由 i - 1 变成了 i - 2。类似于122题的递推：

- **dp[i] [0] = max(dp[i-1] [0], dp[i-2] [1] - prices[i])** 
- **dp[i] [1] = max(dp[i-1] [1], dp[i-1] [0] + prices[i])** 

#### 代码

```cpp
class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int have = -prices[0], no = 0, no2 = 0;
        for(int i = 1; i < prices.size(); ++i) {
            int temp = have;
            have = max(have, no2 - prices[i]);
            no2 = no;
            no = max(no, prices[i] + temp);
        }
        return no;
    }
};
```



### 300.最长递增子序列

#### 题干

给你一个整数数组 `nums` ，找到其中最长严格递增子序列的长度。

**子序列** 是由数组派生而来的序列，删除（或不删除）数组中的元素而不改变其余元素的顺序。例如，`[3,6,2,7]` 是数组 `[0,3,1,6,2,2,7]` 的子序列。

#### 解法1

基本思路：**动态规划**

dp[i] 表示 [0, i] 区间内的子串的最长递增子序列长度。

在思考递推公式前需要先想清楚如何遍历？在数组遍历中，如果上升数组在 i 中断了（比前一个小），后序的最长子序列应该从何处累加才是正确的？因此需要二层循环，对于每一个 [0, i] 区间，都需要遍历一次，找到 **dp[i]** 真正的最大值。由此可以确定**递推公式：**

**dp[i] = max(dp[i], dp[j] + 1)**  ( 在 **nums[i] > nums[j]** 的条件下 ) 

#### 代码

```cpp
class Solution {
public:
    int lengthOfLIS(vector<int>& nums) {
        if(nums.size() == 1) return nums.size();
        vector<int> dp(nums.size(), 1);
        int res = 0;
        for(int i = 0; i < nums.size(); ++i) {
            for(int j = 0; j < i; ++j)
                if(nums[i] > nums[j])
                    dp[i] = max(dp[i], dp[j] + 1);
            if(dp[i] > res) res = dp[i];
        }
        return res;
    }
};
```

#### 解法2

基本思路：**贪心 + 二分查找**

解法1中的动态规划方法显然是需要双层遍历的，时间复杂度一看就是 O(n^2) ，不符合进阶的 **O(n*logn)** 要求。看到这个复杂度很明显是在一层循环中嵌套一个 **O(logn)** 的算法，涉及到递增，那么二分查找是一个好选择。那么如何只用单层遍历呢，要求最大值，可以考虑用贪心：局部最大到全局最大。

**看到的一个生动的解释：**[杀手也不会再冷了](https://leetcode.cn/problems/longest-increasing-subsequence/solutions/1407147/by-zigo_get-ctqu/)

对于一个原序列nums[i],视为nums.size()块大小不同的砖头。要求： 

1.将较小的砖头放在下方，它上面的每一块砖头都比它大 

2.砌起来的砖塔尽可能的高

创建一个数组**tower[]**，且先令 tower[0] = nums[0]，即第一块砖，并用参数**pos**标记塔顶位置。 遍历nums中每一块砖： 

1).若当前遍历到的砖nums[i]，比塔顶的砖大，则将其加至塔顶，即tower[pos] = nums[i]; 

2).若遍历到的砖nums[i]不大于塔顶的砖，则将与下层进行对比，找到tower[]中**最靠下**的**大于**该砖nums[i]的砖，并替换之。

这么做的目的有以下几个原因： 

1.由于上述的1)，已建成的塔是严格有序的（下小上大）。

2.为了使塔尽可能的高，则每一块砖应当**尽可能小**（贪心），因为越小的砖，它头上能容纳的砖的范围更大

3.需要注意的是，我们此处的tower[]并不一定是我们所找到的最高的塔，也即并不一定是我们最终需要的最长单调递增子序列。只有当从某一层开始，往上的每一层都发生了这种替换，最后才是我们需要的最长子序列。

举个栗子： 对于一个nums为{**100,90,1,20,30,40,80,2,3,4,5,6**} 按照以上思路 tower[]为 {100} {90}(100->90,替换) {1}(90->1,替换) {1,20}(添加20) {1,20,30}(添加30) {1,20,30,40}(添加40) {1,20,30,40,80}(添加80) {1,2,30,40,80}(20->2,替换) {1,2,3,40,80}(30->3,替换) {1,2,3,4,80}(40->4,替换) {1,2,3,4,5}(80->5,替换) {1,2,3,4,5,6}(添加6) 。

可以看到，该示例中比较高的塔有甲：{1,20,30,40,80}和乙：{1,2,3,4,5,6}两条。由于甲在nums[]中先出现，因此它修了5层，然后遇到了乙塔中的2这块砖。因此2找到塔中最靠下的大于2的砖20进行替换。但是这并不意味着我们的塔就变成了{1，2，30，40，80}，实际上2和20在此处是**并列关系**，并且它代表着一种**可能性**，即从2继续砌高的可能性。（这里是重点：**如果乙塔的实际长度（假设4，即把原数组中的5、6去掉）小于甲，那么序列是{1，2，30，40，80}，但数组中的值已经被替换为了{1，2，3，4，80}，数组并不表示真实序列，仅表示在这个位置后，能加入递增序列的最小要求，这就是贪心的地方**）后面的事实也证明确实是在2的基础上继续砌高（3，4，5，6都只能加在2的上面，而不能加在80的上面）因此，当1，2，3，4，5，6这个乙序列比甲序列长的时候，长度就会更新，并且继续在乙塔上延伸，而乙塔高度不足甲塔高度时，塔的高度不会更新。

进一步缩减空间复杂度：**直接在原数组上操作**。

#### 代码

```cpp
class Solution {
public:
    int lengthOfLIS(vector<int>& nums) {
        auto end = nums.begin();
        for(int n : nums) {
            auto iter = lower_bound(nums.begin(), end, n);
            *iter = n;
            if(iter == end) end++;
        }
        return end - nums.begin();
    }
};
```



## 2023.7.3

### 674.最长连续递增序列

#### 解法

基本思路：**动态规划**

相比于上题300，这题要求连续子序列就简单多了，只需在遇到递减时将状态重置为1即可。

#### 代码

```cpp
class Solution {
public:
    int findLengthOfLCIS(vector<int>& nums) {
        int res = 1, dp = 1;
        for(int i = 1; i < nums.size(); ++i) {
            if(nums[i] > nums[i - 1])   ++dp;
            else    dp = 1;
            res = max(res, dp);
        }
        return res;
    }
};
```



### 718.最长重复子数组

#### 题干

给两个整数数组 `nums1` 和 `nums2` ，返回 *两个数组中 **公共的** 、长度最长的子数组的长度* 。

#### 解法

基本思路：**动态规划**

记住动态规划的本质就是**填表**，全遍历。这里 **dp[i]** 表示 **nums1 [0, i - 1] 和 nums2 [0, j - 1]范围内的最长公共子数组**，是为了方便遍历，类似于一个向左边和上边的**padding**操作。若是表示 [0, i] ，会发现遍历时dp第一行第一列中若出现相同数字，要初始化为1。

#### 代码

```cpp
class Solution {
public:
    int findLength(vector<int>& nums1, vector<int>& nums2) {
        vector<vector<int> > dp(nums1.size() + 1, vector<int>(nums2.size() + 1, 0));
        int res = 0;
        for(int i = 1; i <= nums1.size(); ++i) {
            for(int j = 1; j <= nums2.size(); ++j) {
                if(nums1[i - 1] == nums2[j - 1])
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                res = max(res, dp[i][j]);
            }
        }        
        return res;
    }
};
```

#### 空间优化

```cpp
class Solution {
public:
    int findLength(vector<int>& nums1, vector<int>& nums2) {
        vector<int> dp(nums2.size() + 1, 0);
        int res = 0;
        for(int i = 1; i <= nums1.size(); ++i) {
            for(int j = nums2.size(); j > 0; --j) {
                if(nums1[i - 1] == nums2[j - 1])
                    dp[j] = dp[j - 1] + 1;
                else
                    dp[j] = 0;
                res = max(res, dp[j]);
            }
        }        
        return res;
    }
};
```



### 1143.最长公共子序列（LCS）

#### 题干

给定字符串 `text1` 和 `text2`，返回两个字符串的最长 **公共子序列** 的长度。如果不存在 **公共子序列** ，返回 `0` 。

一个字符串的 **子序列** 是指这样一个新的字符串：它是由原字符串在不改变字符的相对顺序的情况下删除某些字符（也可以不删除任何字符）后组成的新字符串。

#### 解法

基本思路：**动态规划**

这题主要难点在推导出**递推公式**。有两种情况：

1.**text1[i - 1] == text2[j - 1]** : 此时有 **dp[i] [j] = dp[i - 1] [j - 1] + 1**，很好理解：代表必然使用 **text1[i - 1] **和**text2[j - 1] **时LCS的长度。

2.**text1[i - 1] != text2[j - 1] : **此时 **dp[i] [j] = max(dp[i - 1] [j], dp[i] [j - 1])**，因为不相等，因此必然不会同时用到这两个字符，但存在用到其中一个字符的情况，依次取两者中的最大值。

#### 代码

```cpp
class Solution {
public:
    int longestCommonSubsequence(string text1, string text2) {
        vector<vector<int> > dp(text1.size() + 1, vector<int>(text2.size() + 1, 0));
        for(int i = 1; i <= text1.size(); ++i) {
            for(int j = 1; j <= text2.size(); ++j) {
                if(text1[i - 1] == text2[j - 1])
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                else
                    dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]);
            }
        }        
        return dp[text1.size()][text2.size()];
    }
};
```

#### 空间优化

一定要注意**遍历顺序！！**

在上一题718中，dp[i] [j] 只与 左上角 dp[i-1] [j-1] 有关，体现在一维数组中就是只与它前一个值有关，因此可以反序遍历，解决覆盖问题。

但本题中，dp[i] [j] 同时与 dp[i-1] [j-1] 、dp[i] [j-1] 、dp[i-1] [j] 有关，尤其是 **dp[i] [j-1]** ，若反序遍历，则**dp[i] [j-1] 的状态是无法更新到 dp[i] [j] 的**。因此必须正序遍历，用常量存储前一个值修改前的内容来避免覆盖问题。

```cpp
class Solution {
public:
    int longestCommonSubsequence(string text1, string text2) {
        vector<int> dp(text2.size() + 1, 0);
        for(int i = 1; i <= text1.size(); ++i) {
            int pre = 0;
            for(int j = 1; j <= text2.size(); ++j) {
                int temp = dp[j];
                if(text1[i - 1] == text2[j - 1])
                    dp[j] = pre + 1;
                else
                    dp[j] = max(dp[j], dp[j - 1]);
                pre = temp;
            }
        }        
        return dp[text2.size()];
    }
};
```

#### 相关题目

### 1035.不相交的线

按照题意理解一下，要在线不相交的情况下数量最多，那么线尽可能靠近垂直，并且不同线之间的相对顺序是固定的，也就是说本质就是**求最长公共子序列**。那么代码就和上题1143一模一样了。



### 53.最大子数组和

#### 题干

给你一个整数数组 `nums` ，请你找出一个具有最大和的连续子数组（子数组最少包含一个元素），返回其最大和。**子数组** 是数组中的一个连续部分。

#### 解法

基本思路：**动态规划**

以前用贪心解过，只保留和为正数的子数组，取最大。

动态规划其实也是类似的思路：有两种状态，1是**之前和为非负数，那么直接加上当前值**；2是**之前和是负数，那么从当前数重新开始计算和**。过程中记录最大和即可。

#### 代码

```cpp
class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int pre = 0, res = INT_MIN;
        for(int i = 0; i < nums.size(); ++i) {
            pre = max(nums[i], pre + nums[i]);
            res = max(res, pre);
        }
        return res;
    }
};
```



### 392.判断子序列

#### 题干

给定字符串 **s** 和 **t** ，判断 **s** 是否为 **t** 的子序列。

#### 解法

基本思路：**动态规划**

类似1143题的思路，将待确认子串作为外循环，在母串中：每找到一对匹配的字符，就取左上角（i-1，j-1）+1；没找到就延续前一格（i，j-1）记录的值（因为没找到新的匹配，所以长度暂时不变）。

最终目的实际依旧是求**最长公共子序列**，之后判断公共子序列长度是否和待确认子串相同即可。

TODO：为什么无法压缩成一维数组。。

#### 代码

```cpp
class Solution {
public:
    bool isSubsequence(string s, string t) {
        vector<vector<int> > dp(s.size() + 1, vector<int>(t.size() + 1, 0));
        for(int i = 1; i <= s.size(); ++i) {
            for(int j = 1; j <= t.size(); ++j) {
                if(s[i - 1] == t[j - 1])	dp[i][j] = dp[i - 1][j - 1] + 1;
                else	dp[i][j] = dp[i][j - 1];
            }
        }        
        return dp[s.size()][t.size()] == s.size();
    }
};
```



## 2023.7.6

### 115.不同的子序列

#### 题干

给你两个字符串 `s` 和 `t` ，统计并返回在 `s` 的 **子序列** 中 `t` 出现的个数。答案符合 32 位带符号整数范围。

#### 解法

基本思路：**动态规划**

对于两个**字符串匹配**，一个非常**通用的状态**定义如下：

定义 **dp[i] [j]** 为考虑 s 中 **[0，i]** 个字符，t 中 **[0，j]** 个字符的**匹配个数**。那么显然对于某个 dp[i] [j] 而言，从「最后一步」的匹配进行分析，包含两类决策：

-  **s[i]** 不参与匹配，需要让 s 中 **[0，i-1]** 个字符去匹配 t 中的  **[0，j]** 字符。此时匹配值为 **dp[i-1] [j]**
-  **s[i]** 参与匹配，这时只需让 s 中 **[0，i-1]** 个字符去匹配 t 中的  **[0，j-1]** 字符即可，同时满足 `s[i] = t[j]`。此时匹配值为 **dp[i-1] [j-1]**

显然，当出现 `s[i] = t[j]`时，dp值为以上两者之和，若不相等，则仅满足 s[i] 不参与匹配的情况。

#### 代码

```cpp
class Solution {
public:
    int numDistinct(string s, string t) {
        vector<uint64_t> dp(t.size() + 1, 0);
        dp[0] = 1;
        for(char c : s) {
            uint64_t pre = 1;
            for(int j = 1; j <= t.size(); ++j) {
                uint64_t temp = dp[j];
                if(c == t[j - 1])   dp[j] += pre;
                pre = temp;
            }
        }        
        return dp[t.size()];
    }
};
```



### 583.两个字符串的删除操作

#### 题干

给定两个单词 `word1` 和 `word2` ，返回使得 `word1` 和 `word2` **相同**所需的**最小步数**。**每步** 可以删除任意一个字符串中的一个字符。

#### 解法1

基本思路：**动态规划**

对于两个**字符串匹配**，一个非常**通用的状态**定义如下：

 **dp[i] [j]** 为使 s 中 **[0，i]** ，t 中 **[0，j]** 个字符相同所需的**最少操作步数**。那么对于 dp[i] [j] ，包含两类决策：

- `s[i] = t[j]`，此时不需要新增操作 **dp[i] [j] = dp[i-1] [j-1]**
- `s[i] ≠ t[j]`，此时有两种情况：删除 s[i - 1] 或删除 t[j - 1] 。于是可得 **dp[i] [j] = min(dp[i-1] [j] + 1, dp[i] [j - 1] + 1)** 。实际还有第三种情况即同时删除 s[i - 1] 和 t[j - 1] ，但是该情况（ **dp[i] [j] = dp[i-1] [j-1] + 2**）和删除 s[i-1]是一样的（TODO：why？）

这里需要注意的是dp数组的初始化：**dp[0] [j] = j ，dp[i] [0] = i** 。当 t 为空时，s显然需要删除全部的字符才能相同，因此必然有 **dp[i] [0] = i** 。反之同理。

下面代码为压缩空间后的一维数组解法，要注意**外循环中 dp[0] = i 相当于对二维数组中第一列的初始化，而pre保存的是左上角的值（i-1，j-1），因此初始化时应为上一层的 dp[0]，那也就是 i - 1。**

#### 代码

```cpp
class Solution {
public:
    int minDistance(string word1, string word2) {
        vector<int> dp(word2.size() + 1);
        for(int i = 0; i < dp.size(); ++i)  dp[i] = i;
        for(int i = 1; i <= word1.size(); ++i) {
            int pre = i - 1;
            dp[0] = i;
            for(int j = 1; j <= word2.size(); ++j) {
                int temp = dp[j];
                if(word1[i - 1] == word2[j - 1])   
                    dp[j] = pre;
                else
                    dp[j] = min(dp[j] + 1, dp[j - 1] + 1);
                pre = temp;
            }
        }        
        return dp[word2.size()];
    }
};
```

#### 解法2

将问题转化为[LCS问题](#1143.最长公共子序列（LCS）)，最少删除多少次后两个字符串相等，相当于求公共子串与俩字符串的长度差值的和。

```cpp
return word1.size() + word2.size() - dp[word2.size()] * 2;
```



## 2023.7.7

### 72.编辑距离

#### 题干

给你两个单词 `word1` 和 `word2`， *请返回将 `word1` 转换成 `word2` 所使用的最少操作数* 。

你可以对一个单词进行如下三种操作：**插入**一个字符、**删除**一个字符、**替换**一个字符。

#### 解法

基本思路：**动态规划**

动态规划题还是要冷静思考，找到递推关系。

显然如果两个字符相同，那么就不需要任何操作，**dp[i] [j] = dp[i-1] [j-1]**

如果不同，则有三种操作方法：

- 替换，最容易想到——增加了一步操作 **dp[i-1] [j-1] + 1**
- 删除，假设删除 `word1`的第 i 个字符，那么问题就变成了 dp[i-1] [j] 的最小操作数，加上删除 i 这一步。也就是 **dp[i-1] [j] + 1**；删除 `word2`，也是同理：**dp[i] [j-1] + 1**
- 插入和删除实际是同理：`word1`删除一个字符，相当于在`word2`加入一个和`word1[i]`相同的字符。

#### 代码

```cpp
class Solution {
public:
    int minDistance(string word1, string word2) {
        vector<int> dp(word2.size() + 1, 0);
        for(int i = 0; i < dp.size(); ++i)  dp[i] = i;
        for(int j = 1; j <= word1.size(); ++j) {
            int pre = j - 1;
            dp[0] = j;
            for(int i = 1; i <= word2.size(); ++i) {
                int temp = dp[i];
                if(word1[j - 1] == word2[i - 1])   dp[i] = pre;
                else    dp[i] = min({dp[i], dp[i - 1], pre}) + 1;
                pre = temp;
            }
        }
        return dp[word2.size()];
    }
};
```



### 647.回文子串

#### 题干

给你一个字符串 `s` ，请你统计并返回这个字符串中 **回文子串** 的数目。

具有不同开始位置或结束位置的子串，即使是由相同的字符组成，也会被视作不同的子串。

#### 解法1

基本思路：**动态规划、双指针**

这题没法直接按题意定义dp数组，因为无法找到递推关系。要考虑到回文子串的特点：**回文串（len > 2）去掉左右两边的字符后依旧是一个回文串**。这就是递推关系：字符串是不是回文串是由去掉两边后的字符串来决定的。

因此dp定义：dp[i] [j] 表示 s 在 **[i, j]** 范围内的子串**是否**为回文串，类型为bool，通过变量统计`true`的数量。

递推关系：当遍历到的两个字符不同时，`显然为false`；当相同时，会出现两种情况：

- 如果子串长度为1或2，字符相同则必然是回文串
- 如果长度大于2，则根据递推，由 **dp[i+1] [j-1]** 来决定

根据上述第二种情况，在遍历时要优先遍历到（i，j）的左下角，那么**先下后上，从左至右**的顺序就确定了。同时因为是 **[i, j]** 范围内，那么 **j 的遍历必然是从 i 开始的**。

这个动规数组的设计中其实也包含着双指针的思想。

#### 代码

```cpp
class Solution {
public:
    int countSubstrings(string s) {
        vector<vector<bool> > dp(s.size(), vector<bool>(s.size(), false));
        int res = 0;
        for(int i = s.size() - 1; i >= 0; --i) {
            for(int j = i; j < s.size(); ++j) {
                if(s[i] == s[j] && (j - i <= 1 || dp[i + 1][j - 1])) {
                    ++res;
                    dp[i][j] = true;
                }
            }
        }
        return res;
    }
};
```

#### 解法2

基本思路：**双指针**

上述dp的递推中实际已经体现了双指针实现回文串的核心思想：**回文串的基础是长度为1或2的子串**。

通过遍历整个字符串，以每个字符、该字符与后一位字符为基础计算可以形成的回文子串数。

```cpp
class Solution {
public:
    int countSubstrings(string s) {
        auto countSub = [&s](int i, int j) {
            int res = 0;
            while(i >= 0 && j < s.size() && s[i--] == s[j++])   ++res;
            return res;
        };
        int res = 0;
        for(int i = 0; i < s.size(); ++i) {
            res += countSub(i, i);
            res += countSub(i, i+1);
        }
        return res;
    }
};
```



## 2023.7.8

### 516.最长回文子序列

#### 题干

给你一个字符串 `s` ，找出其中**最长**的回文子序列，并返回该序列的长度。**子序列**定义为：不改变剩余字符顺序的情况下，删除某些字符或者不删除任何字符形成的一个序列。

#### 解法

基本思路：**动态规划**

子序列相对于子串的处理要更简单。思路类似于 [647.回文子串](#647.回文子串)，不过求的是最大长度，因此递推公式：

- 相等，在（i+1，j-1）的基础上+2
- 不等，即无法同时添加两个字符，那么选择添加其中一个，取最大值。

#### 代码

```cpp
class Solution {
public:
    int longestPalindromeSubseq(string s) {
        vector<vector<int> > dp(s.length(), vector<int>(s.length(), 0));
        for(int i = 0; i < s.length(); ++i) dp[i][i] = 1;
        for(int i = s.length() - 2; i >= 0; --i) {
            for(int j = i+1; j < s.length(); ++j) {
                if(s[i] == s[j])    dp[i][j] = dp[i+1][j-1] + 2;
                else    dp[i][j] = max(dp[i][j-1], dp[i+1][j]);
            }
        }
        return dp[0][s.length()-1];
    }
};
```

**空间优化**

```cpp
class Solution {
public:
    int longestPalindromeSubseq(string s) {
        vector<int> dp(s.length(), 0);
        for(int i = s.length() - 1; i >= 0; --i) {
            dp[i] = 1;
            int pre = 0;
            for(int j = i+1; j < s.length(); ++j) {
                int tmp = dp[j];
                if(s[i] == s[j])    dp[j] = pre + 2;
                else    dp[j] = max(dp[j-1], dp[j]);
                pre = tmp;
            }
        }
        return dp[s.length()-1];
    }
};
```



## 2023.7.10

### 739.每日温度

#### 题干

给定一个整数数组 `temperatures` ，表示每天的温度，返回一个数组 `answer` ，其中 `answer[i]` 是指对于第 `i` 天，下一个更高温度出现在几天后。如果气温在这之后都不会升高，请在该位置用 `0` 来代替。

#### 解法

基本思路：**单调栈**

因为是找右边第一个比自己大的元素，因此应手动维护栈为递减（栈底——>栈顶）。即每当遍历到一个元素时，将栈中比这个元素小的元素全部出栈，并记录结果即可。

#### 代码

```cpp
class Solution {
public:
    vector<int> dailyTemperatures(vector<int>& temperatures) {
        vector<int> res(temperatures.size());
        stack<int> st;
        for(int i = 0; i < temperatures.size(); ++i) {
            while(!st.empty() && temperatures[i] > temperatures[st.top()]) {
                res[st.top()] = i - st.top();
                st.pop();
            }
            st.push(i);
        }
        return res;
    }
};
```



### 496.下一个更大元素

#### 题干

`nums1` 中 x 的 **下一个更大元素** 是指 `x` 在 `nums2` 中对应位置 **右侧** 的 **第一个** 比 `x` 大的元素，若不存在返回**-1**。

给你两个 **没有重复元素** 的数组 `nums1` 和 `nums2` ，下标从 **0** 开始计数，其中`nums1` 是 `nums2` 的子集。

返回一个长度为 `nums1.length` 的数组 `ans` 作为答案，满足 `ans[i]` 是如上所述的 **下一个更大元素** 。

#### 解法

基本思路：**单调栈**

思路同上，相当于找到 `nums2`中每个元素的下一个更大元素的值，记录为键值对，之后遍历 `nums1`，取出这些元素对应的值，加入vector中。本质是一种空间换时间的解法。

第二种是正常解法。

#### 代码

```cpp
class Solution {
public:
    vector<int> nextGreaterElement(vector<int>& nums1, vector<int>& nums2) {
        vector<int> res;
        unordered_map<int, int> hash;
        stack<int> st;
        for(int i = nums2.size() - 1; i >= 0; --i) {
            while(!st.empty() && nums2[i] > st.top())   st.pop();
            hash[nums2[i]] = st.empty() ? -1 : st.top();
            st.push(nums2[i]);
        }
        for(int& n : nums1) res.emplace_back(hash[n]);
        return res;
    }
};
```

```cpp
class Solution {
public:
    vector<int> nextGreaterElement(vector<int>& nums1, vector<int>& nums2) {
        vector<int> res(nums1.size(), -1);
        for(int i = 0; i < nums1.size(); ++i) {
            vector<int>::iterator iter = find(nums2.begin(), nums2.end(), nums1[i]);
            while(iter != nums2.end() && nums1[i] >= *iter)    ++iter;
            if(iter != nums2.end()) res[i] = *iter;
        }
        return res;
    }
};
```

#### 相关题目

### 503.下一个更大元素 Ⅱ

#### 题干

给定一个循环数组 `nums` （ `nums[nums.length - 1]` 的下一个元素是 `nums[0]` ），返回 *`nums` 中每个元素的 **下一个更大元素*** 。如果不存在，则输出 `-1` 。

#### 解法

基本思路：**单调栈**

思路还是一样的，区别就是最后一个元素不是直接返回-1，而是需要再遍历一遍数组。

#### 代码

```cpp
class Solution {
public:
    vector<int> nextGreaterElements(vector<int>& nums) {
        int n = nums.size();
        vector<int> res(n, -1);
        stack<int> st;
        for(int i = 0; i < n * 2; ++i) {
            while(!st.empty() && nums[i % n] > nums[st.top()]) {
                res[st.top()] = nums[i % n];
                st.pop();
            }
            st.push(i % n);
        }
        return res;
    }
};
```



### 42.接雨水

#### 题干

给定 `n` 个非负整数表示每个宽度为 `1` 的柱子的高度图，计算按此排列的柱子，下雨之后能接多少雨水。

![img](LeetCode--2023Q3/rainwatertrap.png)

```
输入：height = [0,1,0,2,1,0,1,3,2,1,2,1]
输出：6
```

#### 解法

基本思路：**单调栈**

凹槽才能接雨水，因此当遍历到的元素比栈顶元素更大时说明找到了一个凹槽，因此应维护单调栈为**递减**。

第二步需要思考的是应该按行计算容量还是按列？如图中第二个凹槽，实际为两行三列，而单调递减栈在碰到更大的元素时就会处理，不确定是否是右侧最高的，因此按列计算无法找到列高，需**按行计算**。

按行计算需要得到两个数据：**行高**和**列宽**。

- 行高：以栈顶元素为底，取其左右两边（栈顶下一个元素和当前遍历元素）的较小值为顶，计算插值，得到**未计算部分中最底下一层**的行高。
- 列宽：左右两边的下标差值 - 1。

因为维护的是单调递减栈，说明凹槽左侧有多个不同高度的柱子，当前遍历高度要依次与栈中元素比较，每出栈一个小元素 x，就代表计算了这块凹槽中的一层（高度为**栈顶元素高度 - x**）；直到遍历的元素加入栈后，说明**该元素左侧以该元素为最高高度的部分容量**已经计算完成了。此时就形成了这个大元素遍历之前的情况：栈中只有递减排列的元素。重复这一过程直至遍历结束，就能找到所有的凹槽。

#### 代码

```cpp
class Solution {
public:
    int trap(vector<int>& height) {
        int res = 0;
        stack<int> st;
        st.push(0);
        for(int i = 1; i < height.size(); ++i) {
            while(!st.empty() && height[i] > height[st.top()]) {
                int mid = st.top();
                st.pop();
                if(!st.empty()) {
                    int h = min(height[i], height[st.top()]) - height[mid];
                    int w = i - st.top() - 1;
                    res += h * w;
                }
            }
            st.push(i);
        }
        return res;
    }
};
```

#### 相关题目

### 84.柱状图中最大的矩形

#### 题干

给定 *n* 个非负整数，表示柱状图中柱子的高度。每个柱子彼此相邻，且宽度为 1 。求在该柱状图中，能够勾勒出来的矩形的最大面积。

<img src="LeetCode--2023Q3/histogram.jpg" alt="img" style="zoom: 80%;" />

```
输入：heights = [2,1,5,6,2,3]
输出：10
```

#### 解法1

基本思路：**单调栈**

这题的思路和上题 [42.接雨水](#42.接雨水)相似，区别在于找的是两边第一个小于该元素的位置，因此维护为**递增**栈。

需要注意边界问题，对于左右两侧的柱子，其外层均应设置为**高度为0**的柱子，才能保证计算面积时没有遗漏。

找到小于元素的值，是为了找到面积计算的左右边界，因此应取每次的**栈顶元素值为面积的高**，宽度为当前元素与栈顶元素位置的差值。遍历是为了找到右边界，而左边界就是栈底元素。

#### 代码

```cpp
class Solution {
public:
    int largestRectangleArea(vector<int>& heights) {
        int res = 0;
        heights.emplace(heights.begin(), 0);
        heights.emplace_back(0);
        stack<int> st;
        st.push(0);
        for(int i = 1; i < heights.size(); ++i) {
            while(heights[i] < heights[st.top()]) {
                int h = heights[st.top()];
                st.pop();
                int w = i - st.top() - 1;
                res = max(res, h * w);
            }
            st.push(i);
        }
        return res;
    }
};
```

#### 解法2

基本思路：**双指针**

这题和上题都可以用双指针的思路解决，相对于单调栈，需要用两个数组分别存储左右边界的信息，因此属于是空间换时间。

#### 代码

```cpp
class Solution {
public:
    int largestRectangleArea(vector<int>& heights) {
        int n = heights.size();
        vector<int> l(n, -1);
        vector<int> r(n, n);
        for(int i = 1; i < n; ++i) {
            int idx = i - 1;
            while(idx >= 0 && heights[idx] >= heights[i])   idx = l[idx];
            l[i] = idx;
        }
        for(int i = n - 2; i >= 0; --i) {
            int idx = i + 1;
            while(idx < n && heights[idx] >= heights[i])   idx = r[idx];
            r[i] = idx;
        }
        int res = 0;
        for(int i = 0; i < n; ++i) 
            res = max(res, heights[i] * (r[i] - l[i] - 1));
        return res;
    }
};
```



## 2023.7.11

### 1911.最大子序列交替和

#### 题干

一个下标从 **0** 开始的数组的 **交替和** 定义为 **偶数** 下标处元素之 **和** 减去 **奇数** 下标处元素之 **和** 。

- 比方说，数组 `[4,2,5,3]` 的交替和为 `(4 + 5) - (2 + 3) = 4` 。

给你一个数组 `nums` ，请你返回 `nums` 中**任意子序列**的 **最大交替和** （子序列的下标 **重新** 从 0 开始编号）。

#### 解法

基本思路：**动态规划**

这种求最大的题很容易想到动态规划。类似于 [122.买卖股票的最佳时机 Ⅱ](#122.买卖股票的最佳时机 Ⅱ) 那么分析递推情况：

在构造子序列时，每个元素 `nums[i]`都面临两个选择：

1. 不选择这个元素构造子序列，那么最大交替和和前一状态是**相同**的。
2. 选择这个元素。 此时又有两种情况：

- 这个元素**作为偶数下标**加入子序列，即此时子序列的长度为奇数。
- 这个元素**作为奇数下标**加入子序列，即此时子序列的长度为偶数。

可以发现，当一个元素作为**偶数下标**加入子序列后长度变为**奇数**，说明加入前长度为偶数，并在这一状态下**加上**该元素。反之，则是从长度为奇数的上一状态减去该元素。两者的状态是相关的。

因此需要设定两个dp数组：even表示长度为偶数的子序列的最大交替和，odd表示长度为奇数的。递推公式：

- even[i] = max(even[i-1], odd[i-1] **-** nums[i])
- odd[i] = max(odd[i-1], even[i-1] **+** nums[i])

***Code***

```cpp
class Solution {
public:
    long long maxAlternatingSum(vector<int>& nums) {
        long long even = 0, odd = 0;
        for(int& n : nums) {
            long long tmp = odd;
            odd = max(odd, even + n);
            even = max(even, tmp - n);
        }
        return odd;
    }
};
```

#### 解法2

基本思路：**贪心**

求最大交替和，偶数下标 + ，奇数下标 - 。那么很明显最大交替和的子序列长度一定为奇数。那我们先排除原数组中的第一个元素，在后续元素中挑选组成子序列的成员，那么就是 -、+、-、+的顺序。

当两个数是递增状态时，添加这两个数是有益于增加交替和的，为**局部最优**；当两个数为递减时，和小于0，需要舍去。由此局部可以推至全局最优，贪心贪的是两个数的和都为正数。

那对于数组中第一个元素如何处理？可以在数组最开始假定有一个0，不会影响和的结果，这样即可从头遍历数组，**每次取两个元素间大于0的差值**计算累加和，求得最终结果。

***Code***

```cpp
class Solution {
public:
    long long maxAlternatingSum(vector<int>& nums) {
        int pre = 0;
        long long res = 0;
        for(int& n : nums) {
            res += max(n - pre, 0);
            pre = n;
        }
        return res;
    }
};
```



### 1365.有多少小于当前数字的数字

#### 题干

给你一个数组 `nums`，对于其中每个元素 `nums[i]`，请你统计数组中比它小的所有数字的数目。

```
输入：nums = [8,1,2,2,3]
输出：[4,0,1,1,3]
```

#### 解法

基本思路：**排序、哈希**

首先是统计更小数字的数目，对数组排序后，下标的值就是正确答案。

其次要以按原数组的顺序返回数目，因此需要快速查找到值，选择**哈希表**存储答案。注意对于相同的数字，应按照排序后数组中的第一个数字的下标为答案，因此在使用哈希表记录时，可以从后向前遍历，这样相同数字的答案最后就会被第一个值覆盖。

***Code***

```cpp
class Solution {
public:
    vector<int> smallerNumbersThanCurrent(vector<int>& nums) {
        vector<int> add = nums;
        sort(add.begin(), add.end());
        int hash[101] = {0};
        for(int i = add.size() - 1; i >= 0; --i)
            hash[add[i]] = i;
        for(int& n : nums)
            n = hash[n];
        return nums;
    }
};
```



### 941.有效的山脉数组

#### 题干

给定一个整数数组 `arr`，如果它是有效的山脉数组就返回 `true`，否则返回 `false`。

让我们回顾一下，如果 `arr` 满足下述条件，那么它是一个山脉数组：

1. `arr.length >= 3`
2. 在 0 < i < arr.length - 1 条件下，存在 i 使得：

- `arr[0] < arr[1] < ... arr[i-1] < arr[i] `
- `arr[i] > arr[i+1] > ... > arr[arr.length - 1]`

```
输入：arr = [4,3,2,1]
输出：false
```

#### 解法

基本思路：**双指针**

最朴素的方式就是记录第一个下降点，将标志位置位，之后若再有上升点则返回false。

双指针的方法更好理解一些，从两头向中间遍历，都应是从大到小的顺序，如果有不符时就停止移动。最后**双指针重合且不在两端（两端，存在整个数组都是顺序的情况）**则说明是山脉。

***Code***

```cpp
class Solution {
public:
    bool validMountainArray(vector<int>& arr) {
        if(arr.size() < 3)  return false;
        int n = arr.size() - 1;
        int l = 0, r = n;
        while(l < n && arr[l] < arr[l+1])   ++l;
        while(l > 0 && arr[r] < arr[r-1])   --r;
        return l == r && l != 0 && r != n;
    }
};
```



### 1207.有效的山脉数组

#### 题干

整数数组 `arr`，统计数组中每个数的出现次数。如果出现次数都是独一无二的，返回 `true`；否则返回 `false`。

```
输入：arr = [1,2,2,1,1,3]
输出：true
```

#### 解法

基本思路：**哈希**

两个哈希，一个 统计数量，一个统计是否chu'xian'guo

***Code***

```cpp
class Solution {
public:
    bool uniqueOccurrences(vector<int>& arr) {
        unordered_map<int, int> hash;
        bool exist[1001] = {false};
        for(int& n : arr)   hash[n]++;
        for(auto& p : hash) {
            if(exist[p.second]) return false;
            exist[p.second] = true;
        }
        return true;
    }
};
```



## 2023.7.12

### 2544.交替数字和

#### 解法

基本思路：**模拟**

数学计算，从低往高每次取一位数字乘以符号位累加，最后结果 * -sign。符号位假设末位是正，若最高位也是正，则最后sign为-1，乘以-sign相对于不动；反之则是 * -1。

***Code***

```cpp
class Solution {
public:
    int alternateDigitSum(int n) {
        int res = 0, sign = 1;
        while(n > 0) {
            res += n % 10 * sign;
            sign = -sign;
            n /= 10;
        }
        return -sign * res;
    }
};
```



### 283.移动零

#### 解法

基本思路：**双指针**

一个用于遍历，一个指向下一个非零数字的位置。

***Code***

```cpp
class Solution {
public:
    void moveZeroes(vector<int>& nums) {
        for(int i = 0, idx = 0; i < nums.size(); ++i)
            if(nums[i])
                swap(nums[i], nums[idx++]);
    }
};
```



### 189.轮转数组

#### 题干

给定一个整数数组 `nums`，将数组中的元素向右轮转 `k` 个位置，其中 `k` 是非负数。

#### 解法

基本思路：**字符串反转**

整体反转，然后再局部分别反转，就能实现轮转的效果。

***Code***

```cpp
class Solution {
public:
    void rotate(vector<int>& nums, int k) {
        k = k % nums.size();
        reverse(nums.begin(), nums.end());
        reverse(nums.begin(), nums.begin() + k);
        reverse(nums.begin() + k, nums.end());
    }
};
```



### 724.寻找数组的中心下标

#### 解法

基本思路：**前缀和**

代码随想录里的写法有问题，顺序反了，应该先判断再累加。因为遍历的当前元素是不应该在左侧累加和中的。

***Code***

```cpp
class Solution {
public:
    int pivotIndex(vector<int>& nums) {
        int sum = 0;
        for(int& n : nums)  sum += n;
        int l = 0;
        for(int i = 0; i < nums.size(); ++i) {
            if(sum == 2 * l + nums[i])  return i;
            l += nums[i];
        }
        return -1;
    }
};
```



### 34.在排序数组中查找元素的第一个和最后一个位置

#### 解法

基本思路：**二分查找**

有序数组查找、O(logn) ，第一反应就是二分查找。这里的注意点在于二分查找找到的第一个元素可能是任意位置的，不一定是边界。因此在**找到时不能直接return，而是继续压缩边界**。如果想找左边界，就压缩右边界，每次找到都更新下标值，直至双指针交错，就能得到边界值了。

***Code***

```cpp
class Solution {
public:
    vector<int> searchRange(vector<int>& nums, int target) {
        if(nums.size() == 0)    return {-1, -1};
        auto binarySearch = [&](bool left) -> int {
            int low = 0, high = nums.size() - 1, res = -1;
            while(low <= high) {
                int mid = (low + high) / 2;
                if(nums[mid] < target)  low = mid + 1;
                else if(nums[mid] > target) high = mid - 1;
                else {
                    res = mid;
                    if(left)    high = mid - 1;
                    else        low = mid + 1;
                }
            }
            return res;
        };
        return {binarySearch(true), binarySearch(false)};
    }
};
```



### 922.按奇偶排序数组 Ⅱ

#### 解法

基本思路：**双指针**

双指针一个指向偶数位，一个指向奇数位。当在偶数位遇到奇数时，就向后遍历奇数位，找到第一个奇数位上的偶数位，两者交换即可。

***Code***

```cpp
class Solution {
public:
    vector<int> sortArrayByParityII(vector<int>& nums) {
        for(int i = 0, odd = 1; i < nums.size(); i += 2) {
            if(nums[i] % 2) {
                while(nums[odd] % 2) odd += 2;
                swap(nums[i], nums[odd]);
            }
        }
        return nums;
    }
};
```



### 35.搜索插入位置

#### 解法

基本思路：**二分查找**

在二分查找的基础上，理解插入的位置。在闭区间的前提下，应为**左指针**的位置或**右指针位置 + 1**。

***Code***

```cpp
class Solution {
public:
    int searchInsert(vector<int>& nums, int target) {
        int l = 0, r = nums.size() - 1;
        while(l <= r) {
            int mid = (l + r) / 2;
            if(nums[mid] < target)  l = mid + 1;
            else if(nums[mid] > target) r = mid - 1;
            else    return mid;
        }
        return l;
    }
};
```



## 2023.7.13

### 931.下降路径最小和

#### 解法

基本思路：**动态规划**

一看就是动规。dp[i] [j] 表示到坐标为（i，j-1）位置的下降路径最小和。这里 [j] 长度为 n + 2 是因为便于计算。

**递推**就是**上一行左上角正上方和右上角的dp值**的**最小值**加上**当前值**。空间优化后如下：

***Code***

```cpp
class Solution {
public:
    int minFallingPathSum(vector<vector<int>>& matrix) {
        int n = matrix.size();
        vector<int> dp(n+2);
        for(int i = 1; i <= n; ++i) dp[i] = matrix[0][i-1];
        dp[0] = dp[n+1] = INT_MAX;
        for(int i = 1; i < n; ++i) {
            int pre = INT_MAX;
            for(int j = 1; j <= n; ++j) {
                int tmp = dp[j];                
                dp[j] = min({pre, dp[j], dp[j+1]}) + matrix[i][j-1];
                pre = tmp;
            }
        }
        return *min_element(dp.begin(), dp.end());
    }
};
```



## 2023.7.15

### 234.回文链表

#### 解法

基本思路：**翻转链表**

基础想法就是遍历链表将值都取出来存入数组，然后用双指针判断数组是否是回文即可。

**空间优化：**O(1) 空间复杂度就需要直接在链表上判断回文，但是单链表是无法向前遍历的。可以思考，如果将链表的后半段翻转过来，那是不是就是两段链表都从头开始遍历了。

因此先通过快慢指针，找到链表的中间节点，之后将链表分割为两部分，翻转后半部分，最后判断相同。

***Code***

```cpp
class Solution {
public:
    bool isPalindrome(ListNode* head) {
        if(head->next == nullptr)    return true;
        ListNode* pre;
        ListNode* fast = head;
        ListNode* slow = head;
        while(fast && fast->next) {
            pre = slow;
            slow = slow->next;
            fast = fast->next->next;
        }
        pre->next = nullptr;
        pre = head;
        auto revNodes = [](ListNode* root) {
            ListNode* tmp;
            ListNode* cur = root;
            ListNode* pre = nullptr;
            while(cur) {
                tmp = cur->next;
                cur->next = pre;
                pre = cur;
                cur = tmp;
            }
            return pre;
        };
        fast = revNodes(slow);
        while(pre) {
            if(pre->val != fast->val)   return false;
            pre = pre->next;
            fast = fast->next;
        }
        return true;
    }
};
```

#### 相关题目

### 143.重排链表

#### 解法

基本思路：**翻转链表**

思路和上题[234.回文链表](#234.回文链表)类似，同样是取到后半段的翻转链表，然后遍历插入前半段。

细节注意：上题中求回文 ，因此对于**奇数**长度的**链表中点**是放在后半段的，但本题是需要**放在前半段**的，因此要调一下头指针的位置。

***Code***

```cpp
// ......
if(fast) {		// 细节
    slow = slow->next;
    pre = pre->next;
}
pre->next = nullptr;
pre = head;
fast = revNodes(slow);
while(fast) {
    ListNode* tmp = pre->next;
    pre->next = fast;
    fast = fast->next;
    pre->next->next = tmp;
    pre = pre->next->next;
}
```



### 141.环形链表

#### 解法

基本思路：**双指针**

快慢指针，若无环，快指针直接到终点，返回false。若有环，则快慢指针一直在环内遍历，快指针必然会套慢指针一圈，此时两个指针相等，说明存在环。

***Code***

```cpp
class Solution {
public:
    bool hasCycle(ListNode *head) {
        ListNode* slow = head;
        ListNode* fast = head;
        while(fast && fast->next) {
            fast = fast->next->next;
            slow = slow->next;
            if(fast == slow)    return true;
        }
        return false;
    }
};
```



## 2023.7.16

### 205.同构字符串

#### 解法

基本思路：**哈希表**

记录从 s 到 t 和 从 t 到 s 的字符映射。因为同构是互为对方的唯一映射，因此需要两个方向，也就是两个哈希。

***Code***

```cpp
class Solution {
public:
    bool isIsomorphic(string s, string t) {
        unordered_map<char, char> hash1, hash2;
        for(int i = 0; i < s.length(); ++i) {
            if(hash1.count(s[i]) == 0)  hash1[s[i]] = t[i];
            if(hash2.count(t[i]) == 0)  hash2[t[i]] = s[i];
            if(hash1[s[i]] != t[i] || hash2[t[i]] != s[i])  return false;
        }
        return true;
    }
};
```



### 1002.查找共用字符

#### 解法

基本思路：**哈希表**

很容易想到哈希，难点在于统计字符在每个字符串中出现的次数：取所有字符串中该字符出现数量的**最小值**。

使用一个全局哈希表，维护每个字符在各个字符串中出现的最小数量，初始化为第一个字符串。

使用一个临时哈希表，遍历保存剩余的每个字符串所有字符的出现数量，并每次都和全局哈希的值中取最小值来更新全局哈希。最后得到的哈希表记录的就是公共字符出现的数量了。卡哥nb。

***Code***

```cpp
class Solution {
public:
    vector<string> commonChars(vector<string>& words) {
        int hash[26] = {0};
        for(char& c : words[0]) ++hash[c - 'a'];
        for(int i = 1; i < words.size(); ++i) {
            int otherHash[26] = {0};
            for(char& c : words[i]) ++otherHash[c - 'a'];
            for(int i = 0; i < 26; ++i) hash[i] = min(hash[i], otherHash[i]);
        }
        vector<string> res;
        for(int i = 0; i < 26; ++i)
            while(hash[i]--)
                res.push_back(string(1, i + 'a'));
        return res;
    }
};
```



## 2023.7.17

### 415.字符串相加

#### 解法

基本思路：**双指针**

分别指向两个字符串的末尾，同步向前遍历，计算字符和的末位和进位。

***Code***

```cpp
class Solution {
public:
    string addStrings(string num1, string num2) {
        int i = num1.length() - 1, j = num2.length() - 1;
        int carry = 0;
        string res = "";
        for(; i >= 0 || j >= 0 || carry; --i, --j) {
            int n1 = i >= 0 ? num1[i] - '0' : 0;
            int n2 = j >= 0 ? num2[j] - '0' : 0;
            carry += n1 + n2;
            res.push_back(carry % 10 + '0');
            carry = carry / 10;
        }
        reverse(res.begin(), res.end());
        return res;
    }
};
```



### 925.字符串相加

#### 解法

基本思路：**双指针、模拟**

双指针遍历时，若两个字符不同，存在两种情况：1.第一个就不同，直接return；2.后面不同时，若typed和前一个字符相同，则指针 j 右移，若 j 移完了还不同，直接return。

结束循环后判断哪个字符串没有匹配完，若是name，直接return；若是typed，判断剩余字符是否都相同。

***Code***

```cpp
class Solution {
public:
    bool isLongPressedName(string name, string typed) {
        int i = 0, j = 0;
        for(; i < name.size() && j < typed.size(); ++i, ++j) {
            if(name[i] != typed[j]) {
                if(j == 0)  return false;
                while(j < typed.size() && typed[j] == typed[j - 1]) ++j;
                if(name[i] != typed[j]) return false;
            }
        }
        if(i < name.size()) return false;
        while(j < typed.size() && typed[j] == typed[j - 1]) ++j;
        return j >= typed.size();
    }
};
```



### 844.比较含退格的字符串

#### 解法

基本思路：**双指针**

最简单不动脑的就是用栈来模拟删除了。如果不用，就得用一个变量维护退格的数量，记录在退格过程中再次遇到的退格符。

***Code***

```cpp
class Solution {
public:
    bool backspaceCompare(string s, string t) {
        int i = s.length()-1, j = t.length()-1;
        for(; i >= 0 || j >= 0; --i, --j) {
            int back = 0;
            while(i >= 0) {
                if(s[i] == '#') ++back;
                else if(!back--) break;
                --i;
            }
            back = 0;
            while(j >= 0) {
                if(t[j] == '#') ++back;
                else if(!back--) break;
                --j;
            }
            if(i >= 0 && j >= 0 && s[i] != t[j])    return false;
        }
        return i == j;
    }
};
```



### 129.求根节点到叶节点数字之和

#### 解法

基本思路：**回溯**

可以发现本题只需要找到根节点到所有叶节点的路径即可，不需要处理中间节点，因此无所谓前中后序。

确定**终止条件**：到达叶节点，累加该路径生成的数字。

确定**单层逻辑**：如果子节点存在，添加一位数字，进入下一层递归，然后回溯。

***Code***

```cpp
class Solution {
public:
    int sumNumbers(TreeNode* root) {
        int sum = 0;
        string path = "";
        path += root->val + '0';
        auto backTrack = [&,
            circle = [&](auto&& self, TreeNode* cur) -> void {
                if(!cur->left && ! cur->right) {
                    sum += stoi(path);
                    return;
                }
                if(cur->left) {
                    path += cur->left->val + '0';
                    self(self, cur->left);
                    path.pop_back();
                }
                if(cur->right) {
                    path += cur->right->val + '0';
                    self(self, cur->right);
                    path.pop_back();
                }
            }
        ]() { circle(circle, root); };
        backTrack();
        return sum;
    }
};
```



## 2023.7.18

### 1851.包含每个查询的最小区间

#### 题干

给你一个二维整数数组 `intervals` ，其中 `intervals[i] = [lefti, righti]` 表示第 `i` 个区间开始于 `lefti` 、结束于 `righti`（包含两侧取值，**闭区间**）。区间的 **长度** 的表达是 `righti - lefti + 1` 。

再给你一个整数数组 `queries` 。第 `j` 个查询的答案是满足 `lefti <= queries[j] <= righti` 的 **长度最小区间 `i` 的长度** 。如果不存在这样的区间，那么答案是 `-1` 。

```
输入：intervals = [[2,3],[2,5],[1,8],[20,25]], queries = [2,19,5,22]
输出：[2,-1,4,6]
```

#### 解法

基本思路：**排序、离线查询、小根堆（优先队列）**

简单的暴力双层循环取最小长度，会超时，因此需要优化遍历方式。

如果把`queries`也排序并记录下标，好处在于内层循环不需要从`intervals` 头开始遍历了，而是可以从上一个下标`idx`处开始遍历，这是优化，但是存在问题，即**两个查询值符合的区间有重叠的情况**下，很难去处理 `idx`。

由此引入了小根堆，维护区间的长度由小到大存储。放宽**存储条件**，凡是查询值 ≥ 区间左边界的**区间长度和区间右边界**均可加入小根堆。之后将小根堆顶 区间右边界 < 查询值 的元素剔除，那么之后的堆顶元素就是答案。

进入下一个查询值时，因为必然大于上一个，那么之前加入小根堆的元素必然也是符合**存储条件**的，而上一轮被剔除的元素也是符合**剔除条件**的，此时**两个查询值符合的区间有重叠的情况**已经存入小根堆中了，因此就可以接着使用 `idx++` 向后遍历了。

***Code***

```cpp
class Solution {
public:
    vector<int> minInterval(vector<vector<int>>& intervals, vector<int>& queries) {
        sort(intervals.begin(), intervals.end());
        using pii = pair<int, int>;
        vector<pii> query;
        for(int i = 0; i < queries.size(); ++i) query.emplace_back(queries[i], i);
        sort(query.begin(), query.end());
        priority_queue<pii, vector<pii>, greater<pii>> que;
        int idx = 0;
        for(auto& [n, i] : query) {
            while(idx < intervals.size() && intervals[idx][0] <= n) {
                que.emplace(intervals[idx][1] - intervals[idx][0] + 1, intervals[idx][1]);
                ++idx;
            }
            while(!que.empty() && que.top().second < n)    que.pop();
            queries[i] = que.empty() ? -1 : que.top().first;
        }
        return queries;
    }
};
```



### 1382.将二叉搜索树变平衡

#### 题干

给你一棵二叉搜索树，请你返回一棵 **平衡后** 的二叉搜索树，新生成的树应该与原来的树有着相同的节点值。如果有多种构造方法，请你返回任意一种。

如果一棵二叉搜索树中，每个节点的两棵子树高度差不超过 `1` ，我们就称这棵二叉搜索树是 **平衡的** 。

#### 解法

基本思路：**BST、平衡**

先用中序遍历将BST转化为有序数组，再将**有序数组**构造为平衡BST。

***Code***

```cpp
class Solution {
public:
    TreeNode* balanceBST(TreeNode* root) {
        vector<int> nums;
        auto tree2SortedArray = [&nums,
            circle = [&](auto&& self, TreeNode* cur) -> void {
                if(cur == nullptr)  return;
                self(self, cur->left);
                nums.emplace_back(cur->val);
                self(self, cur->right);
                return;
            }
        ](TreeNode* root) { circle(circle, root); };
        auto SortedArray2BBST = [&nums,
            circle = [&](auto&& self, int l, int r) -> TreeNode* {
                if(l > r)   return nullptr;
                int mid = (l + r) / 2;
                TreeNode* node = new TreeNode(nums[mid]);
                node->left = self(self, l, mid - 1);
                node->right = self(self, mid + 1, r);
                return node;
            }
        ]() { return circle(circle, 0, nums.size() - 1); };
        tree2SortedArray(root);
        return SortedArray2BBST();
    }
};
```



## 2023.7.19

### 874.模拟行走机器人

#### 解法

基本思路：**哈希、模拟、自定义类**

很明显题意需要判断走过的每一步是否存在障碍物，可以通过 `unordered_set` 用哈希快速判断。整体就是模拟转向和前进两种情况。

由于数组坐标的形式判断哈希略显麻烦，刚好昨天看了运算符重载相关，就自定义了一个 `Point` 类，重载了 `==`、`+`、`-`三个运算符。要注意的是，`unordered_set` 使用的是 `std::hash` 来计算哈希的key，但是没有针对自定义类的计算方式的，因此在初始化哈希表时要**自定义哈希函数**。

***Code***

```cpp
class Solution {
public:
    class Point {
    public:
        int x;
        int y;
        Point(int x, int y) {
            this->x = x;
            this->y = y;
        }
        int empow() { return x * x + y * y; }
        bool operator==(const Point& p) const { return x == p.x && y == p.y; }
        Point operator+(const Point& p) const {
            Point tmp(x, y);
            tmp.x = x + p.x;
            tmp.y = y + p.y;
            return tmp;
        }
        Point operator-(const Point& p) const {
            Point tmp(x, y);
            tmp.x = x - p.x;
            tmp.y = y - p.y;
            return tmp;
        }
    };
    struct myhash {
        size_t operator() (const Point& p) const { return hash<int>()(p.x) ^ hash<int>()(p.y); }
    };
    int robotSim(vector<int>& commands, vector<vector<int>>& obstacles) {
        vector<Point> dirs = {Point(0,1), Point(1,0), Point(0,-1), Point(-1,0)};
        unordered_set<Point, myhash> barrier;
        for(auto& vec : obstacles)  barrier.emplace(Point(vec[0], vec[1]));
        Point p(0, 0);
        int dir = 0;
        int res = 0;
        for(int c : commands) {
            if(c < 0)   dir = (dir + (c == -2 ? 3 : 1)) % 4; 
            else {
                while(c--) {
                    p = p + dirs[dir];
                    if(barrier.count(p)) {
                        p = p - dirs[dir];
                        break;
                    }
                }
                res = max(res, p.empow());
            }
        }
        return res;
    }
};
```



### 52.N皇后 Ⅱ

#### 解法

基本思路：**贪心**

和51.N皇后思路一样，只是保存方案改为了计数。本质依旧是，外层遍历行，内层遍历列，依次尝试一行中的每一列放置皇后的效果，迭代出所有结果。

***Code***

```cpp
class Solution {
public:
    int totalNQueens(int n) {
        int res = 0;
        vector<string> path(n, string(n, '.'));
        auto isValid = [&path, n](int row, int col) -> bool {
            for(int i = 0; i < row; ++i)
                if(path[i][col] == 'Q') return false;
            for(int i = row-1, j = col-1; i >= 0 && j >= 0; --i, --j)
                if(path[i][j] == 'Q') return false;
            for(int i = row-1, j = col+1; i >= 0 && j < n; --i, ++j)
                if(path[i][j] == 'Q') return false;
            return true;
        };
        auto backTrack = [
            circle = [&](auto&& self, int row) -> void {
                if(row == n) {
                    ++res;
                    return;
                }   
                for(int i = 0; i < n; ++i) {
                    if(isValid(row, i)) {
                        path[row][i] = 'Q';
                        self(self, row + 1);
                        path[row][i] = '.';
                    }
                }
            }
        ]() { circle(circle, 0); };
        backTrack();
        return res;
    }
};
```



