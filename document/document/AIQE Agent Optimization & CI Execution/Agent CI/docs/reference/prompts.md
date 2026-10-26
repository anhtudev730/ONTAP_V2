# Playwright MCP Test Prompts (OrangeHRM)

## Purpose

This document contains practical test scenarios used as prompts for the
Playwright MCP Test Generator Agent.

The Agent must follow:

-   MCP-first execution.
-   Inspect real UI before generating code.
-   Use verified elements from DOM / Accessibility Tree.
-   Generate maintainable Playwright tests.

------------------------------------------------------------------------

# Prompt 1: Login Functionality

Generate a Playwright test for the following scenario:

1.  Navigate to OrangeHRM login page.

2.  Enter username:

```{=html}
<!-- -->
```
    Admin

3.  Enter password:

```{=html}
<!-- -->
```
    admin123

4.  Click Login button.

5.  Verify Dashboard page is displayed.

------------------------------------------------------------------------

# Prompt 2: Logout Functionality

Generate a Playwright test for logout.

Steps:

1.  Login with Admin account.
2.  Click user profile icon.
3.  Click Logout.
4.  Verify login page is displayed.
5.  Verify Username field exists.

------------------------------------------------------------------------

# Prompt 3: Search Employee (PIM Module)

Generate a Playwright test:

1.  Login to OrangeHRM.
2.  Navigate to PIM module.
3.  Open Employee List.
4.  Search employee.
5.  Click Search.
6.  Verify search result.

------------------------------------------------------------------------

# Prompt 4: Verify Admin Module Access

Generate a Playwright test:

1.  Login as Admin.
2.  Navigate to Admin module.
3.  Verify System Users section.
4.  Verify Add button is visible.

------------------------------------------------------------------------

# Prompt 5: Add New Employee

Generate a Playwright test:

1.  Login to OrangeHRM.
2.  Navigate to PIM.
3.  Click Add Employee.
4.  Enter:

First Name:

    John123

Last Name:

    Doe456

5.  Click Save.
6.  Verify employee profile page.
7.  Verify employee name is displayed.

------------------------------------------------------------------------

# Prompt 6: Buzz Module Post

Generate a Playwright test:

1.  Login to OrangeHRM.
2.  Navigate to Buzz module.
3.  Verify Latest Posts section.
4.  Verify posts are displayed.

------------------------------------------------------------------------

# Prompt 7: Login Functionality (Data Driven using External CSV File)

## Scenario

Generate a Playwright test in TypeScript using `@playwright/test` that
performs data-driven testing with CSV file.

Use:

    csv-parse

package for CSV parsing.

Application:

    https://opensource-demo.orangehrmlive.com

------------------------------------------------------------------------

## Requirements

### 1. Read Test Data From External CSV

Read test data from:

    test_data/loginData.csv

CSV columns:

    Username, Password, Expected

Example data:

``` csv
Username,Password,Expected
Admin,admin123,Dashboard
fakeuser,fakepass,Invalid credentials
ESSUser1,ess123,Invalid credentials
```

------------------------------------------------------------------------

### 2. Execute Test For Each Dataset Row

For each CSV record:

1.  Navigate to OrangeHRM login page.

2.  Enter username from CSV.

3.  Enter password from CSV.

4.  Click Login button.

5.  Verify expected result.

------------------------------------------------------------------------

## Validation Rules

### Successful Login

When:

    Expected = Dashboard

Verify:

-   Dashboard page is displayed.
-   User successfully reaches dashboard.

------------------------------------------------------------------------

### Invalid Login

When:

    Expected = Invalid credentials

Verify:

-   Error message "Invalid credentials" is displayed.

------------------------------------------------------------------------

## 3. Data Iteration

Implement automatic iteration:

-   All CSV rows must be executed.
-   All datasets run within one test suite.

Example:

    CSV Row 1 -> Login Success Test
    CSV Row 2 -> Invalid Login Test
    CSV Row 3 -> Invalid Login Test

------------------------------------------------------------------------

## 4. Test Reporting

Log pass/fail result for each dataset entry.

Example output:

    Admin/admin123
    Result: PASS

    fakeuser/fakepass
    Result: PASS

------------------------------------------------------------------------

## 5. Browser Management

Ensure:

-   Browser closes after all tests complete.
-   Test execution is clean.

------------------------------------------------------------------------

# MCP Execution Requirements

Before generating Playwright code:

1.  Inspect application using MCP.
2.  Verify login page elements.
3.  Verify username field.
4.  Verify password field.
5.  Verify Login button.
6.  Verify dashboard and error message behavior.

Do not guess selectors.

------------------------------------------------------------------------

# Prompt Template

    Generate a Playwright test for the following scenario:

    [Describe user flow]

    Requirements:

    1. Use MCP-first execution.
    2. Inspect application before generating selectors.
    3. Do not assume DOM structure.
    4. Use verified UI elements only.
    5. Generate production-ready Playwright code.
