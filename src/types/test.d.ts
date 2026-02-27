import { Page } from '@playwright/test';

declare global {
  namespace PlaywrightTest {
    interface TestArgs {
      page: Page;
    }
  }
}

export {};
