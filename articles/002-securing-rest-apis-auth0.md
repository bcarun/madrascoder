---
layout: article
title: Securing REST APIs Using OAuth 2.0 + Spring Security 5 + Auth 0
description: >
  Step by step instructions to secure REST API using OAuth 2.0 protocol + Spring Security 5 + Auth0 (Identity as a Service - Platform)
category: article
image: /assets/media/articles/002-securing-rest-apis-auth0/lock-securing-rest-auth0-title.jpg
tags:
  - Java
  - OAuth 2.0
  - Spring Security 5
  - Auth0
date: 2021-02-07
featured: true
---

In this article, we will do the following steps

1. **Auth0 Configuration to secure a REST API**
2. **Create a Spring Boot application with required dependencies**
3. **Create and Secure REST APIs**
4. **Test REST API with and without Security**

_In this article, words '**OAuth 2.0**' and '**Auth0**' is used a lot. **OAuth 2.0** is the protocol to secure REST API and **Auth0** is an Identity as a Service platform. Please make sure you don't get confused while reading._

<hr>

### Auth0 Configuration to Secure REST API

_If you want to follow along this article, you may need to signup for a free account at [Auth0](https://auth0.com/#!)._

**Login to Auth0** {{ site.right-arrow }} navigate to left hand side menu and select **API** {{ site.right-arrow }} and click **Create API** <sup>( 1 )</sup>

![Create API Security Configuration in Auth0](/assets/media/articles/002-securing-rest-apis-auth0/auth0-create-api-step-1.png)

Enter API **name** <sup>( 1 )</sup> and **identifier** <sup>( 2 )</sup> and click on **Create API** <sup>( 3 )</sup>

![New API Create Form in Auth0](/assets/media/articles/002-securing-rest-apis-auth0/auth0-create-api-step-2.png)

After successful API Configuration, select **Settings** <sup>( 1 )</sup>

![API Settings Page in Auth0](/assets/media/articles/002-securing-rest-apis-auth0/auth0-create-api-step-3.png)

In the **Settings**, select **Enable RBAC** <sup>( 1 )</sup>, **Allow Skipping User Consent** <sup>( 2 )</sup> and **Save** <sup>( 3 )</sup>

![API Settings Page in Auth0](/assets/media/articles/002-securing-rest-apis-auth0/auth0-create-api-step-4.png)

Select **Permissions** <sup>( 1 )</sup> {{ site.right-arrow }} and **Add** permissions <sup>( 2 )</sup> <sup>( 3 )</sup>

![API Settings Page in Auth0](/assets/media/articles/002-securing-rest-apis-auth0/auth0-create-api-step-6.png)


**Permission Name Convention**

```xml
<api-short-name>:<permission-type>:<resource-name>
```
**Note 1:** I recommended to prefix API short name before each permission name to avoid collition. In Auth0, multiple APIs permissions/scopes are consolidated under one claim in JWT.

**Note 2:** Do not have any space in permissions name. In Auth0 permissions and scope means the same. Each scope is separated by space in JWT 'scope claim', having a scope in permission name may not work as expected as each split will be considered as a separate scope.

<hr>

### Create a Spring Boot Web Application

You may use [Spring Initializr](https://start.spring.io/) or a maven project with below said dependencies <sup>( 1 )</sup> <sup>( 2 )</sup> to generate a Spring Boot application. We will use this application to configure security and test API.

![Spring Initializr](/assets/media/articles/002-securing-rest-apis-auth0/auth0-test-api-step-0.png)

Incase you just want the maven dependencies, here it is...

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-security</artifactId>
</dependency>
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
</dependency>
```

#### Get JWKS URI

Now that we have the Spring Boot Project, lets us configure OAuth 2.0 Resource Server's JWK Set URI

To get the JWK Set URI, you may use the following URL and look for <code>jwks_uri</code> key in response.

<code>https://{oauth-provider-hostname}/.well-known/openid-configuration</code>

In my case the URL is,  (DO NOT USE THIS)
<code>https://bcarun.auth0.com/.well-known/openid-configuration</code>

**Alternate way is,**  
Select **Quickstart** <sup>( 1 )</sup>, **Node.js** <sup>( 2 )</sup> and Copy **jwksUri** <sup>( 3 )</sup>

![Find jwks uri in Auth0](/assets/media/articles/002-securing-rest-apis-auth0/auth0-create-api-step-5.png)

**Note:** You may copy **your** Auth0 API Configuration's JWKS URI and set it in **application.properties** as stated below

application.properties

```properties
# Remember to use your APIs jwk set uri
spring.security.oauth2.resourceserver.jwt.jwk-set-uri=https://bcarun.auth0.com/.well-known/jwks.json
```

<hr>

### Create and Secure REST APIs

Configure Web Security using WebSecurityConfigurerAdapter.java

OAuth2SecurityConfigurer.java

```java
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;

@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class OAuth2SecurityConfigurer extends WebSecurityConfigurerAdapter {

  @Override
  public void configure(final HttpSecurity http) throws Exception {

    //@formatter:off
    http.sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
        .and()
          .headers().frameOptions().disable()
        .and()
          .csrf().disable()
          .authorizeRequests()
          .antMatchers("/actuator/health") // Health URI
          .permitAll() // Permitted without security
        .and()
          .authorizeRequests()
          .anyRequest() // Any other URI
          .authenticated() // Any other URIs are secured
        .and()
          .oauth2ResourceServer() // App is secured using OAuth 2.0 Protocol (Resource Server)
          .jwt(); // App uses JWT (Json Web Token)
    //@formatter:on
  }
}
```

#### Create REST API and Secure it Using the Permissions Configured in Auth0

Employee.java

```java
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.Accessors;

@Getter
@Setter
@Accessors(chain = true)
@ToString
public class Employee {

  private Long id;
  private String firstName;
  private String lastName;
  private LocalDate joiningDate;

}
```

EmployeeService.java

```java
import java.time.LocalDate;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class EmployeeService {

  public Long create(Employee employee) {
    log.info("Save new employee {}", employee);
    return 1L; // Test Purpose
  }

  public Employee getById(Long id) {

    // Test Purpose
    return new Employee().setId(1L)
        .setFirstName("Joseph")
        .setLastName("Alex")
        .setJoiningDate(LocalDate.now());
  }
}
```

EmployeeRestApi.java

```java
import java.net.URI;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@Slf4j
@RestController
@RequestMapping(path = "/v1/employees")
public class EmployeeRestApi {

  private final EmployeeService employeeService;

  public EmployeeRestApi(EmployeeService employeeService) {
    this.employeeService = employeeService;
  }

  @PostMapping
  @PreAuthorize("hasAuthority('SCOPE_mcapi:create:employee')")
  public ResponseEntity<Void> createEmployee(@RequestBody Employee employee) {
    SecurityContextHolder.getContext();
    Long id = employeeService.create(employee);
    final URI uri = ServletUriComponentsBuilder.fromCurrentRequest()
        .path("/{id}")
        .buildAndExpand(id)
        .toUri();

    return ResponseEntity.created(uri)
        .build();
  }

  @GetMapping(path = "/{id}")
  @PreAuthorize("hasAuthority('SCOPE_mcapi:read:employee')")
  public ResponseEntity<Employee> getEmployeeById(@PathVariable("id") Long id) {
    Employee employee = employeeService.getById(id);
    return ResponseEntity.ok(employee);
  }
}
```

**Note 1:** <code>@PreAuthorize("hasAuthority('SCOPE_mcapi:create:employee')")</code> annotation allows the call only if the token contains scope 'mcapi:create:employee'.

**Note 2:** <code>SCOPE</code> prefix is automatically set by Spring Security for all the values in JWT Scope claim.

#### Project Structure

```shell
➜  secure-rest-api tree
├── pom.xml
├── src
│   ├── main
│   │   ├── java
│   │   │   └── com
│   │   │       └── madrascoder
│   │   │           └── securerestapi
│   │   │               ├── Employee.java
│   │   │               ├── EmployeeRestApi.java
│   │   │               ├── EmployeeService.java
│   │   │               ├── OAuth2SecurityConfigurer.java
│   │   │               └── Startup.java
│   │   └── resources
│   │       ├── application.properties
│   └── test
│       └── java
|
```

<hr>

### Test REST API

#### Test without 'Authorization: Bearer {token}' HTTP Header

HTTP REQUEST

```shell
➜  ~ curl -i --request GET 'http://localhost:8080/v1/employees'
```

HTTP RESPONSE (FAILURE)

```shell
HTTP/1.1 401
WWW-Authenticate: Bearer
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Cache-Control: no-cache, no-store, max-age=0, must-revalidate
Pragma: no-cache
Expires: 0
Content-Length: 0
Date: Sun, 07 Feb 2021 03:32:30 GMT
```
<hr>

#### Test with 'Authorization: Bearer {token} HTTP Header and the Token Contains required Scope/Permission

**Permissions Setup Required Before Testing**

Navigate to **API** {{ site.right-arrow }} **madras-coder-application(Test Application)** to grant permissions to call madras-coder-api.

![Navigate to test application](/assets/media/articles/002-securing-rest-apis-auth0/auth0-create-api-step-7.png)

**Grant Permissions to Test Application**

![Navigate to test application API](/assets/media/articles/002-securing-rest-apis-auth0/auth0-create-api-step-8.png)

**Note:** In Auth0 **madras-coder-api** is API and **madras-coder-application(Test Application)** is the client app that will get the JWT token to call the API.

<hr>

**GET TOKEN**

Navigate to **API** <sup>( 1 )</sup> {{ site.right-arrow }} madras-coder-api {{ site.right-arrow }} **Test** tab <sup>( 2 )</sup> {{ site.right-arrow }} **cURL** {{ site.right-arrow }} **madras-coder-api(Test Application)** {{ site.right-arrow }} Response {{ site.right-arrow }} **Copy Token** <sup>( 3 )</sup>

For every API configuration created in Auth0, a API Test Client application is created by default. Using the test application we can get the JWT Token.

![Get JWT Token for testing](/assets/media/articles/002-securing-rest-apis-auth0/spring-test-api-step-1.png)

**Alternate way is,** get the caller application client_id, client_secret and API audience/identifer, replace them in below curl request and try executing the curl command. Get the access_token value from response and use it as value of Bearer token.

TOKEN REQUEST

```shell
curl --request POST \
  --url REPLACE-WITH-AUTH0-ISSUER-URL \
  --header 'content-type: application/json' \
  --data '{"client_id":"REPLACE-WITH-TEST-APPLICATION-CLIENT-ID","client_secret":"REPLACE-WITH-TEST-APPLICATION-CLIENT-SECRET","audience":"REPLACE-WITH-API-IDENTIFER","grant_type":"client_credentials"}'
```

TOKEN RESPONSE

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlFVSTNNamc1TVVGQk1FRTVOelk1UWtaRE16UXlNa1F4UVVJMVJqVTRSVFl4UmpJNE5EUTJSZyJ9.eyJpc3MiOiJodHRwczovL2JjYXJ1bi5hdXRoMC5jb20vIiwic3ViIjoiMlVlWWFqUDFpMjBLYk5hWTBqZ0Z6NERwYmtBM21mSlVAY2xpZW50cyIsImF1ZCI6Imh0dHBzOi8vd3d3Lm1hZHJhc2Vjb2Rlci5jb20vYXBpIiwiaWF0IjoxNjEyNjgyNTEzLCJleHAiOjE2MTI3Njg5MTMsImF6cCI6IjJVZVlhalAxaTIwS2JOYVkwamdGejREcGJrQTNtZkpVIiwic2NvcGUiOiJtY2FwaTpjcmVhdGU6ZW1wbG95ZWUgbWNhcGk6cmVhZDplbXBsb3llZSIsImd0eSI6ImNsaWVudC1jcmVkZW50aWFscyJ9.qFOPXNiMeTn4_NK5TMAroHq-Xs7bUMxrYf0RgignEAGX2c_96LQHNFoQrt6uCvVSWP2DhL4HS_BwexDdJ751IDJSMriAGUDkYzyXkRd5ebXgzs1BIG_S8iUw9hk1aOmUd9nxIRVDPWAA14KFwaPsv6uwIDJ4g4lRe0Wnb9GtikMerx_Z4ySWfHL9F8uSUTW3Q7wb-F1s-qnSZxNYPrPdlOKgQEsrzSTUO5Z74YyYlANR3J0NfdFef1XwfGhftxsWAazDMGDej3gYf9Zlx5GBxIExOWR8QET0_lXJjXLRnNgHnBa2KNFP1Ef-DlFcAs8MzP9HO3iCrlGH7cy3UJCrTg",
  "token_type": "Bearer"
}
```

Get the access_token value from response and use it as value for Bearer token for below request.

**Test with Authorization Header having Access Token (Bearer Token)**

HTTP REQUEST

```shell
➜  ~ curl -i --request POST 'http://localhost:8080/v1/employees' \
--header 'Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlFVSTNNamc1TVVGQk1FRTVOelk1UWtaRE16UXlNa1F4UVVJMVJqVTRSVFl4UmpJNE5EUTJSZyJ9.eyJpc3MiOiJodHRwczovL2JjYXJ1bi5hdXRoMC5jb20vIiwic3ViIjoiMlVlWWFqUDFpMjBLYk5hWTBqZ0Z6NERwYmtBM21mSlVAY2xpZW50cyIsImF1ZCI6Imh0dHBzOi8vd3d3Lm1hZHJhc2Vjb2Rlci5jb20vYXBpIiwiaWF0IjoxNjEyNjgyNTEzLCJleHAiOjE2MTI3Njg5MTMsImF6cCI6IjJVZVlhalAxaTIwS2JOYVkwamdGejREcGJrQTNtZkpVIiwic2NvcGUiOiJtY2FwaTpjcmVhdGU6ZW1wbG95ZWUgbWNhcGk6cmVhZDplbXBsb3llZSIsImd0eSI6ImNsaWVudC1jcmVkZW50aWFscyJ9.qFOPXNiMeTn4_NK5TMAroHq-Xs7bUMxrYf0RgignEAGX2c_96LQHNFoQrt6uCvVSWP2DhL4HS_BwexDdJ751IDJSMriAGUDkYzyXkRd5ebXgzs1BIG_S8iUw9hk1aOmUd9nxIRVDPWAA14KFwaPsv6uwIDJ4g4lRe0Wnb9GtikMerx_Z4ySWfHL9F8uSUTW3Q7wb-F1s-qnSZxNYPrPdlOKgQEsrzSTUO5Z74YyYlANR3J0NfdFef1XwfGhftxsWAazDMGDej3gYf9Zlx5GBxIExOWR8QET0_lXJjXLRnNgHnBa2KNFP1Ef-DlFcAs8MzP9HO3iCrlGH7cy3UJCrTg' \
--header 'Content-Type: application/json' \
--data-raw '{
    "firstName" : "Joseph",
    "lastName": "Alex",
    "joiningDate" : "2021-01-01"
}'
```

HTTP RESPONSE (SUCCESS)

```shell
HTTP/1.1 201
Location: http://localhost:8080/v1/employees/1
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Cache-Control: no-cache, no-store, max-age=0, must-revalidate
Pragma: no-cache
Expires: 0
Content-Length: 0
Date: Sun, 07 Feb 2021 07:32:40 GMT
```

<hr>
**Appendix**  
**To inspect the JWT/access_token,** you may copy paste <sup>( 1 )</sup> the token value in JWT.io and look at the contents <sup>( 2 )</sup>. This is very helpful in troubleshooting.

![JWT Token inspection](/assets/media/articles/002-securing-rest-apis-auth0/spring-test-api-step-2.png)

<hr>

### References & Further Reading

[OAuth 2.0](https://oauth.net/2/)

[JWT](https://jwt.io/)

[Spring Security OAuth 2.0 Resource Server](https://docs.spring.io/spring-security/site/docs/5.4.2/reference/html5/#oauth2resourceserver)
