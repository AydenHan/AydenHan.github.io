---
title: 常用数据结构和算法的CPP实现
date: 2023-06-06 09:55:34
categories: 原理
tags: 
- 算法
- CPP
---

# 数据结构

## 堆

### 堆的定义

#### 满二叉树

如果二叉树中除了叶子结点，每个结点的度都为 **2**，则此二叉树称为**满二叉树**。具有如下性质

1. 满二叉树中第 **i** 层的节点数为 **2 ^ (i - 1)** 个。
2. 深度为 **k** 的满二叉树必有 **2 ^ k - 1** 个节点 ，叶子数为 **2 ^ (k - 1)**。
3. 满二叉树中不存在度为 1 的节点，每一个分支点中都有两棵深度相同的子树，且叶子节点都在最底层。
4. 具有 **n** 个节点的满二叉树的深度为 **log2(n+1)**。

#### 完全二叉树

如果二叉树中除去最后一层节点为满二叉树，且最后一层的结点依次从左到右分布，则此二叉树被称为**完全二叉树**。

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

在上溯中，**__holeIndex**就是新加入的需要调整的节点序号（从0开始），**__value**是该节点的值，**__cp**是一个实现自定义比较方式的**funtor仿函数**的临时对象。

**__topIndex**需要和后文结合起来看才明白意义，这里只是表明在调整过程中新加节点的位置不得超过它。

只要满足上述条件并且满足**__cp**规则，就将父节点的值赋给新节点处，并更新待调整节点及其父节点位置。直至不满足**__cp**规则，将**__value**赋给当前待调整节点。

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

该函数表现为以**__holeIndex**为根节点的局部下溯操作。，当**__holeIndex = 0**为根节点时，该函数表现为全局的下溯操作。

while循环负责将**__holeIndex**节点逐层下沉直至叶子节点深度。

<font color="red">注意：</font>当size()为奇数时，最后一个非叶节点有两个叶子节点，此时正常完成循环，选择符合**__cp**规则的子节点交换沉入；但当size()为偶数时， **(__len - 1) / 2**计算得到的序号为最后的非叶节点，但实际上该节点依旧可以下沉一步，因此由下面的if处理特殊情况。

size()为偶数时，**(__len - 1) / 2**和**(__len - 2) / 2**的计算结果是一致的（后者用于计算最后的非叶节点序号）。

此时，已经完成了一次下溯操作，，除去刚下沉至最后的那个叶子节点，**__holeIndex**及以下的节点已经调整至了符合**__cp**规则的情况（合理的堆），此时又进行了一次上溯操作，相当于将这个节点插入堆中（<font color="red">TODO：这里不太明白为什么不直接下溯一步到位，要排除这个下沉元素再重新上溯一次</font>）。



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

<font color="red">注意：</font>这里有个关键点就是把**__parent**作为**__topIndex**参数传入，保证非叶节点在调整时不会和节点上方的父节点有交集，影响树的整体结构。

举个例子：大根堆中，根节点序号0是整个堆的最小值，而最后一个非叶节点序号2是整个堆的最大值，此时按照**_adjust_heap_S()** 函数的逻辑，2将下沉至叶子节点然后上溯。若没有**__topIndex**限制，2回到原本位置后并不会停止，而是会继续向上与根节点比较，来到根节点的位置。此时根节点最小值被换到了2原本的位置，但2这个位置在**_make_heap_S()** 中已经遍历结束了，不再碰了。但实际上这个节点是比它的叶子节点更小的，却没有处理的机会了，这就破坏了堆的结构。



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

删除是对**_adjust_heap_S()** 函数的应用。

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

这里**__last**自减后再计算**_DistanceType(last - first)**，相当于忽略最后一个元素（被换下来的根节点），从第一个元素（被换到根节点的叶节点）开始进行下溯操作。



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

