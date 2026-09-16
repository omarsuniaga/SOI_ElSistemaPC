# 03 MUTATION INTEGRITY (C1) — Blindaje contra Mutaciones Ciegas en DataAdapters

> **Fecha:** 10 de Septiembre de 2026  
> **Ámbito:** SOI v1.x LTS Stabilization (Bloque 4)  
> **Problema:** En arquitecturas Jamstack/Supabase, las operaciones `.update()` o `.delete()` que no encadenan `.select()` retornan `error: null` incluso cuando 0 filas fueron modificadas (por ejemplo, si RLS rechazó silenciosamente la operación o el ID no existía). La UI mostraba falsos positivos ("Guardado exitosamente") al usuario mientras los datos no cambiaban en la base de datos.

---

## 1. Contrato de Integridad de Mutación (`MutationResult`)

Para garantizar que toda mutación sea determinista y verificable, se formaliza el estándar obligatorio para DataAdapters en `src/modules/*/api/`:

```typescript
export interface MutationResult<T = any> {
  success: boolean;
  affectedRows: number;
  data?: T;
  error?: string | null;
}
```

### Reglas Arquitectónicas Innegociables:
1. **Obligatoriedad de `.select()`**: Ningún `.update()` o `.delete()` de PostgREST debe ejecutarse sin encadenar `.select()`.
2. **Verificación de Cardinalidad**:
   - Para mutaciones unitarias (por `id`), si `data.length === 0` y `error === null`, el adaptador **DEBE** arrojar un error explícito:  
     `"Registro no encontrado o mutación rechazada por permisos (RLS)"`.
   - Para mutaciones en lote (bulk), se debe validar que el número de registros modificados coincida con la entrada o reportar discrepancias.
3. **Manejo de Códigos RLS de Supabase**: Traducir `PGRST201` o errores de violación de política a mensajes de interfaz de usuario limpios y orientados al usuario final.

---

## 2. Auditoría y Remediación en Módulos Críticos

| Módulo / DataAdapter | Método Mutador | Estado Anterior | Remediación Aplicada | Verificación |
|---|---|---|---|---|
| `alumnosSupabase.js` | `actualizarAlumno(id, datos)` | Usaba `.select()` pero no validaba `data.length > 0`. | Validado `!data \|\| data.length === 0` arrojando error de RLS / no encontrado. | ✅ Hardened |
| `alumnosSupabase.js` | `inactivarAlumno(id)` | Hacía `.update().select()`. | Agregada guarda explícita `if (!data \|\| data.length === 0)`. | ✅ Hardened |
| `alumnosSupabase.js` | `reactivarAlumno(id)` | Hacía `.update().select()`. | Agregada guarda explícita `if (!data \|\| data.length === 0)`. | ✅ Hardened |
| `ausenciaAprobacionApi.js` | `actualizarDecisionAusencia(id, estado)` | Ejecutaba `.update()` ciego sin `.select()`. Si RLS bloqueaba, devolvía `{ id, estado }` simulando éxito. | Encadenado `.select()`, chequeo de `affectedRows` y fallback numérico robusto. | ✅ Hardened |
| `sesionesSupabase.js` | `actualizarSesion(id, datos)` | Retornaba `data[0]` sin validar si `data` era un array vacío. | Agregado chequeo `if (!data \|\| data.length === 0)` arrojando excepción. | ✅ Hardened |
| `sesionesSupabase.js` | `eliminarSesion(id)` | Ejecutaba `.delete().eq('id', id)` ciego retornando `{ success: true }`. | Encadenado `.select()` y validado `deleted.length > 0`. | ✅ Hardened |
| `SupabasePaymentTransactionAdapter.ts` | `executePaymentTransaction(payload)` | Invocaba RPC `fn_registrar_pago_transaccional`. | Modo **Fail-Closed**: Bloqueo pesimista con transaccionalidad atómica y extracción de errores de negocio. | ✅ Hardened |

---

## 3. Guía de Detección de Mutaciones Ciegas (Para Revisiones Futuras)

Para prevenir la reaparición de mutaciones ciegas en el código:
```bash
# Detectar updates sin .select()
rg "\.update\([^\)]*\)(?!\.select)" src/modules/
# Detectar deletes sin .select()
rg "\.delete\([^\)]*\)(?!\.select)" src/modules/
```
Todo hallazgo debe ser corregido inmediatamente aplicando el patrón `MutationResult`.
