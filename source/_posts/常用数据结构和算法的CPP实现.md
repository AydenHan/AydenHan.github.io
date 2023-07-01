---
title: 常用数据结构和算法的CPP实现
date: 2023-06-06 09:55:34
categories: 原理
tags: 
- 算法
- CPP
---

# 数据结构

## 二叉树

### 二叉树的种类

#### 满二叉树

如果一棵二叉树只有度为0的结点和度为2的结点，并且度为0的结点在同一层上，则这棵二叉树为满二叉树。具有如下性质：

1. 满二叉树中第 **i** 层的节点数为 **2 ^ (i - 1)** 个。
2. 深度为 **k** 的满二叉树必有 **2 ^ k - 1** 个节点 ，叶子数为 **2 ^ (k - 1)**。
3. 满二叉树中不存在度为 1 的节点，每一个分支点中都有两棵深度相同的子树，且叶子节点都在最底层。
4. 具有 **n** 个节点的满二叉树的深度为 **log2(n+1)**。

#### 完全二叉树

如果二叉树中除去最后一层节点为满二叉树，且最后一层的结点依次从左到右分布，则此二叉树被称为**完全二叉树**。

**优先级队列其实是一个堆，堆就是一棵完全二叉树，同时保证父子节点的顺序关系。**

#### 二叉搜索树

上述结构的树均没有数值，而二叉搜索树是有数值的。**二叉搜索树是一个有序树**，也叫二叉排序树、二叉查找树。

- 若它的左子树不空，则左子树上所有结点的值均**小于**它的根结点的值；
- 若它的右子树不空，则右子树上所有结点的值均**大于**它的根结点的值；
- 它的左、右子树也分别为二叉搜索树

<img src="常用数据结构和算法的CPP实现/20200806190304693.png" alt="img" style="zoom: 67%;" />

#### 平衡二叉搜索树

**AVL**（Adelson-Velsky and Landis）树，且具有以下性质：它是**一棵空树**或**它的左右两个子树的高度差的绝对值不超过1，并且左右两个子树都是一棵平衡二叉树。**

<img src="常用数据结构和算法的CPP实现/20200806190511967.png" alt="img" style="zoom: 50%;" />

最后一棵 不是平衡二叉树，因为它的左右两个子树的高度差的绝对值超过了1。

**C++中map、set、multimap，multiset的底层实现都是平衡二叉搜索树**，所以map、set的增删操作时间时间复杂度是 **logn**。



### 二叉树的属性

#### 对称性

采用**类前序遍历**，比较的是左右子树是否对称，左子树按照中左右的顺序，那么右子树就是中右左的顺序。

递归处理顺序为：

1. 比较当前左右节点
2. 比较左节点的左子节点和右子树右子节点
3. 比较左节点的右子节点和右子树左子节点

```cpp
    bool recursion(TreeNode* left, TreeNode* right) {
        if(!left && !right) return true;
        if(!left || !right || (left->val != right->val))  return false;
        return recursion(left->left, right->right) && recursion(left->right, right->left);
    }
    bool isSymmetric(TreeNode* root) {
        return recursion(root->left, root->right);
    }
```

#### 节点数

采用**后序遍历**，递归好写：

```cpp
int countNodes(TreeNode* root) {
    if (root == NULL) return 0;
    return 1 + countNodes(root->left) + countNodes(root->right);
}
```

- 时间复杂度：O(n)
- 空间复杂度：O(log n)，算上了递归系统栈占用的空间



#### 深度 & 高度

- 二叉树节点的**深度**：指从**根节点**到**该节点**的最长简单路径边的长度。（多用**前序**）
- 二叉树节点的**高度**：指从**该节点**到**叶子节点**的最长简单路径边的长度。（多用**后序**）

<img src="常用数据结构和算法的CPP实现/20210203155515650.png" alt="110.平衡二叉树2" style="zoom:50%;" />

#### 最近公共祖先LCA

LCA（Lowest Common Ancestor）又分为普通二叉树和搜索二叉树两种遍历方式。

**普通二叉树**

1. 从根节点开始遍历整个二叉树。
2. 如果当前节点为空节点或者等于其中一个目标节点，那么当前节点就是**其中一个目标节点**或者**其中一个目标节点的祖先**。返回当前节点。
3. 递归在当前节点的左子树中寻找两个目标节点的LCA，返回结果为left。
4. 递归在当前节点的右子树中寻找两个目标节点的LCA，返回结果为right。
5. 如果left和right都不为空，说明两个目标节点分别位于当前节点的左右子树中，那么**当前节点**就是它们的LCA。返回当前节点。
6. 如果left为空，说明两个目标节点都不在当前节点的左子树中，LCA一定在右子树中。返回right。
7. 如果right为空，说明两个目标节点都不在当前节点的右子树中，LCA一定在左子树中。返回left。

这个递归的过程会自底向上地找到LCA。在遍历过程中，每个节点都会被访问一次，因此时间复杂度为**O(N)**，其中N是二叉树中的节点数。递归过程中使用的**额外空间**取决于**二叉树的高度**，最坏情况下为**O(N)**。

```cpp
TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
    if(root == p || root == q || root == NULL)    return root;
    TreeNode* left = lowestCommonAncestor(root->left, p, q);
    TreeNode* right = lowestCommonAncestor(root->right, p, q);
    if(left && right)   return root;
    if(left == NULL)    return right;
    return left;
}
```

**二叉搜索树BST**

1. 从根节点开始，将目标节点的值与当前节点的值进行比较。
2. 如果当前节点的值大于两个目标节点的值，说明两个目标节点都位于当前节点的左子树中，那么继续在左子树中寻找LCA。
3. 如果当前节点的值小于两个目标节点的值，说明两个目标节点都位于当前节点的右子树中，那么继续在右子树中寻找LCA。
4. 如果以上两种情况都不满足，那么当前节点就是我们要找的LCA。

这是因为根据BST的性质，对于任意节点x，其左子树中的所有节点值都小于x的值，右子树中的所有节点值都大于x的值。因此，**如果两个目标节点分别位于x的左右子树中，那么x就是它们的LCA。**

这个方法的时间复杂度取决于树的高度，**最坏**情况下为**O(H)**，其中H是树的高度。递归过程中使用的**额外空间**取决于递归栈的深度，**最坏**情况下为**O(H)**。

```cpp
TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
    if(root->val > p->val && root->val > q->val)	return lowestCommonAncestor(root->left, p, q);
    else if(root->val < p->val && root->val < q->val)	return lowestCommonAncestor(root->right, p, q);
    else	return root;
}
```



### 二叉树的存储方式

#### 链式存储

<img src="常用数据结构和算法的CPP实现/2020092019554618.png" alt="img" style="zoom: 50%;" />

#### 顺序存储

<img src="常用数据结构和算法的CPP实现/20200920200429452.png" alt="img" style="zoom:50%;" />

用数组来存储二叉树的遍历：**如果父节点的数组下标是 i，那么它的左孩子就是 i \* 2 + 1，右孩子就是 i \* 2 + 2。**



### 二叉树的遍历方式

#### 深度优先方式（栈）

- 前序遍历（递归法，迭代法）
- 中序遍历（递归法，迭代法）
- 后序遍历（递归法，迭代法）

**前中后，指的是中间节点的遍历顺序。**

- 前序遍历：中左右
- 中序遍历：左中右
- 后序遍历：左右中

<img src="常用数据结构和算法的CPP实现/20200806191109896.png" alt="img" style="zoom:50%;" />

#### 广度优先方式（队列）

- 层次遍历（迭代法）



### 二叉树的构造

#### 后序 + 中序

<img src="常用数据结构和算法的CPP实现/20210203154249860.png" alt="106.从中序与后序遍历序列构造二叉树" style="zoom: 50%;" />

- 第一步：如果数组大小为零的话，说明是空节点
- 第二步：如果不为空，那么取后序数组最后一个元素作为节点元素
- 第三步：找到后序数组最后一个元素在中序数组的位置，作为切割点
- 第四步：切割中序数组，切成中序左数组和中序右数组 
- 第五步：切割后序数组，切成后序左数组和后序右数组（切割后的两个数组长度依旧和中序的相等）
- 第六步：递归处理左区间和右区间

#### 前序 + 中序

前序和后序的构造步骤差不多，区别在于第二步，前序是从序列头部取第一个值。

#### 前序 + 后序 X

**前序和后序不能唯一确定一棵二叉树！**，因为没有中序遍历无法确定左右部分，也就是无法分割。例如：

<img src="常用数据结构和算法的CPP实现/20210203154720326.png" alt="106.从中序与后序遍历序列构造二叉树2" style="zoom:50%;" />

tree1 和 tree2 的前序遍历都是[1 2 3]， 后序遍历都是[3 2 1]。



### 二叉树的实现

#### 链表：节点实现

```cpp
struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
};
```

#### 前中后序遍历（递归）

```cpp
void traversal(TreeNode* cur, vector<int>& vec) {
    if (cur == NULL) return;
    vec.push_back(cur->val);    // 中
    traversal(cur->left, vec);  // 左
    traversal(cur->right, vec); // 右
}
```

- 前序：中左右
- 中序：左中右
- 后序：左右中

#### 前序遍历（迭代）

```cpp
void traversal(TreeNode* root, vector<int>& vec) {
    stack<TreeNode*> st;
    if(root == nullptr)	return;
    st.push(root);
    while(!st.empty()){
        TreeNode* node = st.top();
        st.pop();
        vec.push_back(node->val);
        if(node->right)	st.push(node->right);
        if(node->left)	st.push(node->left);	// 因为读完根节点后是左节点，因此需要先将右节点压栈，才能先读左节点
    }
}
```

#### 后序遍历（迭代）

前序是中左右，反一下遍历子节点的顺序，先右再左，就是中右左；而后续是左右中，两者相反，只需在中序的基础上反转数组即可。

```cpp
void traversal(TreeNode* root, vector<int>& vec) {
    stack<TreeNode*> st;
    if(root == nullptr)	return;
    st.push(root);
    while(!st.empty()){
        TreeNode* node = st.top();
        st.pop();
        vec.push_back(node->val);
        if(node->left)	st.push(node->left);	
        if(node->right)	st.push(node->right);
    }
    reverse(vec.begin(), vec.end());
}
```

#### 中序遍历（迭代）

比较特殊，存在**访问节点（遍历节点）和处理节点（将元素放进结果集）不一致**的情况。

因为中序是左中右的顺序，所以需要先遍历到最左侧的左节点（**没下一个左节点时**），加入结果中。此时该节点为局部根节点（相当于中），然后就访问右节点。（右节点可能存在左节点和右节点，所以跟根节点的遍历一样处理）。

```cpp
class Solution {
public:
    vector<int> inorderTraversal(TreeNode* root) {
        vector<int> res;
        stack<TreeNode*> st;
        TreeNode* cur = root;
        if(root == nullptr) return res;
        while(!st.empty() || cur){
            if(cur){
                st.push(cur);
                cur = cur->left;
            }
            else {
                cur = st.top();
                st.pop();
                res.push_back(cur->val);
                cur = cur->right;
            }            
        }
        return res;
    }
};
```

#### 层序遍历

```cpp
void levelOrder(TreeNode* root, vector<vector<int>>& res) {
    if(root == nullptr)  return;
    queue<TreeNode*> q;
    q.push(root);
    while(!q.empty()){
        vector<int> layer;
        int n = q.size();
        for(int i = 0; i < n; ++i){
            TreeNode* node = q.front();
            q.pop();
            layer.push_back(node->val);
            if(node->left)  q.push(node->left);
            if(node->right)  q.push(node->right);
        }
        res.push_back(layer);
    }
    return;
}
```

#### 前中序构造

```cpp
TreeNode* buildChild(vector<int>& preorder, vector<int>& inorder, int preHead, int inHead, int len) { 
    if(len == 0)    return nullptr;
    TreeNode* node = new TreeNode(preorder[preHead]);
    if(len == 1)    return node;
    int seg;
    for(seg = inHead; seg < inHead + len; ++seg) 
        if(inorder[seg] == node->val)
            break;
    int rightLen = inHead + len - seg - 1;
    node->left = buildChild(preorder, inorder, preHead + 1, inHead, seg - inHead);
    node->right = buildChild(preorder, inorder, preHead + 1 + seg - inHead, seg + 1, rightLen);
    return node;
}
buildChild(preorder, inorder, 0, 0, preorder.size());
```

#### 中后序构造

```cpp
TreeNode* buildChild(vector<int>& inorder, vector<int>& postorder, int inHead, int postTail, int len) {
    if(len == 0)    return nullptr;
    TreeNode* node = new TreeNode(postorder[postTail]);
    if(len == 1)    return node;
    int seg;
    for(seg = inHead; seg < inHead + len; ++seg) 
        if(inorder[seg] == node->val)
            break;
    int rightLen = inHead + len - seg - 1;
    node->left = buildChild(inorder, postorder, inHead, postTail - rightLen - 1, seg - inHead);
    node->right = buildChild(inorder, postorder, seg + 1, postTail - 1, rightLen);
    return node;
}
buildChild(inorder, postorder, 0, postorder.size() - 1, postorder.size());
```

#### 删除

```cpp
TreeNode* deleteNode(TreeNode* root, int key) {
    if (root == nullptr) return root;
    if (root->val == key) {
        if (root->right == nullptr) { // 这里第二次操作目标值：最终删除的作用
            return root->left;
        }
        TreeNode *cur = root->right;
        while (cur->left) {
            cur = cur->left;
        }
        swap(root->val, cur->val); // 这里第一次操作目标值：交换目标值其右子树最左面节点。
    }
    root->left = deleteNode(root->left, key);
    root->right = deleteNode(root->right, key);
    return root;
}
```



#### BST插入

**递归**

```cpp
TreeNode* insertIntoBST(TreeNode* root, int val) {
    if(root ==nullptr)  
        return new TreeNode(val);
    if(root->val > val) 
        root->left = insertIntoBST(root->left, val);
    else  				
        root->right = insertIntoBST(root->right, val);
    return 	root;
}
```

**迭代**

```cpp
TreeNode* insertIntoBST(TreeNode* root, int val) {
    if(root == nullptr) return new TreeNode(val);
    TreeNode* cur = root;
    TreeNode* parent = root;
    while(cur) {
        parent = cur;
        if(cur->val > val)  
            cur = cur->left;
        else    
            cur = cur->right;
    }
    if(parent->val > val)  
        parent->left = new TreeNode(val);
    else    
        parent->right = new TreeNode(val);
    return root;
}
```

#### BST删除（迭代）

```cpp
TreeNode* deleteNode(TreeNode* root, int key) {
    if(root == nullptr) return root;
    if(root->val > key)
        root->left = deleteNode(root->left, key);
    else if(root->val < key)
        root->right = deleteNode(root->right, key);
    else {
        if(!root->left && !root->right) {	// 全空，叶子节点不用调整结构
            delete root;
            return nullptr;
        }
        if(!root->left) {					// 只有右子树，把右子树挪上来
            TreeNode* tmp = root->right;
            delete root;
            return tmp;
        }
        if(!root->right) {					// 只有左子树，把左子树挪上来
            TreeNode* tmp = root->left;
            delete root;
            return tmp;
        }
        else {								// 左右子树均有，左子树归入右子树的最左侧叶子节点下，右子树上挪
            TreeNode* cur = root->right;
            while(cur->left)
                cur = cur->left;
            cur->left = root->left;
            TreeNode* tmp = root->right;
            delete root;
            return tmp;
        }
    }
    return root;
}
```

#### 有序数组构造高度平衡BST（递归）

迭代会较为麻烦，因为需要开辟多个队列存储数组下标和节点信息。

```cpp
TreeNode* sortedArrayToSubBST(vector<int>& nums, int l, int r) {
    if(l > r)   return nullptr;
    int mid = l + (r - l) / 2;
    TreeNode* nd = new TreeNode(nums[mid]);
    nd->left = sortedArrayToSubBST(nums, l, mid - 1);
    nd->right = sortedArrayToSubBST(nums, mid + 1, r);
    return nd;
}
TreeNode* sortedArrayToBST(vector<int>& nums) {
    return sortedArrayToSubBST(nums, 0, nums.size() - 1);
}
```

### 注

- 涉及到二叉树的构造，无论普通二叉树还是二叉搜索树一定前序，都是先构造中节点。
- 求普通二叉树的属性，一般是后序，一般要通过递归函数的返回值做计算。
- 求二叉搜索树的属性，一定是中序了，要不白瞎了有序性了。



## 堆

### 堆的定义

#### 二叉堆

堆是一个树形结构，底层是一棵**完全二叉树**。而完全二叉树是一层一层按照进入的顺序排成的。按照这个特性，我们可以用**数组**来按照完全二叉树实现堆。

<img src="常用数据结构和算法的CPP实现/70.png" alt="img" style="zoom:67%;" />

上图就是一个完全二叉树，也是一个最大堆。而最大堆有一个性质：**每一个节点的值都小于它父节点的值**。

需要注意的是，**每一个节点的值的大小与它所处的深度没有必然的联系**。如第三层的六号和七号节点都小于处于最后一层的八号和十号节点。



### 堆的实现

#### 堆的存储

如果将这个最大堆存入数组中，黑色的数字就是存储的顺序。可以根据任意一个节点的索引(除去根节点)找到它的父节点的索引，如果当前节点的索引为index，那么：

- 当前节点的父节点 = index / 2(这里我们将结果取整)。
- 当前节点的左子节点 = index * 2
- 当前节点的右子节点 = index * 2 + 1。
- 

#### 堆的插入删除

**1.建立堆**

数组具有对应的树表示形式。一般情况下，树并不满足堆的条件，通过重新排列元素，可以建立一颗“堆化”的树。以下以大根堆为例。

**2.插入元素**

新元素被插入到列表层（即完全二叉树最后的位置），将其和父节点比较。如果新元素比父节点大，那么交换两者。交换之后，继续和新的父节点比较，直至新元素不比父节点大，随后树被更新以恢复堆次序。（其时间复杂度为**O(logN)**），以上操作称为**上溯**（**percolate up**）操作。

**3.删除元素**

删除总是发生在**根节点**处。树中最后一个元素被用来填补空缺位置，称为暂时根节点，然后将暂时根节点不断和子节点（**左右两子节点中大的那一个节点**）进行比较，如果他比子节点小，则交换节点位置，直到暂时根节点不小于任何一个子节点，结果树被更新以恢复堆条件。以上操作被称为**下溯**（**percolate down**）。



#### 具体实现

**简单版本：**

一个固定空间大小，支持选择基础数据类型的大根堆。

```cpp
template<typename T>
class MaxHeapStable{
private:
    T* data;
    int idx;
    int len;

    void percolate_up(int i){
        while(i > 1 && data[i] > data[i/2]){
            swap(data[i], data[i/2]);
            i /= 2;
        }
    }
    void percolate_down(int i){
        while(i * 2 <= idx){
            int child = i * 2;
            if(child + 1 <= idx && data[child] < data[child + 1])	child += 1;
            if(data[i] >= data[child])	break;
            swap(data[i], data[child]);
            i = child;
        }
    } 
public:
    MaxHeapStable(int len){
        data = new T[len + 1];
        idx = 0;
        this->len = len;
    }
    ~MaxHeapStable(){
        delete [] data;
    }
    int size(){
        return idx;
    }
    bool isEmpty(){
        return idx == 0;
    }
    void push(T val){
        assert(idx < len);
        data[++idx] = val;
        percolate_up(idx);
    }
    T pop(){
        assert(idx > 0);
        T res = data[1];
        swap(data[1], data[idx]);
        idx--;
        percolate_down(1);
        return res;
    }
};
```

**2.0版本**

底层改用vector实现，支持动态大小、选择基础数据类型的大根堆。

```cpp
template<typename T>
class MaxHeapBase{
private:
    vector<T> data;
    int idx;

    void big_percolate_up(int i){
        while(i > 1 && data[i] > data[i/2]){
            swap(data[i], data[i/2]);
            i /= 2;
        }
    }
    void big_percolate_down(int i){
        while(i * 2 <= idx){
            int child = i * 2;
            if(child + 1 <= idx && data[child] < data[child + 1])	child += 1;
            if(data[i] >= data[child])	break;
            swap(data[i], data[child]);
            i = child;
        }
    } 
public:
    MaxHeapBase(){
        data.emplace_back(0);
    }
    MaxHeapBase(int len){
        data.resize(len + 1);
        data.emplace_back(0);
    }
    MaxHeapBase(initializer_list<T> vals){
        data.resize(vals.size() + 1);
        idx = 0;
        for(auto v : vals)
            push(v);
    }
    ~MaxHeapBase() { vector<T>().swap(data); }

    int size() { return idx; }
    int capacity() { return data.capacity(); }
    int depth() { return ceil(log2(idx + 1)); }
    bool isEmpty() { return idx == 0; }
    void clear() { 
        data.clear(); 
        idx = 0;
    }

    void push(T val){
        idx++;
        if(idx < capacity())
            data[idx] = val;
        else
            data.emplace_back(val);
        big_percolate_up(idx);
    }
    T pop(){
        assert(idx > 0);
        swap(data[1], data[idx]);
        idx--;
        big_percolate_down(1);
        return data[idx+1];
    }
    T top(){
        return data[1];
    }
};
```

####  STL版本（priority_queue）

刚好写了道算法题，打算测试2.0时，发现需要对 pair<int, int> 类型进行排序，也就意味着需要真正的泛型编程，支持自定义比较方式，才能支持底层容器vector能支持的全部类型。

注意，使用template实现模板类和函数时，必须将实现也放在头文件中，因为模板类和函数的实例化都是在预处理阶段，而不是编译、链接。若将其声明和定义分开，在预处理阶段在CPP文件填入声明时，找不到定义会报错。

**学习STL源码：**

1.首先形成一个堆的核心结构在于两个算法：**上溯和下溯**。

```cpp
// 上溯
template<typename _Iterator, typename _Distance, typename _Tp, typename _Compare>
void _push_heap_S(_Iterator __first, _Distance __holeIndex, _Distance __topIndex, _Tp __value, _Compare __cp) {
    // 获取它的父节点
    _Distance __parent = (__holeIndex - 1) / 2;
    // 不断向上更新直至不满足_Compare规则
    while(__holeIndex > __topIndex && __cp(__first + __parent, __value)) {
        *(__first + __holeIndex) = _GLIBCXX_MOVE(*(__first + __parent));
        __holeIndex = __parent;
        __parent = (__holeIndex - 1) / 2;
    }
    *(__first + __holeIndex) = _GLIBCXX_MOVE(__value);
}
```

在上溯中， **__holeIndex**就是新加入的需要调整的节点序号（从0开始）， **__value**是该节点的值， **__cp**是一个实现自定义比较方式的 **funtor仿函数**的临时对象。

**__topIndex**需要和后文结合起来看才明白意义，这里只是表明在调整过程中新加节点的位置不得超过它。

只要满足上述条件并且满足 **__cp**规则，就将父节点的值赋给新节点处，并更新待调整节点及其父节点位置。直至不满足 **__cp**规则，将 **__value**赋给当前待调整节点。

```cpp
// 下溯
template<typename _Iterator, typename _Distance, typename _Tp, typename _Compare>
void _adjust_heap_S(_Iterator __first, _Distance __holeIndex, _Distance __len, _Tp __value, _Compare __cp) {
    // __topIndex是保持整体结构不出问题的关键
    const _Distance __topIndex = __holeIndex;
    _Distance __secondChild = __holeIndex;
    // 将非叶子节点沉入叶子节点深度
    while (__secondChild < (__len - 1) / 2) {
        // 取子节点中更符合__Compare的节点
        __secondChild = 2 * (__secondChild + 1);
        if (__cp(__first + __secondChild, __first + (__secondChild - 1)))
            __secondChild--;
        // 交换两者位置（此时不比较）
        *(__first + __holeIndex) = _GLIBCXX_MOVE(*(__first + __secondChild));
        __holeIndex = __secondChild;
    }
    // 当size()为偶数，且洞节点被移至这个最小的非叶节点时，需要特殊处理（因为只有左节点）
    if ((__len & 1) == 0 && __secondChild == (__len - 2) / 2) {
        __secondChild = 2 * (__secondChild + 1);
        *(__first + __holeIndex) = _GLIBCXX_MOVE(*(__first + (__secondChild - 1)));
        __holeIndex = __secondChild - 1;
    }
    // 此时洞节点为最右的叶子节点，前面的节点均调整至了符合__cp规则的情况（合理的堆），相当于将这个洞节点的值插入前面的堆中
    _push_heap_S(__first, __holeIndex, __topIndex, _GLIBCXX_MOVE(__value),
            __gnu_cxx::__ops::__iter_comp_val(__cp));
}
```

该函数表现为以 **__holeIndex** 为根节点的局部下溯操作。当 **__holeIndex = 0** 为根节点时，该函数表现为全局的下溯操作。

while循环负责将 **__holeIndex** 节点逐层下沉直至叶子节点深度。

<font color="red">注意：</font>当size()为奇数时，最后一个非叶节点有两个叶子节点，此时正常完成循环，选择符合 **__cp** 规则的子节点交换沉入；但当size()为偶数时， **(__len - 1) / 2**计算得到的序号为最后的非叶节点，但实际上该节点依旧可以下沉一步，因此由下面的if处理特殊情况。

size()为偶数时， **(__len - 1) / 2**和 **(__len - 2) / 2**的计算结果是一致的（后者用于计算最后的非叶节点序号）。

此时，已经完成了一次下溯操作，，除去刚下沉至最后的那个叶子节点， **__holeIndex**及以下的节点已经调整至了符合 **__cp**规则的情况（合理的堆），此时又进行了一次上溯操作，相当于将这个节点插入堆中（<font color="red">TODO：这里不太明白为什么不直接下溯一步到位，要排除这个下沉元素再重新上溯一次</font>）。



2.其次，在初始化堆时，需要执行建堆操作。

```cpp
template<typename _Iterator, typename _Compare>
void _make_heap_S(_Iterator __first, _Iterator __last, _Compare __cp) {
    typedef typename iterator_traits<_Iterator>::value_type
    _ValueType;
    typedef typename iterator_traits<_Iterator>::difference_type
    _DistanceType;

    if (__last - __first < 2)
	    return;
    // size()
    const _DistanceType __len = __last - __first;
    // 获取最后一个非叶子节点的位置
    _DistanceType __parent = (__len - 2) / 2;
    // 从后向前遍历所有非叶子节点，每个节点都仅与其下面的节点按照_Compare进行调整，不影响树的整体结构
    while (true) {
        // 取出每个非叶子节点的值
        // _GLIBCXX_MOVE根据_Compare版本选择使用std::move还是直接赋值。
        _ValueType __value = _GLIBCXX_MOVE(*(__first + __parent));
        _adjust_heap_S(__first, __parent, __len, _GLIBCXX_MOVE(__value), __cp);
        if (__parent == 0)
            return;
        __parent--;
	}
}
// make heap
template<typename _Iterator> inline 
void make_heap_S(_Iterator _first, _Iterator _last) {
    _make_heap_S(_first, _last, 
        __gnu_cxx::__ops::__iter_less_iter());
}
template<typename _Iterator, typename _Compare> inline 
void make_heap_S(_Iterator _first, _Iterator _last, _Compare _cp) {
    _make_heap_S(_first, _last, 
        __gnu_cxx::__ops::__iter_comp_iter(_cp));
}
```

<font color="red">注意：</font>这里有个关键点就是把 **__parent**作为 **__topIndex**参数传入，保证非叶节点在调整时不会和节点上方的父节点有交集，影响树的整体结构。

举个例子：大根堆中，根节点序号0是整个堆的最小值，而最后一个非叶节点序号2是整个堆的最大值，此时按照 **_adjust_heap_S()** 函数的逻辑，2将下沉至叶子节点然后上溯。若没有 **__topIndex**限制，2回到原本位置后并不会停止，而是会继续向上与根节点比较，来到根节点的位置。此时根节点最小值被换到了2原本的位置，但2这个位置在 **_make_heap_S()** 中已经遍历结束了，不再碰了。但实际上这个节点是比它的叶子节点更小的，却没有处理的机会了，这就破坏了堆的结构。



3.然后就是堆的**插入、删除**。

插入就是在底层容器vector中加入新元素，然后调用上文中的上溯函数调整即可。

```cpp
// push heap
template<typename _Iterator> inline 
void push_heap_S(_Iterator _first, _Iterator _last) {
    typedef typename iterator_traits<_Iterator>::value_type
    _ValueType;
    typedef typename iterator_traits<_Iterator>::difference_type
    _DistanceType;
    _ValueType _value = _GLIBCXX_MOVE(*(_last - 1));
    _push_heap_S(_first, _DistanceType(_last - _first - 1), _DistanceType(0),
        _value, __gnu_cxx::__ops::__iter_less_val());
}
template<typename _Iterator, typename _Compare> inline 
void push_heap_S(_Iterator _first, _Iterator _last, _Compare _cp) {
    typedef typename iterator_traits<_Iterator>::value_type
    _ValueType;
    typedef typename iterator_traits<_Iterator>::difference_type
    _DistanceType;
    _ValueType _value = _GLIBCXX_MOVE(*(_last - 1));
    _push_heap_S(_first, _DistanceType(_last - _first - 1), _DistanceType(0),
        _value, __gnu_cxx::__ops::__iter_comp_val(_cp));
}
```

删除是对 **_adjust_heap_S()** 函数的应用。

```cpp
template<typename _Iterator, typename _Compare> inline 
void _pop_heap_S(_Iterator __first, _Iterator __last, _Iterator __res, _Compare __cp) {
    typedef typename iterator_traits<_Iterator>::value_type
    _ValueType;
    typedef typename iterator_traits<_Iterator>::difference_type
    _DistanceType;
    _ValueType __value = _GLIBCXX_MOVE(*__res);
    *__res = _GLIBCXX_MOVE(*__first);
    _adjust_heap_S(__first, _DistanceType(0), _DistanceType(__last - __first),
        _GLIBCXX_MOVE(__value), __cp);
}
//pop heap
template<typename _Iterator> inline 
void pop_heap_S(_Iterator _first, _Iterator _last) {
    if(_last - _first > 1){
        --_last;
        _pop_heap_S(_first, _last, _last, __gnu_cxx::__ops::__iter_less_iter());
    }
}
template<typename _Iterator, typename _Compare> inline 
void pop_heap_S(_Iterator _first, _Iterator _last, _Compare _cp) {
    if(_last - _first > 1){
        --_last;
        _pop_heap_S(_first, _last, _last, __gnu_cxx::__ops::__iter_comp_iter(_cp));
    }
}
```

这里 **__last**自减后再计算 **_DistanceType(last - first)** ，相当于忽略最后一个元素（被换下来的根节点），从第一个元素（被换到根节点的叶节点）开始进行下溯操作。



4.最后是**堆排序**

```cpp
template<typename _Iterator, typename _Compare>
void _sort_heap_S(_Iterator __first, _Iterator __last, _Compare __cp) {
    typedef typename iterator_traits<_Iterator>::value_type
    _ValueType;
    typedef typename iterator_traits<_Iterator>::difference_type
    _DistanceType;
    while(__last - __first > 1){
        --__last;
        _pop_heap_S(__first, __last, __last, __cp);
    }
}
template<typename _Iterator> inline 
void sort_heap_S(_Iterator _first, _Iterator _last) {
    _sort_heap_S(_first, _last, 
        __gnu_cxx::__ops::__iter_less_iter());
}
template<typename _Iterator, typename _Compare> inline 
void sort_heap_S(_Iterator _first, _Iterator _last, _Compare _cp) {
    _sort_heap_S(_first, _last, 
        __gnu_cxx::__ops::__iter_comp_iter(_cp));
}
```

堆排序在建堆完成之后就非常简单了，就是不断将堆顶元素弹出，加入到迭代器末端end()的过程。之后end()前移，继续在 **[ begin(),  end() )** 范围内完成pop操作直至范围内仅剩一个元素。



5.以上堆的方法函数设计好后，就可以通过它们定义一些利用堆特性的类了，例如**优先队列**。

```cpp
template<typename _Tp, typename _Sequence = vector<_Tp>,
	typename _Compare  = less<typename _Sequence::value_type> >
class priority_queue_S{
public:
    typedef typename _Sequence::value_type                value_type;
    typedef typename _Sequence::reference                 reference;
    typedef typename _Sequence::const_reference           const_reference;
    typedef typename _Sequence::size_type                 size_type;
    typedef          _Sequence                            container_type;
public:
    _Sequence sq;
    _Compare  cp;
public:
    explicit
    priority_queue_S(const _Sequence& _s, const _Compare& _c)
    : sq(_s), cp(_c) {
        make_heap_S(sq.begin(), sq.end(), cp);
    }
    explicit
    priority_queue_S(const _Sequence& _s = _Sequence(), _Compare&& _c = _Compare())
    : sq(move(_s)), cp(_c) {
        make_heap_S(sq.begin(), sq.end(), cp);
    }

    bool empty() const { return sq.empty(); }
    size_type size() const { return sq.size(); }
    size_type depth() const { return ceil(log2(this->size() + 1)); }
    void clear() { sq.clear(); }
   
    const_reference top() const { 
        __glibcxx_requires_nonempty();
        return sq.front(); 
    }

    void push(const value_type& _x){
        sq.push_back(_x);
        push_heap_S(sq.begin(), sq.end(), cp);
    }
    void push(value_type&& _x){
        sq.push_back(move(_x));
        push_heap_S(sq.begin(), sq.end(), cp);
    }

    template<typename... _Args>
    void emplace(_Args&&... _args){
        sq.emplace_back(forward<_Args>(_args)...);
        push_heap_S(sq.begin(), sq.end(), cp);
    }
    
    void pop(){
        __glibcxx_requires_nonempty();
        pop_heap_S(sq.begin(), sq.end(), cp);
        sq.pop_back();
    }
};
```



# 算法

## 排序

### 堆排序 - O(n*log(n))

#### 1.函数调用

实现堆排序其实仅需两个步骤：建堆、排序（将堆顶元素依次下溯）。

承接上文中的STL写法，实现仅需调用两个对应的函数：

```cpp
vector<int> a = {33, 1, 44, 2, 999, 77};
make_heap_S(a.begin(), a.end(), greater<int>());
sort_heap_S(a.begin(), a.end(), greater<int>());
```

注意，make heap和sort heap操作，要求**堆的比较方式是相同的**才行，也就是说如果不使用默认比较方式（less），就需要在两个函数中均传入同一个比较仿函数。

再注意，**sort_heap_S()** 排序的容器内的元素必须为一个堆，在排序后，这些元素将不再组成一个堆。



#### 2.简单数组实现

```cpp
void adjustHeap(vector<int>& arr, int start, int end) {
    int parent = start;
    // 这里选择左子节点，因为可能存在没有右子节点的情况
    int child = 2 * start + 1;
    while(child <= end){
        if(child+1 <= end && arr[child] < arr[child+1])
            ++child;
        if(arr[child] < arr[parent])
            return;
        else{
            swap(arr[child], arr[parent]);
            parent = child;
            child = 2 * parent + 1;
        }
    }
}
void heapSort(vector<int>& arr){
    int len = arr.size();
    // 第一步：建堆
    for(int i = (len - 2) / 2; i >= 0; --i)
        adjustHeap(arr, i, len - 1);
    // 第二步：排序
    for(int i = len - 1; i > 0; --i){
        swap(arr[i], arr[0]);
        adjustHeap(arr, 0, i - 1);
    }
}
```



## 回溯

回溯法，一般可以解决如下几种问题：

- **组合**问题：N个数里面按一定规则找出k个数的集合
- **切割**问题：一个字符串按一定规则有几种切割方式
- **子集**问题：一个N个数的集合里有多少符合条件的子集
- **排列**问题：N个数按一定规则全排列，有几种排列方式
- **棋盘**问题：N皇后，解数独等等

**所有回溯法的问题都可以抽象为树形结构！**

因为回溯法解决的都是在集合中递归查找子集，**集合的大小就构成了树的宽度，递归的深度，都构成的树的深度**。递归就要有终止条件，所以必然是一棵高度有限的树（N叉树）。



### 模板函数

```cpp
void backtracking(参数) {
    if (终止条件) {
        存放结果;
        return;
    }
    for (选择：本层集合中元素（树中节点孩子的数量就是集合的大小）) {
        处理节点;
        backtracking(路径，选择列表); // 递归
        回溯，撤销处理结果
    }
}
```



### 时空复杂度

子集问题分析：

- 时间复杂度：**O(n × 2 ^ n)**，因为每一个元素的状态无外乎取与不取，所以时间复杂度为**O(2^n)**，构造每一组子集都需要填进数组，又有需要**O(n)**，最终时间复杂度：**O(n × 2^n)**。
- 空间复杂度：**O(n)**，递归深度为n，所以系统栈所用空间为**O(n)**，每一层递归所用的空间都是常数级别，注意代码里的result和path都是全局变量，就算是放在参数里，传的也是引用，并不会新申请内存空间，最终空间复杂度为**O(n)**。

排列问题分析：

- 时间复杂度：**O(n!)**，这个可以从排列的树形图中很明显发现，每一层节点为n，第二层每一个分支都延伸了n-1个分支，再往下又是n-2个分支，所以一直到叶子节点一共就是 n * n-1 * n-2 * ..... 1 = n!。每个叶子节点都会有一个构造全排列填进数组的操作（对应的代码：`res.push_back(path)`），该操作的复杂度为**O(n)**。所以，最终时间复杂度为：n * n!，简化为**O(n!)**。
- 空间复杂度：**O(n)**，和子集问题同理。

组合问题分析：

- 时间复杂度：**O(n × 2^n)**，组合问题其实就是一种子集的问题，所以组合问题最坏的情况，也不会超过子集问题的时间复杂度。
- 空间复杂度：**O(n)**，和子集问题同理。



## 贪心

**手动模拟一下感觉可以局部最优推出整体最优，而且想不到反例，那么就试一试贪心**。

贪心算法一般分为如下四步：

- 将问题分解为若干个子问题
- 找出适合的贪心策略
- 求解每一个子问题的最优解
- 将局部最优解堆叠成全局最优解



## 动态规划

1. 确定dp数组（dp table）以及下标的含义
2. 确定递推公式
3. dp数组如何初始化
4. 确定遍历顺序
5. 举例推导dp数组



### 背包问题

![416.分割等和子集1](%E5%B8%B8%E7%94%A8%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%E5%92%8C%E7%AE%97%E6%B3%95%E7%9A%84CPP%E5%AE%9E%E7%8E%B0/20210117171307407.png)

#### 01背包

例：有n件物品和一个最多能背重量为w 的背包。第i件物品的重量是weight[i]，得到的价值是value[i] 。**每件物品只能用一次**，求解将哪些物品装入背包里物品价值总和最大。

按照动态规划五部曲进行分析：

- **确定dp数组以及下标的含义**（后续一切均以dp的含义为基础进行推理）

**dp[i] [j] 表示从下标为[0-i]的物品里任意取，放进容量为j的背包，价值总和最大是多少**。

- **确定递推公式**

有两个方向推出来**dp[i] [j] = max(dp[i - 1] [j], dp[i - 1] [j - weight[i]] + value[i])**

1. **不放物品i**：即 **dp[i - 1] [j]**。背包容量为 j ，里面不放物品 i 的最大价值，就是dp[i - 1] [j]。(其实就是当物品i的重量大于背包j的重量时，物品i无法放进背包中，所以背包内的价值依然和前面相同。)
2. **放物品i**：由 dp[i - 1] [j - weight[i]] 推出，dp[i - 1] [j - weight[i]] 为背包容量为 j - weight[i] 的时候不放物品 i的最大价值，那么**dp[i - 1] [j - weight[i]] + value[i]** （物品i的价值），就是背包放物品i得到的最大价值

- **dp初始化**

1. 如果背包容量j为0的话，即dp[i] [0]，无论是选取哪些物品，背包价值总和一定为0。
2. 状态转移方程可以看出 i 是由 i - 1 推导出来，那么 i 为0的时候就一定要初始化。

```cpp
vector<vector<int>> dp(weight.size(), vector<int>(bagweight + 1, 0));
for (int j = weight[0]; j <= bagweight; j++)
    dp[0][j] = value[0];
```

- **确立遍历顺序**

先遍历物品，然后遍历背包重量（均为**正序**）



#### 01背包 - 滚动数组

对于上述的二维dp数组，也是可以优化为一维的，类似于之前的动态规划数组一样。

可以发现在递推公式中，如果把 **dp[i - 1]**那一层拷贝到 **dp[i]**上，表达式即为：**dp[i] [j] = max(dp[i] [j], dp[i] [j - weight[i]] + value[i])**。这就是滚动数组的由来，需要满足的条件是上一层可以重复利用，直接拷贝到当前层。

于是可以得到滚动数组的通用模板如下：

先遍历物品（**正序**），然后遍历背包重量（**反序**）

```cpp
vector<int> dp(bagWeight + 1, 0);
    for(int i = 0; i < weight.size(); i++) { // 遍历物品
        for(int j = bagWeight; j >= weight[i]; j--) { // 遍历背包容量
            dp[j] = max(dp[j], dp[j - weight[i]] + value[i]);
        }
    }
```

关于<font color="red">**遍历顺序**</font>：

在01背包一维数组的遍历中，一定是**外层物品（正序）内层容量（反序）**。因为滚动数组在本质上还是一个对二维数组的遍历，并且右下角的值依赖上一层**左上角**（因此外层为遍历物品，内层容量反序）的值，因此需要保证左边的值仍然是上一层的，从右向左覆盖。



#### 完全背包

相当于01背包的变种。物品由取用1次变为了无数次。

因此上文中提到的<font color="red">**遍历顺序**</font>，在完全背包中为：**内外层可以互换，均为正序遍历**，注意判断下标是否越界。

```cpp
for(int j = 0; j <= bagWeight; j++) { // 遍历背包容量
    for(int i = 0; i < weight.size(); i++) { // 遍历物品
        if (j - weight[i] >= 0) dp[j] = max(dp[j], dp[j - weight[i]] + value[i]);
    }
}
```

**组合**

在完全背包的组合问题中，采用 += 的**累加**计算方式替换 max 等**比较**函数。

同时注意<font color="red">**遍历顺序**</font>：一定是**外层物品，内层容量，均正序**。

说明举例：给定一个由正整数组成且不存在重复数字的数组，找出和为给定目标正整数的组合的个数。

- nums = [1, 2, 3]
- target = 4

计算dp[4]的时候，结果集只有 {1,3} 这样的集合，不会有{3,1}这样的集合，因为nums遍历放在外层，3只能出现在1后面。这就**避免了同一组合多种排列导致重复的情况**。

**排列**

在完全背包的排列问题中，同样采用 += 的计算方式。

同时注意<font color="red">**遍历顺序**</font>：一定是**外层容量，内层物品，均正序**。

证明见组合的说明举例。



#### 多重背包

实际是一个**01背包**问题：每件物品最多有Mi件可用，把Mi件摊开，其实就是一个01背包问题了。

```cpp
void multi_pack() {
    vector<int> weight = {1, 3, 4};
    vector<int> value = {15, 20, 30};
    vector<int> nums = {2, 3, 2};
    int bagWeight = 10;
    for (int i = 0; i < nums.size(); i++) {
        while (nums[i] > 1) { // nums[i]保留到1，把其他物品都展开
            weight.push_back(weight[i]);
            value.push_back(value[i]);
            nums[i]--;
        }
    }
    vector<int> dp(bagWeight + 1, 0);
    for(int i = 0; i < weight.size(); i++) // 遍历物品
        for(int j = bagWeight; j >= weight[i]; j--) // 遍历背包容量
            dp[j] = max(dp[j], dp[j - weight[i]] + value[i]);
}
```

或是在遍历01背包时，将每个物品种类都再遍历一遍：

```cpp
void test_multi_pack() {
    vector<int> weight = {1, 3, 4};
    vector<int> value = {15, 20, 30};
    vector<int> nums = {2, 3, 2};
    int bagWeight = 10;
    
    vector<int> dp(bagWeight + 1, 0);
    for(int i = 0; i < weight.size(); i++) // 遍历物品
        for(int j = bagWeight; j >= weight[i]; j--) // 遍历背包容量
            // 以上为01背包，然后加一个遍历个数
            for (int k = 1; k <= nums[i] && (j - k * weight[i]) >= 0; k++) // 遍历个数
                dp[j] = max(dp[j], dp[j - k * weight[i]] + k * value[i]);
}
```



#### 总结

![img](%E5%B8%B8%E7%94%A8%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%E5%92%8C%E7%AE%97%E6%B3%95%E7%9A%84CPP%E5%AE%9E%E7%8E%B0/%E8%83%8C%E5%8C%85%E9%97%AE%E9%A2%981.jpeg)



### 树形DP

TODO
