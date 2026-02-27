import { test, expect } from '../../fixtures/baseTest';
import { LoginPage } from '../../pages/LoginPage';
import { config } from '../../config/env';

/**
 * Suite de Pruebas de Autenticación
 * 
 * Prueba la funcionalidad de autenticación para DEX Manager.
 * Valida el inicio de sesión, cierre de sesión y gestión de sesiones.
 */

test.describe('DEX Manager - Autenticación', () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goToLoginPage();
  });

  test.describe('Pruebas Positivas', () => {
    test('TC-LOGIN-01: Usuario válido puede iniciar sesión exitosamente', async ({ page }) => {
      // Arrange: Usar credenciales válidas del entorno
      const username = config.userEmail;
      const password = config.userPassword;

      // Act: Realizar inicio de sesión
      await loginPage.login(username, password);

      // Assert: Verificar redirección a la URL del dashboard
      await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
      expect(page.url()).toContain('dexmanager.com/DexFrontEnd/#!/dashboard');
    });
  });
});
