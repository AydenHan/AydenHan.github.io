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



## 2023.7.4

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


