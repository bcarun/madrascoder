---
layout: tutorial
chapter: 13
title: Cucumber Reports
description: >
  Cucumber has various built-in plugins to generate reports. In this chapter, we will see how we can generate, package it and expose them as URLs along with the APIs. Report is a plugin in case of Cucumber. To enable any available report, you may need to set Cucumber plugin property in junit-platform.properties.

category: tutorial
image: assets/media/tutorials/001-pragmatic-cucumber/chapter13/lukas-blazek-mcSDtbWXUZU-unsplash.jpg
tags:
  - Java
  - Spring
  - Cucumber
  - BDD
date:
featured: false
---

### 1. HTML Report

HTML Report is my favorite report of all the available as its the one report that shows the DataTable. We can generate HTML report, package it along with the application jar and expose as URL. This report not only serve as a executable specification but also a living documentation of the product as anyone can access the report to understand the behavior of the system.

Navigate to following location and create properties,

```shell
cd src/test/resources
touch junit-platform.properties
```

To enable HTML report, add the following property to Cucumber plugin property as stated below.

```properties
cucumber.plugin=html:target/classes/static/features/index.html
```

Generated HTML report will be saved at the specified directory and packaged along with the application jar as it is under `classes` directory.

After you run the application, you may access the report using the below URL,

http://localhost:8080/features/index.html

**Note:** Host and port may be different in your case.

#### Screenshot of Sample HTML Report

![Cucumber HTML Report](/assets/media/tutorials/001-pragmatic-cucumber/chapter13/html-report.png)

> For security reason, if you don't want to package and expose the Cucumber HTML Report along with your APIs, you may change the location where the report is generated. Other option is to protect `features/index.html` path using WebSecurityConfigurer in Spring Security.

<hr>

### 2. Pretty Print Report

To enable pretty print report, add the word `pretty` Cucumber plugin property as stated below,

```properties
cucumber.plugin=html:target/classes/static/features/index.html,pretty
```

If you don't specify a file name, pretty print report will be printed in the build log. It is quite useful to pretty print the step execution along with the build logs.

Here is a output snippet of pretty print report in build log,

```shell
...
@validations
Scenario Outline: Create employee with all the required & valid attributes IS SUCCESSFUL # com/madrascoder/cucumberbooksample/1100-create-employee.feature:31
  Given user wants to create employee with following details                             # com.madrascoder.cucumberbooksample.stepdefinitions.EmployeeStepDefinitions.userWantsToCreateEmployeeWithFollowingDetails(com.madrascoder.cucumberbooksample.dto.Employee)
  When user saves a new employee with all the required & valid attributes                # com.madrascoder.cucumberbooksample.stepdefinitions.EmployeeStepDefinitions.userSavesANewEmployee()
  Then the save 'IS SUCCESSFUL'                                                          # com.madrascoder.cucumberbooksample.stepdefinitions.CommonStepDefinitions.theSave(java.lang.String)
...
```
<hr>

### 3. JSON Report

To enable JSON report, add `json:target/cucumber.json` to Cucumber plugin property as stated below,

```properties
cucumber.plugin=html:target/classes/static/features/index.html,pretty,json:target/cucumber.json
```

Other external plugins uses json report or the source. 

<hr>

### 4. JUnit Report

To enable JUnit report, add `junit:target/junit.xml` to Cucumber plugin as stated below,

```properties
cucumber.plugin=html:target/classes/static/features/index.html,pretty,json:target/cucumber.json,junit:target/junit.xml
```

This report will be useful if you use tools like SonarQube. SonarQube can parse the JUnit XML and display the test and coverage status in its Dashboard.

<hr>

### Conclusion

Reports improve the visibility. I strongly recommend generating and sharing reports to all interested parties in the product.

<hr>

### References

[Cucumber Reporting](https://cucumber.io/docs/cucumber/reporting/){:target="_blank"}

<hr>

### Credits

Photo by <a href="https://unsplash.com/@goumbik?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank">Lukas Blazek</a> on <a href="https://unsplash.com/s/photos/report?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank">Unsplash</a>
  
<hr>

[Previous Chapter]({% link tutorials/001-pragmatic-cucumber/12-implementing-get-resource.md %}) | 
[Scroll Up to Top]({% link tutorials/001-pragmatic-cucumber/13-cucumber-reports.md %}) | 
[Table of Contents]({% link tutorials/001-pragmatic-cucumber/index.md %})

