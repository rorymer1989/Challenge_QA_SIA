import { FullConfig } from '@playwright/test';

/**
 * Global Teardown
 *
 * Runs once after the entire test suite completes.
 * Use this for any cleanup that must happen after all tests finish.
 */
async function globalTeardown(_config: FullConfig): Promise<void> {
    console.log('\n[Global Teardown] Test suite finished. Cleaning up.\n');

    // Add any post-suite cleanup here if needed:
    // - closing external connections
    // - archiving reports
    // - notifying CI systems
    // Currently no additional teardown is required.
}

export default globalTeardown;
