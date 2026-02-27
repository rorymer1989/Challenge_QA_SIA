import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Modelo de Objeto de Página (POM) para Login
 * 
 * Encapsula toda la funcionalidad relacionada con el inicio de sesión para la autenticación en DEX Manager.
 * Utiliza selectores estables y proporciona métodos de nivel de negocio para las operaciones de login.
 */
export class LoginPage extends BasePage {
  // Selectores que utilizan los selectores estables recomendados por Playwright
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorMessage: Locator;
  private readonly loginForm: Locator;

  constructor(page: Page) {
    super(page);

    // Inicializar localizadores usando selectores estables.
    // .or() es la API correcta de Playwright para alternativas de localizadores — los objetos Locator siempre
    // son evaluados como verdaderos, por lo que el operador || de JavaScript nunca evaluaría el lado derecho.
    this.usernameInput = page.getByRole('textbox', { name: 'User' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.errorMessage = page.getByText(/invalid|error|incorrect/i);
    this.loginForm = page.getByText('Login with your credentials User User required Password Password required Login');
  }

  /**
   * Realizar inicio de sesión con credenciales
   * @param username - El nombre de usuario/correo electrónico
   * @param password - La contraseña
   */
  async login(username: string, password: string): Promise<void> {
    try {
      // Esperar a que el formulario de login sea visible
      await this.waitForVisible(this.loginForm);

      // Completar credenciales
      await this.fill(this.usernameInput, username);
      await this.fill(this.passwordInput, password);

      // Enviar login
      await this.click(this.loginButton);

      // Esperar a que se complete la navegación/redirección después de iniciar sesión
      await this.page.waitForLoadState('load');
      await this.page.waitForLoadState('domcontentloaded');

    } catch (error) {
      console.error('El inicio de sesión falló:', error);
      throw error;
    }
  }

  /**
   * Navegar a la página de inicio de sesión
   */
  async goToLoginPage(): Promise<void> {
    await this.navigate('/');
  }

  /**
   * Verificar si la página de inicio de sesión está cargada
   * @returns True si se muestra la página de login
   */
  async isLoginPageDisplayed(): Promise<boolean> {
    return await this.isVisible(this.loginForm);
  }

  /**
   * Obtener el mensaje de error si el login falla
   * @returns Texto del mensaje de error
   */
  async getErrorMessage(): Promise<string> {
    return await this.getText(this.errorMessage);
  }

  /**
   * Verificar si el inicio de sesión fue exitoso comprobando la URL o elementos del dashboard
   * @returns True si el login fue exitoso
   */
  async isLoginSuccessful(): Promise<boolean> {
    // Verificar si se redirigió fuera de la página de login
    const currentUrl = await this.getCurrentUrl();
    const isNotLoginPage = !currentUrl.includes('login') && !currentUrl.includes('auth');

    // Comprobación adicional por elementos del dashboard o inicio
    const hasDashboardElements = await this.page.locator('[data-testid="dashboard"], .dashboard, .main-content').isVisible().catch(() => false);

    return isNotLoginPage || hasDashboardElements;
  }

  /**
   * Iniciar sesión con credenciales de entorno
   * Utiliza credenciales de las variables de entorno
   */
  async loginWithEnvCredentials(): Promise<void> {
    // Las credenciales deben estar configuradas en el archivo .env — ver .env.example.
    // Si faltan, el setup global ya habrá lanzado un error y abortado la suite.
    const username = process.env.USER_EMAIL!;
    const password = process.env.USER_PASSWORD!;

    await this.login(username, password);
  }

  /**
   * Verificar si el campo de usuario está presente
   * @returns True si el campo de usuario existe
   */
  async hasUsernameField(): Promise<boolean> {
    return await this.isVisible(this.usernameInput);
  }

  /**
   * Verificar si el campo de contraseña está presente
   * @returns True si el campo de contraseña existe
   */
  async hasPasswordField(): Promise<boolean> {
    return await this.isVisible(this.passwordInput);
  }

  /**
   * Verificar si el botón de login está habilitado
   * @returns True si el botón de login está habilitado
   */
  async isLoginButtonEnabled(): Promise<boolean> {
    return await this.loginButton.isEnabled();
  }

}
