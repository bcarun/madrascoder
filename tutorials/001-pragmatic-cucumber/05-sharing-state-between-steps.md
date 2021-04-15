---
layout: tutorial
chapter: 2
title: Applying Spreadsheet DataTable to Test a 'Create API' Use Case
description: >
  In this chapter let's apply 'Spreadsheet DataTable' pattern to test the API that is used to create a new employee in our HR Software. In this process, we will add necessary dependencies to create the Employee API, create feature file, step definitions and using RestAssured library, we will call the API from the step definitions to test 'Create Employee API'.

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

### Conclusion

There is a lot we have learnt so far. This chapter is the first step towards doing BDD in a real projects. Every minute you spend reading and trying the steps so far will definitely save a lots of hours for you and your team when you start implementing BDD in your team.

In this chapter, we had fields to save the state of Employee object, HTTP/REST Response etc., to used in subsequent step definition methods. This is a common problem. In future, we may have some common step definitions to check the success and failure, having state in the step definition will make it had to reuse step definition methods. Hence, in the next chapter let's learn on 2 ways to share state between step definition methods evening if the step definition methods are in 2 different classes.

<hr>

### References

For more information on `MapStruct` you may refer [https://mapstruct.org/](https://mapstruct.org/){:target="_blank"}

<hr>

### Credits

Photo by <a href="https://unsplash.com/@kylejglenn?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Kyle Glenn</a> on <a href="https://unsplash.com/s/photos/accomplishment?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
  
<hr>

[Previous Chapter]({% link tutorials/001-pragmatic-cucumber/04-implementing-create-resource.md %}) | 
[Scroll Up to Top]({% link tutorials/001-pragmatic-cucumber/05-sharing-state-between-steps.md %}) | 
[Table of Contents]({% link tutorials/001-pragmatic-cucumber/index.md %}) |
[Next Chapter]({% link tutorials/001-pragmatic-cucumber/05-sharing-state-between-steps.md %})

