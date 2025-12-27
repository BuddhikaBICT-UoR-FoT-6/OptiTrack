import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

/**
 * OptiTrack Selenium Automation Suite
 * Purpose: Automated verification of the high-fidelity fleet dashboard.
 */
public class SeleniumTest {
    public static void main(String[] args) {
        // 1. Setup Chrome Driver (Ensure chromedriver is in your PATH)
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--start-maximized");
        WebDriver driver = new ChromeDriver(options);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

        try {
            // 2. Navigate to OptiTrack Login
            System.out.println("🚀 Starting Selenium Test: Navigating to OptiTrack...");
            driver.get("http://localhost:3000/login");

            // 3. Perform Login
            WebElement usernameField = driver.findElement(By.placeholderText("Username"));
            WebElement passwordField = driver.findElement(By.placeholderText("Password"));
            WebElement loginButton = driver.findElement(By.className("ot-btn-primary"));

            usernameField.sendKeys("admin");
            passwordField.sendKeys("admin123");
            loginButton.click();
            System.out.println("🔑 Login submitted...");

            // 4. Verify Dashboard Redirect
            wait.until(ExpectedConditions.urlContains("/dashboard"));
            System.out.println("✅ Successfully reached the Dashboard!");

            // 5. Navigate to Tracking Map
            driver.get("http://localhost:3000/tracking");
            wait.until(ExpectedConditions.presenceOfElementLocated(By.className("leaflet-container")));
            System.out.println("✅ Live Tracking Map Loaded Successfully!");

            // 6. Verify AI Safety Scorecards
            driver.get("http://localhost:3000/safety");
            wait.until(ExpectedConditions.presenceOfElementLocated(By.className("ot-card")));
            System.out.println("✅ AI Safety Hub and Scorecards Verified!");

        } catch (Exception e) {
            System.err.println("❌ Test Failed: " + e.getMessage());
        } finally {
            // 7. Cleanup
            System.out.println("🏁 Automation Suite Complete. Closing browser...");
            driver.quit();
        }
    }
}
