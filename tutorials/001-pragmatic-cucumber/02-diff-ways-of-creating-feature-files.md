---
layout: tutorial
chapter: 2
title: Different patterns of creating Cucumber Feature files
description: >
  In this chapter, let us see different patterns of creating feature files, their pros and cons. You may learn all the patterns and use them accordingly.

category: tutorial
image: assets/media/tutorials/001-pragmatic-cucumber/chapter2/chuttersnap-cJxxfSEbO8Y-unsplash.jpg
tags:
  - Java
  - Spring
  - Cucumber
  - BDD
date:
featured: false
---

When I read books like Cucumber For Java, Cucumber Cookbook, writing feature files **sounded easy**, but when I sat down to write feature files and step definitions it was difficult. Didn't mean to say the books are not good, they are the best books for one to get started with BDD and Cucumber. One of the reason why I felt difficult was, creating feature files that are easy to read ended up having lots of step definition code and creating feature files to simplify development ended up having feature files that was hard to understand by product owner. **Writing feature file is an art**, it requires a lot of trial and error until the Software Engineer, Quality Analyst and Product Owner are all in same line of understanding.

Doing BDD for few years now, I discovered different patterns for creating feature files. Let us see some of the basic patterns here and learn other advanced patterns on the go.

Imagine we are building a Calculator product and it has **Addition** feature. Now, let us take one scenario **“Sum of numbers”** and see different ways of writing a feature file for it. Assuming you have already read about Cucumber, Feature file etc., let me jump and show some **patterns** of feature file and corresponding step definitions code.

<hr>

### Pattern 1: All Fields/Inputs in One Step

In the below stated feature file, you may notice that the 2 numbers **sum** are stated in a single `Given` step.

**Feature File**

```cucumber
Feature: Addition
  Scenario: Sum of two numbers
    Given first number is 10 and second number is 20
    When user executes sum function
    Then the sum is 30
```

**Corresponding Step Definitions Class**

```java
import io.cucumber.java.en.Given;

public class AdditionStepDefinitions {

  private int firstNumber;
  private int secondNumber;

  @Given("first number is {int} and second number is {int}") 
  public void firstNumberIs(int firstNumber, int secondNumber) {
    this.firstNumber = firstNumber;
    this.secondNumber = secondNumber;
  }

  @When("user executes sum function")
  public void userExecutesSumFunction() {
    calculatedSum = firstNumber + secondNumber;
  }

  @Then("the sum is {int}")
  public void theSumIs(int expectedSum) {
    assertThat(calculatedSum).isEqualTo(expectedSum);
  }
}
```

**Note:** This approach is more straight forward, it is very easy for a Product Owner to understand. But if you want to turn this scenario to support sum of 3, 4, 5 numbers, this style may not suite well.

**Learning:** One thing you can learn in this pattern is, you can capture any value from a step and use it for testing like how we captured 2 integers from {int} placeholder.

<hr>

### Pattern 2: One Step Per Field/Input

In the below stated Feature file, 2 numbers required for addition are stated in 2 different steps.

**Feature File**

```cucumber
Feature: Addition
  Scenario: Sum of two numbers
    Given first number is 10
    And second number is 20
    When user executes sum function
    Then the sum is 30
```

**Corresponding Step Definitions Class - Type 1**

```java
// Version 1
import io.cucumber.java.en.And;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

public class AdditionStepDefinitions {

  private int firstNumber;
  private int secondNumber;
  private int calculatedSum;

  @Given("first number is {int}")
  public void firstNumberIs(int firstNumber) { // Method 1
    this.firstNumber = firstNumber;
  }

  @And("second number is {int}")
  public void secondNumberIs(int secondNumber) { // Method 2
    this.secondNumber = secondNumber;
  }
  // ...
}
```

**Can this be improved?** Yes.

There are 2 methods (`firstNumberIs`, `secondNumberIs`) in the above step definition class file, one for each step in scenario. As stated above in the beginning of the chapter, we can replace 2 methods into 1 method (`firstOrSecondNumberIs`) by using Cucumber Expressions. Let's see how its done in below code

**Corresponding Step Definitions Class - Type 2**

```java
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import java.util.ArrayList;
import java.util.List;

public class AdditionStepDefinitions {

  private final List<Integer> listOfNumbers = new ArrayList<>();
  private int calculatedSum;

  @Given("first/second number is {int}")
  public void firstOrSecondNumberIs(int number) {
    listOfNumbers.add(number);
  }

  @When("user executes sum function")
  public void userExecutesSumFunction() {
    calculatedSum = listOfNumbers.stream()
        .mapToInt(Integer::intValue)
        .sum();
  }
```

Annotation 

`@Given("first/second number is {int}")`

matches both the scenario steps stated below,

```
Given first number is 10
And second number is 20
```

In the coming chapters, we will introduce some more reusable step definition patterns, so keep reading...

**Note:** Steps in this feature file reads like a story, one after the other we gather the inputs, then we perform the action and finally we assert and check expected result. It is simple for anyone to understand. Imagine if we have 20+ fields and we need to capture the input for all of the fields, scenario will have 20+ `@Given` steps, one for each input. Reading feature file with 20+ steps is hard.

**Learning:** One thing you can learn in this pattern is, you can gather inputs from various steps, save the state using instance variables of the class.

<hr>

### Pattern 3: List DataTable

In the below stated Feature file, inputs or list of numbers is represented in a Grid called DataTable.

**Feature File**

```cucumber
Feature: Addition
  Scenario: Sum of two numbers
    Given user wants to sum the following numbers
      | 10 |
      | 20 |
    When user executes sum function
    Then the sum is 30
```

**Corresponding Step Definitions Class - Type 1**

```java
import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import java.util.ArrayList;
import java.util.List;

public class AdditionStepDefinitions {

  private final List<Integer> listOfNumbers = new ArrayList<>();
  private int calculatedSum;

  @Given("user wants to sum the following numbers")
  public void userWantsToSumTheFollowingNumbers(DataTable dataTable) {
    List<Integer> numbers = dataTable.asList(Integer.class);
    listOfNumbers.addAll(numbers);
  }
  // ...
```

Step definition method `userWantsToSumTheFollowingNumbers(DataTable dataTable)` converts the data into a DataTable object and from that we use `dataTable.asList(Integer.class)` to convert that to a List<Integer>. 

You may be wondering, why this extra step of converting DataTable to a List. 

**Can it be improved?** Yes.

**Corresponding Step Definitions Class - Type 2**

```java
import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import java.util.ArrayList;
import java.util.List;

public class AdditionStepDefinitions {

  private List<Integer> listOfNumbers = new ArrayList();
  private int calculatedSum;

  @Given("user wants to sum the following numbers")
  public void userWantsToSumTheFollowingNumbers(List<Integer> numbers) {
    this.listOfNumbers.clear();
    this.listOfNumbers.addAll(numbers);
  }
  // ...
```

**Note:** Cucumber can automatically convert DataTable to List as stated in above step definition code.

> Some product owners like using these Grids or DataTables as they are very similar to spreadsheets look and feel. If your product owner is of this type, then using DataTable is best for you.

**Learning:** One thing that you can learn in this pattern is, you can use DataTable to gather all inputs in one shot and Cucumber automatically converts them to List<T> or List<Map<K, V>>.

<hr>

### Pattern 4: One Step Per Field Using Scenario Outline and Examples DataTable

In the below stated Feature file, there is `Scenario Outline` instead of `Scenario` and instead of getting input from steps, the input for test is in a `DataTable` under `Examples`.

**Feature File**

```cucumber
Feature: Addition
  
  Scenario Outline: Sum of two numbers - version 5
    
    Given first number is <firstNumber>
    And second number is <secondNumber>
    When user executes sum function
    Then the sum is <result>

    Examples:
      | firstNumber | secondNumber | result |
      | 10          | 20           | 30     |
      | 50          | 60           | 110    |
```

Creating `Feature` file with a lot of `Scenario` is one way. Creating feature file with one `Scenario Outline` and executing the Scenario once for each example test case is another approach. `Scenario Outline` always require `Examples`.

**Note 1:** Look at `<firstNumber>`, `<secondNumber>`, `<result>`, these are variables or placeholders and it will be replaced with values from the `Examples` DataTable.

**Note 2:** Look at the `Examples` DataTable, first row of the DataTable is the header row and each header is like a variable name. Starting row 2, every row is like the value assigned to a variable. Row 2 and Row 3 in the DataTable can be considered as 2 Test Cases. When you run the Cucumber tests, the 2 rows of examples will be executed as 2 test cases, one for row 2 ('10 + 20 = 30') and one for row 3 ('50 + 60 = 110').

**Corresponding Step Definitions Class**

```java
import static org.assertj.core.api.Assertions.assertThat;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import java.util.ArrayList;
import java.util.List;

public class AdditionStepDefinitions {

  private final List<Integer> listOfNumbers = new ArrayList<>();
  private int calculatedSum;

  @Given("first/second number is {int}")
  public void firstOrSecondNumberIs(int number) {
    listOfNumbers.add(number);
  }

  @When("user executes sum function")
  public void userExecutesSumFunction() {
    calculatedSum = listOfNumbers.stream()
        .mapToInt(Integer::intValue)
        .sum();
  }

  @Then("the sum is {int}")
  public void theSumIs(int expectedSum) {
    assertThat(calculatedSum).isEqualTo(expectedSum);
  }
}
```
Approach of using Scenario Outline and Examples are useful for validation use cases. Imagine you need to test 2 validations. “1. Sum function fails when first number is null”, “2. Sum function fails when second number is null”. Best way to create feature file is to use Scenario Outline with one example for each validation as stated above. Or, you may test one success test case and one failure test case.

**Learning:** One thing that you can learn in this pattern is, `Scenario Outline` and `Examples` always go with each other and each example is like one test case.

<hr>

### Pattern 5: Map<Key, Object> DataTable Using Scenario Outline and Examples

In the below Feature file, both Scenario Outline step and Examples are represented as DataTable.

**Feature File**
```cucumber
Feature: Addition
  
  Scenario Outline: Sum of two numbers

    Given user wants to sum the following numbers
      | firstNumber  | <firstNumber>  |
      | secondNumber | <secondNumber> |

    When user executes sum function
    Then the sum is <result>

    Examples:
      | firstNumber | secondNumber | result |
      | 10          | 20           | 30     |
      | 50          | 50           | 100    |
```

DataTable in the following step will be coverted to `Map<String, Integer>`.

```
    Given user wants to sum the following numbers
      | firstNumber  | <firstNumber>  |
      | secondNumber | <secondNumber> |
```

**Corresponding Step Definitions Class**

```java
import static org.assertj.core.api.Assertions.assertThat;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class AdditionStepDefinitions {

  private final List<Integer> listOfNumbers = new ArrayList<>();
  private int calculatedSum;

  @Given("user wants to sum the following numbers")
  public void userWantsToSumTheFollowingNumbers(Map<String, Integer> numbersMap) {
    listOfNumbers.add(numbersMap.get("firstNumber"));
    listOfNumbers.add(numbersMap.get("secondNumber"));
  }

  @When("user executes sum function")
  public void userExecutesSumFunction() {
    calculatedSum = listOfNumbers.stream()
        .mapToInt(Integer::intValue)
        .sum();
  }

  @Then("the sum is {int}")
  public void theSumIs(int expectedSum) {
    assertThat(calculatedSum).isEqualTo(expectedSum);
  }
}
```

**Note:** DataTable has 2 columns, first column correspond to the `Key` of the `Map` and second column is the `Value` of the `Map`, hence the method `userWantsToSumTheFollowingNumbers(Map<String, Integer> numbersMap)` argument is a `Map`.

**Learning:** One thing that you can learn in this pattern is, you can use DataTable in any step of the scenario or example.

<hr>

### Conclusion

Now that you learnt creating Feature file and corresponding step definition, there is one important concept to understand. Here it is,

>Feature files are executable specifications.

There are 2 pieces to the puzzle, specification and making it executable. As stated earlier, if execution (step definition code) is simplified, readability of feature file becomes hard and if readability of feature file is simplified, step definition code for execution becomes hard to maintain. The solution to art of creating and maintaining feature files is by finding a balance between readability and step definition code maintenance and this can be achieved by making developer and product owner work together to create feature files.

**In the next chapter,** we will see how we can represent a Java Object as DataTable and convert a DataTable into a Java Object in step definitions.

<hr>

### References

For more information on Cucumber Expressions you may refer [https://cucumber.io/docs/cucumber/cucumber-expressions/](https://cucumber.io/docs/cucumber/cucumber-expressions/){:target="_blank"}

For more information on DataTable, you may refer [https://cucumber.io/docs/cucumber/api/?sbsearch=DataTable](https://cucumber.io/docs/cucumber/api/?sbsearch=DataTable){:target="_blank"}

<hr>

### Credits

Photo by <a href="https://unsplash.com/@betteratf8?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Weston MacKinnon</a> on <a href="https://unsplash.com/s/photos/change?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
  
<hr>

[Previous Chapter]({% link tutorials/001-pragmatic-cucumber/01-getting-started.md %}) | 
[Scroll Up to Top]({% link tutorials/001-pragmatic-cucumber/02-diff-ways-of-creating-feature-files.md %}) | 
[Table of Contents]({% link tutorials/001-pragmatic-cucumber/index.md %}) |
[Next Chapter]({% link tutorials/001-pragmatic-cucumber/03-converting-datatable-to-java-object.md %})