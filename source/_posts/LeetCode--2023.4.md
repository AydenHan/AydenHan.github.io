---
title: LeetCode--2023.4
date: 2023-04-01 10:32:55
categories: 原理
tags: 
- 算法
- CPP
---

# 打卡4月LeetCode

## 2023.4.1

### 831.隐藏个人信息

#### 题干

太长。

**示例**

```
示例 1：
输入：s = "AB@qq.com"
输出："a*****b@qq.com"
```

```
示例 2：
输入：s = "1(234)567-890"
输出："***-***-7890"
```

#### 解法

基本思路：**模拟？**

这也算算法题。。吗？

#### 代码

```cpp
class Solution {
public:
    string maskPII(string s) {
        if(s[0] >= 'A'){
            int split = s.find('@');
            for(int i = split + 1; i < s.length(); ++i){
                if(s[i] <= 'Z' && s[i] >= 'A')
                    s[i] += 32;
            }
            if(s[0] <= 'Z') s[0] += 32;
            if(s[split - 1] <= 'Z') s[split - 1] += 32;
            s.replace(1, split - 2, "*****");
        }
        else{
            for(string::iterator i = s.begin(); i < s.end(); ++i){
                if(*i < '0')
                    s.erase(i--);
            }
            int len = s.length();
            if(len == 10)
                return "***-***-" + s.substr(6, 4);
            else if(len == 11)
                return "+*-***-***-" + s.substr(7, 4);
            else if(len == 12)
                return "+**-***-***-" + s.substr(8, 4);
            else if(len == 13)
                return "+***-***-***-" + s.substr(9, 4);
        }
        return s;
    }
};
```



### 54.螺旋矩阵、剑指 Offer 29. 顺时针打印矩阵

#### 题干

给你一个 `m` 行 `n` 列的矩阵 `matrix` ，请按照 **顺时针螺旋顺序** ，返回矩阵中的所有元素。

**示例**

```
示例 1：
输入：matrix = [[1,2,3],[4,5,6],[7,8,9]]
输出：[1,2,3,6,9,8,7,4,5]
```

```
示例 2：
输入：matrix = [[1,2,3,4],[5,6,7,8],[9,10,11,12]]
输出：[1,2,3,4,8,12,11,10,9,5,6,7]
```

#### 解法

基本思路：**模拟过程**

相比于 59.螺旋矩阵Ⅱ ，这题的长宽不一定相同，因此不再适用按圈缩减的方法。

![img](LeetCode--2023.4/spiral.jpg)

1. 维护上、下、左、右四个边界的下标。
2. 第一次移动，从左到右移动一整行，移动后直接将1~4从上图中抹掉，变成了一个 4 x 2 的矩阵。如何抹掉？**维护的上边界加一**即可。因为**循环都是统一从一个边界到另一个边界的**。
3. 第二次移动，从上到下，移动后抹去8、12，相当于**右边界减一**。这样下一次移动中从右到左时从右边界开始就是从11开始的，顺序不会错乱。
4. 第三从右往左，第四次从下往上，四次组成一次大循环。
5. 每当有两个对应边界错位（**左 > 右，上 > 下**）时，就直接结束了。例如当仅剩一行时，上下边界重合，抹去这行时，无论up++还是down--，都会出现错位，以此为结束的判断依据。

思路清晰，逻辑明了。

#### 代码

```cpp
class Solution {
public:
    vector<int> spiralOrder(vector<vector<int>>& matrix) {
        vector<int> res;
        int up = 0, left = 0;
        int down = matrix.size() - 1, right = matrix[0].size() - 1;
        while(1){
            for(int i = left; i <= right; ++i) res.push_back(matrix[up][i]);
            if(++up > down) break;
            for(int i = up; i <= down; ++i) res.push_back(matrix[i][right]);
            if(--right < left) break;
            for(int i = right; i >= left; --i) res.push_back(matrix[down][i]);
            if(--down < up) break;
            for(int i = down; i >= up; --i) res.push_back(matrix[i][left]);
            if(++left > right) break;
        }
        return res;
    }
};
```



### 11.盛最多水的容器

#### 题干

给定一个长度为 **n** 的整数数组 **height** 。有 n 条垂线，第 **i** 条线的两个端点是 **(i, 0)** 和 **(i, height[i])** 。

找出其中的两条线，使得它们与 **x** 轴共同构成的容器可以容纳**最多**的水。返回容器可以储存的**最大水量**。

**示例**

```
示例 1：
输入：[1,8,6,2,5,4,8,3,7]
输出：49 
```

```
示例 2：
输入：height = [1,1]
输出：1
```

#### 解法

基本思路：**双指针**

代码很简单，这题主要在于思路上：为什么双指针按代码所示方法往中间移动时不会漏掉某种情况呢？

容量和两个因素有关：双指针的**距离**、双指针中**短的那个的高度**。

开始双指针在两端，距离是最大的，此时移动指针若想要让容量更大，就必须提高双指针中**短的那个的高度**，也就是把短的指针往中间移动找找有没有更高的位置。这样移动下来就不存在漏掉某种最大的情况了。

#### 代码

```cpp
class Solution {
public:
    int maxArea(vector<int>& height) {
        int n = height.size()， res = 0;
        int l = 0, r = n - 1;
        while(l < r){
            int area = min(height[l], height[r]) * (r - l);
            res = max(res, area);
            if(height[l] < height[r])	l++;
            else	r--;
        }
        return res;
    }
};
```



## 2023.4.3

### 1053.交换一次的先前排列

#### 题干

给你一个正整数数组 **arr**（可能存在重复的元素），请你返回可在 **一次交换**（交换两数字 arr[i] 和 arr[j] 的位置）后得到的、按**字典序**排列**小于** **arr** 的**最大排列**。

如果无法这么操作，就请返回**原数组**。

**示例**

```
示例 1：
输入：arr = [3,2,1]
输出：[3,1,2]
```

```
示例 2：
输入：arr = [1,9,4,6,7]
输出：[1,7,4,6,9]
```

#### 解法

基本思路：**贪心**

对于数组中的两元素下标 i 、j 且 **i < j**，若交换 arr[i] 和 arr[j] 得到的新数组按字典序排列比原数组小，显然有**arr[i] > arr[j]** 。因此符合题意要求的交换会使得数组  arr[i]  在下标 i 处的元素变小。那么为了得到按字典序排列小于原数组的最大新数组，尽可能地保持前面的元素不变是这一步的最优解，即让 **i 最大化**。

也就是说，从右往左遍历，找到的第一个**arr[i] > arr[i + 1]** 处，就是需要被交换的 i 。

显然，找到 i 后，j 需要在 i 右半边去找。在满足 **arr[i] > arr[j]** 的情况下，取**最大**的 **arr[j]** 是这一步的最优解，但需要注意元素可能存在重复的情况需要排除，此时把大的值换到相同数字的最左边，在小于原序列的状态下得到的序列是更大的，因此取**最大的、j 尽量小的 arr[j]** 为最优解。

#### 代码

```cpp
class Solution {
public:
    vector<int> prevPermOpt1(vector<int>& arr) {
        for(int i = arr.size() - 2; i >= 0; --i){
            if(arr[i] > arr[i + 1]){
                for(int j = arr.size() - 1; j > i; --j){
                    if(arr[j] < arr[i] && arr[j] != arr[j - 1]){
                        swap(arr[j], arr[i]);
                        return arr;
                    }
                }
            }
        }
        return arr;
    }
};
```



### 31.下一个排列

#### 题干

整数数组的一个 排列  就是将其所有成员以序列或线性顺序排列。

- 例如，arr = [1,2,3] ，以下这些都可以视作 arr 的排列：[1,2,3]、[1,3,2]、[3,1,2]、[2,3,1] 。

整数数组的 **下一个排列** 是指其整数的下一个字典序更大的排列。更正式地，如果数组的所有排列根据其字典顺序从小到大排列在一个容器中，那么数组的 下一个排列 就是在这个有序容器中排在它后面的那个排列。如果不存在下一个更大的排列，那么这个数组必须重排为字典序**最小**的排列（即其元素按升序排列）。

- 例如，arr = [1,2,3] 的下一个排列是 [1,3,2] 。

- 类似地，arr = [2,3,1] 的下一个排列是 [3,1,2] 。
- 而 arr = [3,2,1] 的下一个排列是 [1,2,3] ，因为 [3,2,1] 不存在一个字典序更大的排列。

给你一个整数数组 **nums** ，找出 **nums** 的下一个排列。必须 **原地** 修改，只允许使用**额外常数**空间。

**示例**

```
示例 1：
输入：nums = [1,2,3]
输出：[1,3,2]
```

```
示例 2：
输入：nums = [3,2,1]
输出：[1,2,3]
```

#### 解法

基本思路：**贪心？、双指针？**

这题和今天的每日一题是相同原理，是找大于原序列的最小字典序。

对于数组中的一部分，若完全的降序排列（不存在 **arr[i] < arr[i+1]** 的情况），则这段子序列是最大的。那么最优解就是从右往左找到第一个 **arr[i] > arr[i+1]** 处，就是从尾部开始的最大子序列长度再加一，i 即是要交换的位置。

显然，找到 i 后，j 需要在 i 右半边去找。在满足 **arr[i] < arr[j]** 的情况下，取**最小的** **arr[j]** 是这一步的最优解，此题不需要考虑元素重复的情况，因为换哪个都一样。

交换完成后，由于 i 增大了，要找大于原序列的最小字典序，右侧的子序列自然是要最小的，**因此升序排列即可**。

若找不到这样的 i ，说明原序列就是最大字典序，直接把整个数组升序排列即可。

#### 代码

```cpp
class Solution {
public:
    void nextPermutation(vector<int>& nums){
        for(int i = nums.size() - 2; i >= 0; --i){
        	if(nums[i] < nums[i+1]){
            	for(int j = nums.size() - 1; j > i; --j){  
            		if(nums[j] > nums[i]){
                		swap(nums[j], nums[i]);
        				sort(nums.begin()+i+1,nums.end());
                		return;
            		}
        		}
    		}
    	}
    	sort(nums.begin(),nums.end());
	}
};
```



## 2023.4.4

### 46.全排列

#### 题干

给定一个不含重复数字的数组 `nums` ，返回其 *所有可能的全排列* 。你可以 **按任意顺序** 返回答案。

**示例**

```
示例 1：
输入：nums = [1,2,3]
输出：[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]
```

```
示例 2：
输入：nums = [1]
输出：[[1]]
```

#### 解法

基本思路：**回溯、DFS**

实际就是一个排列组合问题，每一个数字都要放到最前面，而对剩下的数字里同样是每个数字都要被放在最前（第二个）。。以此类推。这就是分布解决问题的过程。

**回溯法**采用的是试错思想：当它通过尝试发现现有的分步答案不能得到有效的正确的解答的时候，它将取消上一步甚至是上几步的计算，再通过其它的可能的分步解答再次尝试寻找问题的答案。这通常是使用递归来实现的。

而本题中不需要判断分步答案是否正确，只需记录所有分布答案即可。

**回溯与动态规划的异同：**

**1.共同点**

- 用于**求解多阶段决策**问题。即：求解一个问题分为很多步骤（阶段）；每一个步骤（阶段）可以有多种选择。

**2.不同点**

- 动态规划只需要求我们评估最优解是多少，最优解对应的具体解是什么并不要求。因此很适合应用于评估一个方案的效果；
- 回溯算法可以搜索得到所有的方案（当然包括最优解），但是本质上它是一种遍历算法，时间复杂度很高。

对于该题，示例1：

![image.png](LeetCode--2023.4/0bf18f9b86a2542d1f6aa8db6cc45475fce5aa329a07ca02a9357c2ead81eec1-image.png)

深度优先遍历有「回头」的过程，在「回头」以后， 状态变量需要设置成为和先前一样 ，因此在回到上一层结点的过程中，需要**撤销**上一次的选择，这个操作称之为「**状态重置**」

#### 代码

```cpp
class Solution {
public:
    void dfs(vector<vector<int>>& res, vector<int>& nums, int start, int end){
        if(start == end){
            res.push_back(nums);
            return;
        }
        for(int i = start; i < end; ++i){
            swap(nums[start], nums[i]);
            dfs(res, nums, start + 1, end);
            swap(nums[start], nums[i]);
        }
    }
    vector<vector<int>> permute(vector<int>& nums) {
        vector<vector<int>> res;
        dfs(res, nums, 0, nums.size());
        return res;
    }
};
```



## 2023.4.5

### 2427.公因子的数目

#### 解法

基本思路：**暴力**

公因子的最大值就是最大公约数，因此先求最大公约数（库函数 **__gcd** ），再从1开始循环判断。

#### 代码

```cpp
class Solution {
public:
    int commonFactors(int a, int b) {
        int divisor = __gcd(a, b);
        int res = 0;
        for(int i = 1; i <= divisor; ++i)
            if(a % i == 0 && b % i == 0)
                res++;
        return res;
    }
};
```



## 2023.4.6

### 1017.负二进制转换

#### 题干

给你一个整数 `n` ，以二进制字符串的形式返回该整数的 **负二进制（`base -2`）**表示。

**注意，**除非字符串就是 `"0"`，否则返回的字符串中不能含有前导零。

**示例**

```
示例 1：
输入：n = 2
输出："110"
解释：(-2)2 + (-2)1 = 2
```

```
示例 2：
输入：n = 3
输出："111"
解释：(-2)2 + (-2)1 + (-2)0 = 3
```

#### 解法

基本思路：**模拟、数学**

本题主要用到了**十进制转n进制**的方法：**除n取余，逆序排列**。代码模拟了这个过程。

注意：因为填入的结果只有0、1，而余数可能为 -1，可以通过商+1重新计算余数，不影响结果。

#### 代码

```cpp
class Solution {
public:
    string baseNeg2(int n) {
        if(n == 0)  
            return "0";
        string res = "";
        while(n){
            int quotient = n / -2;
            int remainder = n - quotient * -2;
            if(remainder < 0)
                remainder = n - ++quotient * -2;
            res += to_string(remainder);
            n = quotient;    
        }
        return string(res.rbegin(), res.rend());
    }
};
```



### 47.全排列Ⅱ

#### 题干

给定一个可包含重复数字的序列 `nums` ，***按任意顺序*** 返回所有不重复的全排列。

**示例**

```
示例 1：
输入：nums = [1,1,2]
输出：[[1,1,2],[1,2,1],[2,1,1]]
```

```
示例 2：
输入：nums = [1,2,3]
输出：[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]
```

#### 解法

基本思路：**回溯、DFS**

相比于46.全排列，这题在输入数组中存在重复数字，这意味着按照之前的方法会导致重复数字被使用导致排列相同的情况。因此需要判断和剪枝。

首先，要先找到重复数字是哪些，最方便的方法就是先对原数组进行**排序**，那么是否重复只需和上一个数字比较即可。

其次，因为排序，不能直接在原数组上操作了，需要新开一个数组存储每次排列的结果，通过**push**和**pop**来实现**状态重置**。

接着，就需要找到要被剪枝的部分的**判断条件**——

以本题的示例1来说：

![image.png](LeetCode--2023.4/1600386643-uhkGmW-image.png)

可以发现，对于一个重复数字，如果它的上一个相同数字已经被使用了（添加进了数组中），那么该数字是不影响接下来的使用的，因为是添加到上一个数字后面的。而对于未被使用（不在结果数组中）的相同数字，就会导致结果重复。1、1、2中选1和选1，剩下的都是1、2，那么结果也都是一样的，因此可以得到跳过的条件：

**遍历到的数字和上一个相同（重复了）且上一个数字未被使用。**使用一个数组进行记录使用情况，在递归前后改变状态完成状态重置。

注意：

1. i - 1 越界问题，要加上 i > 0;
2. 由于原数组被排序了，也无法得知上一个被push进数组的是哪个，因此for循环需要全部遍历一遍，对于已经被push的（状态数组为true，直接跳过即可）。
3. idx用于统计结果数组中已push的数字数量，满了就存储一个结果并开始状态重置。

#### 代码

```cpp
class Solution {
public:
    void dfs(vector<vector<int>>& res, vector<int>& sub, vector<bool>& used, vector<int>& nums, int idx){
        if(idx == nums.size()){
            res.push_back(sub);
            return;
        }
        for(int i = 0; i < nums.size(); ++i){
            if(used[i] || i > 0 && nums[i] == nums[i-1] && !used[i-1])
                continue;
            sub.push_back(nums[i]);
            used[i] = true;
            dfs(res, sub, used, nums, idx + 1);
            used[i] = false;
            sub.pop_back();
        }
    }
    vector<vector<int>> permuteUnique(vector<int>& nums) {
        vector<vector<int>> res;
        vector<int> sub;
        vector<bool> used(nums.size());
        sort(nums.begin(), nums.end());
        dfs(res, sub, used, nums, 0);
        return res;
    }
};
```



### 56.合并区间

#### 题干

以数组 **intervals** 表示若干个区间的集合，其中单个区间为 intervals[i] = [starti, endi] 。请你**合并所有重叠的区间**，并返回 **一个不重叠的区间数组**，该数组需恰好**覆盖**输入中的**所有区间** 。

**示例**

```
示例 1：
输入：intervals = [[1,3],[2,6],[8,10],[15,18]]
输出：[[1,6],[8,10],[15,18]]
```

```
示例 2：
输入：intervals = [[1,4],[0,4]]
输出：[[0,4]]
```

#### 解法

基本思路：**双指针？**

先对二维数组排序，sort默认按第一列升序排，不需要自定义比较函数（自定义的比较函数会让排序慢上很多，其中**单写函数比lambda函数要快一些**）。排完序后需要合并的区间必然是**连续**的。

双指针（这里用了一个大小为2的vector便于存储），只需要判断**左区间和上一个的右区间**即可。

- 左区间大，不用合并，则直接将当前区间加入结果，双指针替换为当前区间的左右边界；
- 左区间小，再判断**右区间和上一个的右区间**，只有当前右区间更大的时候需要替换右边界的值。

结束循环后，若最后一个区间需要合并，则值已经更新在双指针sub中；若不需要合并，则sub也已经替换为了该区间。仅需将sub再加入结果中即可。

#### 代码

```cpp
class Solution {
public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        sort(intervals.begin(), intervals.end());
        vector<vector<int>> res;
        vector<int> sub = intervals[0];
        for(int i = 1; i < intervals.size(); ++i){
            if(intervals[i][0] <= sub[1]){
                if(intervals[i][1] > sub[1])
                    sub[1] = intervals[i][1];
            }
            else{
                res.push_back(sub);
                sub = intervals[i];
            }
        }
        res.push_back(sub);
        return res;56
    }
};
```



### 57.插入区间

#### 题干

给你一个 **无重叠的** *，*按照区间起始端点排序的区间列表。

在列表中插入一个新的区间，你需要确保列表中的区间仍然有序且不重叠（如果有必要的话，可以合并区间）。

**示例**

```
示例 1：
输入：intervals = [[1,3],[6,9]], newInterval = [2,5]
输出：[[1,5],[6,9]]
```

```
示例 2：
输入：intervals = [[1,2],[3,5],[6,7],[8,10],[12,16]], newInterval = [4,8]
输出：[[1,2],[3,10],[12,16]]
```

#### 解法

基本思路：**模拟**

遍历一遍，每个元素判断以下三种状态：

1. 完全在插入区间左边，直接push
2. 与插入区间有重叠，求他们的并集，更新插入区间的左右边界。
3. 完全在插入区间右侧，需要判断插入区间是否push了，没push就push一下，然后push本次元素。

如果遍历完都没有push过，那么最后push插入区间。

#### 代码

```cpp
class Solution {
public:
    vector<vector<int>> insert(vector<vector<int>>& intervals, vector<int>& newInterval) {
        bool merged = false;
        vector<vector<int>> res;
        for (auto& range: intervals) {
            if (range[1] < newInterval[0])
                res.push_back(range);
            else if (range[0] > newInterval[1]) {
                if (!merged) {
                    res.push_back(newInterval);
                    merged = true;                    
                }
                res.push_back(range);
            }
            else {
                newInterval[0] = min(newInterval[0], range[0]);
                newInterval[1] = max(newInterval[1], range[1]);
            }
        }
        if (!merged) {
            res.push_back(newInterval);
        }
        return res;
    }
};
```



### 73.矩阵置0

#### 题干

给定一个 `m x n` 的矩阵，如果一个元素为 **0** ，则将其所在行和列的所有元素都设为 **0** 。请使用 **原地** 算法**。**

你能想出一个仅使用**常量空间**的解决方案吗？

**示例**

```
示例 1：
输入：matrix = [[1,1,1],[1,0,1],[1,1,1]]
输出：[[1,0,1],[0,0,0],[1,0,1]]
```

```
示例 2：
输入：matrix = [[0,1,2,0],[3,4,5,2],[1,3,1,5]]
输出：[[0,0,0,0],[0,4,5,0],[0,3,1,0]]
```

#### 解法

基本思路：**模拟**

仅用常数空间，那只能利用原数组进行操作，也就是挑一行和一列记录该行/列是否有0。于是问题转化为了如何记录这一行一列本身是否有0？

思考过程中发现，第一行是最先遍历的话，就能先知道这一行是否有0，那么这一行的值就不重要了，可以用来存储。那么对于列来说，如果是行内遍历列的话（for循环行在外面），只需要维护一个标志位，每次行内遍历时先判断的是第一列，如果是0，标志位置位，就知道了第一列是否有0。这样第一列的值也不重要了（判断过了），也可以用来存储了。

最后按照第一行和第一列的记录情况把对应行列置0。注意跟上述过程相反，为了将记录信息保存到最后，从右下角开始遍历，先向左（到第一列时，这个位置的记录就不需要了。**根据标志位对第一列单独置0**）再向上。

#### 代码

```cpp
class Solution {
public:
    void setZeroes(vector<vector<int>>& matrix) {
        bool col0 = false;
        int row = matrix.size();
        int col = matrix[0].size();
        for(int i = 0; i < row; ++i){
            if(matrix[i][0] == 0)   col0 = true;
            for(int j = 1; j < col; ++j){
                if(matrix[i][j] == 0){
                    matrix[i][0] = 0;
                    matrix[0][j] = 0;
                }
            }
        }
        for(int i = row - 1; i >= 0; --i){
            for(int j = col - 1; j >= 1; --j)
                if(matrix[i][0] == 0 || matrix[0][j] == 0)
                    matrix[i][j] = 0;
            if(col0)   matrix[i][0] = 0;
        }
    }
};
```



## 2023.4.8

### 203.移除链表元素

#### 解法

基本思路：**链表的删除**

注意：

- 创建的链表指针temp是**new**的，需要用**delete**手动释放；而tmp指向的是要删除的链表元素，因此也需要**delete**。
- cur指针不是**new**或**malloc**分配了空间的，系统会自动释放内存。
- **free**是C的API，适用于malloc和calloc；**delete**是C++的关键字，主要用于释放new分配的内存，也可用于malloc和calloc。

#### 代码

```cpp
class Solution {
public:
    ListNode* removeElements(ListNode* head, int val) {
        ListNode* temp = new ListNode(0, head);
        ListNode* cur = temp;
        while(cur->next){
            if(cur->next->val == val){
                ListNode* tmp = cur->next;
                cur->next = cur->next->next;
                delete tmp;
            }
            else
                cur = cur->next;
        }
        head = temp->next;
        delete temp;
        return head;
    }
};
```



### 707.设计链表

#### 题干

你可以选择使用单链表或者双链表，设计并实现自己的链表。

单链表中的节点应该具备两个属性：val 和 next 。val 是当前节点的值，next 是指向下一个节点的指针/引用。

如果是双向链表，则还需要属性 prev 以指示链表中的上一个节点。假设链表中的所有节点下标从 0 开始。

实现 **MyLinkedList** 类：

- **MyLinkedList()** 初始化 MyLinkedList 对象。
- int **get**(int index) 获取链表中下标为 index 的节点的值。如果下标无效，则返回 -1 。
- void **addAtHead**(int val) 将一个值为 val 的节点插入到链表中第一个元素之前。在插入完成后，新节点会成为链表的第一个节点。
- void **addAtTail**(int val) 将一个值为 val 的节点追加到链表中作为链表的最后一个元素。
- void **addAtIndex**(int index, int val) 将一个值为 val 的节点插入到链表中下标为 index 的节点之前。如果 index 等于链表的长度，那么该节点会被追加到链表的末尾。如果 index 比长度更大，该节点将 不会插入 到链表中。
- void **deleteAtIndex**(int index) 如果下标有效，则删除链表中下标为 index 的节点。

**示例**

```
示例 1：
输入：
["MyLinkedList", "addAtHead", "addAtTail", "addAtIndex", "get", "deleteAtIndex", "get"]
[[], [1], [3], [1, 2], [1], [1], [1]]
输出：[null, null, null, null, 2, null, 3]
```

#### 解法

基本思路：**链表的增删查**

#### 代码

```cpp
class MyLinkedList {
public:
    MyLinkedList() {
        dummy = new ListNode(0);
        length = 0;
    }
    int get(int index) {
        if(index >= length || index < 0)
            return -1;
        ListNode* cur = dummy->next;
        while(index--)
            cur = cur->next;
        return cur->val;
    }
    void addAtHead(int val) {
        ListNode* newNode = new ListNode(val);
        newNode->next = dummy->next;
        dummy->next = newNode;
        length++;
    }
    void addAtTail(int val) {
        ListNode* newNode = new ListNode(val);
        ListNode* cur = dummy;
        while(cur->next)
            cur = cur->next;
        cur->next = newNode;
        length++;
    }
    void addAtIndex(int index, int val) {
        if(index > length || index < 0)
            return;
        ListNode* newNode = new ListNode(val);
        ListNode* cur = dummy;
        while(index--)
            cur = cur->next;
        newNode->next = cur->next;
        cur->next = newNode;
        length++;
    }
    void deleteAtIndex(int index) {
        if(index >= length || index < 0)
            return;
        ListNode* cur = dummy;
        while(index--)
            cur = cur->next;
        ListNode* tmp = cur->next;
        cur->next = cur->next->next;
        delete tmp;
        length--;
    }
private:
    ListNode* dummy;
    int length;
};
```



### 206.反转链表

#### 解法

基本思路：**双指针**

![img](LeetCode--2023.4/206.翻转链表.gif)

#### 代码

```cpp
class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        ListNode* tmp;
        ListNode* slow = nullptr;
        ListNode* fast = head;
        while(fast){
            tmp = fast->next;
            fast->next = slow;
            slow = fast;
            fast = tmp;
        }
        return slow;
    }
};
```

#### 优化

基本思路：**虚拟头节点、头插法**

建立一个新链表的虚拟头节点，指向nullptr。遍历原链表元素，依次插入到虚拟节点后。

速度比双指针快一些。

```cpp
class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        ListNode* dummy = new ListNode(0);
        ListNode* cur = head;
        while(cur){
            ListNode* tmp = cur->next;
            cur->next = dummy->next;
            dummy->next = cur;
            cur = tmp;
        }
        cur = dummy->next;
        delete dummy;
        return cur;
    }
};
```



### 24.两两交换链表中的节点

#### 题干

给你一个链表，两两交换其中相邻的节点，并返回交换后链表的头节点。你必须在不修改节点内部的值的情况下完成本题（即，只能进行节点交换）。

**示例**

```
示例 1：
输入：head = [1,2,3,4]
输出：[2,1,4,3]
```

```
示例 2：
输入：head = [1]
输出：[1]
```

#### 解法

基本思路：**模拟**

#### 代码

```cpp
class Solution {
public:
    ListNode* swapPairs(ListNode* head) {
        ListNode* dummy = new ListNode(0, head);
        ListNode* cur = dummy;
        while(cur->next != nullptr && cur->next->next != nullptr){
            ListNode* tmp = cur->next;
            ListNode* tmp2 = cur->next->next->next;
            cur->next = cur->next->next;
            cur->next->next = tmp;
            cur->next->next->next = tmp2;
            cur = cur->next->next;
        }
        cur = dummy->next;
        delete dummy;
        return cur;
    }
};
```



