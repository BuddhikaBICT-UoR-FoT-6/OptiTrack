# 🧪 OptiTrack Selenium Testing Guide

This guide explains how to use **Selenium WebDriver** to perform automated end-to-end (E2E) testing on the OptiTrack command center.

## 🚀 Prerequisites

1.  **JDK 21:** Ensure you have Java installed.
2.  **Chrome Browser:** The tests are designed for Google Chrome.
3.  **ChromeDriver:** 
    *   Download the version matching your Chrome browser from [Chrome for Testing](https://googlechromelabs.github.io/chrome-for-testing/).
    *   Add `chromedriver.exe` to your system's PATH or place it in the root of the project.

## 🛠️ Project Setup

### Maven Dependencies
Add the following to a `pom.xml` if you are creating a dedicated testing module, or ensure these libraries are in your classpath:

```xml
<dependency>
    <groupId>org.seleniumhq.selenium</groupId>
    <artifactId>selenium-java</artifactId>
    <version>4.16.1</version>
</dependency>
```

## 🏃 Running the Tests

1.  **Start the Backend:**
    ```bash
    cd optitrack-backend
    ./mvnw spring-boot:run
    ```
2.  **Start the Frontend:**
    ```bash
    cd optitrack-frontend
    npm run dev
    ```
3.  **Execute the Test:**
    Run the `SeleniumTest.java` file from your IDE (IntelliJ/VS Code) or via the command line.

## 🔍 Key Test Scenarios Covered

*   **🔐 Authentication:** Verifies the secure login handshake and token-based redirection.
*   **🗺️ Map Integrity:** Confirms the `Leaflet` GIS engine initializes correctly in the Tracking Hub.
*   **📊 Data Presence:** Ensures that the AI Scorecards are successfully retrieved and rendered in the Safety Hub.

## 🛡️ Best Practices

*   **Implicit Waits:** Always use `WebDriverWait` to handle the dynamic React rendering.
*   **Headless Mode:** For CI/CD pipelines, enable `options.addArguments("--headless")` in `SeleniumTest.java`.
*   **Screenshots:** Use `((TakesScreenshot)driver).getScreenshotAs(OutputType.FILE)` for visual audit logs in case of failures.

---
*Elevate your fleet management with automated confidence.* 🛰️🚛✨
