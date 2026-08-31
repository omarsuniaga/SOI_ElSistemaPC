# Runbook: Google Apps Script Ingestion Buffer Setup (M2)

**Module:** M2 — Ingestion Buffer & Webhook Dispatcher  
**Reference Script:** [`scripts/google-apps-script-enrollment.js`](file:///home/omedsunriv/projects/sistema-academico-pwa/scripts/google-apps-script-enrollment.js)  
**SRS Reference:** [`docs/srs/srs-enrollment-funnel.md`](file:///home/omedsunriv/docs/srs/srs-enrollment-funnel.md)

---

## 1. Prerequisites
- Google Form for Candidate Admission / Registration.
- Google Sheets linked to form responses.
- Supabase Project URL and `service_role` key.
- Hermes Webhook URL endpoint (M4).

---

## 2. Step-by-Step Installation

1. **Open Apps Script:**
   - In the linked Google Sheet, click **Extensions > Apps Script**.
2. **Copy Code:**
   - Replace `Code.gs` contents with the code from [`scripts/google-apps-script-enrollment.js`](file:///home/omedsunriv/projects/sistema-academico-pwa/scripts/google-apps-script-enrollment.js).
3. **Configure Environment Secrets:**
   - In Apps Script left sidebar, click **Project Settings** (gear icon) ➔ **Script Properties**.
   - Add the following properties:
     | Property Name | Example Value | Description |
     | :--- | :--- | :--- |
     | `SUPABASE_URL` | `https://xyzcompany.supabase.co` | Your Supabase Project API URL |
     | `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOi...` | Supabase service_role secret |
     | `HERMES_WEBHOOK_URL` | `https://api.tu-dominio.com/api/hermes/enrollment` | Hermes FSM endpoint |
     | `HMAC_SECRET` | `un_secret_largo_y_seguro_123` | Shared secret to sign payloads |

4. **Add Form Submit Trigger:**
   - In Apps Script left sidebar, click **Triggers** (clock icon) ➔ **+ Add Trigger**.
   - Choose which function to run: `onFormSubmit`
   - Select event source: `From spreadsheet` (or `From form`)
   - Select event type: `On form submit`
   - Failure notification settings: `Notify me immediately`
   - Click **Save** and grant permissions.

---

## 3. Observability & Testing
- The script creates an automatic `SyncLogs` tab in the Google Sheet.
- You can review execution status (`SUCCESS` / `ERROR`), timestamp, and idempotency key for every submission.
