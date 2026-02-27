import { Page, Locator, expect } from '@playwright/test';
import { config } from '../config/env';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Funciones de Ayuda (Helpers) de Utilidad
 * 
 * Funciones de utilidad comunes utilizadas en toda la suite de pruebas.
 * Incluye operaciones de archivos, generación de datos, ayuda de validación y más.
 */

/**
 * Operaciones de Archivos y Directorios
 */
export class FileHelper {
  /**
   * Asegurar que el directorio exista
   */
  static ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  /**
   * Crear archivo de prueba si no existe
   */
  static createTestFile(filePath: string, content: string = 'Contenido de prueba'): void {
    const dir = path.dirname(filePath);
    this.ensureDirectoryExists(dir);

    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, content);
    }
  }

  /**
   * Obtener el tamaño del archivo en bytes
   */
  static getFileSize(filePath: string): number {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      return stats.size;
    }
    return 0;
  }
}

/**
 * Utilidades de Generación de Datos
 */
export class DataGenerator {
  /**
   * Generar cadena aleatoria
   */
  static randomString(length: number = 10, charset?: string): string {
    const chars = charset || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generar número aleatorio
   */
  static randomNumber(min: number = 0, max: number = 100): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Generar correo electrónico aleatorio
   */
  static randomEmail(): string {
    const domains = ['test.com', 'example.com', 'demo.org', 'sample.net'];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    return `${this.randomString(8).toLowerCase()}@${domain}`;
  }

  /**
   * Generar número de teléfono aleatorio
   */
  static randomPhoneNumber(): string {
    return `+1${this.randomNumber(10)}`;
  }

  /**
   * Generar fecha aleatoria
   */
  static randomDate(start?: Date, end?: Date): Date {
    const startDate = start || new Date(2020, 0, 1);
    const endDate = end || new Date();
    const date = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
    return date;
  }

  /**
   * Generar URL aleatoria
   */
  static randomUrl(): string {
    const protocols = ['http', 'https'];
    const domains = ['example.com', 'test.org', 'demo.net'];
    const paths = ['', '/page', '/api/v1', '/content', '/dashboard'];

    const protocol = protocols[Math.floor(Math.random() * protocols.length)];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const path = paths[Math.floor(Math.random() * paths.length)];

    return `${protocol}://${domain}${path}`;
  }

  /**
   * Generar un nombre de carpeta de prueba profesional
   * Cumple con las reglas de nomenclatura de DEX Manager (excluye \ / : * ? " < > |)
   */
  static generateFolderName(prefix: string = 'CONTENIDO DEX MANAGER'): string {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-mm-ss
    const randomSuffix = this.randomString(4).toUpperCase();

    // Se usa espacio-guion-espacio como separador seguro
    return `${prefix} - ${dateStr} ${timeStr} - ${randomSuffix}`;
  }

  /**
   * Generar un nombre de contenido de prueba profesional
   */
  static generateContentName(type: string = 'CONTENIDO'): string {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    const randomSuffix = this.randomString(4).toUpperCase();

    return `${type} - ${dateStr} ${timeStr} - ${randomSuffix}`;
  }
}

/**
 * Utilidades de Validación
 */
export class ValidationHelper {
  /**
   * Validar formato de URL
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validar formato de correo electrónico
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validar extensión de archivo
   */
  static isValidFileType(fileName: string, allowedTypes: string[]): boolean {
    const extension = path.extname(fileName).toLowerCase().slice(1);
    return allowedTypes.includes(extension);
  }

  /**
   * Validar tamaño de archivo
   */
  static isValidFileSize(filePath: string, maxSizeMB: number): boolean {
    const fileSize = FileHelper.getFileSize(filePath);
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return fileSize <= maxSizeBytes;
  }

  /**
   * Verificar si la cadena contiene solo caracteres permitidos
   */
  static hasValidCharacters(input: string, allowedChars: string): boolean {
    const regex = new RegExp(`^[${allowedChars}]*$`);
    return regex.test(input);
  }

  /**
   * Validar longitud de cadena
   */
  static isValidLength(input: string, minLength: number, maxLength: number): boolean {
    return input.length >= minLength && input.length <= maxLength;
  }
}

/**
 * Utilidades de Espera
 */
export class WaitHelper {
  /**
   * Esperar elemento con tiempo de espera personalizado y lógica de reintento
   */
  static async waitForElement(
    page: Page,
    selector: string,
    options: { timeout?: number; visible?: boolean; state?: 'visible' | 'hidden' | 'attached' | 'detached' } = {}
  ): Promise<Locator> {
    const { timeout = config.actionTimeout, visible = true, state = 'visible' } = options;

    const locator = page.locator(selector);
    await locator.waitFor({ state, timeout });

    if (visible && state === 'visible') {
      await expect(locator).toBeVisible({ timeout });
    }

    return locator;
  }

  /**
   * Esperar a que se complete la navegación
   */
  static async waitForNavigation(page: Page, urlPattern?: string): Promise<void> {
    if (urlPattern) {
      await page.waitForURL(urlPattern, { timeout: config.navigationTimeout });
    } else {
      await page.waitForLoadState('load', { timeout: config.navigationTimeout });
    }
  }

  /**
   * Esperar a que se complete la carga de archivos
   */
  static async waitForUpload(
    page: Page,
    successSelector: string,
    timeout: number = config.testTimeout
  ): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        const successElement = page.locator(successSelector);
        if (await successElement.isVisible({ timeout: 5000 })) {
          return;
        }
      } catch {
        // El elemento aún no es visible, continuar esperando
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    throw new Error(`La carga no se completó en ${timeout}ms`);
  }

  /**
   * Esperar con retroceso exponencial (exponential backoff)
   */
  static async waitWithBackoff(
    condition: () => Promise<boolean>,
    maxAttempts: number = 10,
    baseDelay: number = 1000
  ): Promise<void> {
    let attempt = 0;

    while (attempt < maxAttempts) {
      if (await condition()) {
        return;
      }

      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
      attempt++;
    }

    throw new Error(`La condición no se cumplió después de ${maxAttempts} intentos`);
  }
}

/**
 * Utilidades de Captura de Pantalla y Depuración
 */
export class DebugHelper {
  /**
   * Tomar captura de pantalla con asignación automática de nombre
   */
  static async takeScreenshot(page: Page, testName: string, step?: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const stepSuffix = step ? `_${step}` : '';
    const fileName = `${testName}_${timestamp}${stepSuffix}.png`;
    const filePath = path.join(config.screenshotsPath, fileName);

    FileHelper.ensureDirectoryExists(config.screenshotsPath);
    await page.screenshot({ path: filePath, fullPage: true });

    return filePath;
  }

  /**
   * Capturar registros de la consola (console logs)
   */
  static async captureConsoleLogs(page: Page): Promise<string[]> {
    const logs: string[] = [];

    page.on('console', msg => {
      logs.push(`[${msg.type()}] ${msg.text()}`);
    });

    return logs;
  }

  /**
   * Capturar errores de red
   */
  static async captureNetworkErrors(page: Page): Promise<string[]> {
    const errors: string[] = [];

    page.on('response', response => {
      if (response.status() >= 400) {
        errors.push(`${response.status()} ${response.url()}`);
      }
    });

    return errors;
  }

  /**
   * Obtener métricas de rendimiento de la página
   */
  static async getPerformanceMetrics(page: Page): Promise<{
    domContentLoaded: number;
    loadComplete: number;
    firstPaint: number;
    firstContentfulPaint: number;
  }> {
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByType('paint')[1]?.startTime || 0
      };
    });

    return metrics;
  }
}

/**
 * Gestión de Datos de Prueba
 */
export class TestDataHelper {
  /**
   * Cargar datos de prueba desde un archivo JSON
   */
  static loadTestData<T>(filePath: string): T {
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      throw new Error(`Error al cargar los datos de prueba desde ${filePath}: ${error}`);
    }
  }

  /**
   * Guardar datos de prueba en un archivo JSON
   */
  static saveTestData<T>(data: T, filePath: string): void {
    try {
      const jsonData = JSON.stringify(data, null, 2);
      FileHelper.ensureDirectoryExists(path.dirname(filePath));
      fs.writeFileSync(filePath, jsonData);
    } catch (error) {
      throw new Error(`Error al guardar los datos de prueba en ${filePath}: ${error}`);
    }
  }

  /**
   * Obtener rutas de archivos de prueba
   */
  static getTestFiles(): { [key: string]: string } {
    return {
      image: path.join(config.testFilesPath, 'test-images.png'),
      image_1: path.join(config.testFilesPath, 'test_imagen_1.jpg'),
      image_2: path.join(config.testFilesPath, 'test_imagen_2.jpg'),
    };
  }

}


