---
layout: tutorial
chapter: 2
title: Use BDD to Implement and Test 'Update API'
description: >
  Previously, we learnt how to use BDD to implement and test 'Create API'. Here, let us learn how to create feature files for 'Update API'. In order to update something, it should exist. So before update, we have to setup the necessary data. To setup data, we will use 'Background' in feature file.

category: tutorial
image: assets/media/tutorials/001-pragmatic-cucumber/chapter11/markus-winkler-cxoR55-bels-unsplash.jpg
tags:
  - Java
  - Spring
  - Cucumber
  - BDD
date:
featured: false
---

Let's create feature file, step definitions and an API for the following requirement/user story.
    
**As a** HR Staff,  
**I want to** edit and save and existing employee details,  
**So that** I can keep the information current.  

<hr>

### Step 1: Create Feature File for 'Update API'

Refer below feature file for 'Update API', it uses `Background` to setup the necessary data before testing 'Update API' scenarios. 

#### 1.1 Feature File

```cucumber
Feature: Update Employee

  Background: Employee already exists

    Given a employee with following details already exists

      | id     | firstName | lastName | email                | dateOfBirth        | remoteWorker | jobTitle            | employeeNumber | employeeStatus | employmentType |
      | 110501 | Bronnie   | Lanfear  | blanfear0@flickr.com | LocalDate.now-6570 | false        | Electrical Engineer | 198            | Inactive       | Full-Time      |

  @validations
  Scenario Outline: Update employee <testCase> <expectedResult>

    Given user wants to update employee with following details
      | id     | firstName   | lastName   | email   | dateOfBirth   | jobTitle                      | employeeNumber | employeeStatus | employmentType |
      | 110501 | <firstName> | <lastName> | <email> | <dateOfBirth> | Budget/Accounting Analyst III | 160            | Active         | Full-Time      |

    When user saves a new employee <testCase>

    Then the save '<expectedResult>'

    Examples:
      | testCase                                 | expectedResult | firstName | lastName | email                 | dateOfBirth        |
      | without first name                       | FAILS          |           | Fair     | bfairall0@pcworld.com | LocalDate.now-6570 |
      | without last name                        | FAILS          | Barnie    |          | bfairall0@pcworld.com | LocalDate.now-6570 |
      | with invalid email id bfairall0@         | FAILS          | Barnie    | Fair     | bfairall0@            | LocalDate.now-6570 |
      | with invalid email id bfairall0          | FAILS          | Barnie    | Fair     | bfairall0             | LocalDate.now-6570 |
      | with date of birth as future date        | FAILS          | Barnie    | Fair     | bfairall0@pcworld.com | LocalDate.now+1    |
      | with all the required & valid attributes | IS SUCCESSFUL  | Barnie    | Fair     | bfairall0@pcworld.com | LocalDate.now-6570 |
    
```

#### 1.2 Corresponding Step Definitions

```java
import com.madrascoder.cucumberbooksample.dto.Employee;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.When;

public class EmployeeStepDefinitions extends AbstractStepDefinitions {

  @Given("user wants to create/update employee with following details")
  public void userWantsToCreateEmployeeWithFollowingDetails(Employee employee) {
    testContext().setPayload(employee);
  }

  // Background Step. It gets executed once for every Scenario or Example.
  @Given("a employee with following details already exists")
  public void aEmployeeWithFollowingDetailsAlreadyExists(Employee employee) {
    testContext().setPayload(employee);
    executePost(employeeResourceUrl());
  }

  @When("user saves a new employee(.*)")
  public void userSavesANewEmployee() {
    executePost(employeeResourceUrl());
  }

  @When("user saves employee")
  public void userSavesEmployee() {
    executePut(employeeResourceUrl());
  }

  private String employeeResourceUrl() {
    return baseUrl() + "/v1/employees";
  }
}
```

Given Step of 'Create Employee API'

```cucumber
...
Given user wants to create employee with following details
...
```

Given Step of 'Update Employee API'

```cucumber
...
Given user wants to update employee with following details
...
```

If you look closely at the 'Given Step', the only difference is the 5th word 'create' and 'update'. We don't need to create 2 different step definition methods one for create and one for update, instead we can use the concept of 'Alternative Text' in Cucumber Expressions. In the Given annotation value, we have used `create/update` to represent alternate text. Hence the method will be executed for both `Given user wants to create employee with following details` and `Given user wants to update employee with following details`.

**Step definition with alternate text 'create/update'**

```java
  @Given("user wants to create/update employee with following details")
  public void userWantsToCreateEmployeeWithFollowingDetails(Employee employee) {
    testContext().setPayload(employee);
  }
```

> Background will get executed once per scenario in the file, in this case it will get executed once per example use case.

**If you run the tests**, all update use cases will fail as we have not yet implemented 'Update Employee API'.


### Step 2: Implement 'Update API'

#### 2.1 Add update method to EmployeeService.java

```java
import com.madrascoder.cucumberbooksample.dto.Employee;
import com.madrascoder.cucumberbooksample.entity.EmployeeEntity;
import com.madrascoder.cucumberbooksample.mapper.EmployeeMapper;
import com.madrascoder.cucumberbooksample.repository.EmployeeRepository;
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


#### 2.2 Add PUT method to EmployeeRestController.java

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
import org.springframework.web.bind.annotation.PutMapping;
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
@validations
Scenario Outline: Update employee without first name FAILS   # com/madrascoder/cucumberbooksample/1105-update-employee.feature:22
  Given a employee with following details already exists     # com.madrascoder.cucumberbooksample.stepdefinitions.EmployeeStepDefinitions.aEmployeeWithFollowingDetailsAlreadyExists(com.madrascoder.cucumberbooksample.dto.Employee)
  Given user wants to update employee with following details # com.madrascoder.cucumberbooksample.stepdefinitions.EmployeeStepDefinitions.userWantsToCreateEmployeeWithFollowingDetails(com.madrascoder.cucumberbooksample.dto.Employee)
  When user saves a new employee without first name          # com.madrascoder.cucumberbooksample.stepdefinitions.EmployeeStepDefinitions.userSavesANewEmployee()
  Then the save 'FAILS'                                      # com.madrascoder.cucumberbooksample.stepdefinitions.CommonStepDefinitions.theSave(java.lang.String)

@validations
Scenario Outline: Update employee without last name FAILS    # com/madrascoder/cucumberbooksample/1105-update-employee.feature:23
  Given a employee with following details already exists     # com.madrascoder.cucumberbooksample.stepdefinitions.EmployeeStepDefinitions.aEmployeeWithFollowingDetailsAlreadyExists(com.madrascoder.cucumberbooksample.dto.Employee)
  Given user wants to update employee with following details # com.madrascoder.cucumberbooksample.stepdefinitions.EmployeeStepDefinitions.userWantsToCreateEmployeeWithFollowingDetails(com.madrascoder.cucumberbooksample.dto.Employee)
  When user saves a new employee without last name           # com.madrascoder.cucumberbooksample.stepdefinitions.EmployeeStepDefinitions.userSavesANewEmployee()
  Then the save 'FAILS'                                      # com.madrascoder.cucumberbooksample.stepdefinitions.CommonStepDefinitions.theSave(java.lang.String)

@validations
Scenario Outline: Update employee with invalid email id bfairall0@ FAILS # com/madrascoder/cucumberbooksample/1105-update-employee.feature:24
  Given a employee with following details already exists                 # com.madrascoder.cucumberbooksample.stepdefinitions.EmployeeStepDefinitions.aEmployeeWithFollowingDetailsAlreadyExists(com.madrascoder.cucumberbooksample.dto.Employee)
  Given user wants to update employee with following details             # com.madrascoder.cucumberbooksample.stepdefinitions.EmployeeStepDefinitions.userWantsToCreateEmployeeWithFollowingDetails(com.madrascoder.cucumberbooksample.dto.Employee)
  When user saves a new employee with invalid email id bfairall0@        # com.madrascoder.cucumberbooksample.stepdefinitions.EmployeeStepDefinitions.userSavesANewEmployee()
  Then the save 'FAILS'                                                  # com.madrascoder.cucumberbooksample.stepdefinitions.CommonStepDefinitions.theSave(java.lang.String)

@validations
Scenario Outline: Update employee with invalid email id bfairall0 FAILS # com/madrascoder/cucumberbooksample/1105-update-employee.feature:25
  Given a employee with following details already exists                # com.madrascoder.cucumberbooksample.stepdefinitions.EmployeeStepDefinitions.aEmployeeWithFollowingDetailsAlreadyExists(com.madrascoder.cucumberbooksample.dto.Employee)
  Given user wants to update employee with following details            # com.madrascoder.cucumberbooksample.stepdefinitions.EmployeeStepDefinitions.userWantsToCreateEmployeeWithFollowingDetails(com.madrascoder.cucumberbooksample.dto.Employee)
  When user saves a new employee with invalid email id bfairall0        # com.madrascoder.cucumberbooksample.stepdefinitions.EmployeeStepDefinitions.userSavesANewEmployee()
  Then the save 'FAILS'                                                 # com.madrascoder.cucumberbooksample.stepdefinitions.CommonStepDefinitions.theSave(java.lang.String)

@validations
Scenario Outline: Update employee with date of birth as future date FAILS # com/madrascoder/cucumberbooksample/1105-update-employee.feature:26
  Given a employee with following details already exists                  # com.madrascoder.cucumberbooksample.stepdefinitions.EmployeeStepDefinitions.aEmployeeWithFollowingDetailsAlreadyExists(com.madrascoder.cucumberbooksample.dto.Employee)
  Given user wants to update employee with following details              # com.madrascoder.cucumberbooksample.stepdefinitions.EmployeeStepDefinitions.userWantsToCreateEmployeeWithFollowingDetails(com.madrascoder.cucumberbooksample.dto.Employee)
  When user saves a new employee with date of birth as future date        # com.madrascoder.cucumberbooksample.stepdefinitions.EmployeeStepDefinitions.userSavesANewEmployee()
  Then the save 'FAILS'                                                   # com.madrascoder.cucumberbooksample.stepdefinitions.CommonStepDefinitions.theSave(java.lang.String)

@validations
Scenario Outline: Update employee with all the required & valid attributes IS SUCCESSFUL # com/madrascoder/cucumberbooksample/1105-update-employee.feature:27
  Given a employee with following details already exists                                 # com.madrascoder.cucumberbooksample.stepdefinitions.EmployeeStepDefinitions.aEmployeeWithFollowingDetailsAlreadyExists(com.madrascoder.cucumberbooksample.dto.Employee)
  Given user wants to update employee with following details                             # com.madrascoder.cucumberbooksample.stepdefinitions.EmployeeStepDefinitions.userWantsToCreateEmployeeWithFollowingDetails(com.madrascoder.cucumberbooksample.dto.Employee)
  When user saves a new employee with all the required & valid attributes                # com.madrascoder.cucumberbooksample.stepdefinitions.EmployeeStepDefinitions.userSavesANewEmployee()
  Then the save 'IS SUCCESSFUL'                                                          # com.madrascoder.cucumberbooksample.stepdefinitions.CommonStepDefinitions.theSave(java.lang.String)
[INFO] Tests run: 6, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.061 s - in Examples

```

<hr>

### Conclusion

In this chapter, we learnt how to make use of `Background` to setup the data needed for testing the `Scenario`. We have used some of the strategies like 'Handling Auto Generated Identifiers', 'Handling Boolean & Dates in feature file' etc.

In the next chapter, we will learn how to implement and test 'Get APIs'. We will also learn how to validate the response payload by comparing it with the expected payload specified as a DataTable in feature file.

<hr>

### Credits

Photo by <a href="https://unsplash.com/@markuswinkler?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank">Markus Winkler</a> on <a href="https://unsplash.com/s/photos/update?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank">Unsplash</a>
  
<hr>

[Previous Chapter]({% link tutorials/001-pragmatic-cucumber/10-handling-boolean-dates-in-feature-files.md %}) | 
[Scroll Up to Top]({% link tutorials/001-pragmatic-cucumber/11-implementing-update-resource.md %}) | 
[Table of Contents]({% link tutorials/001-pragmatic-cucumber/index.md %}) |
[Next Chapter]({% link tutorials/001-pragmatic-cucumber/12-implementing-get-resource.md %})

