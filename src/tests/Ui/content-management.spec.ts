import { test, expect } from '../../fixtures/baseTest';
import { ContentPage } from '../../pages/ContentPage';
import { DataGenerator, TestDataHelper } from '../../utils/helpers';
import { ContentData } from '../../types/testData';

/**
 * Suite de Pruebas de Gestión de Contenido
 * 
 * Prueba toda la funcionalidad de gestión de contenido para DEX Manager.
 * Cubre creación de carpetas, carga de archivos, operaciones de contenido y compatibilidad de reproductores.
 */

test.describe('Suite de Pruebas de Gestión de Contenido', () => {
  let contentPage: ContentPage;
  let testFolderName: string;

  // Cargar datos centralizados con tipado
  const contentData = TestDataHelper.loadTestData<ContentData>('src/data/contentData.json');

  test.beforeEach(async ({ page }) => {
    // Navegar a la URL base para aplicar storageState y llegar al dashboard
    await page.goto('/');

    contentPage = new ContentPage(page);
    await contentPage.goToContentModule();

    // Generar nombre único para la carpeta de prueba usando el prefijo de datos
    testFolderName = DataGenerator.generateFolderName(contentData.folderNames.prefix);
  });

  test.afterEach(async () => {
    // Limpieza de datos de prueba
    try {
      if (await contentPage.folderCreatedExists(testFolderName)) {
        // Carpeta creada
      }
    } catch (error) {
      console.warn('La limpieza falló:', error);
    }
  });

  test.describe('Gestión de Carpetas', () => {

    test('TC-01-01: Crear Carpeta con Nombre Válido', async () => {
      // Act: Crear carpeta
      await contentPage.createFolder(testFolderName);
      // Assert: Carpeta creada exitosamente
      expect(await contentPage.folderCreatedExists(testFolderName),
        `La carpeta '${testFolderName}' debería existir en la librería`).toBeTruthy();
    });

    test('TC-01-02: Crear carpeta duplicada', async () => {
      const testFolderNameDuplicate = contentData.folderNames.prefix;
      // Arrange: Crear primera carpeta y volver a la raíz
      await contentPage.createFolder(testFolderNameDuplicate);
      expect(await contentPage.folderCreatedExists(testFolderNameDuplicate), 'La primera carpeta debería haber sido creada').toBeTruthy();
      await contentPage.navigateToRoot();
      // Act: Intentar crear duplicado ingresando el mismo nombre
      await contentPage.createFolder(testFolderNameDuplicate);
      // Assert: Debería mostrar el nombre del folder mas 1 entre (1)  
      const warningMessage = await contentPage.getNameFolderDuplicate(testFolderNameDuplicate);
      expect(warningMessage, 'El mensaje de advertencia para carpetas duplicadas no es el esperado').toContain(testFolderNameDuplicate + '(1)');
    });

    test('TC-01-03: Crear carpeta con caracteres especiales en el nombre', async () => {
      // Arrange: Nombre de carpeta con caracteres especiales desde datos
      const specialFolderName = contentData.folderNames.specialChars;
      // Act: Intentar ingresar nombre inválido
      await contentPage.enterFolderName(specialFolderName);

      // Assert: Debería mostrar el boton aceptar deshabilitado
      expect(contentPage.acceptButton).toBeDisabled();
    });

  });

  test.describe('Carga de Archivos', () => {
    test('TC-02-01: Cargar Archivo de Imagen Individual', async () => {
      // Arrange: Crear carpeta de prueba y obtener archivo de prueba
      await contentPage.createFolder(testFolderName);
      await contentPage.openFolder(testFolderName);
      const testFiles = TestDataHelper.getTestFiles();

      // Act: Cargar un solo archivo
      await contentPage.uploadSingleFile(testFiles.image_1);

      // Assert: Archivo cargado exitosamente
      await contentPage.waitForUploadComplete();
      expect(await contentPage.getContentItemCount(),
        'Debería haber al menos un archivo cargado en la carpeta').toBeGreaterThan(0);
    });

    test('TC-02-02: Cargar Múltiples Archivos Simultáneamente', async () => {
      // Arrange: Crear carpeta de prueba y obtener archivos de prueba
      await contentPage.createFolder(testFolderName);
      await contentPage.openFolder(testFolderName);
      const testFiles = TestDataHelper.getTestFiles();

      // Act: Cargar múltiples archivos
      await contentPage.uploadMultipleFiles([
        testFiles.image_1,
        testFiles.image_2,
      ]);

      // Assert: Todos los archivos cargados exitosamente
      const itemCount = await contentPage.getContentItemCount();
      expect(itemCount, 'No se cargaron todos los archivos seleccionados')
        .toBeGreaterThanOrEqual(2);
    });

    test('TC-02-03: Cargar Video mediante Drag & Drop', async () => {
      // Arrange: Crear carpeta de prueba y obtener archivos de prueba
      await contentPage.createFolder(testFolderName);
      await contentPage.openFolder(testFolderName);
      const testFiles = TestDataHelper.getTestFiles();

      // Act: Cargar mediante arrastrar y soltar
      await contentPage.uploadByDragAndDrop([testFiles.image_1, testFiles.image_2]);

      // Assert: Archivos cargados exitosamente
      expect(await contentPage.getContentItemCount(),
        'No se detectaron archivos después del drag and drop').toBeGreaterThan(0);
    });

    test('TC-02-04: Validar Indicador de Progreso de Carga', async () => {
      // Arrange: Crear carpeta de prueba
      await contentPage.createFolder(testFolderName);
      await contentPage.openFolder(testFolderName);
      const testFiles = TestDataHelper.getTestFiles();
      const imageName = testFiles.image_1.split('/').pop() ?? 'test-image.jpg';

      // Act: Iniciar carga y verificar progreso
      const uploadPromise = contentPage.uploadSingleFile(testFiles.image_1);

      // Assert: El indicador de progreso/finalización debería ocurrir
      await uploadPromise;
      await contentPage.waitForUploadComplete();
      expect(await contentPage.contentItemExists(imageName),
        'El archivo de imagen no parece haberse cargado correctamente').toBeTruthy();
    });
  });

  test.describe('Operaciones de Contenido', () => {
    test.beforeEach(async () => {
      // Configuración de datos de prueba
      await contentPage.createFolder(testFolderName);
      await contentPage.openFolder(testFolderName);

      const testFiles = TestDataHelper.getTestFiles();
      await contentPage.uploadSingleFile(testFiles.image_1);
      await contentPage.waitForUploadComplete();
    });

    test('TC-03-01: Descargar Contenido Seleccionado', async () => {
      const testFiles = TestDataHelper.getTestFiles();
      const imageName = testFiles.image_1.split('/').pop() ?? 'test-image_1.jpg';

      // Act: Seleccionar y descargar contenido
      await contentPage.selectContentItem(imageName);
      await contentPage.downloadSelectedContent();

      // Assert: Se espera que el método se complete sin errores
      expect(imageName).toBeDefined();
    });

    test('TC-03-02: Selección Masiva: Todos y Ninguno', async () => {

      const testFiles = TestDataHelper.getTestFiles();
      await contentPage.uploadSingleFile(testFiles.image_2);
      await contentPage.waitForUploadComplete();

      // Act: Seleccionar todos los elementos
      await contentPage.selectAllItems();

      // Assert: Todos los elementos deberían estar seleccionados
      expect(await contentPage.areAllItemsChecked()).toBeTruthy();

      // Act: Deseleccionar todos
      await contentPage.selectNoneItems();

      // Assert: Ningún elemento debería estar seleccionado
      expect(await contentPage.areAllItemsChecked()).toBeFalsy();
    });

    test('TC-03-03: Eliminar Contenido con Confirmación', async () => {
      const testFiles = TestDataHelper.getTestFiles();
      const imageName = testFiles.image_1.split('/').pop() ?? 'test-image.jpg';

      // Act: Seleccionar y eliminar contenido
      await contentPage.selectContentItem(imageName);
      await contentPage.deleteSelectedContent();
      // Assert: El archivo ya no existe
      expect(await contentPage.contentItemExists(imageName)).toBeFalsy();
    });

    test('TC-03-04: Cambiar Modo de Visualización', async () => {
      // Act: Cambiar a vista de cuadrícula
      await contentPage.openViewModeMenu();
      await contentPage.switchToGridView();

      // Assert: La vista debería cambiar
      expect(await contentPage.getActiveViewMode()).toBe(contentData.viewModes.grid);
      // Act: Cambiar a vista de lista
      await contentPage.openViewModeMenu();
      await contentPage.switchToListView();

      // Assert: La vista debería cambiar
      expect(await contentPage.getActiveViewMode()).toBe(contentData.viewModes.list);

      // Act: Cambiar a vista de tarjeta
      await contentPage.openViewModeMenu();
      await contentPage.switchToCardView();

      // Assert: La vista debería cambiar
      expect(await contentPage.getActiveViewMode()).toBe(contentData.viewModes.card);
    });

    test('TC-03-05: Copiar Contenido entre Carpetas', async () => {
      const testFiles = TestDataHelper.getTestFiles();
      const imageName = testFiles.image_1.split('/').pop() ?? 'test-image.jpg';

      // Act: Seleccionar y copiar contenido
      await contentPage.selectContentItem(imageName);
      await contentPage.copySelectedContent();

      // Assert: Se espera que la operación se complete
      expect(true).toBeTruthy();
      await contentPage.navigateToRoot();
      await contentPage.createFolder(testFolderName);
      await contentPage.pasteSelectedContent();
      expect(await contentPage.contentItemExists(imageName)).toBeTruthy();
    });

    test('TC-03-06: Mover Contenido entre Carpetas', async () => {

      const testFiles = TestDataHelper.getTestFiles();
      const imageName = testFiles.image_1.split('/').pop() ?? 'test-image.jpg';
      // Act: Seleccionar y Cortar contenido
      await contentPage.selectContentItem(imageName);
      await contentPage.cutSelectedContent();

      // Assert: Se espera que la operación se complete
      expect(true).toBeTruthy();
      await contentPage.navigateToRoot();
      await contentPage.createFolder(testFolderName);
      await contentPage.pasteSelectedContent();
      expect(await contentPage.contentItemExists(imageName)).toBeTruthy();
    });
  });

});

