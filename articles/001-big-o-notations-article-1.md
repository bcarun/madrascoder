---
layout: article
title: Algorithms - Big O Notations O(1) O(n) O(log n) Explained In Simple Terms
description: >
  Big O notations help us to represent an algorithm or a program’s efficiency. In this article, we will see 3 basic Big O notations O(1), O(n) and O(log n) with simple explanations and examples with code snippets.
category: article
image: assets/media/articles/001-big-o-notations-article-1/clock-title-picture.jpg
tags:
  - Algorithms
date: 2021-01-17
featured: true
---

Before jumping to learn about Big O notations, lets get some basics.

### What is an Algorithm?

Algorithms are methods used to complete a certain operation or solve a problem. There is more than one algorithm to solve a given problem. If there is more than one algorithm to solve a problem, how can we find, which is better or more efficient? This is where Big O notations are helpful.

Big O notations help us to represent an algorithm or a program's efficiency. As per wikipedia [Big O notation](https://en.wikipedia.org/wiki/Big_O_notation) is used to classify algorithms according to how their run time or space (memory) requirements grow as the input size grows. In order to represent the efficiency of an algorithm, Big O notations — such as O(n), O(1), O(log n) — are used.

### What does O(1) O(n) and O(log n) mean?

| Big O Notation | Name                       |
| -------------- | -------------------------- |
| O(n)           | Linear time operation      |
| O(1)           | Constant time operation    |
| O(log n)       | Logarithmic time operation |

In order to understand Big O notation, we need to understand constant time operations, linear time operations, and logarithmic time operations.

<hr>

### O(n): Linear Time Operation

Imagine there is a box containing cards with numbers printed on them (like 1, 2, 3, 4, … 16) and we are asked find if a card with number 6 is in that box. What do we need to do?

Pick one card at a time and check if the card we picked has number 6 (the number to search). If the card we picked matches the number to be searched, then we are done. Otherwise, we need to pick another card from the box. This way of picking one card at a time and verifying if it matches until all the n cards are checked is called **'Linear Time Operation'**.

If we are lucky, the card we search can be the first card we pick. But, if we are not lucky, we need to check till the last card to find the match. Thus worst case, we need to check all the n cards to find the match. Because we are checking for a match one by one and worst case we need to search till the last card (n<sup>th</sup> card), we call this as **'Linear Time Operation'** and it is represented as O(n).

Below code snippet demostrates 'Linear Time Operation'.

```java
int n = 16;
int[] numbers = {11,12,13,14,15,16,1,2,3,4,5,6,7,8,9,10};
int numberToSearch = 16;
​
int find(int numberToSearch, int[] numbers) {
  for (int i = 0; i < n; i++) {
    if (numbers[i] = numberToSearch)
      return i; // FOUND
  }
  return -1; // NOT FOUND
}
```

<hr>

### O(1): Constant Time Operation

Imagine we are given a box of cards with numbers (1, 2, 3, 4, … 16) and outside the box it's printed that the box contains 16 cards. If some ask you how many cards are there in the box, you can say 16 looking at the total number prited outside the box. If another person asks you the same question next day, you can answer again just by looking at the printed value outside the box, even if you get another box with 100 numbers in it and if it has a label saying the box contains 100 numbers. This is called **'Constant Time Operation'**. It is represented as O(1).

Below code snippet demostrates 'Constant Time Operation'.

```java
int n = 16;
int[] numbers = {11,12,13,14,15,16,1,2,3,4,5,6,7,8,9,10};
​
int findSize(int[] numbers) {
  return numbers.length;
}
```

<hr>

### O(log n): Logarithmic Time Operation

Imagine we have a box of cards with numbers (1, 2, 3, 4, … 16) and all the cards are in order. You are asked to find a card with number 16 from the box. Please note, here cards are in order starting 1..n. Let's split the cards into two parts. A total of 16 numbers is divided into two sets each containing eight numbers. if the number to search is greater than 8, then its on the right side of the split. See the below code snippet to see how the input (pack of cards) is split into 2 halfs.

Below code snippet demostrates spliting of input in 'Logarithmic Time Operation'.

```java
int n = 16;
int[] numbers = {1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16};
int numberToSearch = 16;
​
int median = 16/2 = 8;
int[] split1 = {1,2,3,4,5,6,7,8};
int[] split2 = {9,10,11,12,13,14,15,16};
```

Number 16 is greater than the greatest element in the <code>split1</code>, hence the number to search will only be <code>split2</code>. Continue this splitting until the end of cards or the card to search is found like in the below image.

![Binary Search Representation](/assets/media/articles/001-big-o-notations-article-1/binary-search.jpg)

Looking at the above image, we understand that we need atmost 4 steps (for a pack containing 16 cards) to find the card with given number.

This can be written as in below image,

![Binary Search Number Representation](/assets/media/articles/001-big-o-notations-article-1/number-representation.png)

In math, <code>n = 2<sup>x</sup></code> can be written as <code>log<sub>2</sub> n = x</code>. (Refer Binary Logarithm)

Hence, <code>16 = 2<sup>4</sup></code> can be written as <code>log<sub>2</sub> 16 = 4</code>.

This can be written as <code>log<sub>2</sub> n</code>, or simply <code>O(log n)</code>, where n is the number of elements/items to search.

Thus, four steps are required to find a number in a box containing 16 cards splitting the box into two parts every step (this is called [Binary Search Algorithm](https://en.wikipedia.org/wiki/Binary_search_algorithm)).

```java
int find(int[] numbers, int numberToSearch) {
    int left = 0;
    int right = numbers.length - 1;
​
    while (left <= right) {
      int mid = left + (right - left) / 2;
      if (numberToSearch < numbers[mid]){
          right = mid - 1;
      }
      else if (numberToSearch > numbers[mid]) {
          left = mid + 1;
      }
      else {
          return mid; // NUMBER FOUND
      }
    }
    return -1; // NUMBER NOT FOUND
}
```

**Another example:**

If for example, we have 64 cards, then maximum number of steps to find a number can be derived as below,

<code>64</code> can be written as <code>2<sup>6</sup></code>,

<code>2<sup>6</sup></code> can be written as <code>log<sub>2</sub> 64 = 6</code>.

Hence maximum of 6 steps is required to find a given number in a array of 64 numbers.

<hr>

### References & Further reading

[Time Complexity](https://en.wikipedia.org/wiki/Time_complexity#Linear_time)
