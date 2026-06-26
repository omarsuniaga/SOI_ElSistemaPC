# Runbook: Deployment WhatsApp Campaña (Go-Live)

**Fecha de actualización**: 2026-06-26  
**Rama**: `origin/claude/flamboyant-ardinghelli-d6aeb6`  
**Commits**: 387baa5, d131ad7, faa2feb, 2316c42

---

## Pre-Requisitos

- [ ] Número de WhatsApp **dedicado** para El Sistema Punta Cana (no compartido con SOI)
  - Registrado a nombre de la institución
  - Debe ser un número real (no virtual)
  - Disponible 24/7 para recibir webhook
- [ ] Consentimiento de representantes **registrado** en DB (para compliance, menores de edad)
- [ ] Servidor/VPS con acceso a internet (para Baileys instance)
- [ ] Credenciales Supabase y Groq API (ya están en secretos)

---

## Fase 1: Configuración de la Instancia Baileys

### 1.1 Levantar Baileys (on-premises o VPS)

```bash
# En el servidor/VPS dedicado
git clone <repo-whatsapp-baileys>
cd whatsapp-baileys-server
npm install

# Configurar env
cat > .env <<EOF
WHATSAPP_NUMBER=+1 (829) 555-XXXX  # Tu número dedicado
WEBHOOK_URL=https://zmhmdvmyeyswunurcyow.supabase.co/functions/v1/whatsapp-webhook
WEBHOOK_SECRET=<jwt-token-or-secret>
API_PORT=3000
EOF

npm start
```

**Esperado**: Baileys genera QR code en terminal.

### 1.2 Escanear QR (conectar WhatsApp)

```bash
# En otra terminal, acceder a http://localhost:3000/qr
# Abrir con celular y escanear QR desde WhatsApp
# Una vez conectado: "Account linked"
```

**Verifica**: Baileys muestra "Account authenticated"

---

## Fase 2: Configurar Gateway en ADM Portal

### 2.1 Completar `hermes_whatsapp_config`

**Acceso**: ADM Portal → Operación → Gateway WhatsApp

Rellena estos campos:

| Campo | Valor | Ejemplo |
|-------|-------|---------|
| **Número dedicado** | Número con formato | `+1 (829) 555-0123` |
| **Nombre amigable** | Para logs | `Inscripción 2026-A` |
| **Cap diario** | Mensajes/día (no cambiar tras start) | `200` |
| **Warmup desde** | Fecha inicio del ritmo | `2026-06-26` (hoy) |

**Campos read-only** (no tocar, ya configurados):
- `jitter_min_seg`: 8, `jitter_max_seg`: 20
- `warmup_inicio`: 20, `warmup_dias`: 7
- `rate_limit_hora`: 10

### 2.2 Verificar Estado

```sql
SELECT id, activo, numero_wid, cap_diario, warmup_desde, warmup_dias
FROM public.hermes_whatsapp_config
WHERE activo = true;
```

**Esperado**: 1 fila, `activo=true`, todos los campos llenos.

---

## Fase 3: Crear Período de Prueba (E2E Test)

### 3.1 Crear Período Mock

**Acceso**: ADM Portal → Operación → Períodos / Campañas

**Form**:
- **Acción**: Inscripción
- **Nombre**: "TEST-Inscripción 2026-A"
- **Fecha inicio**: Hoy
- **Fecha fin**: Hoy + 7 días
- **Abre servicio público**: ✓ SÍ (para responder números desconocidos sin LLM)

**Click**: Crear Período

### 3.2 Preview & Activar

Selecciona el período creado:
- **Preview**: Muestra cuántos postulantes se enviarán
  - Esperado: 0–20 (según datos de test)
- **Activar**: Convierte a estado "activo"

---

## Fase 4: Test de Punta a Punta (5 números mock)

### 4.1 Segmento de Test

Crea 5 postulantes de test en `postulantes`:

```sql
INSERT INTO public.postulantes (nombre, email, celular, estado, intencion_contacto)
VALUES
  ('Test User 1', 'test1@example.com', '+1 (829) 555-0001', 'pendiente', 'primer_contacto'),
  ('Test User 2', 'test2@example.com', '+1 (829) 555-0002', 'pendiente', 'primer_contacto'),
  ('Test User 3', 'test3@example.com', '+1 (829) 555-0003', 'pendiente', 'recuperacion'),
  ('Test User 4', 'test4@example.com', '+1 (829) 555-0004', 'pendiente', 'primer_contacto'),
  ('Test User 5', 'test5@example.com', '+1 (829) 555-0005', 'pendiente', 'reinscripcion');
```

**Nota**: Los números NO necesitan ser reales (Baileys simula localmente si está en modo test).

### 4.2 Encolar Campaña

**En ADM**:
1. Selecciona período "TEST-Inscripción 2026-A"
2. **Click "Encolar tanda (anti-ban)"**
3. Limita a 5 mensajes (input `limite`)
4. Observa métricas:
   - Cap hoy: X
   - Enviados hoy: 0 (antes de encolar)
   - A encolar: 5
   - Restante: X − 5

### 4.3 Monitor de Cola

```sql
SELECT jid, estado, mensaje, created_at, procesado_at
FROM public.hermes_whatsapp_queue
WHERE estado IN ('pendiente', 'enviado', 'fallido')
ORDER BY created_at DESC LIMIT 10;
```

**Esperado**:
1. 5 filas en estado `pendiente`
2. A los ~30s: cambian a `enviado` (con jitter 8–20s entre c/u)
3. `procesado_at` tiene timestamp de RD

### 4.4 Respuestas desde el Bot Público

**Envía WhatsApp** a tu número dedicado desde un número test:

```
Hola, ¿cuál es el costo de inscripción?
```

**Esperado** (sin LLM, solo KB):
```
El Sistema Punta Cana es un programa social de formación musical. 
La inscripción y la clase de Iniciación Musical no tienen costo. 
Te confirmamos los detalles en tu cita.
```

**Test opt-out**:
```
BAJA
```

**Esperado**: Marca en `whatsapp_optout`, no responde más.

---

## Fase 5: Validación Pre-Live

### 5.1 Checklist DB

```sql
-- Funciones RLS + REVOKE anon
SELECT COUNT(*) FROM information_schema.role_routine_grants
  WHERE routine_schema='public' AND grantee='anon'
    AND routine_name IN (
      'fn_encolar_campania', 'fn_whatsapp_optout',
      'fn_whatsapp_cap_hoy', 'fn_whatsapp_enviados_hoy',
      'fn_servicio_publico_activo', 'fn_whatsapp_rate_excedido'
    );
-- Esperado: 0 (ningún anon grant)

-- Consentimientos registrados
SELECT COUNT(*) FROM public.whatsapp_consentimientos
  WHERE acepta_campania = true;
-- Esperado: >= 1 (al menos el test)

-- Log de webhook
SELECT COUNT(*) FROM public.whatsapp_webhook_log
  WHERE created_at > now() - interval '1 hour';
-- Esperado: >= 5 (del test)
```

### 5.2 Checklist Edge Function

**Visita**:
```
https://supabase.com/dashboard/project/zmhmdvmyeyswunurcyow/functions
```

- [ ] `whatsapp-webhook` versión **≥ 9**
- [ ] Status: **ACTIVE**
- [ ] Logs: sin errores (ver últimas 10 invocaciones)

**Trigger manual** (desde función SQL):
```sql
SELECT public.fn_servicio_publico_activo();
-- Esperado: true (si hay periodo activo con abre_servicio_publico=true)
```

### 5.3 Checklist UI ADM

- [ ] Menu Operación muestra "Gateway WhatsApp" + "Períodos / Campañas"
- [ ] Gateway config carga sin error
- [ ] Campañas list muestra período test
- [ ] Botón "Encolar tanda" funciona

---

## Fase 6: Go-Live Producción

### 6.1 Datos Reales

Una vez validado con test, carga datos reales:

**Postulantes (Inscripción A)**:
```sql
SELECT COUNT(*) FROM public.postulantes
  WHERE estado = 'pendiente'
    AND intencion_contacto = 'primer_contacto'
    AND created_at > '2026-06-01';
-- Esperado: 100–500 (depende de tu data)
```

### 6.2 Crear Período de Producción

**En ADM**:
- **Acción**: Inscripción
- **Nombre**: "Inscripción 2026-A (oficial)"
- **Fecha inicio**: Hoy
- **Fecha fin**: +30 días
- **Abre servicio público**: ✓ SÍ

### 6.3 Preview

Click "Preview" → verifica número de postulantes antes de activar.

### 6.4 Activar + Encolar

1. **Activar**: Convierte período a "activo"
2. **Encolar tanda (anti-ban)**: 
   - Sin límite (o con el que quieras para primer batch)
   - Respeta warmup (primer día: ~20 msgs si warmup_desde=hoy)
3. **Monitor**: Observa `hermes_whatsapp_queue` con estado `enviado`

### 6.5 Logs & Alertas

**Monitorea**:
```sql
-- Errores en webhook
SELECT COUNT(*) FROM public.whatsapp_webhook_log
  WHERE intencion_detectada LIKE '%Error%'
    AND created_at > now() - interval '1 hour';

-- Opt-outs acumulados
SELECT COUNT(DISTINCT jid) FROM public.whatsapp_optout
  WHERE created_at > now() - interval '1 day';

-- Cap usage
SELECT public.fn_whatsapp_cap_hoy() AS cap_hoy,
       public.fn_whatsapp_enviados_hoy() AS enviados_hoy;
```

---

## Fase 7: Mantenimiento & Rollback

### 7.1 Si Algo Falla

**Pausar campañas**:
```sql
UPDATE public.campanias_periodo SET activo = false
  WHERE id = '<id-periodo>';
```

**Limpiar cola** (si quedaron pendientes):
```sql
UPDATE public.hermes_whatsapp_queue SET estado = 'cancelado'
  WHERE estado = 'pendiente' AND created_at < now() - interval '1 hour';
```

**Reverter a DB anterior** (si error grave):
```bash
# En Supabase Dashboard → Backups
# Restaurar snapshot pre-deployment
```

### 7.2 Escalar Campaña

Una vez validada con Inscripción A:

1. Cambiar `warmup_desde` a una fecha futura (ej. +7 días)
2. Aumentar `cap_diario` (ej. 300 → 500)
3. Crear período para Reinscripción (mismos pasos)

---

## Fase 8: Post-Launch (Primeros 7 Días)

### Daily Checklist

```bash
# Monitorea a diario:
# 1. Logs de webhook (errores)
# 2. % opt-out vs. total enviados
# 3. Response time (webhook latency)
# 4. Consentimientos recibidos vs. mensajes enviados
```

### Métricas Clave

| Métrica | Objetivo | Rojo |
|---------|----------|------|
| Warmup compliance | Día 1: 20 msgs, Día 7: full cap | < 50% target |
| Opt-out rate | < 5% | > 10% |
| Webhook latency | < 2s | > 5s |
| Consentimiento | 100% registrado | < 80% |

---

## Support & Escalation

**Errores comunes**:

| Error | Causa | Fix |
|-------|-------|-----|
| "Rate limit excedido" | Floods en entrada | Reducir `rate_limit_hora` o pausar período |
| "Servicio público cerrado" | Sin período activo con `abre_servicio_publico=true` | Crear/activar período |
| "Webhook timeout" | Baileys instance down | Reiniciar Baileys, verificar red |
| "LLM error (Groq)" | API key expirada o límite alcanzado | Verificar secretos en Supabase |

**Contacto**: Omar Suniaga (omareduardo74@gmail.com)

---

## Commits de Referencia

```
387baa5 feat(campanias): periodos + segmentacion
d131ad7 feat(antiban): warm-up + jitter + opt-out
faa2feb feat(bot): blindaje publico (KB cerrada + gating) + DEPLOY
2316c42 feat(gateway): config numero dedicado + compliance
```

**Rama**: `origin/claude/flamboyant-ardinghelli-d6aeb6`

---

## Checklist Final (Antes de "Go" en Producción)

- [ ] Número WhatsApp dedicado registrado
- [ ] Baileys instance levantada + autenticada
- [ ] `hermes_whatsapp_config` completado
- [ ] Período TEST creado + E2E test pasó (5 números)
- [ ] Logs limpios (sin errores)
- [ ] Consentimientos >= 1 registrado
- [ ] Edge function v9+ deployed
- [ ] DB backup reciente
- [ ] Team informed (ADM sabe cómo usar UI)

✅ **Ready to go live**
