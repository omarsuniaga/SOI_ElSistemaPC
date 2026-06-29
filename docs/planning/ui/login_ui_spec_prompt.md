# ESPECIFICACIÓN TÉCNICA DE INTERFAZ: LOGIN PORTAL DE MAESTROS
## Proceso: `SOI-SPEC-LOGIN-UI-V2`

Actúa como un Ingeniero de Frontend Senior y Diseñador de Interfaces UI/UX Premium. Tu tarea es generar el marcado HTML5 semántico y las reglas de hojas de estilo CSS3 (Vanilla, estructurado con variables personalizadas) para la pantalla de inicio de sesión del **Portal de Maestros de SOI (Sistema Operativo Institucional - El Sistema Punta Cana)**.

La interfaz debe cumplir con los siguientes lineamientos de diseño, comportamiento responsivo, accesibilidad y soporte de temas (Dark/Light):

---

### 1. SISTEMA DE COLORES Y TOKENS DE DISEÑO (THEMING)
Define variables CSS (`:root`) para alternar de manera limpia e interactiva mediante una clase contenedora `.theme-light` o `.theme-dark` en el body:

```css
/* LIGHT THEME (Default) */
.theme-light {
  --bg-app: #f8fafc;
  --bg-card: #ffffff;
  --bg-input: #f1f5f9;
  --border-input: #cbd5e1;
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #94a3b8;
  --primary-color: #2563eb;
  --primary-hover: #1d4ed8;
  --biometric-color: #4f46e5;
  --biometric-hover: #4338ca;
  --card-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.04);
  --error-color: #ef4444;
}

/* DARK THEME */
.theme-dark {
  --bg-app: #0f172a;
  --bg-card: #1e293b;
  --bg-input: rgba(255, 255, 255, 0.02);
  --border-input: rgba(255, 255, 255, 0.1);
  --text-primary: #ffffff;
  --text-secondary: #cbd5e1;
  --text-muted: #64748b;
  --primary-color: #3b82f6;
  --primary-hover: #2563eb;
  --biometric-color: #60a5fa;
  --biometric-hover: #3b82f6;
  --card-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  --error-color: #ef4444;
}
```

---

### 2. LAYOUT & DISEÑO DE CONTENEDORES (DESKTOP)
*   **Contenedor Principal:** Una tarjeta split centrada en pantalla de `1200px` de ancho por `800px` de alto, con bordes redondeados a `32px`, bordes finos de separación de color y sombra premium `--card-shadow`.
*   **Lado Izquierdo (Hero de Branding Institucional - Split 50%):**
    *   Fondo con degradado dinámico institucional: `linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)`.
    *   **Isotipo:** Círculo de cristal (glassmorphism) translúcido de `80px` de diámetro, con borde de `1px` blanco semi-transparente, conteniendo el icono de clave de sol `🎵` en el centro.
    *   **Título:** "Portal de Maestros" (Sans-serif geométrica, `36px`, `fontWeight: 800`, color blanco).
    *   **Subtítulo:** "by SOI - El Sistema Punta Cana" (color blanco con opacidad al 70%, `14px`, `fontWeight: 500`).
*   **Lado Derecho (Formulario de Login - Split 50%):**
    *   Fondo de tarjeta `--bg-card` con relleno interno (`padding: 60px`).
    *   Título de bienvenida interno: "Iniciar Sesión" (fuente `--text-primary`, `24px`, negrita).
    *   Subtítulo: "Ingresa tus credenciales para acceder al sistema" (`--text-muted`, `13px`).

---

### 3. COMPONENTES DEL FORMULARIO & ENTRADA DE DATOS
*   **Campo Correo Electrónico:**
    *   Etiqueta de accesibilidad: "CORREO ELECTRÓNICO" (`10px`, negrita, color `--text-secondary`).
    *   Caja de entrada con borde redondeado (`12px`), fondo `--bg-input`, borde `--border-input`.
    *   **Placeholder descriptivo explícito:** `ejemplo.maestro@elsistema.edu.do`.
*   **Campo Contraseña (Password con Toggle de Ojo):**
    *   Etiqueta de accesibilidad: "CONTRASEÑA" (`10px`, negrita).
    *   **Placeholder descriptivo:** `Ingresa tu contraseña (mínimo 8 caracteres)`.
    *   **Botón de Visibilidad Integrado:** Un botón interactivo (icono de ojo `bi-eye` / `bi-eye-slash`) en el lado derecho dentro del input para alternar la visualización del texto de la clave.
*   **Fila de Preferencias y Recuperación:**
    *   Alineación de espacio entre extremos (`flexbox justify-content: space-between`).
    *   **Control de Sesión Abierta:** Un checkbox estilizado y etiqueta: "Mantener sesión activa (30 días)" o "Recordar correo".
    *   **Enlace de Recuperación:** Enlace directo con texto "¿Olvidaste tu contraseña?" en color `--primary-color`.

---

### 4. BOTONES DE ACCIÓN PRINCIPAL & BIOMÉTRICA
*   **Botón Iniciar Sesión (Acción Primaria):**
    *   Fondo `--primary-color` con texto blanco, bordes redondeados de `12px` y altura de `48px`.
    *   **Estado de Carga (Spinner):** Transición animada al hacer clic; el texto debe reemplazarse por un indicador spinner giratorio y el texto "Validando credenciales...".
*   **Botón de Acceso Biométrico (Acción Secundaria):**
    *   Fondo transparente con borde de `1px` `--border-input`, color `--text-primary`.
    *   Icono de huella digital integrado: `🧬 Usar huella o Face ID` (color `--biometric-color`).
*   **Enlace de Registro para Nuevo Maestro (Pie de Tarjeta):**
    *   Texto alinear al centro: "¿No tienes cuenta? Regístrate como maestro" (con enlace apuntando a la ruta de registro).

---

### 5. MECÁNICA RESPONSIVA (MOBILE / TABLET / DESKTOP)
Implementa media-queries (`@media (max-width: 1024px)`) para garantizar una adaptabilidad perfecta sin cajas rotas ni superposiciones:
*   **Filtro de Ancho:** Oculta los fondos estáticos de media pantalla (`.op-rect-rect-branding-side`, `.op-rect-rect-form-side`).
*   **Comportamiento de la Tarjeta:** La tarjeta del formulario pasa a tener `position: relative`, ancho dinámico `100%` con un `max-width: 440px` y se auto-centra en la pantalla.
*   **Flujo Flexbox Relativo:** Todos los campos de entrada, botones y etiquetas se posicionan bajo flujo de caja flexible vertical (`flex-direction: column`, con espacios de separación de `20px`), eliminando cualquier posicionamiento absoluto.
*   **Hero Superior Adaptativo:** El logotipo `🎵`, el título "Portal de Maestros" y la firma "by SOI - El Sistema Punta Cana" se reposicionan dinámicamente arriba de la tarjeta de login, centrados y alineados verticalmente sobre el fondo oscuro general de la aplicación.

---

### 6. ANIMACIONES & MICRO-INTERACCIONES
*   **Transiciones:** Todos los botones e inputs deben tener transiciones de `0.2s ease-in-out` para hovers, focos (`focus-visible`) y estados activos.
*   **Hovers:**
    *   Botón de login primario: Oscurecimiento del fondo a `--primary-hover` y elevación con sombra suave.
    *   Inputs: Al hacer focus, el borde cambia a `--primary-color` con una sombra perimetral difusa (`box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15)`).
*   **Validación de Errores:** Incluye un contenedor de error (`#pm-login-error`) relativo de color rojo `--error-color` con animación de sacudida (shake) al activarse.
