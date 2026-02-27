import { FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

/**
 * Global Setup
 *
 * Runs once before the entire test suite.
 * Validates environment configuration and prepares required directories.
 */
async function globalSetup(_config: FullConfig): Promise<void> {
    // Load environment variables
    dotenv.config();

    // Validate required environment variables are present
    const required = ['BASE_URL', 'USER_EMAIL', 'USER_PASSWORD'];
    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        throw new Error(
            `Global setup failed — missing required environment variables: ${missing.join(', ')}.\n` +
            `Copy .env.example to .env and fill in the values.`
        );
    }

    console.log(`\n[Global Setup] BASE_URL: ${process.env.BASE_URL}`);

    // Create required directories if they don't exist
    const directories = [
        process.env.TEST_FILES_PATH || './test-files',
        process.env.SCREENSHOTS_PATH || './screenshots',
        process.env.DOWNLOADS_PATH || './downloads',
    ];

    for (const dir of directories) {
        const resolved = path.resolve(dir);
        if (!fs.existsSync(resolved)) {
            fs.mkdirSync(resolved, { recursive: true });
            console.log(`[Global Setup] Created directory: ${resolved}`);
        }
    }

    // Perform Login and Save Global Storage State
    const { chromium } = require('@playwright/test');
    const browser = await chromium.launch();
    const page = await browser.newPage();

    try {
        console.log('[Global Setup] Authenticating...');
        await page.goto(process.env.BASE_URL!);

        // Use selectors directly or via a temporary LoginPage instance if needed
        // Given we want to keep it simple in global setup:
        await page.getByRole('textbox', { name: 'User' }).fill(process.env.USER_EMAIL!);
        await page.getByRole('textbox', { name: 'Password' }).fill(process.env.USER_PASSWORD!);
        await page.getByRole('button', { name: 'Login' }).click();

        // Wait for redirection to dashboard to ensure login completeness
        await page.waitForURL(/.*dashboard/, { timeout: 30000 });

        // Save storage state
        await page.context().storageState({ path: 'auth/storageState.json' });
        console.log('[Global Setup] Authentication successful. Storage state saved to auth/storageState.json.');
    } catch (error) {
        console.error('[Global Setup] Authentication failed:', error);
        throw error;
    } finally {
        await browser.close();
    }

    console.log('[Global Setup] Environment validated. Ready to run tests.\n');
}

export default globalSetup;
