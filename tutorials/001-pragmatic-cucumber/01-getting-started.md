---
layout: tutorial
chapter: 1
title: Getting Started with Cucumber, Java and Spring Boot
description: >
  In this chapter, let us setup Spring Boot + Cucumber project and run a simple feature file. Just follow along the chapter and try doing all the steps. This will give some familiarity to Cucumber and Behavior Driven Development (BDD). We will learn the concepts as we go.

category: tutorial
image: assets/media/tutorials/001-pragmatic-cucumber/chapter1/braden-collum-9HI8UJMSdZA-unsplash.jpg
tags:
  - Java
  - Spring
  - Cucumber
  - BDD
date:
featured: false
---
### 1. Prerequisites

For this tutorial, let us used the following 

**1. Java 11 LTS**  
**2. Cucumber 6.8.1**  
**3. Spring Boot 2.4.4**  
**4. Intellij IDE (You may use your favorite IDE)**  

<hr>

### 2. Create a Spring Boot Project using Spring Initializer

There are 2 ways you can create a Spring Boot project.
1. Using Spring Initializer website [https://start.spring.io/](https://start.spring.io/){:target="_blank"}
2. Use Spring Initializer in your IDE

In this chapter, we will use the option 1 (Using Spring Initializer website). Click open Spring Initializer website link and choose Maven Project, Java Language, Spring Boot version, Java version and all dependencies for this chapter and other chapters in this book as per below image.

![Spring Initializer](/assets/media/tutorials/001-pragmatic-cucumber/chapter1/spring-initializer.png)

After choosing Java version, Spring Boot version and above said dependencies, click on `Generate` button.

Spring Initializer will trigger a zip file download, you may unzip it and import the project into you favorite IDE.

<hr>

### 3. Maven Dependencies

Add the following Cucumber dependencies to pom.xml file

```xml
<!--
Java implementation of Cucumber BDD framework
https://github.com/cucumber/cucumber-jvm
-->
<dependency>
  <groupId>io.cucumber</groupId>
  <artifactId>cucumber-java</artifactId>
  <version>6.8.1</version>
  <scope>test</scope>
</dependency>

<!--
Library to use JUnit Platform to execute Cucumber Scenarios
This also helps IDE's to discover Cucumber tests and run
https://github.com/cucumber/cucumber-jvm/tree/main/junit-platform-engine
-->
<dependency>
  <groupId>io.cucumber</groupId>
  <artifactId>cucumber-junit-platform-engine</artifactId>
  <version>6.8.1</version>
</dependency>

<!--
Library to access Spring Application Context and share
state between cucumber step execution
-->
<dependency>
  <groupId>io.cucumber</groupId>
  <artifactId>cucumber-spring</artifactId>
  <version>6.8.1</version>
  <scope>test</scope>
</dependency>

<!--
  Spring doesn't include the right version for surefire to pickup
  TODO: Remove once the surefire or spring is upgraded
  [Recommended by Cucumber JVM committers]
-->
<dependency>
  <groupId>org.junit.platform</groupId>
  <artifactId>junit-platform-commons</artifactId>
  <version>1.7.1</version>
  <scope>test</scope>
</dependency>
```

<hr>

### 4. Rename CucumberBookSampleApplicationTests.java as CucumberSpringContextConfiguration.java

When you generate Spring Boot Project, it automatically creates a class under test directory to run all tests. In case of Cucumber, we don't want to use this class to trigger tests, let us use this class to configure spring context for executing spring boot application tests, hence we are renaming it to 'CucumberSpringContextConfiguration.java'

Navigate to following directory `src/test/java/com/madrascoder/cucumberbooksample/`

Rename CucumberBookSampleApplicationTests.java to `CucumberSpringContextConfiguration.java`

<hr>

### 5. Create a class called RunCucumberTest.java

```java
package com.madrascoder.cucumberbooksample;

import io.cucumber.junit.platform.engine.Cucumber;

@Cucumber
public class RunCucumberTest {}

```

RunCucumberTest class helps trigger Cucumber test. Also, it helps IDE to automatically recognize this class as a Test Class. You may right click to run all Cucumber tests using this class.

This is automatically run by maven as well.

<hr>

### 6. Create junit-platform.properties

Create a file under resources/junit-platform.properties and configure a couple of properties as stated below.

```properties
# Options if you don't want to publish test umber reports to 
# https://reports.cucumber.io cloud
cucumber.publish.quiet=true
cucumber.publish.enabled=false

# Cucumber Test Report Generation Plugins. Html report is generated 
# and packaged along with the application.
cucumber.plugin=pretty,html:target/classes/static/features/index.html
```

For other properties, you may refer to [https://cucumber.io/docs/cucumber/api/?sbsearch=Properties#options](https://cucumber.io/docs/cucumber/api/?sbsearch=Properties#options){:target="_blank"}

<hr>

### 7. Let's create our first feature file

Navigate to `src/test/resources/com/madrascoder/cucumberbooksample/`

**Note:** Remember, you have to create multiple directories and not one directory as com.madrascoder.cucumberbooksample like what you do for package. This is `src/test/resources` directory and `src/test/java`.

Create a file named `1000-sum-of-numbers.feature` with the following feature.

```cucumber
Feature: Addition
  Scenario: Sum of two numbers
    Given first number is 10
    And second number is 20
    When user executes sum function
    Then the sum is 30
```

**Note:** Package structure of step definition Java classes under `src/test/java` should match with the directory structure of feature files in `src/test/resources` as Cucumber looks for feature files there. 

Feature file is created using something called Gherkin. This is one of the way to represent the requirement or executable specifications of the software. A file that contains a feature of the software product is called a feature file. Important keywords here are `Feature`, `Scenario`, `Given`, `And`, `When`, `Then`.

**Feature:** Every feature file contains a feature. A feature may contain one or more Scenario's.

**Scenario:** It is nothing but a representation of test case or behavior of the software.

**Given, When, And, Then:** These are the steps in the test case or scenario. Each Given/When/And/Then step will have a corresponding Java method in a class called `*StepDefinition.java`. Name of the class can be anything but the methods should be annotated with `@Given` or `@And` or `@When` or `@Then`. When a feature file scenario is executed, cucumber matches the text after Given, And, When, Then with the value of the `@Given/@When/@Then` annotations. If the pattern matches, corresponding method is executed. Hence, there can be only one matching method per step in feature file.

> By now, your mind may be thinking that creating one method per step may need a lot of code and it sounds crazy. But, don't worry there are smart ways to create one method and reuse for multiple steps using something called expressions. We will learn all those in the following chapters.

<hr>

### 8. Let's create the step definitions file for 1000-sum-of-numbers.feature

You may use your IDE to generate step definitions skeleton code if you have Cucumber and Gherkin plugins in intellij.

Else, you may manually create a file named `AdditionStepDefinitions.java` under `src/test/resources/com/madrascoder/cucumberbooksample/stepdefinitions`.

```java
package com.madrascoder.cucumberbooksample.stepdefinitions;

import static org.assertj.core.api.Assertions.assertThat;

import io.cucumber.java.en.And;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

public class AdditionStepDefinitions {

  private int firstNumber;
  private int secondNumber;
  private int calculatedSum;

  @Given("first number is {int}")
  public void firstNumberIs(int firstNumber) {
    this.firstNumber = firstNumber;
  }

  @And("second number is {int}")
  public void secondNumberIs(int secondNumber) {
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

Annotations `@Given`, `@And`, `@When`, `@Then` are synonymous, they can be used interchangable. Important part is the value of these annotation. These values corresponds to the steps in feature file. You may have noticed `{int}` in annotation values. We will learn more about expressions `{int}`, `{string}` etc., in future chapter. For now, imagine the text at location of `{int}` in feature file will be automatically converted to `int` and supplied as argument to the corresponding method.

<hr>

### 9. Project Structure

If you had followed along all the steps from the beginning, you may have the following project structure. Take few minutes to compare your project with what is stated below, this way you run the Cucumber test in next step, it will work as expected.

```shell
➜  cucumber-book-sample tree
.
├── HELP.md
├── cucumber-book-sample.iml
├── mvnw
├── mvnw.cmd
├── pom.xml
└── src
    ├── main
    │   ├── java
    │   │   └── com
    │   │       └── madrascoder
    │   │           └── cucumberbooksample
    │   │               └── CucumberBookSampleApplication.java
    │   └── resources
    │       ├── application.properties
    │       ├── static
    │       └── templates
    └── test
        ├── java
        │   └── com
        │       └── madrascoder
        │           └── cucumberbooksample
        │               ├── CucumberSpringContextConfiguration.java # Added
        │               ├── RunCucumberTest.java                    # Added
        │               └── stepdefinitions                         # Added
        │                   └── AdditionStepDefinitions.java        # Added
        └── resources
            ├── com                                                 # Added
            │   └── madrascoder                                     # Added
            │       └── cucumberbooksample                          # Added
            │           └── 1000-sum-of-numbers.feature             # Added
            └── junit-platform.properties                           # Added
```

<hr>

### 10. Run Cucumber Test

There are multiple ways to trigger/run Cucumber tests, here is the list

You may do `mvn verify` from your terminal

```shell
➜  cucumber-book-sample mvn clean verify
...
2021-04-12 20:46:51.552  INFO 55910 --- [           main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat started on port(s): 59841 (http) with context path ''
2021-04-12 20:46:51.560  INFO 55910 --- [           main] c.m.c.CucumberSpringContextConfiguration : Started CucumberSpringContextConfiguration in 3.771 seconds (JVM running for 5.486)

Scenario: Sum of two numbers      # com/madrascoder/cucumberbooksample/1000-hello-world.feature:4
  Given first number is 10        # com.madrascoder.cucumberbooksample.stepdefinitions.AdditionStepDefinitions.firstNumberIs(int)
  And second number is 20         # com.madrascoder.cucumberbooksample.stepdefinitions.AdditionStepDefinitions.secondNumberIs(int)
  When user executes sum function # com.madrascoder.cucumberbooksample.stepdefinitions.AdditionStepDefinitions.userExecutesSumFunction()
  Then the sum is 30              # com.madrascoder.cucumberbooksample.stepdefinitions.AdditionStepDefinitions.theSumIs(int)
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 4.666 s - in Addition
...
```

**[OR]**

You may right click on `RunCucumberTest.java` and choose Run/Debug in intellij

![RunCucumberTest.java](/assets/media/tutorials/001-pragmatic-cucumber/chapter1/run-cucumber-test.png)

**[OR]**

You may right click on `1000-sum-of-numbers.feature` under resources and choose Run in intellij

![RunCucumberTest.java](/assets/media/tutorials/001-pragmatic-cucumber/chapter1/run-feature-file.png)

<hr>

### Conclusion

In this chapter, we create a Spring Boot application, added Cucumber dependencies, created necessary configuration to bootstrap Spring Boot Test context configuration, created a class to run Cucumber tests, created feature file, create step definitions and finally run the test using various ways. In the next chapter, we will learn different ways of creating feature files and corresponding step definitions.

<hr>

### References

To read more about Gherkin, you may refer [https://cucumber.io/docs/gherkin/reference/](https://cucumber.io/docs/gherkin/reference/){:target="_blank"}

Using Cucumber Plugin in intellij IDE, you may refer [https://www.jetbrains.com/help/idea/cucumber-support.html](https://www.jetbrains.com/help/idea/cucumber-support.html){:target="_blank"}

<hr>

### Credits

Photo by <a href="https://unsplash.com/@bradencollum?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Braden Collum</a> on <a href="https://unsplash.com/s/photos/start?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>

<hr>

[Previous Chapter]({% link tutorials/001-pragmatic-cucumber/index.md %}) | 
[Scroll Up to Top]({% link tutorials/001-pragmatic-cucumber/01-getting-started.md %}) | 
[Table of Contents]({% link tutorials/001-pragmatic-cucumber/index.md %}) |
[Next Chapter]({% link tutorials/001-pragmatic-cucumber/02-diff-ways-of-creating-feature-files.md %})