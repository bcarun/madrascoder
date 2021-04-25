---
layout: tutorial
chapter: 12
title: Use BDD to Implement and Test 'GET APIs'
description: >
  In this chapter, let us see how to create feature files for 'GET APIs'. Also, let us see how we can compare the expected results with the actual results using AssertJ library.

category: tutorial
image: assets/media/tutorials/001-pragmatic-cucumber/chapter12/david-sinclair-1ZC_mM2wHnw-unsplash.jpg
tags:
  - Java
  - Spring
  - Cucumber
  - BDD
date:
featured: false
---

Let’s create feature file, step definitions and an API for the following requirement/user story.

**As a** HR Staff,  
**I want to** get employee details by id,  
**So that** I view the details of the respective employee.  

**As a** HR Staff,  
**I want to** get employee details by last name,  
**So that** I view all the employees with who has the given last name.  

<hr>

### Step 1: Create Feature File for 'Get APIs'

Here is the feature file containing following scenarios

1. **Get employee by id** 
2. **Get employees by last name**


#### 1.1 Feature File

In the feature `Background`, we setup 3 employees with ids **(111001, 111002, 111003)**. Also, employee with id = **'111001'** and **'111003'** is set to have the same last name **'Green'**. This is to test **'Get employees by last name'** use case.

```cucumber
Feature: Get Employee

  Background: Employee already exists

    Given a employee with following details already exists
      | id     | firstName | lastName | email              | dateOfBirth        | remoteWorker | jobTitle                     | employeeNumber | employeeStatus | employmentType |
      | 111001 | Tyrone    | Green    | tobeney0@hc360.com | LocalDate.now-6546 | NO           | Budget/Accounting Analyst II | 175            | Active         | Part-Time      |

    And a employee with following details already exists
      | id     | firstName | lastName  | email                   | dateOfBirth        | remoteWorker | jobTitle                      | employeeNumber | employeeStatus | employmentType |
      | 111002 | Shel      | Hendricks | shendricks1@walmart.com | LocalDate.now-6547 | YES          | Community Outreach Specialist | 183            | Inactive       | Contractor     |

    And a employee with following details already exists
      | id     | firstName | lastName | email                | dateOfBirth        | remoteWorker | jobTitle           | employeeNumber | employeeStatus | employmentType |
      | 111003 | Salli     | Green    | sduffitt2@rambler.ru | LocalDate.now-6548 | YES          | Biostatistician IV | 146            | Inactive       | Part-Time      |


  Scenario: Get employee by id

    When user wants to get employee by id 111002

    Then the get 'IS SUCCESSFUL'

    And following employee is returned
      | id     | firstName | lastName  | email                   | dateOfBirth        | remoteWorker | jobTitle                      | employeeNumber | employeeStatus | employmentType |
      | 111002 | Shel      | Hendricks | shendricks1@walmart.com | LocalDate.now-6547 | YES          | Community Outreach Specialist | 183            | Inactive       | Contractor     |


  Scenario: Get employee by last name

    When user wants to get employee by last name containing 'Gre'

    Then the get 'IS SUCCESSFUL'

    And following employees are returned
      | id     | firstName | lastName | email                | dateOfBirth        | remoteWorker | jobTitle                     | employeeNumber | employeeStatus | employmentType |
      | 111003 | Salli     | Green    | sduffitt2@rambler.ru | LocalDate.now-6548 | YES          | Biostatistician IV           | 146            | Inactive       | Part-Time      |
      | 111001 | Tyrone    | Green    | tobeney0@hc360.com   | LocalDate.now-6546 | NO           | Budget/Accounting Analyst II | 175            | Active         | Part-Time      |

```

If you look at the both the `Scenario`s, there is no `Given Step`. Yes, you can create a `Scenario` without a `Given Step`. 

#### 1.2 Corresponding Step Definitions

Look at the methods stated below, these are the new methods added to support testing 'GET APIs'.

```java
userWantsToGetEmployeeById(Integer id)

followingEmployeeIsReturned(Employee expectedEmployee) 

userWantsToGetEmployeeByLastNameContaining(String lastNameContaining)

followingEmployeesAreReturned(List<Employee> expectedEmployees) 
```

 In the step definition class stated below, 

```java
import static org.assertj.core.api.Assertions.assertThat;

import com.madrascoder.cucumberbooksample.dto.Employee;
import io.cucumber.java.en.And;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.When;
import io.restassured.mapper.TypeRef;
import io.restassured.response.Response;
import java.util.List;
import java.util.Map;

public class EmployeeStepDefinitions extends AbstractStepDefinitions {

  @Given("user wants to create/update employee with following details")
  public void userWantsToCreateEmployeeWithFollowingDetails(Employee employee) {
    testContext().setPayload(employee);
  }

  // Background Step. It gets executed once for every Scenario or Example.
  @Given("a employee with following details already exists")
  public void aEmployeeWithFollowingDetailsAlreadyExists(Employee employee) {
    testContext().setPayload(employee);
    
    // Payload is picked up from test context automatically
    executePost(employeeResourceUrl());

    // To make sure next API call doesn't use the previous request payload
    testContext().reset();
  }

  @When("user saves a new employee(.*)")
  public void userSavesANewEmployee() {
    executePost(employeeResourceUrl());
  }

  @When("user saves employee")
  public void userSavesEmployee() {
    executePut(employeeResourceUrl());
  }

  @When("user wants to get employee by id {int}")
  public void userWantsToGetEmployeeById(Integer id) {
    Map<String, String> pathParams = Map.of("id", id.toString());
    executeGet(employeeResourceUrl() + "/{id}", pathParams);
  }

  @And("following employee is returned")
  public void followingEmployeeIsReturned(Employee expectedEmployee) {
    final Response response = testContext().getResponse();
    final Employee actualEmployee = response.as(Employee.class);
    assertThat(actualEmployee).isEqualTo(expectedEmployee);
  }

  @When("user wants to get employee by last name containing {string}")
  public void userWantsToGetEmployeeByLastNameContaining(String lastNameContaining) {
    Map<String, String> queryParams = Map.of("last-name-containing", lastNameContaining);
    executeGet(employeeResourceUrl(), null, queryParams);
  }

  @And("following employees are returned")
  public void followingEmployeesAreReturned(List<Employee> expectedEmployees) {
    final Response response = testContext().getResponse();
    final List<Employee> actualEmployees = response.as(new TypeRef<List<Employee>>() {});

    assertThat(actualEmployees).containsExactlyElementsOf(expectedEmployees);
  }

  private String employeeResourceUrl() {
    return baseUrl() + "/v1/employees";
  }
}
```

**Note:** In all the previous chapter, we assert the HTTP response code, but here in GET API Scenario, we do another assertion to check if the actual response payload matches with the expected response payload using AssertJ library.

#### 1.3 Modified CommonStepDefinitions.java to match 'Get API' Response Code Assertion

Look at the the `Then Step`, it uses Cucumber Expressions **alternate text** to match both `save` and `get` words using `save/get`.

```java
import static org.assertj.core.api.Assertions.assertThat;

import com.madrascoder.cucumberbooksample.TestContext;
import io.cucumber.java.en.Then;
import io.restassured.response.Response;
import org.springframework.beans.factory.annotation.Autowired;

public class CommonStepDefinitions {

  @Autowired
  private TestContext testContext;

  @Then("the save/get {string}")
  public void theSave(String expectedResult) {
    Response response = testContext.getResponse();
    final int actualStatusCode = response.statusCode();

    if ("IS SUCCESSFUL".equals(expectedResult)) {
      assertThat(actualStatusCode).isIn(200, 201);

    } else if ("FAILS".equals(expectedResult)) {
      assertThat(actualStatusCode).isIn(400, 412);

    } else if ("NOT FOUND".equals(expectedResult)) {
      assertThat(actualStatusCode).isEqualTo(404);

    } else {
      throw new IllegalArgumentException(
          "Expected result is invalid. Valid values are 'IS SUCCESSFUL', 'FAILS', 'NOT FOUND'");
    }
  }
}
```

Now that we have the Scenarios to test 'Get APIs', you may run the test. Test will fail as we have not yet implemented the 'Get API', to be specific we have not yet implemented 'Get employee by last name'.

<hr>

### Step 2: Implement 'Get APIs'

#### 2.1 Add find method to EmployeeRepository.java

**Path:** src/main/java/com/madrascoder/cucumberbooksample/repository/EmployeeRepository.java

```java
import com.madrascoder.cucumberbooksample.entity.EmployeeEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface EmployeeRepository extends JpaRepository<EmployeeEntity, Long> {

  @Query("select e from EmployeeEntity e where e.lastName like %:lastName% order by e.lastName, e.firstName")
  List<EmployeeEntity> findByLastName(String lastName);

}
```

#### 2.2 Add getById and getByLastName methods to EmployeeService.java

```java
import com.madrascoder.cucumberbooksample.dto.Employee;
import com.madrascoder.cucumberbooksample.entity.EmployeeEntity;
import com.madrascoder.cucumberbooksample.mapper.EmployeeMapper;
import com.madrascoder.cucumberbooksample.repository.EmployeeRepository;
import java.util.List;
import java.util.Optional;
import javax.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EmployeeService {

  private final EmployeeMapper employeeMapper;
  private final EmployeeRepository employeeRepository;

  public EmployeeService(EmployeeMapper employeeMapper, EmployeeRepository employeeRepository) {
    this.employeeMapper = employeeMapper;
    this.employeeRepository = employeeRepository;
  }

  @Transactional
  public Long create(final Employee employee) {
    EmployeeEntity employeeEntity = employeeMapper.toEmployeeEntity(employee);
    employeeEntity = employeeRepository.save(employeeEntity);
    return employeeEntity.getId();
  }

  @Transactional(readOnly = true)
  public Employee getById(final Long id) {
    final Optional<EmployeeEntity> employeeEntityOpt = employeeRepository.findById(id);

    return employeeEntityOpt.map(employeeMapper::toEmployee)
        .orElseThrow(() -> new EntityNotFoundException("Employee not found for given id"));
  }

  @Transactional(readOnly = true)
  public List<Employee> getByLastName(String lastNameContaining) {
    final List<EmployeeEntity> entities =
        employeeRepository.findByLastName(lastNameContaining);

    return employeeMapper.toEmployees(entities);
  }

  @Transactional
  public void update(final Employee employee) {
    final Optional<EmployeeEntity> employeeEntityOpt = employeeRepository.findById(employee.getId());

    final EmployeeEntity employeeEntity = employeeEntityOpt.map(employeeEntityInDb -> {
      employeeMapper.mergeToEmployeeEntity(employee, employeeEntityInDb);
      return employeeEntityInDb;

    }).orElseThrow(() -> new EntityNotFoundException("Employee not found for given id"));

    // No need to explicitly save employee entity as it will be merged when transaction is committed.
    employeeRepository.save(employeeEntity);
  }
}
```

#### 2.3 Add HTTP GET methods to EmployeeRestController.java

```java
import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

import com.madrascoder.cucumberbooksample.dto.Employee;
import com.madrascoder.cucumberbooksample.service.EmployeeService;
import java.net.URI;
import java.util.List;
import javax.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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

  @GetMapping(produces = APPLICATION_JSON_VALUE)
  public ResponseEntity<List<Employee>> getEmployeesByLastName(
      @RequestParam("last-name-containing") String lastNameContaining) {

    return ResponseEntity.ok(employeeService.getByLastName(lastNameContaining));
  }

  @PutMapping(consumes = APPLICATION_JSON_VALUE, produces = APPLICATION_JSON_VALUE)
  public ResponseEntity<Employee> updateEmployee(@Valid @RequestBody Employee employee) {
    employeeService.update(employee);
    return ResponseEntity.ok(employeeService.getById(employee.getId()));
  }
}
```

<hr>

### Step 3: Run the Test

```shell
mvn clean verify
```

Maven Log:

```shell
...
Scenario: Get employee by id                             # com/madrascoder/cucumberbooksample/1110-get-employee.feature:18
  Given a employee with following details already exists # com.madrascoder.cucumberbooksample.stepdefinitions.EmployeeStepDefinitions.aEmployeeWithFollowingDetailsAlreadyExists(com.madrascoder.cucumberbooksample.dto.Employee)
  And a employee with following details already exists   # com.madrascoder.cucumberbooksample.stepdefinitions.EmployeeStepDefinitions.aEmployeeWithFollowingDetailsAlreadyExists(com.madrascoder.cucumberbooksample.dto.Employee)
  And a employee with following details already exists   # com.madrascoder.cucumberbooksample.stepdefinitions.EmployeeStepDefinitions.aEmployeeWithFollowingDetailsAlreadyExists(com.madrascoder.cucumberbooksample.dto.Employee)
  When user wants to get employee by id 111002           # com.madrascoder.cucumberbooksample.stepdefinitions.EmployeeStepDefinitions.userWantsToGetEmployeeById(java.lang.Integer)
  Then the get 'IS SUCCESSFUL'                           # com.madrascoder.cucumberbooksample.stepdefinitions.CommonStepDefinitions.theSave(java.lang.String)
  And following employee is returned                     # com.madrascoder.cucumberbooksample.stepdefinitions.EmployeeStepDefinitions.followingEmployeeIsReturned(com.madrascoder.cucumberbooksample.dto.Employee)

Scenario: Get employee by last name                             # com/madrascoder/cucumberbooksample/1110-get-employee.feature:29
  Given a employee with following details already exists        # com.madrascoder.cucumberbooksample.stepdefinitions.EmployeeStepDefinitions.aEmployeeWithFollowingDetailsAlreadyExists(com.madrascoder.cucumberbooksample.dto.Employee)
  And a employee with following details already exists          # com.madrascoder.cucumberbooksample.stepdefinitions.EmployeeStepDefinitions.aEmployeeWithFollowingDetailsAlreadyExists(com.madrascoder.cucumberbooksample.dto.Employee)
  And a employee with following details already exists          # com.madrascoder.cucumberbooksample.stepdefinitions.EmployeeStepDefinitions.aEmployeeWithFollowingDetailsAlreadyExists(com.madrascoder.cucumberbooksample.dto.Employee)
  When user wants to get employee by last name containing 'Gre' # com.madrascoder.cucumberbooksample.stepdefinitions.EmployeeStepDefinitions.userWantsToGetEmployeeByLastNameContainingGre(java.lang.String)
  Then the get 'IS SUCCESSFUL'                                  # com.madrascoder.cucumberbooksample.stepdefinitions.CommonStepDefinitions.theSave(java.lang.String)
  And following employees are returned                          # com.madrascoder.cucumberbooksample.stepdefinitions.EmployeeStepDefinitions.followingEmployeesAreReturned(java.util.List<com.madrascoder.cucumberbooksample.dto.Employee>)
...
```

**Note:** First 3 steps printed in the logs for each scenario are from `Background`. Remember, `Background` will get executed once for each scenario.

<hr>

### Conclusion

In this chapter, we learnt how to use `Background` to setup all the data needed to test the 'Get APIs', implemented the 'Get APIs' and tested them. We also learnt how to validate the data in response payload by comparing it with the expected data given in the feature file.

In the next chapter, we will learn how to generate reports using build-in Cucumber report plugins.

<hr>

### References

For more information on `AssertJ` library, you may refer [https://assertj.github.io/doc/](https://assertj.github.io/doc/){:target="_blank"}

<hr>

### Credits

Photo by <a href="https://unsplash.com/@ayosake?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank">David Sinclair</a> on <a href="https://unsplash.com/s/photos/search?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank">Unsplash</a>
  
<hr>

[Previous Chapter]({% link tutorials/001-pragmatic-cucumber/11-implementing-update-resource.md %}) | 
[Scroll Up to Top]({% link tutorials/001-pragmatic-cucumber/12-implementing-get-resource.md %}) | 
[Table of Contents]({% link tutorials/001-pragmatic-cucumber/index.md %}) |
[Next Chapter]({% link tutorials/001-pragmatic-cucumber/13-cucumber-reports.md %})

