# Estándar de Integración de OpenPencil (Design-as-Code) en el SOI

## Código de Proceso: `SOI-UI-OPENPENCIL-FLOW-V1`
**Última Actualización:** 2026-06-29  
**Responsable:** Arquitectura de Software & Omar Suniaga

---

# 1. Filosofía de Trabajo

El Sistema Operativo Institucional (SOI) adopta la metodología **Design-as-Code** a través de **OpenPencil**. Almacenar los archivos de diseño en formato vectorial abierto `.op` (JSON estructurado) nos permite:

1.  **Versionado Real de UI**: Realizar seguimiento de los cambios visuales mediante diffs de Git, evitando archivos binarios opacos (`.png`, `.fig`, `.xd`).
2.  **Autonomía de Agente Co-Autor**: Los agentes de IA pueden leer la estructura del layout de la interfaz y alterarla directamente escribiendo en el JSON del diseño antes de codificar la SPA.
3.  **Local-First & Privacidad**: El diseño de la gobernanza de la institución no depende de servidores de terceros ni suscripciones propietarias.

---

# 2. El Ciclo de Vida del Diseño en el SOI

Cualquier cambio o nueva funcionalidad visual debe atravesar el siguiente flujo de trabajo secuencial:

```txt
[ 1. Requerimiento / SPEC ]
            ↓
[ 2. IA edita / crea archivo .op (Diseño en docs/planning/ui/designs/) ]
            ↓
[ 3. Auditoría Humana (Omar abre el .op en la app local de OpenPencil) ]
            ↓
[ 4. IA implementa el código físico (HTML/CSS/JS) en la SPA ]
            ↓
[ 5. Commits en Git de Diseño y Código juntos (Mantenimiento sincronizado) ]
```

---

# 3. Convenciones de Estructura de Archivos `.op`

Los archivos de diseño vectorial de OpenPencil deben ser almacenados en la ruta:
`docs/planning/ui/designs/[nombre_modulo].op`

Cada archivo `.op` debe ser un JSON que responda a la estructura base del motor vectorial de OpenPencil:

```json
{
  "version": "1.0.0",
  "canvas": {
    "backgroundColor": "#0f172a",
    "width": 1440,
    "height": 900
  },
  "nodes": []
}
```

### 3.1 Nodos Vectoriales Soportados:
- **`frame`**: Contenedores principales (como pantallas, paneles flotantes o modales).
- **`rect`**: Cajas de layout, botones y separadores.
- **`text`**: Títulos, etiquetas e información textual.
- **`group`**: Agrupaciones de componentes (ej: la fila de un alumno con sus botones).

---

# 4. Git Rules para Diseños Vectoriales

1.  **Commits Coherentes**: Al subir una feature visual, el commit **debe** incluir tanto la modificación del archivo de código (`.js` / `.css`) como la actualización de su correspondiente archivo `.op` en `docs/planning/ui/designs/`.
2.  **Convención de commits**:
    - `feat(ui-layout): add weekly navigation card layout in openpencil`
    - `refactor(ui-layout): update student progress modal colors`
