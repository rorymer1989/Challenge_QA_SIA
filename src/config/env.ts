import dotenv from 'dotenv';

/**
 * Environment Configuration
 * 
 * Centralized configuration management for DEX Manager testing.
 * Loads environment variables and provides typed access to configuration values.
 */

// Load environment variables from .env file
dotenv.config();

/**
 * Configuration interface for type safety
 */
interface Config {
  // Base URLs
  baseUrl: string;

  // Authentication credentials
  userEmail: string;
  userPassword: string;

  // Test configuration
  testTimeout: number;
  actionTimeout: number;
  navigationTimeout: number;

  // File paths
  testFilesPath: string;
  screenshotsPath: string;
  downloadsPath: string;

  // Browser configuration
  headless: boolean;
  slowMo: number;

  // Reporting configuration
  reportPath: string;
  tracePath: string;

  // DEX Manager specific
  contentModulePath: string;
  playerModulePath: string;
}

/**
 * Default configuration values
 */
const defaultConfig: Partial<Config> = {
  testTimeout: 120000, // 2 minutes
  actionTimeout: 30000, // 30 seconds
  navigationTimeout: 60000, // 1 minute
  testFilesPath: './test-files',
  screenshotsPath: './screenshots',
  downloadsPath: './downloads',
  headless: true,
  slowMo: 0,
  reportPath: './playwright-report',
  tracePath: './trace',
  contentModulePath: '/content',
  playerModulePath: '/players'
};

/**
 * Validate required environment variables
 */
function validateEnvironment(): void {
  const required = ['BASE_URL', 'USER_EMAIL', 'USER_PASSWORD'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

/**
 * Get configuration value with fallback to default
 */
function getConfigValue(key: keyof Config, defaultValue?: string): string {
  const envKey = key.replace(/([A-Z])/g, '_$1').toUpperCase();
  const value = process.env[envKey] || defaultValue || defaultConfig[key] as string;

  if (!value && defaultValue === undefined) {
    throw new Error(`Configuration value for ${key} is missing`);
  }

  return value;
}

/**
 * Get numeric configuration value
 */
function getNumericConfigValue(key: keyof Config, defaultValue?: number): number {
  const envKey = key.replace(/([A-Z])/g, '_$1').toUpperCase();
  const value = process.env[envKey];

  if (value) {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      throw new Error(`Invalid numeric value for ${key}: ${value}`);
    }
    return parsed;
  }

  return defaultValue || defaultConfig[key] as number;
}

/**
 * Get boolean configuration value
 */
function getBooleanConfigValue(key: keyof Config, defaultValue?: boolean): boolean {
  const envKey = key.replace(/([A-Z])/g, '_$1').toUpperCase();
  const value = process.env[envKey];

  if (value !== undefined) {
    return value.toLowerCase() === 'true';
  }

  return defaultValue || defaultConfig[key] as boolean;
}

/**
 * Export configuration object
 */
export const config: Config = {
  baseUrl: getConfigValue('baseUrl'),
  userEmail: getConfigValue('userEmail'),
  userPassword: getConfigValue('userPassword'),
  testTimeout: getNumericConfigValue('testTimeout'),
  actionTimeout: getNumericConfigValue('actionTimeout'),
  navigationTimeout: getNumericConfigValue('navigationTimeout'),
  testFilesPath: getConfigValue('testFilesPath'),
  screenshotsPath: getConfigValue('screenshotsPath'),
  downloadsPath: getConfigValue('downloadsPath'),
  headless: getBooleanConfigValue('headless'),
  slowMo: getNumericConfigValue('slowMo'),
  reportPath: getConfigValue('reportPath'),
  tracePath: getConfigValue('tracePath'),
  contentModulePath: getConfigValue('contentModulePath'),
  playerModulePath: getConfigValue('playerModulePath')
};

/**
 * Validate environment on import
 */
try {
  validateEnvironment();
} catch (error) {
  console.error('Environment validation failed:', error);
  console.log('Please ensure .env file exists with required variables');
  process.exit(1);
}

/**
 * Export individual configuration values for convenience
 */
export const {
  baseUrl,
  userEmail,
  userPassword,
  testTimeout,
  actionTimeout,
  navigationTimeout,
  testFilesPath,
  screenshotsPath,
  downloadsPath,
  headless,
  slowMo,
  reportPath,
  tracePath,
  contentModulePath,
  playerModulePath
} = config;

/**
 * Helper function to get configuration for specific test environments
 */
export function getTestConfig(environment?: string): Config {
  if (environment && environment !== 'default') {
    // Load environment-specific configuration if needed
    const envSuffix = `_${environment.toUpperCase()}`;
    const envConfig = { ...config };

    // Override with environment-specific values
    Object.keys(config).forEach(key => {
      const envKey = `${key.toUpperCase()}${envSuffix}`;
      if (process.env[envKey]) {
        (envConfig as unknown as Record<string, string | number | boolean | undefined>)[key] = process.env[envKey];
      }
    });

    return envConfig;
  }

  return config;
}

/**
 * Export configuration validation function
 */
export { validateEnvironment };

/**
 * Export default configuration for testing
 */
export { defaultConfig };
