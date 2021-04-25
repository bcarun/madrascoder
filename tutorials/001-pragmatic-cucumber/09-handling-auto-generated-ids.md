---
layout: tutorial
chapter: 9
title: Strategy to Handle Auto Generated Identifier 
description: >
  

category: tutorial
image: assets/media/tutorials/001-pragmatic-cucumber/chapter9/markus-spiske-yAlLIl4qtnc-unsplash.jpg
tags:
  - Java
  - Spring
  - Cucumber
  - BDD
date:
featured: false
---

In the below Entity class, we have used IdentityGenerator (@Id and @GeneratedValue annotations) to automatically generate id of the record during persist/save.

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

We used the following feature file to create a employee.

```cucumber
Feature: Create Employee

  @smoketest
  Scenario: Create employee with basic details
    Given user wants to create employee with following details
      | firstName | lastName | email               | dateOfBirth | jobTitle                   | employeeNumber | employeeStatus | employmentType |
      | Effie     | Slee     | eslee@blueocean.com | 2014-03-01  | Physical Therapy Assistant | E101           | Active         | Full-Time      |

    When user saves a new employee

    Then the save 'IS SUCCESSFUL'
```

Above scenario executes HTTP POST method to create a resource. If for some reason, user wants to fetch this record and perform some updates to it, we need the id of the record to fetch it. We can add 'id' column to the `Scenario` as stated below and explicitly set the 'id' as 110501 or whatever number you need for testing.

```cucumber
Feature: Create Employee

  @smoketest
  Scenario: Create employee with basic details
    Given user wants to create employee with following details
      | id     | firstName | lastName | email               | dateOfBirth | jobTitle                   | employeeNumber | employeeStatus | employmentType |
      | 110501 | Effie     | Slee     | eslee@blueocean.com | 2014-03-01  | Physical Therapy Assistant | E101           | Active         | Full-Time      |

    When user saves a new employee

    Then the save 'IS SUCCESSFUL'
```

When you execute the above `Scenario`, JPA/Hibernate will check if a record with 'id' = 110501 exists. If it doesn't exist, it uses default IdentityGenerator to auto generate an id and set it to the 'id' field and completely ignore the supplied '110501'. This behavior of hibernate ignoring supplied 'id' makes accessing the data setup for testing difficult.

One way to solve this problem is to extend IdentityGenerator class and override `generate` method to use the 'id' supplied if available and auto generate a new 'id' only when the supplied 'id' is null.

### Step 1: Extend IdentityGenerator.java 

**Path:** src/main/java/com/madrascoder/cucumberbooksample/entity/AutoGenerateIdIfNullIdentityGenerator.java

```java
import java.io.Serializable;
import org.hibernate.engine.spi.SharedSessionContractImplementor;
import org.hibernate.id.IdentityGenerator;

public class AutoGenerateIdIfNullIdentityGenerator extends IdentityGenerator {

  @Override
  public Serializable generate(SharedSessionContractImplementor session, Object object) {
    Serializable id = session.getEntityPersister(null, object)
        .getClassMetadata()
        .getIdentifier(object, session);

    return id != null ? id : super.generate(session, object);
  }
}
```

### Step 2: Use Custom Identity Generator in EmployeeEntity.java

```java
import java.time.LocalDate;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;

@Entity
@Table(name = "employee")
@Getter
@Setter
public class EmployeeEntity {

  @Id
  @GenericGenerator(name = "AutoGenerateIdIfNullIdentityGenerator",
                    strategy = "com.madrascoder.cucumberbooksample.entity.AutoGenerateIdIfNullIdentityGenerator")

  @GeneratedValue(generator = "AutoGenerateIdIfNullIdentityGenerator")
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

> Whatever we did now is what I call as 'Testable Architecture'.

<hr>

### Conclusion

In this chapter, we created a custom identity generator to replace the default behavior of JPA/Hibernate. Now, if feature file supply an 'id', JPA/Hibernate will use that 'id' instead of ignoring and creating one from next sequence. This is very useful when implementing 'Update API' and 'Get APIs'.

In the next chapter, we will learn another technique on how we can replace true/false with YES/NO in feature files so that it is easier to read. We will also learn how to use relative dates instead of fixed dates which is not good for testing.

<hr>

### Credits

Photo by <a href="https://unsplash.com/@markusspiske?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank">Markus Spiske</a> on <a href="https://unsplash.com/s/photos/identification?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank">Unsplash</a>
  
<hr>

[Previous Chapter]({% link tutorials/001-pragmatic-cucumber/08-moving-rest-client-calls-to-base-class.md %}) | 
[Scroll Up to Top]({% link tutorials/001-pragmatic-cucumber/09-handling-auto-generated-ids.md %}) | 
[Table of Contents]({% link tutorials/001-pragmatic-cucumber/index.md %}) |
[Next Chapter]({% link tutorials/001-pragmatic-cucumber/10-handling-boolean-dates-in-feature-files.md %})

