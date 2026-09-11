# SOI 2.0 — Primera demo académica

Aplicación React + TypeScript aislada de v1. Datos ficticios exclusivamente, sin credenciales, autenticación ni llamadas a Supabase. No modifica el portal actual. No interpreta la navegación del cliente como autorización real.

## Ejecutar

Requiere Node 22.18+ (Vite 8 y ejecución de pruebas TypeScript).

```sh
cd apps/soi-v2
npm ci
npm test
npm run build
npm run dev
```

## Recorridos implementados

- `/academico`: conteos derivados de la demo y acceso a pendientes.
- `/administrativo`: búsqueda por nombre/cátedra y filtros combinados.
- `/alumnos/:alumnoId`: ficha, estado y navegación a la clase.
- `/academico/clases`: horario semanal de ejemplo.
- `/clases/:claseId`: detalles y nómina enlazada a las fichas.
- Direcciones desconocidas: pantalla de recuperación; historial atrás/adelante y enlaces nativos.

El host de la demo debe devolver `index.html` para rutas de interfaz al recargar. No montar este fallback sobre `/api/v2`. Vite permite probar la recarga local. No se ha cambiado la configuración de hosting de v1.

## Alcance y límites

El DataAdapter devuelve una copia del JSON en `src/assets/data/mocks`. Los conteos y filtros se calculan, no se escriben como indicadores reales. Un alumno inactivo sin clase no cuenta como asignación pendiente. Las ausencias son valores ficticios sin período académico asociado.

Todavía no incluye registro de asistencia, edición/asignación, login, roles efectivos, sincronización, modo sin conexión ni tema oscuro. No hay botones que simulen guardar operaciones reales. Los módulos pendientes se identifican sin enlaces vacíos.

Verificación: TypeScript, build y contratos de navegación/datos. La inspección visual en navegador y la revisión con maestros siguen pendientes.

## Parche de seguridad independiente

PR: https://github.com/omarsuniaga/SOI_ElSistemaPC/pull/82

Supabase rechazó crear `soi-v2-security-staging` porque FUNEYCA PC está en Free y Branching requiere Pro o superior. La cotización de la rama fue US$0.01344/h; no incluye una eventual suscripción Pro. No se creó la rama ni se cambió el plan. Producción sigue sin modificaciones por esta entrega.
