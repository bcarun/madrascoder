---
layout: tutorial
chapter: 5
title: Implementing BDD to Test Validation Use Cases
description: >
  In the last chapter, we used BDD to develop and test 'Create API'. In this chapter, let's go a little deeper and learn how to represent validation use cases in feature file and test the same.

category: tutorial
image: assets/media/tutorials/001-pragmatic-cucumber/chapter5/glenn-carstens-peters-RLw-UC03Gwc-unsplash.jpg
tags:
  - Java
  - Spring
  - Cucumber
  - BDD
date:
featured: false
---

### Validation Use Cases

Let's imagine we have to perform the following validations before saving an employee.

| Field         | Validation     |  Description                      |
| -----------   | -------------- | --------------------------------- |
| firstName     | Required       | First name is a required field    |
| lastName      | Required       | Last name is a required field     |
| email         | Valid Email Id | Email Id should be valid          |
| dateOfBirth   | Future Date    | Date of birth cannot be in future |


### Feature File for Validation Use Case

In the previous chapters, we used `Scenario` in our feature files. Each `Scenario` is like one test case. In this case, we have to perform validations. For example, we have to test creating employee without **firstName** and expect the API to fail with 400 Bad Request. Next we have to test creating employee without **lastName** and expected the API to fail with 400 Bad Request. Likewise, we have test various validation use cases listed in the above said table. One of the best way to do this is by using `Scenario Outline` and `Examples`.

Read the below stated feature file to see how `Scenario Outline` and `Examples` are used to represent validation test cases. 

```cucumber
Feature: Create Employee

  @smoketest
  Scenario: Create employee with basic details
    Given user wants to create employee with following details
      | firstName | lastName | email               | dateOfBirth | jobTitle                   | employeeNumber | employeeStatus | employmentType |
      | Effie     | Slee     | eslee@blueocean.com | 2014-03-01  | Physical Therapy Assistant | E101           | Active         | Full-Time      |

    When user saves a new employee

    Then the save 'IS SUCCESSFUL'

  @validations
  Scenario Outline: Create employee <testCase> <expectedResult>

    Given user wants to create employee with following details
      | firstName   | lastName   | email   | dateOfBirth   | jobTitle                      | employeeNumber | employeeStatus | employmentType |
      | <firstName> | <lastName> | <email> | <dateOfBirth> | Budget/Accounting Analyst III | 160            | Active         | Full-Time      |
    
    When user saves a new employee <testCase>
    
    Then the save '<expectedResult>'

    Examples:
      | testCase                                 | expectedResult | firstName | lastName | email                 | dateOfBirth |
      | without first name                       | FAILS          |           | Fairall  | bfairall0@pcworld.com | 2000-05-26  |
      | without last name                        | FAILS          | Barnie    |          | bfairall0@pcworld.com | 2000-05-26  |
      | with invalid email id bfairall0@         | FAILS          | Barnie    | Fairall  | bfairall0@            | 2000-05-26  |
      | with invalid email id bfairall0          | FAILS          | Barnie    | Fairall  | bfairall0             | 2000-05-26  |
      | with date of birth as future date        | FAILS          | Barnie    | Fairall  | bfairall0@pcworld.com | 2021-05-26  |
      | with all the required & valid attributes | IS SUCCESSFUL  | Barnie    | Fairall  | bfairall0@pcworld.com | 2000-05-26  |

```

If you look at the feature file, there is one `Scenario` and one `Scenario Outline`, this is just to compare each other. In `Scenario` the values or attributes of employee are hardcoded, but in `Scenario Outline`, values are picked up from `Examples`. `Scenario Outline` helps us to represent multiple test cases as examples and execute once for each row in the `Examples DataTable`.

Now, lets compare 'Given Step', 'When Step' and 'Then Step' between `Scenario` and `Scenario Outline`.

#### 'Given Step' Changes between Scenario and Scenario Outline

**In Scenario,**

```cucumber
Given user wants to create employee with following details
  | firstName | lastName | email               | dateOfBirth | jobTitle                   | employeeNumber | employeeStatus | employmentType |
  | Effie     | Slee     | eslee@blueocean.com | 2014-03-01  | Physical Therapy Assistant | E101           | Active         | Full-Time      |

```

**In Scenario Outline,**

```cucumber
Given user wants to create employee with following details
  | firstName   | lastName   | email   | dateOfBirth   | jobTitle                      | employeeNumber | employeeStatus | employmentType |
  | <firstName> | <lastName> | <email> | <dateOfBirth> | Budget/Accounting Analyst III | 160            | Active         | Full-Time      |

```

Fields firstName, lastName, email and dateOfBirth are the ones that need to be validated. Hence in `Scenario Outline`, the values are modified to be variables `<firstName>`, `<lastName>`, `<email>`, `<dateOfBirth>`. `Scenario Outline` will be executed once per example row in `Examples DataTable`. In our case, we have 6 rows in `Examples` DataTable, hence the `Scenario Outline` will be executed 6 times once per example row. Value for these placeholders or variables will be picked up from the example that is being executed.

#### When Step

**In Scenario,**

```cucumber
When user saves a new employee
```

**In Scenario Outline,**

```cucumber
When user saves a new employee <testCase>
```

Comparing the 'When Step', in `Scenario` and `Scenario Outline`, the difference is the `<testCase>` placeholder in `Scenario Outline`. Use of `<testCase>` variable in this step is to print the test case when executing the step. When the first example is executed, 'When Step' will be printed as stated below

```shell
When user saves a new employee without first name
Then the save 'FAILS'
```

For the above 'When Step' in both `Scenario` and `Scenario Outline`, we have only one step definition method, 

```java
  @When("user saves a new employee(.*)")
  public void userSavesANewEmployee() {
    ...
  }
```

If you look at the `@When` annotation, we used `(.*)` at the end. By using `(.*)`, we are asking Cucumber not to use any word after 'user saves a new employee' for matching the step definition. Anything that is stated inside a parenthesis is an optional text and it will not be used for matching the step in feature file with the step definition method. Hence we are able to use one step definition method for both of the 'When Step's in `Scenario` and `Scenario Outline`. We have used 'Cucumber Expressions' support to achieve this.

#### Then Step

One change you can notice easily in the `Then` step is, enclosing 'IS SUCCESSFUL' between single quotes as stated below.

**In Scenario,**
```cucumber
Then the save 'IS SUCCESSFUL'
```

**In Scenario Outline,**
```cucumber
Then the save '<expectedResult>'
```

When you enclose words between Single Quote ('), it is considered as a String and the value in between single quotes can be captured as an argument in step definition. Here is the corresponding step definition.

```java
@Then("the save {string}")
public void theSave(String expectedResult) {
  ...
}
```

When the method `theSave(String expectedResult)` is executed, expectedResult will be 'IS SUCCESSFUL' for the `Scenario: Create employee with basic details`.

> When you list examples test cases, have all failure test cases first and then have success test case at the end, like what we had in the above said feature file.


#### EmployeeStepDefinitions.java Changes

Two methods, `userSavesANewEmployee` and `theSave` are the ones that you need to look in the below code.

```java
import static io.restassured.RestAssured.given;
import static org.assertj.core.api.Assertions.assertThat;

import com.madrascoder.cucumberbooksample.dto.Employee;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import org.springframework.boot.web.server.LocalServerPort;

public class EmployeeStepDefinitions {

  // By default, all step definitions are Spring Beans
  // You may autowire Spring Beans and Properties in Cucumber 
  // StepDefinition class
  @LocalServerPort
  private int port;

  private Response response;

  private Employee employee;

  public String baseUrl() {
    return "http://localhost:" + port;
  }

  @Given("user wants to create employee with following details")
  public void userWantsToCreateEmployeeWithFollowingDetails(Employee employee) {
    this.employee = employee;
  }

  @When("user saves a new employee(.*)")
  public void userSavesANewEmployee() {
    String uri = baseUrl() + "/v1/employees";

    response = given().log()
        .all()
        .body(employee)
        .contentType(ContentType.JSON)
        .post(uri);

    response.then()
        .log()
        .all();
  }

  @Then("the save {string}")
  public void theSave(String expectedResult) {
    final int actualStatusCode = response.statusCode();

    if ("IS SUCCESSFUL".equals(expectedResult)) {
      assertThat(actualStatusCode).isIn(200, 201);

    } else if ("FAILS".equals(expectedResult)) {
      assertThat(actualStatusCode).isIn(400, 412);

    } else if ("NOT FOUND".equals(expectedResult)) {
      assertThat(actualStatusCode).isEqualTo(404);

    } else {
      throw new IllegalArgumentException("Cannot parse expected result, expecting 'IS SUCCESSFUL' or 'FAILS'");
    }
  }

}
```

**If you run the Cucumber test**, you can see all the test cases related to validations are failing. It is because, we have not implement validations yet.

### API Changes to Implement Validations

Let us make necessary changes to source code to implement the expected validation to make the tests pass.

#### Add Maven Dependency to Perform Bean Validation

```xml
<!-- Bean Validation -->
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

**Note:** We don't have version because, it is inherited from Spring Boot Dependencies.

#### Add Validation Annotations to Employee DTO Bean

```java
import java.time.LocalDate;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Past;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class Employee {

  private Long id;

  @NotBlank(message = "First name is required")
  private String firstName;

  @NotBlank(message = "Last name is required")
  private String lastName;

  @Email(message = "Valid email id is required")
  private String email;

  @Past(message = "Expecting past date for date of birth")
  private LocalDate dateOfBirth;

  private boolean remoteWorker;
  private String jobTitle;
  private String employeeNumber;
  private String employmentStatus;
  private String employmentType;
}
```

### Add MethodArgumentNotValidException Handler to DefaultRestControllerAdvice

Look at method having following annotation
```java
@ExceptionHandler(MethodArgumentNotValidException.class)
```

In the below code,

```java
import java.util.List;
import java.util.stream.Collectors;
import javax.persistence.EntityNotFoundException;
import lombok.Getter;
import lombok.Setter;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class DefaultRestControllerAdvice {

  @ExceptionHandler(EntityNotFoundException.class)
  public ResponseEntity<List<Message>> handleException(EntityNotFoundException exception) {
    final Message message = Message.error(exception.getMessage());
    return new ResponseEntity<>(List.of(message), HttpStatus.NOT_FOUND);
  }


  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<List<Message>> handleValidationExceptions(MethodArgumentNotValidException ex) {

    List<Message> messages = ex.getBindingResult()
        .getAllErrors()
        .stream()
        .map(DefaultMessageSourceResolvable::getDefaultMessage)
        .map(Message::error)
        .collect(Collectors.toList());

    return new ResponseEntity<>(messages, HttpStatus.BAD_REQUEST);
  }

  @Getter
  @Setter
  public static class Message {

    public static Message info(String text) {
      Message message = new Message();
      message.setType(Message.MessageType.INFO);
      message.setText(text);

      return message;
    }

    public static Message warning(String text) {
      Message message = new Message();
      message.setType(Message.MessageType.WARNING);
      message.setText(text);

      return message;
    }

    public static Message error(String text) {
      Message message = new Message();
      message.setType(Message.MessageType.ERROR);
      message.setText(text);

      return message;
    }

    private Message.MessageType type;
    private String text;

    public enum MessageType {
      INFO,
      WARNING,
      ERROR
    }
  }
}
```

#### Add @Valid Annotation to EmployeeRestController

Look at `@Valid` annotation added to `createEmployee` method.

```java
import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

import com.madrascoder.cucumberbooksample.dto.Employee;
import com.madrascoder.cucumberbooksample.service.EmployeeService;
import java.net.URI;
import javax.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping(path = "/v1/employees")
public class EmployeeRestController {

  private final EmployeeService employeeService;

  // Using Spring Constructor Injection
  public EmployeeRestController(EmployeeService employeeService) {
    this.employeeService = employeeService;
  }

  @PostMapping(consumes = APPLICATION_JSON_VALUE)
  public ResponseEntity<Void> createEmployee(@Valid @RequestBody Employee employee) {
    Long id = employeeService.create(employee);
    URI location = ServletUriComponentsBuilder.fromCurrentRequest()
        .path("/{id}")
        .buildAndExpand(id)
        .toUri();

    return ResponseEntity.created(location)
        .build();
  }

  @GetMapping(path = "/{id}", produces = APPLICATION_JSON_VALUE)
  public ResponseEntity<Employee> getEmployeeById(@PathVariable("id") Long id) {
    Employee employee = employeeService.getById(id);
    return ResponseEntity.ok(employee);
  }
}
```

### Run the Test

```shell
mvn clean verify
```

Maven Log: You can see logs similar to the one below, I have removed the REST request and response log to make it easier to read,

```shell
...
@validations
Scenario Outline: Create employee without first name FAILS   # com/madrascoder/cucumberbooksample/1100-create-employee.feature:26
  Given user wants to create employee with following details # com.madrascoder.cucumberbooksample.stepdefinitions.EmployeeStepDefinitions.userWantsToCreateEmployeeWithFollowingDetails(com.madrascoder.cucumberbooksample.dto.Employee)
  When user saves a new employee without first name          # com.madrascoder.cucumberbooksample.stepdefinitions.EmployeeStepDefinitions.userSavesANewEmployee()
  Then the save 'FAILS'                                      # com.madrascoder.cucumberbooksample.stepdefinitions.EmployeeStepDefinitions.theSave(java.lang.String)

@validations
Scenario Outline: Create employee without last name FAILS    # com/madrascoder/cucumberbooksample/1100-create-employee.feature:27
  Given user wants to create employee with following details # com.madrascoder.cucumberbooksample.stepdefinitions.EmployeeStepDefinitions.userWantsToCreateEmployeeWithFollowingDetails(com.madrascoder.cucumberbooksample.dto.Employee)
  When user saves a new employee without last name           # com.madrascoder.cucumberbooksample.stepdefinitions.EmployeeStepDefinitions.userSavesANewEmployee()
  Then the save 'FAILS'                                      # com.madrascoder.cucumberbooksample.stepdefinitions.EmployeeStepDefinitions.theSave(java.lang.String)

@validations
Scenario Outline: Create employee with invalid email id bfairall0@ FAILS # com/madrascoder/cucumberbooksample/1100-create-employee.feature:28
  Given user wants to create employee with following details             # com.madrascoder.cucumberbooksample.stepdefinitions.EmployeeStepDefinitions.userWantsToCreateEmployeeWithFollowingDetails(com.madrascoder.cucumberbooksample.dto.Employee)
  When user saves a new employee with invalid email id bfairall0@        # com.madrascoder.cucumberbooksample.stepdefinitions.EmployeeStepDefinitions.userSavesANewEmployee()
  Then the save 'FAILS'                                                  # com.madrascoder.cucumberbooksample.stepdefinitions.EmployeeStepDefinitions.theSave(java.lang.String)

@validations
Scenario Outline: Create employee with invalid email id bfairall0 FAILS # com/madrascoder/cucumberbooksample/1100-create-employee.feature:29
  Given user wants to create employee with following details            # com.madrascoder.cucumberbooksample.stepdefinitions.EmployeeStepDefinitions.userWantsToCreateEmployeeWithFollowingDetails(com.madrascoder.cucumberbooksample.dto.Employee)
  When user saves a new employee with invalid email id bfairall0        # com.madrascoder.cucumberbooksample.stepdefinitions.EmployeeStepDefinitions.userSavesANewEmployee()
  Then the save 'FAILS'                                                 # com.madrascoder.cucumberbooksample.stepdefinitions.EmployeeStepDefinitions.theSave(java.lang.String)

@validations
Scenario Outline: Create employee with date of birth as future date FAILS # com/madrascoder/cucumberbooksample/1100-create-employee.feature:30
  Given user wants to create employee with following details              # com.madrascoder.cucumberbooksample.stepdefinitions.EmployeeStepDefinitions.userWantsToCreateEmployeeWithFollowingDetails(com.madrascoder.cucumberbooksample.dto.Employee)
  When user saves a new employee with date of birth as future date        # com.madrascoder.cucumberbooksample.stepdefinitions.EmployeeStepDefinitions.userSavesANewEmployee()
  Then the save 'FAILS'                                                   # com.madrascoder.cucumberbooksample.stepdefinitions.EmployeeStepDefinitions.theSave(java.lang.String)

@validations
Scenario Outline: Create employee with all the required & valid attributes IS SUCCESSFUL # com/madrascoder/cucumberbooksample/1100-create-employee.feature:31
  Given user wants to create employee with following details                             # com.madrascoder.cucumberbooksample.stepdefinitions.EmployeeStepDefinitions.userWantsToCreateEmployeeWithFollowingDetails(com.madrascoder.cucumberbooksample.dto.Employee)
  When user saves a new employee with all the required & valid attributes                # com.madrascoder.cucumberbooksample.stepdefinitions.EmployeeStepDefinitions.userSavesANewEmployee()
  Then the save 'IS SUCCESSFUL'                                                          # com.madrascoder.cucumberbooksample.stepdefinitions.EmployeeStepDefinitions.theSave(java.lang.String)

...
```

Read the log and look at the `Scenario Outline` once again, you will understand the concept behind `Scenario Outline` & `Examples` much better.

**Note:** If you have looked closely, DataTable didn't get printed in the logs. Yes Cucumber uses 'pretty' print report to log the execution and it doesn't print the DataTable. In order to solve this problem, we will learn to generate a HTML report in a future chapter.

### Conclusion

In this chapter, you learnt how to use `Scenario Outline` and `Examples` to implement API validation use cases. 

In the step definition code, we had a method to assert the response. It is a generic method, it can be used to assert Employee API or any other API. As its a common method, we can move it to a separate class called `CommonStepDefinitions.java`, but this method uses the instance variable in `EmployeeStepDefinitions.java` to assert the response. In order to effectively utilize or reuse step definitions from multiple classes, we need to change the way we share state between step definitions. 

In the next chapter, lets learn 2 ways to share state between step definitions.

<hr>

### References

For more information on `Cucumber Expressions` you may refer [https://cucumber.io/docs/cucumber/cucumber-expressions/](https://cucumber.io/docs/cucumber/cucumber-expressions/){:target="_blank"}

For more information on `RestAssured` you may refer [https://rest-assured.io/](https://rest-assured.io/){:target="_blank"}

<hr>

### Credits

Photo by <a href="https://unsplash.com/@glenncarstenspeters?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank">Glenn Carstens-Peters</a> on <a href="https://unsplash.com/s/photos/list?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank">Unsplash</a>
  
<hr>

[Previous Chapter]({% link tutorials/001-pragmatic-cucumber/04-implementing-create-resource.md %}) | 
[Scroll Up to Top]({% link tutorials/001-pragmatic-cucumber/05-implementing-validations-during-create.md %}) | 
[Table of Contents]({% link tutorials/001-pragmatic-cucumber/index.md %}) |
[Next Chapter]({% link tutorials/001-pragmatic-cucumber/06-sharing-state-between-steps.md %})