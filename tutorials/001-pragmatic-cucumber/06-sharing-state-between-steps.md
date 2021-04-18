---
layout: tutorial
chapter: 6
title: Sharing State between Step Executions
description: >
  We use 'Given Step' to gather inputs, 'When Step' to call the API or perform the desired operation using the data gathered and 'Then Step' to assert the expected result/response. There are 3 different strategies to share data between step executions. First one is to store the state as StepDefinition class instance variables. We have been doing this in the past chapters. Second strategy is to use a class with @ScenarioScope annotation and the last one is to use a ThreadLocal. In this chapter, let us see how we can use the @ScenarioScope annotation and ThreadLocal to share state between step executions.

category: tutorial
image: assets/media/tutorials/001-pragmatic-cucumber/chapter6/isabel-lenis-vXM4dJPB4OM-unsplash.jpg
tags:
  - Java
  - Spring
  - Cucumber
  - BDD
date:
featured: false
---

You know that we are developing a Spring Boot REST API using BDD. Hence our primary focus is to test the APIs. In order to call the API, we may need a payload (HTTP Request) and in order to validate or assert the test case we need the response. In a nutshell, we need to store the HTTP Request and HTTP Response object and make it available across step definition methods.

In our example, we use a library called RestAssured to call the REST API. Hence we need to store the RequestSpecification and Response object as state variables. Here is the @ScenarioScope class that stores the state.

### 1. Using @ScenarioScope Spring Bean

**Path:** src/test/java/com/madrascoder/cucumberbooksample/TestContext.java

```java
import static io.restassured.RestAssured.given;

import io.cucumber.spring.ScenarioScope;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;
import lombok.Data;
import org.springframework.stereotype.Component;

@ScenarioScope
@Component
@Data
public class TestContext {

  private RequestSpecification request = given().log()
                                                .all();

  private Response response;
  private Object payload;

  public <T> T getPayload(Class<T> clazz) {
    return clazz.cast(payload);
  }

  public void reset() {
    request = given().log()
                     .all();

    response = null;
    payload = null;
  }
}
```

Now let us see how we can use this `TestContext.java` class in `EmployeeStepDefinitions.java`,

```java
import static io.restassured.RestAssured.given;
import static org.assertj.core.api.Assertions.assertThat;

import com.madrascoder.cucumberbooksample.TestContext;
import com.madrascoder.cucumberbooksample.dto.Employee;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.server.LocalServerPort;

public class EmployeeStepDefinitions {

  // By default, all step definitions are Spring Beans
  // You may autowire Spring Beans and Properties in Cucumber StepDefinition class
  @LocalServerPort
  private int port;

  @Autowired
  private TestContext testContext;

  public String baseUrl() {
    return "http://localhost:" + port;
  }

  @Given("user wants to create employee with following details")
  public void userWantsToCreateEmployeeWithFollowingDetails(Employee employee) {
    testContext.setPayload(employee);
  }

  @When("user saves a new employee(.*)")
  public void userSavesANewEmployee() {
    String uri = baseUrl() + "/v1/employees";

    Response response = given()
        .log()
        .all()
        .body(testContext.getPayload(Employee.class))
        .contentType(ContentType.JSON)
        .post(uri);

    response.then()
        .log()
        .all();

    testContext.setResponse(response);
  }

  @Then("the save {string}")
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
      throw new IllegalArgumentException("Cannot parse expected result, expecting 'IS SUCCESSFUL' or 'FAILS'");
    }
  }
}
```

If you look at the above EmployeeStepDefinitions.java class, you may notice that we replaced the following instance variables with testContext instance variable.

```java
private Response response;

private Employee employee;
```

Replaced with,

```java
@Autowired
private TestContext testContext;
```

Look at the following lines of code in EmployeeStepDefinitions.java to see how we have used testContext.

```java
...
testContext.setPayload(employee);
...
```

```java
...

Response response = given()
    .log()
    .all()
    .body(testContext.getPayload(Employee.class))
    .contentType(ContentType.JSON)
    .post(uri);
    
...

testContext.setResponse(response);
...  
```

```java
...
Response response = testContext.getResponse();
...
```

<hr>

### 2. Using ThreadLocal Singleton Class

```java
import static io.restassured.RestAssured.given;
import static java.lang.ThreadLocal.withInitial;

import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;
import java.util.HashMap;
import java.util.Map;

public enum TestContext {

  CONTEXT;

  private static final String PAYLOAD = "PAYLOAD";
  private static final String REQUEST = "REQUEST";
  private static final String RESPONSE = "RESPONSE";
  private final ThreadLocal<Map<String, Object>> testContexts = withInitial(HashMap::new);

  public <T> T get(String name) {
    return (T) testContexts.get()
        .get(name);
  }

  public <T> T set(String name, T object) {
    testContexts.get()
        .put(name, object);
    return object;
  }

  public RequestSpecification getRequest() {
    if (null == get(REQUEST)) {
      set(REQUEST, given().log()
          .all());
    }

    return get(REQUEST);
  }

  public Response getResponse() {
    return get(RESPONSE);
  }

  public Response setResponse(Response response) {
    return set(RESPONSE, response);
  }

  public Object getPayload() {
    return get(PAYLOAD);
  }

  public <T> T getPayload(Class<T> clazz) {
    return clazz.cast(get(PAYLOAD));
  }

  public <T> void setPayload(T object) {
    set(PAYLOAD, object);
  }

  public void reset() {
    testContexts.get()
        .clear();
  }
}
```

You may see that test context uses ThreadLocal and there are methods to set and get HTTP Request, Payload and HTTP Response.

In order to use the TestContext enum, you may add below method in EmployeeStepDefinitions.java or directly use the CONTEXT enum to set/get objects required by various step definition methods.


```java
  public TestContext testContext() {
    return CONTEXT;
  }
```

### Conclusion


<hr>

### References

For more information on `MapStruct` you may refer [https://mapstruct.org/](https://mapstruct.org/){:target="_blank"}

<hr>

### Credits

Photo by <a href="https://unsplash.com/@isalenis?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Isabel Lenis</a> on <a href="https://unsplash.com/s/photos/sharing?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
  
<hr>

[Previous Chapter]({% link tutorials/001-pragmatic-cucumber/04-implementing-create-resource.md %}) | 
[Scroll Up to Top]({% link tutorials/001-pragmatic-cucumber/06-sharing-state-between-steps.md %}) | 
[Table of Contents]({% link tutorials/001-pragmatic-cucumber/index.md %}) |
[Next Chapter]({% link tutorials/001-pragmatic-cucumber/05-implementing-validations-during-create.md %})