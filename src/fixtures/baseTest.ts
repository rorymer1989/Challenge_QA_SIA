import { test as base, expect, Page, BrowserContext, Locator } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ContentPage } from '../pages/ContentPage';
import { config } from '../config/env';
import * as fs from 'fs';
// // import * as path from 'path'; // Removed as unused // Removed as unused

// Re-export Playwright types and utilities for use in test files
export { Page, BrowserContext, Locator, expect };

/**
 * Base Test Fixture
 * 
 * Extends Playwright's test fixture with custom page objects and utilities.
 * Provides authenticated sessions and common test setup/teardown functionality.
 */

// Define custom fixture types
export interface TestFixtures {
  loginPage: LoginPage;
  contentPage: ContentPage;
  authenticatedPage: Page;
  authenticatedContext: BrowserContext;
}

// Extend base test with custom fixtures
export const test = base.extend<TestFixtures>({
  // Page objects
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  contentPage: async ({ page }, use) => {
    const contentPage = new ContentPage(page);
    await use(contentPage);
  },

  // Authenticated context and page
  authenticatedContext: async ({ browser }, use) => {
    // Create new context with realistic viewport
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    });

    // Create page in context
    const page = await context.newPage();

    // Perform login
    const loginPage = new LoginPage(page);
    await loginPage.goToLoginPage();
    await loginPage.loginWithEnvCredentials();

    // Verify login successful
    const isLoginSuccessful = await loginPage.isLoginSuccessful();
    if (!isLoginSuccessful) {
      throw new Error('Login failed during authenticated context setup');
    }

    // Use authenticated context
    await use(context);

    // Cleanup
    await context.close();
  },

  authenticatedPage: async ({ authenticatedContext }, use) => {
    // Create new page from authenticated context
    const page = await authenticatedContext.newPage();
    await use(page);
    await page.close();
  }
});

/**
 * Custom expect with timeout configuration
 */
export const expectWithTimeout = {
  toBeVisible: async (locator: Locator, timeout?: number) => {
    return expect(locator).toBeVisible({ timeout: timeout || config.actionTimeout });
  },

  toBeHidden: async (locator: Locator, timeout?: number) => {
    return expect(locator).toBeHidden({ timeout: timeout || config.actionTimeout });
  },

  toHaveText: async (locator: Locator, text: string | RegExp | (string | RegExp)[], timeout?: number) => {
    return expect(locator).toHaveText(text, { timeout: timeout || config.actionTimeout });
  },

  toContainText: async (locator: Locator, text: string | RegExp | (string | RegExp)[], timeout?: number) => {
    return expect(locator).toContainText(text, { timeout: timeout || config.actionTimeout });
  },

  toBeEnabled: async (locator: Locator, timeout?: number) => {
    return expect(locator).toBeEnabled({ timeout: timeout || config.actionTimeout });
  },

  toBeDisabled: async (locator: Locator, timeout?: number) => {
    return expect(locator).toBeDisabled({ timeout: timeout || config.actionTimeout });
  }
};

/**
 * Test utilities
 */
export class TestUtils {
  /**
   * Wait for page load with custom timeout
   */
  static async waitForPageLoad(page: Page, timeout?: number): Promise<void> {
    await page.waitForLoadState('load', { timeout: timeout || config.navigationTimeout });
  }

  /**
   * Take screenshot with timestamp
   */
  static async takeScreenshot(page: Page, testName: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await page.screenshot({
      path: `${config.screenshotsPath}/${testName}-${timestamp}.png`,
      fullPage: true
    });
  }

  /**
   * Generate random test data
   */
  static generateRandomString(length: number = 10): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generate random folder name
   */
  static generateRandomFolderName(): string {
    return `TEST_FOLDER_${this.generateRandomString(8)}`;
  }

  /**
   * Generate random content name
   */
  static generateRandomContentName(): string {
    return `TEST_CONTENT_${this.generateRandomString(8)}`;
  }

  /**
   * Wait for file upload to complete
   */
  static async waitForUpload(contentPage: ContentPage, timeout?: number): Promise<void> {
    const startTime = Date.now();
    const maxWait = timeout || config.testTimeout;

    while (Date.now() - startTime < maxWait) {
      try {
        await contentPage.waitForUploadComplete();
        return;
      } catch (error) {
        // Upload still in progress, wait and retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    throw new Error(`Upload did not complete within ${maxWait}ms`);
  }

  /**
   * Clean up test data (folders, files)
   */
  static async cleanupTestData(contentPage: ContentPage, folderName: string): Promise<void> {
    try {
      if (await contentPage.contentItemExists(folderName)) {
        await contentPage.selectContentItem(folderName);
        await contentPage.deleteSelectedContent();
      }
    } catch (error) {
      console.warn(`Failed to cleanup test data: ${folderName}`, error);
    }
  }

  /**
   * Verify element accessibility
   */
  static async verifyAccessibility(page: Page): Promise<void> {
    // Basic accessibility checks
    const focusableElements = await page.locator('button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])').count();
    expect(focusableElements).toBeGreaterThan(0);
  }

  /**
   * Get test file path
   */
  static getTestFilePath(fileName: string): string {
    return `${config.testFilesPath}/${fileName}`;
  }

  /**
   * Create test directories if they don't exist
   */
  static async ensureTestDirectories(): Promise<void> {
    const directories = [config.screenshotsPath, config.downloadsPath, config.testFilesPath];

    for (const dir of directories) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  }
}

/**
 * Export test annotations
 */
export const annotations = {
  smoke: { tag: '@smoke' },
  regression: { tag: '@regression' },
  critical: { tag: '@critical' },
  high: { tag: '@high' },
  medium: { tag: '@medium' },
  low: { tag: '@low' },
  content: { tag: '@content' },
  upload: { tag: '@upload' },
  download: { tag: '@download' },
  folder: { tag: '@folder' },
  player: { tag: '@player' },
  compatibility: { tag: '@compatibility' }
};

/**
 * Export commonly used test data
 */
export const testData = {
  validUrls: [
    'https://www.example.com',
    'https://www.google.com',
    'https://www.github.com'
  ],
  invalidUrls: [
    'not-a-url',
    'ftp://invalid-protocol.com',
    ''
  ],
  fileTypes: {
    image: ['jpg', 'png', 'gif', 'bmp'],
    video: ['mp4', 'avi', 'mov', 'wmv'],
    document: ['pdf', 'doc', 'docx', 'txt'],
    template: ['html', 'htm']
  }
};

/**
 * Export default test for use in test files
 */
export default test;
