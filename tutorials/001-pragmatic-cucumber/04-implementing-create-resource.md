---
layout: tutorial
chapter: 4
title: Use BDD to Implement and Test 'Create API'
description: >
  We learnt various patterns to represent features or product specifications. Here, let's apply 'Spreadsheet DataTable' pattern to test the API that is used to create a new employee in our HR Software. In this process, we will add few more maven dependencies to create and call the API. To be specific, we will use RestAssured library to call the REST API from the step definition methods.

category: tutorial
image: assets/media/tutorials/001-pragmatic-cucumber/chapter4/kyle-glenn-YkOQ4So1TXM-unsplash.jpg
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
**I want to** to save a new employee details,  
**So that** I can refer to the details in the system when needed.  

<hr>

### Step 1: Maven Dependencies

#### 1.1 Add following maven dependencies to pom.xml

```xml
<!--
To generate mappers to convert Entity (JPA Managed Object) to DTOs.
[Its optional, you may use a different mechanism]
-->
<dependency>
  <groupId>org.mapstruct</groupId>
  <artifactId>mapstruct</artifactId>
  <version>1.4.2.Final</version>
</dependency>

<!--    
To call REST API from Cucumber Step Definition classes
This is part of Spring Boot Dependencies, hence version is not needed
-->
<dependency>
  <groupId>io.rest-assured</groupId>
  <artifactId>rest-assured</artifactId>
</dependency>
```

#### 1.2 Add following maven plugin to pom.xml

Plugins here use annotation processor to generate code. 

```xml
<plugin>
  <groupId>org.apache.maven.plugins</groupId>
  <artifactId>maven-compiler-plugin</artifactId>
  <version>3.8.1</version>
  <configuration>
    <source>${java.version}</source>
    <target>${java.version}</target>
    <annotationProcessorPaths>
      <path>
        <groupId>org.mapstruct</groupId>
        <artifactId>mapstruct-processor</artifactId>
        <version>1.4.2.Final</version>
      </path>
      <path>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <version>${lombok.version}</version>
      </path>
      <path>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok-mapstruct-binding</artifactId>
        <version>0.2.0</version>
      </path>
    </annotationProcessorPaths>
  </configuration>
</plugin>
```

#### 1.3 Add following property to application.properties

This helps converting ISO 8601 Date and Time formats to java.time.* classes. 

```properties
spring.jackson.serialization.write-dates-as-timestamps=false
```
<hr>

### Step 2: Create Feature File 

Navigate to following location and create a feature file,

```shell
cd src/test/resources/com/madrascoder/cucumberbooksample
touch 1100-create-employee.feature
```

Add the following feature,

```cucumber
Feature: Create Employee

  Scenario: Create employee with basic details
    
    Given user wants to create employee with following details

      | firstName | lastName | email               | dateOfBirth | jobTitle                   | employeeNumber | employeeStatus | employmentType |
      | Effie     | Slee     | eslee@blueocean.com | 2014-03-01  | Physical Therapy Assistant | E101           | Active         | Full-Time      |

    When user saves a new employee

    Then the save IS SUCCESSFUL
```
<hr>

### Step 3: Create Data Transformer Class

DataTransformer (The Magic Class) helps to convert DataTable to respective DTO or Collection of DTOs and vice versa.

Navigate to following location and create a data transformer class,

```shell
cd src/test/com/madrascoder/cucumberbooksample
touch DataTransformer.java
```

Add the following code,

```java
import com.fasterxml.jackson.databind.ObjectMapper;
import io.cucumber.java.DefaultDataTableCellTransformer;
import io.cucumber.java.DefaultDataTableEntryTransformer;
import io.cucumber.java.DefaultParameterTransformer;
import java.lang.reflect.Type;

// Implicitly a Spring Bean
public class DataTransformer {

  // Set spring.jackson.serialization.write-dates-as-timestamps=false 
  // in application.properties This is required to convert ISO 8601 
  // Date String to LocalDate and many other java.time package use cases
  private final ObjectMapper objectMapper;

  // Spring will autowire the ObjectMapper
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

<hr>

### Step 4: Create Employee Step Definitions

Navigate to following location and create a step definitions class,

```shell
cd src/test/java/com/madrascoder/cucumberbooksample/stepdefinitions
touch EmployeeStepDefinitions.java
```

Add the following code,

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

// Implicitly a Spring Bean
public class EmployeeStepDefinitions {

  // By default, all step definitions are Spring Beans
  // You may autowire Spring Beans and Properties in StepDefinition class
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

  @When("user saves a new employee")
  public void userSavesANewEmployee() {
    String uri = baseUrl() + "/v1/employees";

    // Using RestAssured Library to call REST API
    response = given().log()
        .all()
        .body(employee)
        .contentType(ContentType.JSON)
        .post(uri);

    response.then()
        .log()
        .all();
  }

  @Then("the save IS SUCCESSFUL")
  public void theSaveIsSuccessful() {
    final int actualStatusCode = response.statusCode();
    assertThat(actualStatusCode).isIn(200, 201);
  }
}
```
We are done with all changes needed under src/test/*. If you try to run the test using `mvn clean verify`, it will fail as the Create Employee API is not yet implemented. In the next step, lets create the API to pass the test.

<hr>

### Step 5: Create Employee API

#### 5.1 Create Employee Class (DTO) with basic attributes,

Navigate to following location and create Employee DTO class,

```shell
cd src/main/java/com/madrascoder/cucumberbooksample/dto
touch Employee.java
```

Add the following code,

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
  private LocalDate dateOfBirth;
  private boolean remoteWorker;
  private String jobTitle;
  private String employeeNumber;
  private String employmentStatus;
  private String employmentType;
}
```

#### 5.2 Create EmployeeEntity Class (JPA Managed Object)

Navigate to following location and create Employee Entity class,

```shell
cd src/main/java/com/madrascoder/cucumberbooksample/entity
touch EmployeeEntity.java
```

Add the following code,

```java
import java.time.LocalDate;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "employee")
@Getter
@Setter
public class EmployeeEntity {

  @Id
  @GeneratedValue
  private Long id;

  private String firstName;
  private String lastName;
  private String email;
  private LocalDate dateOfBirth;
  private boolean remoteWorker;
  private String jobTitle;
  private String employeeNumber;
  private String employmentStatus;
  private String employmentType;
}
```

#### 5.3 Create EmployeeMapper Interface

'MapStruct' library (dependency added earlier), this library uses AnnotationProcessor to generate the respective convertor method implementations for the interface and also declares the auto generated class as a Spring Bean.

Navigate to the following location and create EmployeeMapper class

```shell
cd src/main/java/com/madrascoder/cucumberbooksample/mapper
touch EmployeeMapper.java
```

Add the following code,

```java
import com.madrascoder.cucumberbooksample.dto.Employee;
import com.madrascoder.cucumberbooksample.entity.EmployeeEntity;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.util.List;
import org.mapstruct.IterableMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.Qualifier;

@Mapper(componentModel = "spring")
public interface EmployeeMapper {

  // For Create Use Case
  EmployeeEntity toEmployeeEntity(Employee employee);

  // For Get Use Case
  @ToEmployee
  Employee toEmployee(EmployeeEntity employeeEntity);

  @IterableMapping(qualifiedBy = ToEmployee.class)
  List<Employee> toEmployees(Iterable<EmployeeEntity> entities);

  // For Update Use Case
  void mergeToEmployeeEntity(Employee employee, @MappingTarget EmployeeEntity employeeEntity);

  @Qualifier
  @Retention(RetentionPolicy.SOURCE)
  @Target(ElementType.METHOD)
  public @interface ToEmployee {}

}
```

Look for the auto generated class under compiler output directory, usually its target/generated-sources/annotations.

**Note:** Maven compiler plugin and the mapstruct annotation processor declared in `pom.xml` generates the `EmployeeMapperImpl.class`.

#### 5.4 Create EmployeeRepository Interface

Navigate to following location and create employee repository class,

```shell
cd src/main/java/com/madrascoder/cucumberbooksample/repository
touch EmployeeRepository.java
```

Add following code,

```java
import com.madrascoder.cucumberbooksample.entity.EmployeeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmployeeRepository extends JpaRepository<EmployeeEntity, Long> {}

```

#### 5.5 Create EmployeeService Class

Navigate to following location and create employee service class

```shell
cd src/main/java/com/madrascoder/cucumberbooksample/service
touch EmployeeService.java
```

Add the following code,

```java
import com.madrascoder.cucumberbooksample.dto.Employee;
import com.madrascoder.cucumberbooksample.entity.EmployeeEntity;
import com.madrascoder.cucumberbooksample.mapper.EmployeeMapper;
import com.madrascoder.cucumberbooksample.repository.EmployeeRepository;
import java.util.Optional;
import javax.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class EmployeeService {

  private final EmployeeMapper employeeMapper;
  private final EmployeeRepository employeeRepository;

  // Using Constructor Injection
  public EmployeeService(EmployeeMapper employeeMapper, EmployeeRepository employeeRepository) {
    this.employeeMapper = employeeMapper;
    this.employeeRepository = employeeRepository;
  }

  public Long create(Employee employee) {
    final EmployeeEntity employeeEntity = employeeMapper.toEmployeeEntity(employee);
    employeeRepository.save(employeeEntity);
    return employeeEntity.getId();
  }

  public Employee getById(Long id) {
    final Optional<EmployeeEntity> employeeEntityOpt = employeeRepository.findById(id);

    return employeeEntityOpt.map(employeeMapper::toEmployee)
        .orElseThrow(() -> new EntityNotFoundException("Employee not found for given id"));
  }
}
```

#### 5.6 Create Controller Advice & Respective Message Class for REST API Error Handling

Navigate to the following location and create a exception handler for REST API Controller,

```shell
cd src/main/java/com/madrascoder/cucumberbooksample/restapi
touch DefaultRestControllerAdvice.java
```

Add the following code,

```java
import java.util.List;
import javax.persistence.EntityNotFoundException;
import lombok.Getter;
import lombok.Setter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class DefaultRestControllerAdvice {

  @ExceptionHandler(EntityNotFoundException.class)
  public ResponseEntity<List<Message>> handleException(EntityNotFoundException exception) {

    final Message error = Message.error(exception.getMessage());
    return new ResponseEntity<>(List.of(error), HttpStatus.NOT_FOUND);
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

#### 5.7 Create EmployeeRestController Class

Navigate to the following location and create rest controller class,

```shell
cd src/main/java/com/madrascoder/cucumberbooksample/restapi
touch EmployeeRestController.java
```
Add the following code,

```java
import com.madrascoder.cucumberbooksample.dto.Employee;
import com.madrascoder.cucumberbooksample.service.EmployeeService;
import java.net.URI;
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
  public ResponseEntity<Void> createEmployee(@RequestBody Employee employee) {
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

Look at the location header in HTTP Response.

<hr>

### Step 6: Run the Test

```shell
mvn clean verify
```

**Maven Log**: You can see a log similar to the one below, it is nothing but the steps in feature file and REST Request + Response log.

```shell
...
[INFO] Running Create Employee

Scenario: Create employee with basic details                 # com/madrascoder/cucumberbooksample/1100-create-employee.feature:3
  Given user wants to create employee with following details # com.madrascoder.cucumberbooksample.stepdefinitions.EmployeeStepDefinitions.userWantsToCreateEmployeeWithFollowingDetails(com.madrascoder.cucumberbooksample.dto.Employee)
Request method: POST
Request URI:    http://localhost:60096/v1/employees
Proxy:                  <none>
Request params: <none>
Query params:   <none>
Form params:    <none>
Path params:    <none>
Headers:                Accept=*/*
                                Content-Type=application/json; charset=UTF-8
Cookies:                <none>
Multiparts:             <none>
Body:
{
    "id": null,
    "firstName": "Effie",
    "lastName": "Slee",
    "email": "eslee@blueocean.com",
    "joiningDate": [
        2014,
        3,
        1
    ],
    "jobTitle": "Physical Therapy Assistant",
    "employeeNumber": "E101",
    "employmentStatus": null,
    "employmentType": "Full-Time"
}
HTTP/1.1 201 
Location: http://localhost:60096/v1/employees/1
Content-Length: 0
Date: Thu, 15 Apr 2021 02:19:07 GMT
Keep-Alive: timeout=60
Connection: keep-alive
  When user saves a new employee                             # com.madrascoder.cucumberbooksample.stepdefinitions.EmployeeStepDefinitions.userSavesANewEmployee()
  Then the save IS SUCCESSFUL                                # com.madrascoder.cucumberbooksample.stepdefinitions.EmployeeStepDefinitions.theSave()
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 1.082 s - in Create Employee
...
```

<hr>

### Conclusion

There is a lot we have learnt so far. This chapter is the first step towards doing BDD in a real projects. Every minute you spend reading and trying the steps so far will definitely save a lots of hours for you and your team when you start implementing BDD in your team.

In the next chapter, lets learn how to create feature files to represent all validation use cases and test those validations. This is also a common use case when it comes to creating an API. 

<hr>

### References

[MapStruct](https://mapstruct.org/){:target="_blank"}

<hr>

### Credits

Photo by <a href="https://unsplash.com/@kylejglenn?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank">Kyle Glenn</a> on <a href="https://unsplash.com/s/photos/accomplishment?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank">Unsplash</a>
  
<hr>

[Previous Chapter]({% link tutorials/001-pragmatic-cucumber/03-converting-datatable-to-java-object.md %}) | 
[Scroll Up to Top]({% link tutorials/001-pragmatic-cucumber/04-implementing-create-resource.md %}) | 
[Table of Contents]({% link tutorials/001-pragmatic-cucumber/index.md %}) |
[Next Chapter]({% link tutorials/001-pragmatic-cucumber/05-implementing-validations-during-create.md %})

