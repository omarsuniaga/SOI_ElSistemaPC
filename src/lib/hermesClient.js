const HERMES_URL = process.env.HERMES_URL
const HERMES_KEY = process.env.HERMES_API_KEY

export async function sendWhatsAppGroup(jid, message) {
  if (!jid) return { sent: false, reason: 'no_jid' }
  if (!HERMES_URL) return { sent: false, reason: 'not_configured' }

  try {
    const res = await fetch(`${HERMES_URL}/api/send/group`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(HERMES_KEY && { Authorization: `Bearer ${HERMES_KEY}` }),
      },
      body: JSON.stringify({ jid, message }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (err) {
    return { sent: false, error: err.message }
  }
}

export async function sendWhatsAppGroupDocument(jid, caption, pdfBuffer, filename) {
  if (!jid) return { sent: false, reason: 'no_jid' }
  if (!HERMES_URL) return { sent: false, reason: 'not_configured' }

  try {
    const form = new FormData()
    form.append('jid', jid)
    form.append('caption', caption)
    form.append('file', new Blob([pdfBuffer], { type: 'application/pdf' }), filename)

    const res = await fetch(`${HERMES_URL}/api/send/group/document`, {
      method: 'POST',
      headers: HERMES_KEY ? { Authorization: `Bearer ${HERMES_KEY}` } : {},
      body: form,
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (err) {
    return { sent: false, error: err.message }
  }
}
