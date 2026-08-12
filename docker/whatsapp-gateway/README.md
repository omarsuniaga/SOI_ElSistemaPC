# Gateway WhatsApp (Baileys) — Subsistema 4

Este directorio contiene la definición oficial del **Worker de WhatsApp (Evolution API v2 / Baileys)** para el Sistema Operativo Institucional (SOI).

---

## 1. Despliegue Rápido con Docker Compose (Local o VPS)

```bash
cd docker/whatsapp-gateway
docker compose up -d
```

El servidor quedará escuchando en `http://localhost:8080` (o la IP de tu VPS).

---

## 2. Despliegue en la Nube (Railway / Render / Hetzner)

1. Crear un servicio Docker en **Railway** o tu proveedor VPS preferido.
2. Usar la imagen oficial: `atendai/evolution-api:v2.1.2`.
3. Configurar las siguientes variables de entorno:
   * `AUTHENTICATION_API_KEY`: Tu clave secreta (ej: `sk_live_soi_baileys_secure`).
   * `WEBHOOK_GLOBAL_URL`: `https://<tu-proyecto>.supabase.co/functions/v1/whatsapp-webhook`.
   * `SERVER_URL`: La URL pública asignada por Railway o tu dominio.

---

## 3. Conexión con Supabase y Flujo Outbox

1. El sistema SOI encola los mensajes a enviar en la tabla `hermes_whatsapp_queue`.
2. La Edge Function `whatsapp-dispatcher` toma los mensajes pendientes y los envía a `POST /message/sendText/<instance_name>` en este worker.
3. El webhook `whatsapp-webhook` recibe las respuestas de los representantes e interactúa con el bot de Hermes.
