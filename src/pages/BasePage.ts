import { Page, Locator } from '@playwright/test';

/**
 * Modelo de Objeto de Página Base (Base POM)
 * 
 * Proporciona funcionalidad común para todos los objetos de página para evitar la duplicación de código.
 * Incluye navegación básica, interacción con elementos y utilidades de espera.
 */
export class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navegar a una URL específica
   * @param path - La ruta a navegar (relativa a baseURL)
   */
  async navigate(path: string = ''): Promise<void> {
    await this.page.goto(path);
  }

  /**
   * Hacer clic en un elemento con espera automática
   * @param locator - El localizador del elemento a hacer clic
   */
  async click(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    await locator.click();
  }

  /**
   * Completar texto en un campo de entrada
   * @param locator - El localizador del campo de entrada
   * @param value - El texto a completar
   */
  async fill(locator: Locator, value: string): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    await locator.fill(value);
  }

  /**
   * Esperar a que un elemento sea visible
   * @param locator - El localizador del elemento
   * @param timeout - Tiempo de espera opcional en milisegundos
   */
  async waitForVisible(locator: Locator, timeout?: number): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Esperar a que un elemento esté oculto
   * @param locator - El localizador del elemento
   * @param timeout - Tiempo de espera opcional en milisegundos
   */
  async waitForHidden(locator: Locator, timeout?: number): Promise<void> {
    await locator.waitFor({ state: 'hidden', timeout });
  }

  /**
   * Obtener el contenido de texto de un elemento
   * @param locator - El localizador del elemento
   * @returns El contenido de texto
   */
  async getText(locator: Locator): Promise<string> {
    await locator.waitFor({ state: 'visible' });
    return await locator.textContent() || '';
  }

  /**
   * Verificar si un elemento es visible
   * @param locator - El localizador del elemento
   * @returns True si es visible, false en caso contrario
   */
  async isVisible(locator: Locator): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Seleccionar una opción de un menú desplegable (dropdown)
   * @param locator - El localizador del elemento select
   * @param value - El valor a seleccionar
   */
  async selectOption(locator: Locator, value: string): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    await locator.selectOption(value);
  }

  /**
   * Pasar el mouse (hover) sobre un elemento
   * @param locator - El localizador del elemento
   */
  async hover(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    await locator.hover();
  }

  /**
   * Presionar una tecla en el teclado
   * @param key - La tecla a presionar
   */
  async press(key: string): Promise<void> {
    await this.page.keyboard.press(key);
  }

  /**
   * Tomar una captura de pantalla para depuración
   * @param name - Nombre de la captura de pantalla
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `screenshots/${name}.png` });
  }

  /**
   * Obtener la URL de la página actual
   * @returns La URL actual
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Desplazarse hasta el final de la página
   */
  async scrollToBottom(): Promise<void> {
    await this.page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
  }

  /**
   * Aceptar una alerta/diálogo
   */
  async acceptAlert(): Promise<void> {
    this.page.on('dialog', async dialog => {
      await dialog.accept();
    });
  }

  /**
   * Rechazar una alerta/diálogo
   */
  async dismissAlert(): Promise<void> {
    this.page.on('dialog', async dialog => {
      await dialog.dismiss();
    });
  }
}
