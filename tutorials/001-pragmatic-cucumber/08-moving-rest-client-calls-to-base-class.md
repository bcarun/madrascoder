---
layout: tutorial
chapter: 8
title: Move REST API Calls to Step Definitions Base Class
description: >
  

category: tutorial
image: assets/media/tutorials/001-pragmatic-cucumber/chapter8/mark-potterton-sNVkn3507Oo-unsplash.jpg
tags:
  - Java
  - Spring
  - Cucumber
  - BDD
date:
featured: false
---

Following method calls `POST /v1/employees` REST API to create an employee.

```java
...
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
...
```

In the above code, we use RestAssured static builder methods `given()`, `log()`, `post()` etc to call the REST API and log the request and response. Similarly, we need to call HTTP GET, PUT, DELETE, PATCH methods for multiple APIs. Instead of repeating this 7 - 8 lines of code in each method, we can abstract all HTTP calls to a base class use it in all step definitions class by extending the abstract base class.

### Step 1: Create AbstractStepDefinitions.java

AbstractStepDefinitions.java contains methods to call REST APIs, log request response and it reads the state from TestContext.java.

```java
import com.madrascoder.cucumberbooksample.TestContext;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.server.LocalServerPort;

public abstract class AbstractStepDefinitions {

  // By default, all step definitions are Spring Beans
  // You may autowire Spring Beans and Properties in Cucumber StepDefinition class
  @LocalServerPort
  private int port;

  @Autowired
  private TestContext testContext;

  protected String baseUrl() {
    return "http://localhost:" + port;
  }

  protected TestContext testContext() {
    return testContext;
  }

  protected void executePost(String apiPath) {
    executePost(apiPath, null, null);
  }

  protected void executePost(String apiPath, Map<String, String> pathParams) {
    executePost(apiPath, pathParams, null);
  }

  protected void executePost(String apiPath, Map<String, String> pathParams, Map<String, String> queryParams) {
    final RequestSpecification request = testContext.getRequest();
    final Object payload = testContext.getPayload();

    setPayload(request, payload);
    setQueryParams(pathParams, request);
    setPathParams(queryParams, request);

    Response response = request.contentType(ContentType.JSON)
        .accept(ContentType.JSON)
        .post(apiPath);

    logResponse(response);

    testContext.setResponse(response);
  }

  protected void executeMultiPartPost(String apiPath) {
    final RequestSpecification request = testContext.getRequest();
    final Object payload = testContext.getPayload();

    Response response = request.multiPart("fileName", payload, "application/json")
        .post(apiPath);

    logResponse(response);
    testContext.setResponse(response);
  }

  protected void executeDelete(String apiPath) {
    executeDelete(apiPath, null, null);
  }

  protected void executeDelete(String apiPath, Map<String, String> pathParams) {
    executeDelete(apiPath, pathParams, null);
  }

  protected void executeDelete(String apiPath, Map<String, String> pathParams, Map<String, String> queryParams) {
    final RequestSpecification request = testContext.getRequest();
    final Object payload = testContext.getPayload();

    setPayload(request, payload);
    setQueryParams(pathParams, request);
    setPathParams(queryParams, request);

    Response response = request.accept(ContentType.JSON)
        .delete(apiPath);

    logResponse(response);
    testContext.setResponse(response);
  }

  protected void executePut(String apiPath) {
    executePut(apiPath, null, null);
  }

  protected void executePut(String apiPath, Map<String, String> pathParams) {
    executePut(apiPath, pathParams, null);
  }

  protected void executePut(String apiPath, Map<String, String> pathParams, Map<String, String> queryParams) {
    final RequestSpecification request = testContext.getRequest();
    final Object payload = testContext.getPayload();

    setPayload(request, payload);
    setQueryParams(pathParams, request);
    setPathParams(queryParams, request);

    Response response = request.contentType(ContentType.JSON)
        .accept(ContentType.JSON)
        .put(apiPath);
    logResponse(response);
    testContext.setResponse(response);
  }

  protected void executePatch(String apiPath) {
    executePatch(apiPath, null, null);
  }

  protected void executePatch(String apiPath, Map<String, String> pathParams) {
    executePatch(apiPath, pathParams, null);
  }

  protected void executePatch(String apiPath, Map<String, String> pathParams, Map<String, String> queryParams) {
    final RequestSpecification request = testContext.getRequest();
    final Object payload = testContext.getPayload();

    setPayload(request, payload);
    setQueryParams(queryParams, request);
    setPathParams(pathParams, request);

    Response response = request.accept(ContentType.JSON)
        .patch(apiPath);

    logResponse(response);
    testContext.setResponse(response);
  }

  protected void executeGet(String apiPath) {
    executeGet(apiPath, null, null);
  }

  protected void executeGet(String apiPath, Map<String, String> pathParams) {
    executeGet(apiPath, pathParams, null);
  }

  protected void executeGet(String apiPath, Map<String, String> pathParams, Map<String, String> queryParams) {
    final RequestSpecification request = testContext.getRequest();

    setQueryParams(queryParams, request);
    setPathParams(pathParams, request);
    Response response = request.accept(ContentType.JSON)
        .get(apiPath);

    logResponse(response);
    testContext.setResponse(response);
  }

  private void logResponse(Response response) {
    response.then()
        .log()
        .all();
  }

  private void setPathParams(Map<String, String> pathParams, RequestSpecification request) {
    if (null != pathParams) {
      request.pathParams(pathParams);
    }
  }

  private void setQueryParams(Map<String, String> queryParams, RequestSpecification request) {
    if (null != queryParams) {
      request.queryParams(queryParams);
    }
  }

  private void setPayload(RequestSpecification request, Object payload) {
    if (null != payload) {
      request.contentType(ContentType.JSON)
          .body(payload);
    }
  }
}
```

> If for some reason, you don't like RestAssured and would like to replace it with another REST client library, you need to add the respective dependency and modify the REST client code only in this class.

### Step 2: Extend AbstractStepDefinitions.java in EmployeeStepDefinitions.java

Because many of the boiler plate REST API calls are moved to AbstractStepDefinitions.java, EmployeeStepDefinitions.java now became super thin with just one or two lines of code in each step definition methods.

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

Compared with the one we had in previous chapter, you know how simple it is now. 

<hr>


### Conclusion

In this chapter, we moved all boiler plate REST API call code to AbstractStepDefinitions.java class. This simplified EmployeeStepDefinitions.java class and it will make any other new step definitions class also a simple one.

In the next chapter, we will learn how to deal with JPA/Hibernate auto generated identifiers from testing perspective.

<hr>

### References

For more information on `MapStruct` you may refer [https://mapstruct.org/](https://mapstruct.org/){:target="_blank"}

<hr>

### Credits

Photo by <a href="https://unsplash.com/@markpot123?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank">Mark Potterton</a> on <a href="https://unsplash.com/s/photos/construction?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank">Unsplash</a>
  
<hr>

[Previous Chapter]({% link tutorials/001-pragmatic-cucumber/07-common-step-definitions-class.md %}) | 
[Scroll Up to Top]({% link tutorials/001-pragmatic-cucumber/08-moving-rest-client-calls-to-base-class.md %}) | 
[Table of Contents]({% link tutorials/001-pragmatic-cucumber/index.md %}) |
[Next Chapter]({% link tutorials/001-pragmatic-cucumber/09-handling-auto-generated-ids.md %})

