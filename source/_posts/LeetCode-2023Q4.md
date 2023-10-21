---
title: LeetCode--2023Q4
date: 2023-10-10 22:18:41
categories: 原理
tags: 
- 算法
- CPP
---

# 打卡10月LeetCode

## 2023.10.10

### 128.最长连续序列

**解法**

基本思路：**哈希表**

要求时间复杂度为O(n)，那就不能排序后再找。并且肯定需要遍历一遍数组，因此判断的时间复杂度必须是O(1)。

那么就想到了哈希表，用哈希表存储数组中的不重复元素，遍历哈希表中的元素，每个元素先检查-1是否存在，不存在说明这是连续序列的第一个元素，进入下一步。之后循环判断+1的元素是否存在，存在则计数累加，对每个数产生的累加结果取最大值即可。

***Code***

```cpp
class Solution {
public:
    int longestConsecutive(vector<int>& nums) {
        unordered_set<int> st;
        for(int n : nums)
            st.insert(n);
        int res = 0;
        for(const int& n : st) {
            if(!st.count(n-1)) {
                int cur = n, cnt = 1;
                while(st.count(cur+1)) {
                    ++cur;
                    ++cnt;
                }
                res = max(res, cnt);
            }
        }
        return res;
    }
};
```



### 560.和为K的子数组

**解法**

基本思路：**哈希表、前缀和**

和为k的子数组[i, j]，可以由前缀和pre[j] - pre[i-1]计算得到，并且可以发现每一个前缀和都只和前一个前缀和有关，因此可以直接使用一个变量sum累加。同时可得 pre[i-1] = pre[j] - k。

因此可以维护一个哈希表，存储每一个前缀和出现的次数（初始化需要记录前缀和为0的次数为1，因为可能存在子数组是从第一个元素开始，此时公式需要支持找到key为0对应的值）。之后的遍历只需要寻找键 pre[j] - k，即可得到之前 pre[i-1] 的出现次数（因为元素可能为负数，因此某个前缀和可能出现多次），累加这个次数。

***Code***

```cpp
class Solution {
public:
    int subarraySum(vector<int>& nums, int k) {
        unordered_map<int, int> hash;
        hash[0] = 1;
        int res = 0, sum = 0;
        for(int n : nums) {
            sum += n;
            if(hash.count(sum - k))
                res += hash[sum - k];
            hash[sum]++;
        }
        return res;
    }
};
```



### 238.除自身以外数组的乘积

**解法**

基本思路：**前缀和**

其实是前缀积。除自身以外的乘积，可以分为自身左边的乘积 x 自身右边的乘积，用相同的方式计算。

先算左边的乘积，就是前缀积，累加相乘，注意 res[i] 保存的是[0, i-1]的乘积，所以先保存再相乘，最左边的元素左边没有元素，所以相当于 x 1不动，因此 res[0] = 1。同理之后从后往前遍历，每个元素从1开始，先乘保存，再累乘，得到的就是正确数组。

***Code***

```cpp
class Solution {
public:
    vector<int> productExceptSelf(vector<int>& nums) {
        vector<int> res(nums.size());
        int fac = 1;
        for(int i = 0; i < nums.size(); ++i) {
            res[i] = fac;
            fac *= nums[i];
        }
        fac = 1;
        for(int i = nums.size()-1; i >= 0; --i) {
            res[i] *= fac;
            fac *= nums[i];
        }
        return res;
    }
};
```



## 2023.10.121

### 2316.统计无向图中无法到达点对数

**解法**

基本思路：**并查集**

在最基础的并查集基础上，增加数组统计**每一个连通分量中的节点个数**。可以发现所求结果，对一个节点来说无法到达即为**该节点所在连通分量外的节点个数**。因此遍历所有节点，求无法到达节点的和，是实际结果的两倍（求的是对数，因此要除以2）。

***Code***

```cpp
class Solution {
public:
    long long countPairs(int n, vector<vector<int>>& edges) {
        vector<int> fa(n);
        vector<int> sz(n, 1);
        iota(fa.begin(), fa.end(), 0);
        function<int(int)> find = [&](int u) {
            return u == fa[u] ? u : fa[u] = find(fa[u]);
        };
        auto join = [&](int u, int v) {
            u = find(u);
            v = find(v);
            if(u == v)  return;
            if(sz[u] > sz[v]) {
                fa[v] = u;
                sz[u] += sz[v];
            }
            else {
                fa[u] = v;
                sz[v] += sz[u];
            }
        };
        for(auto& vec : edges)
            join(vec[0], vec[1]);
        long long res = 0;
        for(int i = 0; i < n; ++i)
            res += n - sz[find(i)];
        return res / 2;
    }
};
```

