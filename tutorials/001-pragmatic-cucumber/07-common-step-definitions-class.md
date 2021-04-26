---
layout: tutorial
chapter: 7
title: Common Step Definitions
description: >
  We are primarily dealing with REST APIs. In all our test, we need to assert the HTTP Response Code. Step Definition code to assert the HTTP Response Code can be used in multiple feature files. Hence, in this chapter, we will move that to a separate class called CommonStepDefinitions.java. In future if there is a need to share a step definitions across multiple feature files, we can add those methods to CommonStepDefinitions.java.
category: tutorial
image: assets/media/tutorials/001-pragmatic-cucumber/chapter7/kit-suman--vxhOD5_Aeo-unsplash.jpg
tags:
  - Java
  - Spring
  - Cucumber
  - BDD
date:
featured: false
---

### Move HTTP Response Code Assertion Step Definition to Common Step Definitions class

Navigate to following location and create the common step definitions class,

```shell
cd src/test/java/com/madrascoder/cucumberbooksample/stepdefinitions
touch CommonStepDefinitions.java
```

Add the following code,

```java
import com.madrascoder.cucumberbooksample.TestContext;
import io.cucumber.java.en.Then;
import io.restassured.response.Response;
import org.springframework.beans.factory.annotation.Autowired;

public class CommonStepDefinitions {

  @Autowired
  private TestContext testContext;

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
      throw new IllegalArgumentException(
          "Expected result is invalid. Valid values are 'IS SUCCESSFUL', 'FAILS', 'NOT FOUND'");
    }
  }
}
```
<hr>

### Conclusion

In this chapter, we learnt how to deal with step definitions that are commonly used across multiple feature files. Test Context class that we created in the previous chapter made it possible to split the common step definitions to its own class.

In the next chapter, we will move all boiler plate REST API calls to an abstract base class and let all step definitions class extend it. This way we write less code per step definitions there by its easier to maintain.

<hr>

### Credits

Photo by <a href="https://unsplash.com/@cobblepot?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank">Kit Suman</a> on <a href="https://unsplash.com/s/photos/public-transport?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank">Unsplash</a>
  
<hr>

[Previous Chapter]({% link tutorials/001-pragmatic-cucumber/06-sharing-state-between-steps.md %}) | 
[Scroll Up to Top]({% link tutorials/001-pragmatic-cucumber/07-common-step-definitions-class.md %}) | 
[Table of Contents]({% link tutorials/001-pragmatic-cucumber/index.md %}) |
[Next Chapter]({% link tutorials/001-pragmatic-cucumber/08-moving-rest-client-calls-to-base-class.md %})