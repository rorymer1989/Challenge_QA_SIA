import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Modelo de Objeto de Página (POM) para Contenido
 * 
 * Encapsula toda la funcionalidad de gestión de contenido para DEX Manager.
 * Incluye creación de carpetas, carga de archivos, operaciones de contenido y compatibilidad de reproductores.
 */
export class ContentPage extends BasePage {
  // Elementos de navegación y principales
  private readonly contentMediaLibraryButton: Locator;
  private readonly contentHeader: Locator;
  private readonly breadcrumb: Locator;

  // Operaciones de carpetas
  private readonly addButton: Locator;
  private readonly folderOption: Locator;
  private readonly folderNameInput: Locator;
  public readonly acceptButton: Locator;
  private readonly cancelButton: Locator;
  private readonly folderCreated: (name: string) => Locator;

  // Operaciones de carga de archivos
  private readonly uploadFilesButton: Locator;
  private readonly fileInput: Locator;
  private readonly dropZone: Locator;
  private readonly uploadProgress: Locator;
  private readonly uploadSuccess: Locator;

  // Selección de contenido y operaciones
  private readonly selectCheckbox: Locator;
  private readonly selectItems: Locator;
  private readonly selectionWrapper: Locator;
  private readonly selectAllCheckbox: Locator;
  private readonly selectNoneCheckbox: Locator;
  private readonly downloadButton: Locator;
  private readonly deleteButton: Locator;
  private readonly copyButton: Locator;
  private readonly cutButton: Locator;
  private readonly pasteButton: Locator;

  // Modos de vista
  private readonly viewModeButton: Locator;
  private readonly gridViewButton: Locator;
  private readonly listViewButton: Locator;
  private readonly cardViewButton: Locator;

  // Creación de contenido URL
  private readonly webAddressOption: Locator;
  private readonly urlInput: Locator;
  private readonly urlNameInput: Locator;
  private readonly saveButton: Locator;

  // Ítems de contenido
  private readonly contentItems: Locator;
  private readonly contentItem: (name: string) => Locator;
  private readonly itemCheckbox: (name: string) => Locator;
  private readonly itemMenu: (name: string) => Locator;
  private readonly itemCard: (name: string) => Locator;

  // Diálogos de confirmación
  private readonly confirmDialog: Locator;
  private readonly confirmDeleteButton: Locator;
  private readonly cancelDeleteButton: Locator;
  private readonly folderErrorText: Locator;
  private readonly loadingSpinner: Locator;

  constructor(page: Page) {
    super(page);

    // Inicializar elementos de navegación.
    this.contentMediaLibraryButton = page.getByRole('link', { name: 'Librería de Medias' }).getByRole('button');
    this.contentHeader = page.getByRole('heading', { name: /content|contenido/i })
      .or(page.locator('h1'));
    this.breadcrumb = page.locator('.breadcrumb, .breadcrumb-nav');

    // Elementos de creación de carpetas
    this.addButton = page.locator('#mainFab').locator('#paperFab');
    this.folderOption = page.getByRole('button', { name: 'Carpeta' });
    this.folderNameInput = page.getByRole('textbox', { name: 'Nuevo Nombre' });
    this.acceptButton = page.getByRole('button', { name: 'Aceptar' });
    this.cancelButton = page.getByRole('button', { name: 'Cancelar' });
    this.folderCreated = (name: string) => page.locator('#dexFilesTree').getByText(name, { exact: true });


    // Elementos de dialogo nueva carpetas
    this.folderErrorText = page.getByText('Crear Carpeta Nuevo Nombre No').getByText('No se permiten los siguientes caracteres: \ / : * ? " < > |');

    // Elementos de carga de archivos
    this.uploadFilesButton = page.getByRole('button', { name: 'Subir Archivo' });
    this.fileInput = page.locator('#fileupload #fileInput').or(page.locator('input[type="file"]').first());
    this.dropZone = page.locator('.drop-zone, .upload-area, [data-testid="drop-zone"]');
    this.uploadProgress = page.locator('.upload-progress, .progress-bar');
    this.uploadSuccess = page.locator('.success');

    // Selección de contenido y operaciones
    this.selectCheckbox = page.getByRole('checkbox');
    this.selectItems = page.getByRole('button', { name: 'Selección de Items' });
    this.selectAllCheckbox = page.getByRole('option', { name: 'Todos' })
    this.selectNoneCheckbox = page.getByRole('option', { name: 'Ninguno' })
    this.downloadButton = page.locator('.toolbar > paper-icon-button').first();
    this.deleteButton = page.getByRole('button', { name: 'Eliminar Ítems Seleccionados' });
    this.copyButton = page.getByRole('button', { name: 'Copiar Ítems Seleccionados' });
    this.cutButton = page.getByRole('button', { name: 'Cortar Ítems Seleccionados' });
    this.pasteButton = page.getByRole('button', { name: 'Pegar Ítems Seleccionados' });

    // Elementos de modo de vista
    this.viewModeButton = page.getByRole('button', { name: 'Cambiar Vista' });
    this.gridViewButton = page.getByRole('option', { name: 'Grilla Pequeña' });
    this.listViewButton = page.getByRole('option', { name: 'Lista Detallada' });
    this.cardViewButton = page.getByRole('option', { name: 'Tarjetas Grandes' });

    // Elementos de contenido URL
    this.webAddressOption = page.getByRole('menuitem', { name: /web address|url|dirección web/i }).or(page.getByText('WEB Address'));
    this.urlInput = page.getByLabel('URL').or(page.locator('input[name="url"], input[type="url"]'));
    this.urlNameInput = page.getByLabel('Name').or(page.locator('input[name="displayName"]'));
    this.saveButton = page.getByRole('button', { name: /save|guardar/i }).or(page.locator('[data-testid="save-button"]'));

    // Ítems de contenido
    this.contentItems = page.locator('.content-item, .file-item, [data-testid="content-item"], #dexFilesTree [role="option"]');
    this.contentItem = (name: string) => this.page.locator(`.media-card[title="${name}"]`);
    this.itemMenu = (name: string) => this.folderCreated(name).locator('.item-menu, .actions-menu, [data-testid="item-menu"]');
    //this.itemCard = (name: string) => this.page.locator(`.media-card[title="${name}"]`);
    this.itemCheckbox = (name: string) => this.itemCard(name).getByRole('checkbox');

    // Elementos de diálogo
    this.confirmDialog = page.locator('paper-dialog[opened]');
    this.confirmDeleteButton = page.getByRole('button', { name: 'Aceptar' });
    this.cancelDeleteButton = page.getByRole('button', { name: 'Cancelar' });
    this.loadingSpinner = page.locator('.layout.vertical.center-center.container');
  }

  /**
   * Navegar al módulo de Contenido
   */
  async goToContentModule(): Promise<void> {
    await this.click(this.contentMediaLibraryButton);
    await this.waitForVisible(this.contentHeader);
  }

  /**
   * Ingresar el nombre para una nueva carpeta sin confirmar
   * @param folderName - Nombre para la carpeta
   */
  async enterFolderName(folderName: string): Promise<void> {
    await this.click(this.addButton);
    await this.click(this.folderOption);
    await this.fill(this.folderNameInput, folderName);
  }

  /**
   * Crear una nueva carpeta (flujo completo)
   * @param folderName - Nombre de la carpeta a crear
   */
  async createFolder(folderName: string): Promise<void> {
    await this.enterFolderName(folderName);
    await this.click(this.acceptButton);
    await this.waitForHidden(this.confirmDialog);
  }

  async getNameFolderDuplicate(folderName: string): Promise<string> {
    await this.waitForVisible(this.page.locator('#dexFilesTree').getByText(folderName + '(1)'));
    return (await this.page.locator('#dexFilesTree').getByText(folderName + '(1)').textContent())?.trim() ?? '';
  }

  /**
   * Cargar un solo archivo
   * @param filePath - Ruta al archivo a cargar
   */
  async uploadSingleFile(filePath: string): Promise<void> {
    await this.click(this.addButton);
    await this.click(this.uploadFilesButton);
    await this.fileInput.setInputFiles(filePath);
    await this.waitForVisible(this.uploadSuccess);
  }

  /**
   * Cargar múltiples archivos
   * @param filePaths - Array de rutas de archivos a cargar
   */
  async uploadMultipleFiles(filePaths: string[]): Promise<void> {
    await this.click(this.addButton);
    await this.click(this.uploadFilesButton);
    await this.fileInput.setInputFiles(filePaths);
    await this.waitForVisible(this.page.locator('div:nth-child(1) > .horizontal > .file-status-icon > .success'));
    await this.waitForVisible(this.page.locator('div:nth-child(2) > .horizontal > .file-status-icon > .success'));
  }



  /**
   * Cargar archivos usando arrastrar y soltar (drag and drop)
   * @param filePaths - Array de rutas de archivos a soltar
   */
  async uploadByDragAndDrop(filePaths: string[]): Promise<void> {
    await this.fileInput.setInputFiles(filePaths);
    await this.waitForVisible(this.page.locator('div:nth-child(1) > .horizontal > .file-status-icon > .success'));
    await this.waitForVisible(this.page.locator('div:nth-child(2) > .horizontal > .file-status-icon > .success'));
  }

  /**
   * Seleccionar un ítem de contenido
   * @param itemName - Nombre del ítem a seleccionar
   */
  async selectContentItem(itemName: string): Promise<void> {
    const card = this.page.locator(`.media-card[title="${itemName}"]`);
    const checkbox = card.locator('.media-card-checkbox');
    await card.hover();
    await checkbox.click();
  }

  /**
   * Seleccionar todos los ítems de contenido
   */
  async selectAllItems(): Promise<void> {
    await this.waitForVisible(this.selectItems);
    await this.click(this.selectItems);
    await this.waitForVisible(this.selectAllCheckbox);
    await this.click(this.selectAllCheckbox);
  }

  /**
   * Deseleccionar todos los ítems de contenido
   */
  async selectNoneItems(): Promise<void> {
    await this.waitForVisible(this.selectItems);
    await this.click(this.selectItems);
    await this.waitForVisible(this.selectNoneCheckbox);
    await this.click(this.selectNoneCheckbox);
  }

  /**
   * Descargar el contenido seleccionado
   */
  async downloadSelectedContent(): Promise<void> {
    await this.click(this.downloadButton);
    // Manejar la confirmación de descarga si está presente
    const downloadPromise = this.page.waitForEvent('download');
    await downloadPromise;
  }

  /**
   * Eliminar el contenido seleccionado
   */
  async deleteSelectedContent(): Promise<void> {
    await this.click(this.deleteButton);
    await this.click(this.confirmDeleteButton);
    await this.waitForHidden(this.confirmDialog);
    await this.waitForHidden(this.loadingSpinner);
  }

  /**
   * Copiar el contenido seleccionado
   */
  async copySelectedContent(): Promise<void> {
    await this.click(this.copyButton);
  }

  /**
   * Cortar el contenido seleccionado
   */
  async cutSelectedContent(): Promise<void> {
    await this.click(this.cutButton);
  }

  /**
   * Pegar contenido en la ubicación actual
   */
  async pasteSelectedContent(): Promise<void> {
    await this.click(this.pasteButton);
  }

  /**
   * Abrir el menú de modo de vista
   */
  async openViewModeMenu(): Promise<void> {
    await this.click(this.viewModeButton);
  }

  /**
   * Cambiar modo de vista a cuadrícula
   */
  async switchToGridView(): Promise<void> {
    await this.click(this.gridViewButton);
  }

  /**
   * Cambiar modo de vista a lista
   */
  async switchToListView(): Promise<void> {
    await this.click(this.listViewButton);
  }

  /**
   * Cambiar modo de vista a tarjetas
   */
  async switchToCardView(): Promise<void> {
    await this.click(this.cardViewButton);
  }

  /**
   * Crear un contenido de dirección web (URL)
   * @param url - La URL a agregar
   * @param name - Nombre a mostrar para la URL
   */
  async createWebAddressContent(url: string, name: string): Promise<void> {
    await this.click(this.addButton);
    await this.click(this.webAddressOption);
    await this.fill(this.urlInput, url);
    await this.fill(this.urlNameInput, name);
    await this.click(this.saveButton);
  }

  /**
   * Abrir una carpeta
   * @param folderName - Nombre de la carpeta a abrir
   */
  async openFolder(folderName: string): Promise<void> {
    const folder = this.folderCreated(folderName);
    await this.click(folder);
  }

  /**
   * Navegar a la carpeta raíz usando el árbol lateral
   */
  async navigateToRoot(): Promise<void> {
    await this.click(this.page.locator('#dexFilesTree').getByText('/'));
  }
  /**
   * Verificar si un folder nuevo existe
   * @param itemName - Nombre del folder a verificar
   * @returns True si el folder existe
   */
  async folderCreatedExists(itemName: string): Promise<boolean> {
    return await this.isVisible(this.folderCreated(itemName));
  }


  /**
   * Verificar si un ítem de contenido existe
   * @param itemName - Nombre del ítem a verificar
   * @returns True si el ítem existe
   */
  async contentItemExists(itemName: string): Promise<boolean> {
    return await this.isVisible(this.page.locator(`.media-card[title="${itemName}"]`))
  }

  /**
   * Obtener la cantidad de ítems de contenido
   * @returns Cantidad de ítems
   */
  async getContentItemCount(): Promise<number> {
    return await this.contentItems.count();
  }

  /**
   * Esperar a que la carga se complete
   */
  async waitForUploadComplete(): Promise<void> {
    await this.waitForVisible(this.uploadSuccess);
  }

  /**
   * Clic derecho en un ítem de contenido para abrir el menú de contexto
   * @param itemName - Nombre del ítem
   */
  async rightClickContentItem(itemName: string): Promise<void> {
    const item = this.contentItem(itemName);
    await item.click({ button: 'right' });
  }

  /**
   * Buscar contenido
   * @param query - El término de búsqueda
   */
  async searchContent(query: string): Promise<void> {
    const searchInput = this.page.getByPlaceholder(/search|buscar/i).or(this.page.locator('[data-testid="search-input"]'));
    await searchInput.clear();
    if (query) {
      await searchInput.fill(query);
      await searchInput.press('Enter');
    } else {
      await searchInput.press('Enter');
    }
    await this.page.waitForLoadState('load');
  }

  /**
   * Verificar si un ítem de contenido está seleccionado
   * @param name - Nombre del ítem
   * @returns True si está seleccionado
   */
  async isItemChecked(name: string): Promise<boolean> {
    return await this.itemCheckbox(name).isChecked();
  }

  /**
   * Verificar si todos los ítems están seleccionados
   * @returns True si todos están seleccionados
   */
  async areAllItemsChecked(): Promise<boolean> {
    const checkboxes = this.page.locator('.media-card paper-checkbox[role="checkbox"]');
    const count = await checkboxes.count();
    if (count === 0) return false;

    for (let i = 0; i < count; i++) {
      if (!await checkboxes.nth(i).isChecked()) return false;
    }
    return true;
  }

  /**
   * Obtener el modo de vista activo
   * @returns Nombre del modo de vista
   */
  async getActiveViewMode(): Promise<'grid' | 'list' | 'card' | 'unknown'> {
    const options = [
      { locator: this.gridViewButton, value: 'grid' },
      { locator: this.listViewButton, value: 'list' },
      { locator: this.cardViewButton, value: 'card' }
    ];

    for (const option of options) {
      if (await option.locator.getAttribute('aria-selected') === 'true') {
        return option.value as 'grid' | 'list' | 'card';
      }
    }

    return 'unknown';
  }

}
