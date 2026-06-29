const decisions = []

function delay(ms = 50) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function genId(prefix = 'dir') {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

export async function createDecision(payload) {
  await delay()
  const row = {
    id: genId('decision'),
    status: 'pending_review',
    source_doc_refs: [],
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...payload,
  }
  decisions.unshift(row)
  return row
}

export async function getDecisions() {
  await delay()
  return [...decisions]
}
