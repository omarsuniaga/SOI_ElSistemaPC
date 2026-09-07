# SOI WhatsApp Gateway

This process is the server-side Baileys worker for the ADM WhatsApp module. It
must run outside the Vite renderer and must have exactly one active process per
WhatsApp instance.

## Required environment

```bash
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<server-only-key>
SUPABASE_ANON_KEY=<publishable-key-for-admin-token-validation>
WHATSAPP_GATEWAY_INTERNAL_KEY=<long-random-secret>
WHATSAPP_WEBHOOK_SECRET=<webhook-secret>
WHATSAPP_INSTANCE_NAME=soi-main
WHATSAPP_GATEWAY_PORT=8787
WHATSAPP_ALLOWED_ORIGINS=http://localhost:5173
```

`VITE_SUPABASE_SERVICE_ROLE_KEY` is accepted for backwards compatibility, but
new deployments should use `SUPABASE_SERVICE_ROLE_KEY`. Never expose either
variable to the browser or commit it to the repository.

`SUPABASE_ANON_KEY` is used only to validate an administrator's short-lived
Supabase access token sent over the authenticated WebSocket. It is not a secret
key. Keep `WHATSAPP_ALLOWED_ORIGINS` restricted to the actual ADM origins.

`SUPABASE_URL` is mandatory; the runner no longer contains a project URL fallback.

The Baileys auth state is stored at
`~/.soi/whatsapp/<instance>` by default. Override it with
`WHATSAPP_AUTH_DIR` when using a managed encrypted volume. This directory
contains long-lived WhatsApp cryptographic keys and must be backed up securely,
excluded from source control, and readable only by the runner account.
The runner also creates `.runner.lock` there and refuses to start a second
process for the same instance. Backups/restores must operate on the complete
auth directory through an encrypted volume or an approved server-side backup
job; never copy it to the browser, localStorage, or a client-download endpoint.

## Protected local API

HTTP requests must include `x-gateway-key: <WHATSAPP_GATEWAY_INTERNAL_KEY>`:

- `GET /health` — current connection and QR state.
- `GET /qr` — current in-memory QR Data URL and expiration timestamp.
- `POST /logout` — invalidates the WhatsApp session and requires a new QR scan.

The WebSocket endpoint is `ws://127.0.0.1:<port>/events`. Server-to-server
clients may authenticate with
`{"type":"auth","key":"<WHATSAPP_GATEWAY_INTERNAL_KEY>"}`. The ADM
browser must instead send its current Supabase access token as
`{"type":"auth","token":"<access-token>"}`; the gateway validates the user
and requires administrator access. After authentication, it receives
`gateway.status` events containing the QR only while it is valid. QR values are
never written to Supabase or disk.

## Run

```bash
npm ci
npm start
```

The first run emits a QR event valid for 90 seconds. Scan it from the institutional WhatsApp phone.
Subsequent runs reuse the persisted Baileys credentials until the session is
logged out or revoked from the phone.

Before processing the outbox, the runner acquires a 30-second lease for its
instance in Supabase and renews it on every queue cycle. A second runner may
serve health/QR requests but cannot claim or send queue messages while another
worker owns the lease.
