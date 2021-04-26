---
layout: tutorial
chapter: 9
title: Strategy to Handle Boolean Values and Dates in Feature Files 
description: >
  We use boolean data type for certain fields in our code. There are 2 possible values for the boolean field in java, they are true and false. If we need to set value to a boolean field in feature file, we need to use true/false. But, from a Product Owner perspective, they wish to see the value as YES/NO instead of true/false.

  In this chapter, we will learn how to convert YES/NO in feature file to true/false. Also, we will learn how to use relative dates instead of fixed dates in test cases.

category: tutorial
image: assets/media/tutorials/001-pragmatic-cucumber/chapter10/suzanne-d-williams-VMKBFR6r_jg-unsplash.jpg
tags:
  - Java
  - Spring
  - Cucumber
  - BDD
date:
featured: false
---

Employee DTO has 2 fields,

```java
  ...
  private LocalDate dateOfBirth;
  private boolean remoteWorker;
  ...
```

In the feature file, we used the values `true` or `false` for the field `remoteWorker`. From business perspective, they perfer `Yes`, `No` instead of `true`, `false`. Now the question is, how to make cucumber convert `Yes` and `No` to `true` and `false`.

Similarly, for the `dateOfBirth` field, we have a validation in place to check the given date is in the past date. In order to validate this use case, we have used a future date 2021-05-26 (a future date as today 2021-04-18) and whenever a future date is provided, validation should fail. It will work as expected till 2021-05-26 and after that it not fail as expected. Hence, from testing perspective we need to use relative dates instead of real dates in our feature files to avoid these kinds of failures. One way to solve this problem is to use relative dates like 'LocalDate.now+1' for tomorrow, 'LocalDate.now+2' for day after tomorrow etc.

Following are the classes that require special treatment in Cucumber,

1. Boolean/boolean
2. LocalDate
3. LocalDateTime
4. LocalTime

### Step 1: Create Convertors 

We use Spring Convertor interface to create convertors for all the above classes to String and back.

#### 1.1 Yes No Convertor

```java
import org.springframework.core.convert.converter.Converter;

public class YesNoConverter implements Converter<String, Boolean> {

  @Override
  public Boolean convert(String source) {
    if (source.equalsIgnoreCase("YES")) {
      return Boolean.TRUE;
    }
    return Boolean.FALSE;
  }
}
```
#### 1.2 LocalDate Convertor

```java
import java.time.LocalDate;
import org.springframework.core.convert.converter.Converter;

public class LocalDateConverter implements Converter<String, LocalDate> {

  private static final String PATTERN = "LocalDate.now";

  @Override
  public LocalDate convert(String source) {
    LocalDate localDate = LocalDate.now();
    String[] addValue = source.split(PATTERN);
    if (addValue.length > 0) {
      localDate = localDate.plusDays(Long.parseLong(addValue[1]));
    }
    return localDate;
  }
}
```

#### 1.3 LocalDateTime Convertor

```java
import static java.time.format.DateTimeFormatter.ISO_DATE_TIME;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import org.springframework.core.convert.converter.Converter;

public class LocalDateTimeConverter implements Converter<String, LocalDateTime> {

  private static final String PATTERN = "LocalDateTime.now";
  private static final String DAY_PARAMETER = "D";
  private static final String HOUR_PARAMETER = "H";

  @Override
  public LocalDateTime convert(String source) {
    LocalDateTime localDateTime = LocalDateTime.now();
    String[] addValue = source.split(PATTERN);
    if (addValue.length > 0) {
      String parameter = addValue[1];
      if (parameter.length() > 2) {
        localDateTime = convertWithParameter(parameter.substring(parameter.length() - 1),
            Integer.valueOf(parameter.substring(0, parameter.length() - 1)));
      } else {
        localDateTime = convertWithParameter(DAY_PARAMETER, Integer.valueOf(parameter.substring(0, 2)));
      }
    }

    //Returning minutes in zero to avoid comparison errors
    assert localDateTime != null;
    return LocalDateTime.parse(localDateTime.truncatedTo(ChronoUnit.HOURS)
        .format(ISO_DATE_TIME));
  }

  /**
   * Create a LocalDateTime based on parameter
   *
   * @param parameter D (Days) H (Hours)
   * @param unit Unit to increase of decrease
   */
  private LocalDateTime convertWithParameter(String parameter, Integer unit) {
    final LocalDateTime now = LocalDateTime.now();
    switch (parameter) {
      case DAY_PARAMETER:
        return now.plusDays(unit);
      case HOUR_PARAMETER:
        return now.plusHours(unit);
    }
    return null;
  }
}
```

#### 1.4 LocalTime Convertor

```java
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import org.springframework.core.convert.converter.Converter;

public class LocalTimeConverter implements Converter<String, LocalTime> {

  private static final String PATTERN = "LocalTime.now";

  @Override
  public LocalTime convert(String source) {
    LocalTime localTime = LocalTime.now();
    String[] addValue = source.split(PATTERN);
    if (addValue.length > 0) {
      localTime = localTime.plusHours(Long.parseLong(addValue[1]));
    }
    return localTime.truncatedTo(ChronoUnit.HOURS);
  }
}
```

#### 1.5 Convertor Factory

```java
import java.util.HashMap;
import java.util.Map;
import org.springframework.core.convert.converter.Converter;

public class ConverterFactory {

  private static final Map<String, Converter<String, ?>> converters = new HashMap<>();

  static {
    // Map of converter name to respective convertor class.
    converters.put("LocalDateTime", new LocalDateTimeConverter());
    converters.put("LocalDate", new LocalDateConverter());
    converters.put("LocalTime", new LocalTimeConverter());
    converters.put("YES", new YesNoConverter());
    converters.put("NO", new YesNoConverter());
  }

  /**
   * Get Converter class for the given converter name.
   *
   * @param converterName - name of the converter class
   * @return converter object
   */
  public static Converter<String, ?> getConverter(String converterName) {
    return converters.get(converterName);
  }
}
```

#### 1.6 ConvertorUtils

```java
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.core.convert.converter.Converter;
import org.springframework.util.StringUtils;

public class ConverterUtils {

  public static Map<String, Object> convertMapValues(Map<String, Object> row) {
    Map<String, Object> fields = new LinkedHashMap<>(row);
    row.forEach((k, v) -> {
      if (v instanceof String) {
        String convertedV = convert((String) v);
        fields.put(k, convertedV);
      } else {
        fields.put(k, v);
      }
    });

    return fields;
  }

  /**
   * Values like LocalDate.now, LocalDateTime.now, Yes, No etc are converted java types.
   *
   * @param value to convert
   * @return converted java types
   */
  private static String convert(String value) {
    if (!StringUtils.hasText(value)) {
      return value;
    }

    // Split by period and get the left side value
    String converterName = value.split("\\.")[0];
    Converter<String, ?> converter = ConverterFactory.getConverter(converterName);
    if (null != converter) {
      final Object convertedValue = converter.convert(value);
      return (null != convertedValue) ? convertedValue.toString() : value;
    }

    return value;
  }
}
```

<hr>

#### Step 2: Using ConvertorUtils in DataTransformer.java

ConvertorUtils check each and every field, based on the value, it chooses the respective convertor to convert the data before it is being sent as payload in API calls.

```java
import com.fasterxml.jackson.databind.ObjectMapper;
import com.madrascoder.cucumberbooksample.convertor.ConverterUtils;
import io.cucumber.java.DefaultDataTableCellTransformer;
import io.cucumber.java.DefaultDataTableEntryTransformer;
import io.cucumber.java.DefaultParameterTransformer;
import java.lang.reflect.Type;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class DataTransformer {

  private final ObjectMapper objectMapper;

  // Spring will auto wire the ObjectMapper
  public DataTransformer(ObjectMapper objectMapper) {
    this.objectMapper = objectMapper;
  }

  @DefaultParameterTransformer
  @DefaultDataTableEntryTransformer
  @DefaultDataTableCellTransformer
  public Object transformer(Object fromValue, Type toValueType) {

    log.debug("Transform: fromValue = {}, toValueType = {}", fromValue, toValueType);

    if (fromValue instanceof Map) {
      @SuppressWarnings("unchecked") 
      Map<String, Object> map = (Map<String, Object>) fromValue;

      return objectMapper.convertValue(ConverterUtils.convertMapValues(map), objectMapper.constructType(toValueType));

    } else {
      return objectMapper.convertValue(fromValue, objectMapper.constructType(toValueType));
    }
  }
}
```

<hr>

### Step 3: Create Feature File

Now that we have Convertors for LocalDate, LocalDateTime, Boolean etc., we can modify the feature files to use YES NO instead of true false and relative dates instead of actual dates.

Look at the fields 'remoteWorker', 'dateOfBirth' in the below DataTable and Examples in Scenario Outline.

```cucumber
Feature: Create Employee

  @smoketest
  Scenario: Create employee with basic details
    Given user wants to create employee with following details
      | firstName | lastName | email               | dateOfBirth        | remoteWorker | jobTitle                   | employeeNumber | employeeStatus | employmentType |
      | Effie     | Slee     | eslee@blueocean.com | LocalDate.now-6570 | NO           | Physical Therapy Assistant | E101           | Active         | Full-Time      |

    When user saves a new employee

    Then the save 'IS SUCCESSFUL'

  @validations
  Scenario Outline: Create employee <testCase> <expectedResult>

    Given user wants to create employee with following details
      | firstName   | lastName   | email   | dateOfBirth   | remoteWorker | jobTitle                      | employeeNumber | employeeStatus | employmentType |
      | <firstName> | <lastName> | <email> | <dateOfBirth> | NO           | Budget/Accounting Analyst III | 160            | Active         | Full-Time      |

    When user saves a new employee <testCase>

    Then the save '<expectedResult>'

    Examples:
      | testCase                                 | expectedResult | firstName | lastName | email                 | dateOfBirth        |
      | without first name                       | FAILS          |           | Fairall  | bfairall0@pcworld.com | LocalDate.now-6570 |
      | without last name                        | FAILS          | Barnie    |          | bfairall0@pcworld.com | LocalDate.now-6570 |
      | with invalid email id bfairall0@         | FAILS          | Barnie    | Fairall  | bfairall0@            | LocalDate.now-6570 |
      | with invalid email id bfairall0          | FAILS          | Barnie    | Fairall  | bfairall0             | LocalDate.now-6570 |
      | with date of birth as future date        | FAILS          | Barnie    | Fairall  | bfairall0@pcworld.com | LocalDate.now+1    |
      | with all the required & valid attributes | IS SUCCESSFUL  | Barnie    | Fairall  | bfairall0@pcworld.com | LocalDate.now-6570 |

```

If you run the tests, everything will work as usual. Values YES/NO will be automatically converted to boolean and relative dates 'LocalDate.now+1' etc., will be transformed to a LocalDate value based on the date and time the test is executed.

<hr>

### Conclusion

In this chapter, we learnt how to replace true/false with **YES/NO** and fixed dates with **relative dates**. This will improve the readability of the feature file.

In the next chapter, we will learn how to create feature file for 'Update API'. We will also apply/use these Convertor in feature files.

<hr>

### Credits

Photo by <a href="https://unsplash.com/@scw1217?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank">Suzanne D. Williams</a> on <a href="https://unsplash.com/s/photos/automatic?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank">Unsplash</a>
  
<hr>

[Previous Chapter]({% link tutorials/001-pragmatic-cucumber/09-handling-auto-generated-ids.md %}) | 
[Scroll Up to Top]({% link tutorials/001-pragmatic-cucumber/10-handling-boolean-dates-in-feature-files.md %}) | 
[Table of Contents]({% link tutorials/001-pragmatic-cucumber/index.md %}) |
[Next Chapter]({% link tutorials/001-pragmatic-cucumber/11-implementing-update-resource.md %})

