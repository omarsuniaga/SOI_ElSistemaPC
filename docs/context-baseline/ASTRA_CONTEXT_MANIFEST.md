# ASTRA CONTEXT MANIFEST — Guía de Lectura y Navegación para Agentes de IA

> **Propósito:** Indicar a cualquier agente o ingeniero el orden exacto de consulta para comprender y evolucionar el SOI sin alucinaciones ni asunciones falsas.

## 1. MUST READ (Obligatorio antes de proponer cambios o código)

1. `docs/release-v1/SOI_V2_INHERITANCE_CONTRACT.md`: Contrato vinculante de transición técnica (cuadrante de 4 categorías y principio de desacoplamiento de persistencia).
2. `SOI_MASTER_SPEC_v2.0_UNIFICADO.md`: Hipótesis funcional y especificación maestra del objetivo.
3. `AGENTS.md`: Reglas de gobernanza, DataAdapter Pattern, convenciones de commit en inglés y Deep Modules.
4. `CONTEXT.md`: Lenguaje ubicuo estricto del dominio orquestal (prevenir deriva sinonímica).
5. `docs/context-baseline/DATABASE_TRUTH.md`: La única fuente de verdad sobre las 216 tablas reales de PostgreSQL.
6. `database/schema_reference_2026-09-10.sql`: DDL completo de PostgreSQL 17.6 (esquema canónico).
7. `docs/context-baseline/TABLE_USAGE_GRAPH.md`: Relación empírica entre tablas y código fuente.
8. `docs/context-baseline/VERIFICATION_MATRIX.md`: Contraste empírico de las afirmaciones del Master SPEC.
9. `docs/context-baseline/AUTHORIZATION_TRUTH.md`: Políticas RLS, funciones definer y brechas de seguridad.
10. `docs/context-baseline/CHARACTERIZATION_TESTS.md`: Batería de pruebas que definen el comportamiento que no debe romperse.
11. `docs/context-baseline/PRESERVE_REFACTOR_REBUILD.md`: Decisiones arquitectónicas por componente.

## 2. READ WHEN RELEVANT (Lectura bajo demanda por dominio)

- **Pedagogía y Clases:** `docs/context-baseline/FRONTEND_FEATURE_MAP.md` (sección ACM/Maestros), `src/modules/planificacion/`.
- **Finanzas y Caja:** `src/portales/fin/`, `docs/context-baseline/FRONTEND_FEATURE_MAP.md` (sección FIN).
- **Lutería e Inventario:** `src/modules/luteria/`, `src/modules/inventario/`.
- **Hermes y WhatsApp:** `docker/whatsapp-gateway/`, `docs/context-baseline/AUTHORIZATION_TRUTH.md`.
- **Migración de Datos:** `docs/context-baseline/DATA_PRESERVATION_MAP.md`, `docs/context-baseline/SCHEMA_MIGRATION_MAP.md`, `docs/context-baseline/IDENTITY_MIGRATION.md`.

## 3. DO NOT TRUST WITHOUT RECHECKING (Documentos históricos desactualizados)

- ⚠️ `docs/database_schema.sql`: Desincronizado de la base real (solo contiene ~65 tablas legacy).
- ⚠️ `bbdd.md`: Parcial; documenta ~100 tablas frente a las 216 reales en Supabase.
- ⚠️ Cifras de comodatos del informe 2025 (mencionaban 88; la BD real registra exactamente 30).
- ⚠️ Código en ramas no integradas sin previa verificación con `git branch` o `git log`.

## 4. DO NOT SEND TO MODEL / SENSITIVE BOUNDARIES (Prohibido filtrar)

- 🛑 Secretos, claves `service_role`, API keys de Groq / OpenRouter / Telegram.
- 🛑 Dumps de producción con datos personales de menores de edad, tutores o personal (cédulas, teléfonos, emails reales).
- 🛑 Archivo `.env` y variables de entorno productivas.
