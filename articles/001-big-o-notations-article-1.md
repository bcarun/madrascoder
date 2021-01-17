---
layout: article
title: Algorithms - Big O Notations O(1) O(n) O(log n) Explained In Simple Terms
description: >
  In order to learn Algorithms, first step is to learn is Big O notations. In this article, we will see 3 notations O(1), O(n) and O(log n) with simple examples.
category: article
image: assets/media/big-o-notations-article-1/big-o-notation.jpg
tags:
  - Algorithms
date: 2021-01-17
---

---

### What Is an Algorithm?

Algorithms are methods used to complete a certain operation or solve a problem. There is more than one way to solve a given problem; similarly, there is more than one algorithm to solve a given problem. If there is more than one algorithm to solving a problem, how can we find which is better or more efficient?

Big O notations help us to represent an algorithm or a program's efficiency. As per wikipedia [Big O notation](https://en.wikipedia.org/wiki/Big_O_notation) is used to classify algorithms according to how their run time or space requirements grow as the input size grows. In order to represent the efficiency of an algorithm, Big O notations — such as O(n), O(1), O(log n) — are used.

In this article, lets understand the following Big O notations

| Big O Notation | Name                       |
| -------------- | -------------------------- |
| O(n)           | Linear time operation      |
| O(1)           | Constant time operation    |
| O(log n)       | Logarithmic time operation |

In order to understand Big O notation, we need to understand constant time operations, linear time operations, and logarithmic time operations.

---

### O(n): Linear Time Operation

Assume that we have a box containing cards with numbers printed on them (like 1, 2, 3, 4, … 16) and we are asked find if number 6 is in the box. What do we need to do?

Pick one number at a time and check if the number we picked is 6 (the number to search).

If the number we picked matches the number to be searched, then we are good. Otherwise, we need to pick another number from the box. This way of picking one number at a time and verifying if it matches one after another until all the n numbers are picked is called linear operation. This way of searching n numbers is represented as O(n). If the number to find is the last number (the worst case scenario), we need to pick all the n numbers.

```java

  int n = 16;
  int[] numbers = {11,12,13,14,15,16,1,2,3,4,5,6,7,8,9,10};
  int numberToSearch = 16;
  ​
  int find(int numberToSearch, int[] numbers) {
    for (int i = 0; i &lt; n; i++) {
      if (numbers[i] = numberToSearch)
      return i; // FOUND
    }
    return -1; // NOT FOUND
  }

```

----

O(1): Constant Time Operation
Problem to be solved: Assume we are given a box of numbers (1, 2, 3, 4, … 16) and outside the box it's printed that the box contains 16 numbers. You are asked how many numbers/items are there in the box. Because you know the box is labeled as containing 16 balls, you reply saying the box contains 16. If another person asks you the same question next day, you can answer again just by looking at the box, even if you get another box with 100 numbers in it and if it has a label saying the box contains 100 numbers. This is called constant time operation. It is represented as O(1).

```java

  int n = 16;
  int[] numbers = {11,12,13,14,15,16,1,2,3,4,5,6,7,8,9,10};
  ​
  int findSize(int[] numbers) {
      return numbers.length;
  }

```
----

### O(log n): Logarithmic Time Operation
Assume we have a box that contains numbers (1, 2, 3, 4, … 16) and all the numbers are in order. You are asked to find a number 16 in the box. The catch here is that the numbers are in order. Let's split the numbers into two parts. A total of 16 numbers is divided into two sets each containing eight numbers.

```java

  int n = 16;
  int[] numbers = {1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16};
  int numberToSearch = 16;
  ​
  int median = 16/2 = 8;
  int[] split1 = {1,2,3,4,5,6,7,8};
  int[] split2 = {9,10,11,12,13,14,15,16};

```

Number 16 is greater than the greatest element in the split, hence the number to search will only be split in 2. Continue this splitting until the end of numbers or the number to search is found.

![Binary Search Representation](/assets/media/big-o-notations-article-1/binary-search.jpg)

Looking at the above picture, we are able to find a number in4 steps (in a list of 16 numbers).

This can be written as,

![Binary Search Number Representation](/assets/media/big-o-notations-article-1/number-representation.png)

In math, if n = 2<sup>x</sup> then log<sub>2</sub> n = x. (Refer Binary Logarithm)

Hence 16 = 2<sup>4</sup> can be written as log<sub>2</sub> 16 = 4.

This can be written as log2 n, or simply O(log n).

Thus, four steps are required to find a number in a box containing 16 numbers splitting the box into two every step (this is also called binary search).

```java

    int find(int[] numbers, int numberToSearch) {
        int left = 0;
        int right = numbers.length - 1;
​
       while (left &lt;= right) {
          int mid = left + (right - left) / 2;
          if (numberToSearch &lt; numbers[mid]){
              right = mid - 1;
          }
          else if (numberToSearch &gt; numbers[mid]) {
              left = mid + 1;
          }
          else {
              return mid; //NUMBER FOUND
          }
        }
        return -1; //NUMBER NOT FOUND
    }


```

I hope this is simple or at least easy to understand!

**Another example:**

If for example, we have 64 numbers, then maximum number of steps to find a number can be derived as below,

64 = 26, this can be written as log2 64 = 6. Hence maximum of 6 steps is required to find a number in a list of 64 numbers.
