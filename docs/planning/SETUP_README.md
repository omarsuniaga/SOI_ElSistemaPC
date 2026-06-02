# 🚀 Setup Estructura Modular - Sistema Académico PWA

Script automático que crea la estructura modular profesional del proyecto.

## 📋 Requisitos

- **Windows**: PowerShell (incluido en Windows 10+)
- **Linux/Mac**: Bash (incluido por defecto)
- Tener la carpeta `src/` creada

## 🎯 Uso

### En Windows (OPCIÓN RECOMENDADA - Más Fácil)

**Opción 1: Ejecutar el archivo .bat**

1. Ve a la carpeta raíz del proyecto
2. **Haz doble clic en `setup-structure.bat`**
3. Listo! El script se ejecutará y esperará a que presiones una tecla

**Opción 2: PowerShell (si prefieres)**

1. Abre PowerShell en el directorio del proyecto:
   ```powershell
   cd C:\Users\omare\OneDrive\Documentos\SOI_Sistema_Operativo_Institucional\09_SOI_WEB_PORTAL\sistema-academico-pwa
   ```

2. Ejecuta el script:
   ```powershell
   .\setup-structure.ps1
   ```

   O si necesitas especificar la ruta:
   ```powershell
   .\setup-structure.ps1 -SrcPath ".\src"
   ```

3. El script creará la estructura automáticamente.

### En Linux/Mac (Bash)

1. Abre Terminal en el directorio del proyecto:
   ```bash
   cd ~/path/to/sistema-academico-pwa
   ```

2. Hazlo ejecutable:
   ```bash
   chmod +x setup-structure.sh
   ```

3. Ejecuta el script:
   ```bash
   ./setup-structure.sh
   ```

   O especificando la ruta:
   ```bash
   ./setup-structure.sh ./src
   ```

## 📁 Estructura Generada

```
src/
├── core/
│   ├── router/
│   │   └── router.js          # Sistema de navegación
│   ├── config/
│   │   └── config.js          # Configuración global
│   └── utils/
│       └── common.js          # Funciones compartidas
│
├── modules/
│   ├── maestros/
│   │   ├── api/               # Conexión a BBDD
│   │   │   └── maestrosApi.js
│   │   ├── models/            # Tipos y validaciones
│   │   │   └── maestros.model.js
│   │   ├── views/             # UI del módulo
│   │   │   └── maestrosView.js
│   │   ├── components/        # Sub-componentes reutilizables
│   │   │   └── maestrosCard.js
│   │   ├── utils/             # Helpers del módulo
│   │   │   └── maestrosUtils.js
│   │   ├── hooks/             # Lógica reutilizable
│   │   │   └── useMaestros.js
│   │   ├── maestros.router.js # Rutas del módulo
│   │   └── index.js           # API pública del módulo
│   │
│   ├── programas/             # Mismo patrón
│   │   └── ...
│   │
│   └── alumnos/               # Mismo patrón
│       └── ...
│
├── shared/
│   ├── components/            # Componentes globales
│   │   └── navbar.js
│   ├── styles/                # Estilos compartidos
│   │   └── ...
│   ├── assets/                # Imágenes, iconos, etc
│   │   └── ...
│   └── utils/                 # Utilidades globales
│       └── validators.js
│
└── main.js                    # Orquestador principal
```

## 🔧 Próximos Pasos

Después de ejecutar el script:

1. **Mueve tus archivos existentes:**
   - `maestrosService.js` → `modules/maestros/api/maestrosApi.js`
   - `maestrosView.js` → `modules/maestros/views/maestrosView.js`
   - Lo mismo con `programas`

2. **Actualiza las importaciones:**
   - Cambia rutas relativas según la nueva estructura
   - Ejemplo: `import { obtenerMaestros } from '../../api/maestrosApi.js'`

3. **Implementa los módulos:**
   - Completa los archivos `*Api.js` con las funciones CRUD
   - Completa las vistas con el UI
   - Implementa validaciones en `*.model.js`

4. **Ejecuta el servidor:**
   ```bash
   npm run dev
   ```

## 📚 Convenciones

### Nombres de Archivos
- `maestrosApi.js` - Funciones API del módulo
- `useMaestros.js` - Hooks personalizados
- `maestrosUtils.js` - Utilidades específicas
- `maestros.router.js` - Definición de rutas

### Exportaciones en index.js
```javascript
// El módulo expone su API pública
export * from './api/maestrosApi.js'
export * from './models/maestros.model.js'
export * from './hooks/useMaestros.js'
export { registerRoutesMaestros } from './maestros.router.js'
```

### Importaciones desde main.js
```javascript
// Clean imports
import { registerRoutesMaestros } from './modules/maestros'
import { registerRoutesProgramas } from './modules/programas'

// Registrar rutas
registerRoutesMaestros()
registerRoutesProgramas()
```

## ✨ Beneficios de esta Estructura

- ✅ **Modular**: Cada módulo es independiente
- ✅ **Escalable**: Agregar nuevo módulo = copiar carpeta
- ✅ **Profesional**: Sigue patrones de equipos grandes
- ✅ **Testeable**: Cada módulo se puede testear aisladamente
- ✅ **Mantenible**: Fácil encontrar donde está cada cosa
- ✅ **DRY**: Shared evita duplicación de código

## 🐛 Solución de Problemas

### Windows: La ventana se cierra muy rápido

**Usa el archivo .bat en su lugar**, que mantiene la ventana abierta.

Si insistes en usar PowerShell, ejecuta desde PowerShell (no desde Explorador):
```powershell
cd .\tu-ruta\sistema-academico-pwa
.\setup-structure.ps1
```

### En PowerShell: "cannot be loaded because running scripts is disabled"

Ejecuta esto una sola vez:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### En Linux/Mac: "Permission denied"

```bash
chmod +x setup-structure.sh
```

### En Linux/Mac: Problemas con espacios en rutas

```bash
./setup-structure.sh "./src"
```

## 📝 Notas

- El script no sobrescribe archivos existentes
- Todos los archivos se crean con UTF-8
- Los nombres de módulos pueden modificarse en `main.js`
- Agregá más módulos duplicando cualquier módulo existente

## ✉️ Soporte

Si hay problemas, verifica:
1. Que tengas permisos de escritura en `src/`
2. Que la ruta sea correcta
3. Que el archivo de script esté en la raíz del proyecto
