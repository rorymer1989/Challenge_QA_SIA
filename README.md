# Framework de Automatización QA para DEX Manager

Framework de automatización de pruebas a nivel empresarial para DEX Manager usando Playwright y TypeScript.

## 🏗️ Resumen de Arquitectura

Este framework implementa las mejores prácticas de la industria, incluyendo:
- **Page Object Model (POM)** patrón de diseño
- **TypeScript** para un tipado seguro y fácil mantenimiento
- Gestión de **configuración basada en entornos**
- **Cobertura exhaustiva de pruebas** para autenticación y gestión de contenido
- **Capacidades de reporte profesional** y depuración

## 📋 Tabla de Contenidos

- [Instalación](#installation)
- [Configuración](#configuration)
- [Ejecución de Pruebas](#running-tests)
- [Estructura del Proyecto](#project-structure)
- [Suites de Pruebas](#test-suites)
- [Page Objects](#page-objects)
- [Utilidades](#utilities)
- [Depuración](#debugging)

## 🚀 Instalación

### Requisitos Previos

- Node.js 18+ 
- npm 9+
- Git

### Pasos de Configuración

1. **Instalar dependencias**
   ```bash
   npm install
   ```

2. **Configurar entorno**
   ```bash
   cp .env.example .env
   # Edita .env con tus credenciales
   ```

3. **Instalar navegadores de Playwright**
   ```bash
   npm run test:install
   ```

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env` basado en `.env.example`:

```env
# URL de la Aplicación
BASE_URL=https://demo4.dexmanager.com/

# Credenciales de usuario de prueba
USER_EMAIL=*******
USER_PASSWORD=*******
```

## 🧪 Ejecución de Pruebas

### Comandos Básicos

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas con modo UI (interactivo)
npm run test:ui

# Ver reporte HTML
npm run test:report
```

### Ejecutar Pruebas Específicas

```bash
# Ejecutar archivo de prueba específico
npx playwright test src/tests/Ui/login.spec.ts

# Ejecutar caso de prueba específico
npx playwright test --grep "TC-LOGIN-01"
```

## 📁 Estructura del Proyecto

```
dex-manager-automation/
├── auth/                 # Estado de sesión guardado (storageState.json)
├── src/
│   ├── pages/                # Modelos de Page Objects (POM)
│   │   ├── BasePage.ts       # Funcionalidad base de páginas
│   │   ├── LoginPage.ts      # Operaciones de la página de Login
│   │   └── ContentPage.ts    # Operaciones de gestión de contenido
│   ├── tests/                # Especificaciones de pruebas
│   │   ├── Ui/               # Pruebas de automatización UI
│   │   │   ├── login.spec.ts
│   │   │   └── content-management.spec.ts
│   │   └── Api/              # Pruebas de automatización API
│   │       └── login.api.spec.ts
│   ├── fixtures/             # Fixtures y extensiones de pruebas
│   │   └── baseTest.ts       # Fixtures de pruebas personalizados
│   ├── types/                # Interfaces/Tipos de TypeScript
│   │   └── testData.ts       # Contratos de datos de prueba estrictamente tipados
│   ├── config/               # Gestión de configuración
│   │   └── env.ts            # Configuración de entorno
│   ├── utils/                # Funciones de utilidad
│   │   └── helpers.ts        # Utilidades de ayuda
│   └── data/                 # Datos de prueba (fixtures JSON)
│       └── contentData.json  # Datos de prueba para gestión de contenido
├── test-files/               # Archivos de prueba para la subida
├── screenshots/              # Capturas de pantalla de pruebas
├── downloads/                # Archivos descargados
├── playwright-report/        # Reportes de pruebas en HTML
├── playwright.config.ts      # Configuración de Playwright
├── tsconfig.json             # Configuración de TypeScript
├── package.json              # Dependencias de Node.js
├── .env.example              # Plantilla de entorno
└── README.md                 # Este archivo
```

## 🧪 Suites de Pruebas

### 1. Autenticación (`login.spec.ts` & `login.api.spec.ts`)

Valida la funcionalidad de autenticación tanto por UI como por API:
- **UI**: Inicio de sesión exitoso, redirección al dashboard.
- **API**: Validación de estados de respuesta y payloads de login.

### 2. Gestión de Contenido (`content-management.spec.ts`)

Validación integral de la gestión de contenidos:
- **Carpetas**: Creación, navegación, duplicados.
- **Archivos**: Carga (single, multiple, drag & drop), progreso.
- **Operaciones**: Selección, descarga, eliminación, copia, movimiento.
- **Vistas**: Cuadrícula, lista, tarjeta.

## 📄 Page Objects

### BasePage
Proporciona funcionalidad común para todos los Page Objects (click, fill, navigate, wait).

### LoginPage
Encapsula la funcionalidad de autenticación por UI.

### ContentPage
Operaciones completas de gestión de contenido. Implementa **Atomic Actions** para mayor flexibilidad:
- `enterFolderName(name)`: Solo interactúa con el input.
- `submitNewFolder()`: Solo hace click en el botón de confirmación.
- `createFolder(name)`: Encapsula el flujo completo (Business Logic).

## 🛠️ Utilidades

- **DataGenerator**: Generación de nombres de carpetas y datos aleatorios.
- **TestDataHelper**: Creación de archivos físicos y carga de datos JSON tipados.

## 💎 Senior Standings

Este framework sigue los estándares definidos por el **Staff QA Automation Architect**:

### 1. Locators Estables
Evita el uso de IDs dinámicos (ej. `#paper-input-add-on-2`), prefiriendo selectores jerárquicos o basados en roles:
```typescript
this.folderErrorText = page.locator('#dialogNewFolder').locator('paper-input-add-on #a11yWrapper');
```

### 2. Strict Typing
Todos los datos externos están validados mediante interfaces TypeScript, garantizando contratos de datos sólidos:
```typescript
// src/types/testData.ts
export interface ContentData {
  folderNames: { specialChars: string; prefix: string; };
  // ...
}
```

### 3. Convención de Nombres
Los métodos de página siguen la regla de **Simple Verbs**. El código se lee como una historia de usuario, facilitando el mantenimiento.

### 4. Aserciones Descriptivas
Cada `expect` incluye un mensaje de error personalizado:
```typescript
expect(errorText, 'El mensaje de error para caracteres especiales no coincide').toBe('...');
```

## 🐛 Depuración

### Reportes HTML
Los reportes se generan automáticamente en `playwright-report/` y se pueden abrir con:
```bash
npm run test:report
```

### Traces y Screenshots
Configurados para capturarse en caso de errores en `playwright.config.ts`.

---

