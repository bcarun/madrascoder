---
layout: tutorial
chapter: 3
title: How to Convert a DataTable into a Java Object
description: >
  This chapter is continuation of 'Different patterns of creating Cucumber Feature files' with more real use case.
  
  In this chapter, let us see 3 patterns to represent complex objects in feature files. In a real use case, we may need to convert the DataTable to a JSON so that we can use that as payload to call REST API from step definition. If we can convert DataTable to a Java Object, we can easily convert that to a JSON.

category: tutorial
image: assets/media/tutorials/001-pragmatic-cucumber/chapter3/weston-mackinnon-au9N2rdOmOg-unsplash.jpg
tags:
  - Java
  - Spring
  - Cucumber
  - BDD
date:
featured: false
---

Let's imagine we are working on a HR Software and we need to implement the following requirement/user story.
    
**As a** HR Staff,  
**I want to** to save a new employee details,  
**So that** I can refer to the details in the system when needed.  

In order to implement this requirement/user story, let us create a feature file using the patterns we learnt earlier.

Let us assume the following fields represents basic details of an employee,

```java
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class Employee {
  private Long id;
  private String firstName;
  private String lastName;
  private String email;
  private LocalDate joiningDate;
  private String jobTitle;
  private String employeeNumber;
  private String employmentStatus;
  private String employmentType;
}
```
And the sample JSON representation is,

```json
{
  "id": 1,
  "firstName": "Effie",
  "lastName": "Slee",
  "email": "eslee0@blueocean.com",
  "joiningDate": "2014-03-01T07:36:18Z",
  "jobTitle": "Physical Therapy Assistant",
  "employeeNumber": 101,
  "employeeStatus": "Active",
  "employmentType": "Full-Time"
}
```

<hr>

### Pattern: One Step Per Field

**Feature File**

```cucumber
Feature: Create Employee
  Scenario: Create employee with basic details
    Given employee first name is 'Effie'
    And employee last name is 'Slee'
    And employee email is 'eslee0@blueocean.com'
    And employee joining date is '2014-03-01'
    And employee job title is 'Physical Therapy Assistant'
    And employee number is 'E101'
    And employment status is 'Active'
    And employment type is 'Full-Time'
  
    When user saves a new employee

    Then the save IS SUCCESSFUL
```

**Corresponding Step Definitions**

```java
import com.madrascoder.cucumberbooksample.dto.Employee;
import io.cucumber.java.en.And;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import java.time.LocalDate;

public class EmployeeStepDefinitions {

  private Employee employee = new Employee();

  @Given("employee first name is {string}")
  public void employeeFirstNameIs(String firstName) {
    employee.setFirstName(firstName);
  }

  @And("employee last name is {string}")
  public void employeeLastNameIs(String lastName) {
    employee.setLastName(lastName);
  }

  @And("employee email is {string}")
  public void employeeEmailIs(String email) {
    employee.setEmail(email);
  }

  @And("employee joining date is {string}")
  public void employeeJoiningDateIs(String joiningDateStr) {
    LocalDate joiningDate = LocalDate.parse(joiningDateStr);
    employee.setJoiningDate(joiningDate);
  }

  @And("employee job title is {string}")
  public void employeeJobTitleIs(String jobTitle) {
    employee.setJobTitle(jobTitle);
  }

  @And("employee number is {string}")
  public void employeeNumberIs(String employeeNumber) {
    employee.setEmployeeNumber(employeeNumber);
  }

  @And("employment status is {string}")
  public void employmentStatusIs(String employmentStatus) {
    employee.setEmploymentStatus(employmentStatus);
  }

  @And("employment type is {string}")
  public void employmentTypeIs(String employmentType) {
    employee.setEmploymentType(employmentType);
  }

  @When("user saves a new employee")
  public void userSavesANewEmployee() {
    // call REST API to create employee
    // save REST API Response
  }

  @Then("the save IS SUCCESSFUL")
  public void theSaveIsSuccessful() {
    // assert if Response status is 201 Created or 200 Ok.
  }
}
```
Creating step definitions for each step is time consuming, representations are some time hierarchical and it becomes very hard to maintain.

So, let us try another approach.

<hr>

### Pattern: Map<Key, Value> DataTable

**Feature File**

```cucumber
Feature: Create Employee
  Scenario: Create employee with basic details
    Given user wants to create employee with following details
      | firstName        | Effie                      |
      | lastName         | Slee                       |
      | email            | eslee@blueocean.com        | 
      | joiningDate      | 2014-03-01                 |
      | jobTitle         | Physical Therapy Assistant |
      | employeeNumber   | E101                       |
      | employmentStatus | Active                     |
      | employmentType   | Full-Time                  |

    When user saves a new employee

    Then the save IS SUCCESSFUL  
```

**Corresponding Step Definitions**

```java
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.madrascoder.cucumberbooksample.dto.Employee;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import java.util.Map;

public class EmployeeStepDefinitions {

  private Employee employee;

  @Given("user wants to create employee with following details")
  public void userWantsToCreateEmployeeWithFollowingDetails(Map<String, Object> employeeMap) {
    // Create one instance of ObjectMapper and keep reusing every where, else autowire Spring's ObjectMapper bean
    final ObjectMapper objectMapper = new ObjectMapper();
    objectMapper.registerModule(new JavaTimeModule())
        .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    
    this.employee = objectMapper.convertValue(employeeMap, Employee.class);
  }

  @When("user saves a new employee")
  public void userSavesANewEmployee() {
    // call REST API to create employee
    // save REST API Response
  }

  @Then("the save IS SUCCESSFUL")
  public void theSaveIsSuccessful() {
    // assert if Response status is 201 Created or 200 Ok.
  }
}
```
Using Map<String, Object> DataTable made life little easy. But reading the Map DataTable is not easy. Most of us are used to spreadsheet style, header row at the top and all values under it. Reading Key on the left and value on the right in a DataTable may add some cognitive load.

In the next pattern, let's do spreadsheet like DataTable.

<hr>

### Pattern: Spreadsheet DataTable

**Feature File**

```cucumber
Feature: Create Employee

  Scenario: Create employee with basic details
    Given user wants to create employee with following details

      | firstName | lastName | email               | joiningDate | jobTitle                   | employeeNumber | employeeStatus | employmentType |
      | Effie     | Slee     | eslee@blueocean.com | 2014-03-01  | Physical Therapy Assistant | E101           | Active         | Full-Time      |

    When user saves a new employee

    Then the save IS SUCCESSFUL

```

**IMPORTANT NOTE:** Header row in the data table contains the camelCase field names of Employee.java. This makes life easy for Cucumber to automatically convert the DataTable into a Employee Object. This is one of the convention that is going to help us a lot.

> If needed, we can make the the Header row as Title Case, we can write a few lines of code to convert it to Java field names if we follow some convention.

**Prerequisite for Step Definitions**

Before we implement the step definition, we need to create a generic data transformer which converts any DataTable to corresponding Java Object. Here is that **magic** class,

Create a class `src/test/com/madrascoder/cucumberbooksample/DataTransformer.java` and as stated below.

```java
import com.fasterxml.jackson.databind.ObjectMapper;
import io.cucumber.java.DefaultDataTableCellTransformer;
import io.cucumber.java.DefaultDataTableEntryTransformer;
import io.cucumber.java.DefaultParameterTransformer;
import java.lang.reflect.Type;

public class DataTransformer {

  // Set spring.jackson.serialization.write-dates-as-timestamps=false in application.properties
  // This is required to convert ISO 8601 Date String to LocalDate and many other java.time package use cases
  private final ObjectMapper objectMapper;

  // Spring will auto wire the ObjectMapper
  public DataTransformer(ObjectMapper objectMapper) {
    this.objectMapper = objectMapper;
  }

  @DefaultParameterTransformer
  @DefaultDataTableEntryTransformer
  @DefaultDataTableCellTransformer
  public Object transformer(Object fromValue, Type toValueType) {
    return objectMapper.convertValue(fromValue, objectMapper.constructType(toValueType));
  }
}
```

Also, set the following property in `application.properties`. This helps converting ISO 8601 Date and Time formats to java.time.* classes.

```properties
spring.jackson.serialization.write-dates-as-timestamps=false
```

**Corresponding Step Definitions**

```java
import com.madrascoder.cucumberbooksample.dto.Employee;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class EmployeeStepDefinitions {

  private Employee employee;

  @Given("user wants to create employee with following details")
  public void userWantsToCreateEmployeeWithFollowingDetails(Employee employee) {
    log.info("Employee: {}", employee);
    this.employee = employee;
  }

  @When("user saves a new employee")
  public void userSavesANewEmployee() {
    // call REST API to create employee
    // save REST API Response
  }

  @Then("the save IS SUCCESSFUL")
  public void theSaveIsSuccessful() {
    // assert if Response status is 201 Created or 200 Ok.
  }
}
```

Look at the above step definition file, compare it with other patterns stated above. You will know how `DataTransformer.java` and Using **Spreadsheet DataTable Pattern** made life easy.

There is one draw back here, if the object has more fields, viewing DataTable may require scrolling horizontally. It may difficult in the chapter code snippet component but not if you are using a wide screen monitor. This is the trade off and it is worth it.

<hr>
### Quick Tip

You may use below strategy to create DataTable header row. Remember to replace `Employee.class` with your respective class.

```java
  public static void main(String[] args) {
    final String header = Stream.of(Employee.class.getDeclaredFields())
        .map(Field::getName)
        .collect(Collectors.joining("|", "|", "|"));
    System.out.println(header);
  }
```

**[OR]**

To generate mock data for DataTable, you may use Mockaroo custom formatter with pipe delimiter. For more information refer [https://www.mockaroo.com/](https://www.mockaroo.com/){:target="_blank"}

<hr>

### Conclusion

In this chapter, we saw 3 patterns

**1. One Step Per Field Pattern**  
**2. Map<Key, Object> DataTable Pattern**  
**3. Spreadsheet DataTable Pattern**  

My recommendation is to use the **Spreadsheet DataTable Pattern** when ever you need  to represent a complex object in feature file.

> You may be wondering, how can to represent hierarchical information in feature file using **Spreadsheet DataTable Pattern**. In the future chapter, I will introduce that when handling `One Employee can have Many Address` use case.

In the next chapter, let's apply **Spreadsheet DataTable Pattern** to test the REST API to 'create employee'.

<hr>

### References

For more information on `DataTransformer.java` you may refer [https://cucumber.io/docs/cucumber/configuration/](https://cucumber.io/docs/cucumber/configuration/){:target="_blank"}

<hr>

### Credits

Photo by <a href="https://unsplash.com/@chuttersnap?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">CHUTTERSNAP</a> on <a href="https://unsplash.com/s/photos/options?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
  
<hr>

[Previous Chapter]({% link tutorials/001-pragmatic-cucumber/02-diff-ways-of-creating-feature-files.md %}) | 
[Scroll Up to Top]({% link tutorials/001-pragmatic-cucumber/03-converting-datatable-to-java-object.md %}) | 
[Table of Contents]({% link tutorials/001-pragmatic-cucumber/index.md %}) |
[Next Chapter]({% link tutorials/001-pragmatic-cucumber/04-implementing-create-resource.md %})

