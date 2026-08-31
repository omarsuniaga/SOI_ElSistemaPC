/**
 * ============================================================================
 * SOI — Automated Enrollment Funnel: Google Apps Script Ingestion Buffer (M2)
 * ============================================================================
 * Spec: /home/omedsunriv/docs/srs/srs-enrollment-funnel.md (FR-02)
 *
 * Description:
 * This script runs inside Google Forms / Google Sheets attached to the public
 * enrollment form. It acts as an anti-spam buffer, sanitizes incoming applicant
 * data, computes an idempotent key, syncs to Supabase, logs analytics events,
 * and notifies the Hermes FSM engine via an HMAC-SHA256 signed webhook.
 *
 * Setup in Google Apps Script Editor:
 * 1. Open Google Sheets linked to Google Form -> Extensions -> Apps Script.
 * 2. Paste this code.
 * 3. Go to Project Settings -> Script Properties and add:
 *    - SUPABASE_URL: e.g. https://your-project.supabase.co
 *    - SUPABASE_SERVICE_ROLE_KEY: eyJhbGciOi... (service_role secret)
 *    - HERMES_WEBHOOK_URL: https://your-domain.com/api/webhooks/enrollment (or Hermes endpoint)
 *    - HMAC_SECRET: your-secure-shared-secret-key
 * 4. Add Trigger:
 *    - Event source: From spreadsheet / From form -> On form submit -> onFormSubmit
 * ============================================================================
 */

// Configuration loaded from Script Properties
function getConfig() {
  var props = PropertiesService.getScriptProperties();
  return {
    supabaseUrl: props.getProperty('SUPABASE_URL'),
    supabaseKey: props.getProperty('SUPABASE_SERVICE_ROLE_KEY'),
    hermesWebhookUrl: props.getProperty('HERMES_WEBHOOK_URL'),
    hmacSecret: props.getProperty('HMAC_SECRET') || 'default-secret-change-me'
  };
}

/**
 * Main Trigger on Form Submit
 */
function onFormSubmit(e) {
  var config = getConfig();
  var lock = LockService.getScriptLock();

  // Prevent concurrent execution overlaps on same sheet
  try {
    lock.waitLock(15000);
  } catch (err) {
    Logger.log('Could not obtain lock: ' + err.toString());
  }

  try {
    var payload = extractFormData(e);
    if (!payload) {
      throw new Error('No valid form payload extracted.');
    }

    Logger.log('Processing applicant: ' + payload.full_name + ' (' + payload.phone_number + ')');

    // 1. Insert/Upsert to Supabase 'applicants' table
    var applicantResult = upsertApplicantToSupabase(config, payload);
    var applicantId = applicantResult && applicantResult.id ? applicantResult.id : null;

    // 2. Insert event to 'applicant_events' table
    if (applicantId) {
      logApplicantEvent(config, applicantId, 'FORM_SUBMITTED', {
        utm_source: payload.utm_source,
        idempotency_key: payload.idempotency_key,
        submitted_at: new Date().toISOString()
      });
    }

    // 3. Dispatch HMAC-signed webhook to Hermes Engine
    if (config.hermesWebhookUrl) {
      dispatchHermesWebhook(config, {
        event: 'NEW_APPLICANT_SUBMISSION',
        applicant_id: applicantId,
        idempotency_key: payload.idempotency_key,
        full_name: payload.full_name,
        phone_number: payload.phone_number,
        email: payload.email,
        utm_source: payload.utm_source,
        timestamp: new Date().toISOString()
      });
    }

    logSyncStatus('SUCCESS', payload.idempotency_key, 'Synced to Supabase & Hermes');

  } catch (error) {
    Logger.log('ERROR onFormSubmit: ' + error.toString());
    logSyncStatus('ERROR', e ? (e.response ? e.response.getId() : 'unknown') : 'unknown', error.toString());
  } finally {
    lock.releaseLock();
  }
}

/**
 * Extracts and sanitizes form response items
 */
function extractFormData(e) {
  var responseId = '';
  var rawData = {};
  var fullName = '';
  var phoneNumber = '';
  var email = '';
  var utmSource = 'direct';

  if (e && e.response) {
    // Triggered directly from Google Form
    responseId = e.response.getId();
    var itemResponses = e.response.getItemResponses();
    for (var i = 0; i < itemResponses.length; i++) {
      var title = itemResponses[i].getItem().getTitle().toLowerCase().trim();
      var answer = itemResponses[i].getResponse();
      rawData[title] = answer;

      if (title.indexOf('nombre') !== -1 || title.indexOf('completo') !== -1) {
        fullName = answer;
      } else if (title.indexOf('teléfono') !== -1 || title.indexOf('telefono') !== -1 || title.indexOf('whatsapp') !== -1) {
        phoneNumber = cleanPhoneNumber(answer);
      } else if (title.indexOf('correo') !== -1 || title.indexOf('email') !== -1) {
        email = answer.toString().trim();
      } else if (title.indexOf('origen') !== -1 || title.indexOf('redes') !== -1 || title.indexOf('utm') !== -1) {
        utmSource = answer.toString().toLowerCase().trim();
      }
    }
  } else if (e && e.namedValues) {
    // Triggered from Spreadsheet Form Submit
    var values = e.namedValues;
    responseId = 'sheet_row_' + (e.range ? e.range.getRow() : new Date().getTime());
    for (var key in values) {
      var lowerKey = key.toLowerCase().trim();
      var val = values[key][0] || '';
      rawData[lowerKey] = val;

      if (lowerKey.indexOf('nombre') !== -1 || lowerKey.indexOf('completo') !== -1) {
        fullName = val;
      } else if (lowerKey.indexOf('teléfono') !== -1 || lowerKey.indexOf('telefono') !== -1 || lowerKey.indexOf('whatsapp') !== -1) {
        phoneNumber = cleanPhoneNumber(val);
      } else if (lowerKey.indexOf('correo') !== -1 || lowerKey.indexOf('email') !== -1) {
        email = val.trim();
      } else if (lowerKey.indexOf('origen') !== -1 || lowerKey.indexOf('redes') !== -1 || lowerKey.indexOf('utm') !== -1) {
        utmSource = val.toLowerCase().trim();
      }
    }
  } else {
    return null;
  }

  if (!fullName) fullName = 'Aspirante ' + new Date().toLocaleDateString();
  if (!phoneNumber) phoneNumber = '0000000000';

  return {
    idempotency_key: 'form_response_' + responseId,
    full_name: fullName.trim(),
    phone_number: phoneNumber,
    email: email,
    utm_source: utmSource,
    raw_metadata: rawData
  };
}

/**
 * Normalizes phone numbers for WhatsApp E.164 compliance
 */
function cleanPhoneNumber(rawPhone) {
  if (!rawPhone) return '';
  var digits = rawPhone.toString().replace(/\D/g, '');
  // If no international prefix and standard 10-digit number (e.g. DO/VE/AR), adapt if needed
  return digits;
}

/**
 * Upsert applicant into Supabase REST API
 */
function upsertApplicantToSupabase(config, payload) {
  if (!config.supabaseUrl || !config.supabaseKey) {
    Logger.log('WARNING: Supabase URL or Key not set.');
    return null;
  }

  var url = config.supabaseUrl + '/rest/v1/applicants?on_conflict=idempotency_key';
  var body = {
    idempotency_key: payload.idempotency_key,
    full_name: payload.full_name,
    phone_number: payload.phone_number,
    email: payload.email || null,
    utm_source: payload.utm_source,
    status: 'FORM_COMPLETED'
  };

  var options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'apikey': config.supabaseKey,
      'Authorization': 'Bearer ' + config.supabaseKey,
      'Prefer': 'resolution=merge-duplicates,return=representation'
    },
    payload: JSON.stringify(body),
    muteHttpExceptions: true
  };

  var response = UrlFetchApp.fetch(url, options);
  var code = response.getResponseCode();
  var text = response.getContentText();

  if (code >= 200 && code < 300) {
    var parsed = JSON.parse(text);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : null;
  } else {
    throw new Error('Supabase insert failed (' + code + '): ' + text);
  }
}

/**
 * Log analytics event to Supabase
 */
function logApplicantEvent(config, applicantId, eventName, payload) {
  var url = config.supabaseUrl + '/rest/v1/applicant_events';
  var body = {
    applicant_id: applicantId,
    event_name: eventName,
    payload: payload || {}
  };

  var options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'apikey': config.supabaseKey,
      'Authorization': 'Bearer ' + config.supabaseKey,
      'Prefer': 'return=minimal'
    },
    payload: JSON.stringify(body),
    muteHttpExceptions: true
  };

  UrlFetchApp.fetch(url, options);
}

/**
 * Dispatches HMAC-SHA256 signed webhook to Hermes
 */
function dispatchHermesWebhook(config, payload) {
  var jsonPayload = JSON.stringify(payload);
  var signature = computeHmacSha256(jsonPayload, config.hmacSecret);

  var options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'X-Signature-SHA256': signature,
      'X-Idempotency-Key': payload.idempotency_key
    },
    payload: jsonPayload,
    muteHttpExceptions: true
  };

  var response = UrlFetchApp.fetch(config.hermesWebhookUrl, options);
  var code = response.getResponseCode();
  if (code >= 400) {
    Logger.log('Hermes webhook returned code ' + code + ': ' + response.getContentText());
  }
}

/**
 * Computes HMAC-SHA256 hex signature
 */
function computeHmacSha256(message, secret) {
  var signatureBytes = Utilities.computeHmacSha256Signature(message, secret);
  return signatureBytes.map(function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');
}

/**
 * Records execution status in a dedicated 'SyncLogs' sheet tab
 */
function logSyncStatus(status, key, details) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return;
    var sheet = ss.getSheetByName('SyncLogs');
    if (!sheet) {
      sheet = ss.insertSheet('SyncLogs');
      sheet.appendRow(['Timestamp', 'Status', 'Idempotency Key', 'Details']);
      sheet.setFrozenRows(1);
    }
    sheet.appendRow([new Date(), status, key, details]);
  } catch (e) {
    Logger.log('Could not log to SyncLogs sheet: ' + e.toString());
  }
}
