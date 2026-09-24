#!/usr/bin/env node
// Triages a CI failure through Jev (TypeSafe AI's evaluation model, via Vercel
// AI Gateway) before spending human/agent time diagnosing it. Classifies the
// failure and recommends one of three actions, each mapped to an exit code
// so this script is usable directly in a shell pipeline or CI gate.
//
// Usage:
//   node scripts/jev-triage-ci.mjs --state "<failure description>"
//   echo "<failure description>" | node scripts/jev-triage-ci.mjs
//
// Requires AI_GATEWAY_API_KEY in the environment. Never hardcode the key.
//
// Exit codes:
//   0 = auto_retry            (safe to retry without human review)
//   1 = retry_with_review     (retry, but a human should check the result)
//   2 = investigate_first     (do not retry blindly, diagnose first)
//   3 = script/API error (key missing, malformed input, Jev call failed)

const GATEWAY_URL = 'https://ai-gateway.vercel.sh/v4/ai/evaluation-model'
const MODEL_ID = 'typesafe-ai/jev'

const ACTION_EXIT_CODES = {
  auto_retry: 0,
  retry_with_review: 1,
  investigate_first: 2,
}

const QUESTIONS = {
  es_flake: {
    type: 'boolean',
    instructions:
      'Is this CI failure most likely a transient infrastructure flake (not caused by the code change) rather than a real, reproducible bug?',
  },
  categoria: {
    type: 'choice',
    instructions: 'What category best describes this failure?',
    criteria: {
      infra_flake:
        'Transient infra issue: connection refused, timeout, service not ready, rate limit.',
      real_test_bug:
        'Deterministic bug in code or test logic, caused by the diff under test.',
      environment_config:
        'Missing env var, misconfigured service, wrong port, stale fixture.',
      flaky_test_race:
        'Timing-dependent test with a real race condition, inconsistent across runs.',
      unknown: 'Not enough evidence to classify.',
    },
  },
  // Calibration note (2026-09-24): an earlier "urgencia" 0-10 score question
  // conflated "how bad is this bug" with "what should I do about it", and
  // Jev's own confidence on it dropped to 6% on a real CI failure — the
  // lowest of every test case. Replaced with a direct action choice instead.
  accion_recomendada: {
    type: 'choice',
    instructions:
      'Given the classification, what should happen next in the CI pipeline?',
    criteria: {
      auto_retry:
        'Safe to retry automatically without any human involvement (clear infra flake).',
      retry_with_review:
        'Retry is reasonable, but a human should glance at the result before trusting it (ambiguous or intermittent).',
      investigate_first:
        'Do not just retry — this needs diagnosis first (real, deterministic bug).',
    },
  },
}

function readState(argv) {
  const flagIndex = argv.indexOf('--state')
  if (flagIndex !== -1 && argv[flagIndex + 1]) {
    return Promise.resolve(argv[flagIndex + 1])
  }
  if (!process.stdin.isTTY) {
    return new Promise((resolve, reject) => {
      let data = ''
      process.stdin.setEncoding('utf8')
      process.stdin.on('data', (chunk) => (data += chunk))
      process.stdin.on('end', () => resolve(data.trim()))
      process.stdin.on('error', reject)
    })
  }
  return Promise.resolve('')
}

async function triageWithJev(state, apiKey) {
  const response = await fetch(GATEWAY_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'ai-model-id': MODEL_ID,
      'ai-evaluation-model-specification-version': '4',
      'ai-gateway-protocol-version': '0.0.1',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ state, questions: QUESTIONS }),
  })

  const body = await response.json()
  if (!response.ok) {
    throw new Error(`Jev call failed (${response.status}): ${JSON.stringify(body)}`)
  }
  return body
}

function summarize(result) {
  const { answers, providerMetadata } = result
  const confidence = providerMetadata?.typesafe?.confidence ?? {}

  return {
    es_flake: answers.es_flake.probability,
    categoria: answers.categoria.choice,
    categoria_confianza: confidence.categoria ?? null,
    accion_recomendada: answers.accion_recomendada.choice,
    accion_confianza: confidence.accion_recomendada ?? null,
  }
}

async function main() {
  const apiKey = process.env.AI_GATEWAY_API_KEY
  if (!apiKey) {
    console.error('Error: AI_GATEWAY_API_KEY no está en el entorno. No se hace la llamada.')
    process.exit(3)
  }

  const state = await readState(process.argv.slice(2))
  if (!state) {
    console.error(
      'Error: falta la descripción del fallo. Usar --state "<texto>" o pasarla por stdin.',
    )
    process.exit(3)
  }

  let result
  try {
    result = await triageWithJev(state, apiKey)
  } catch (err) {
    console.error(`Error consultando Jev: ${err.message}`)
    process.exit(3)
  }

  const summary = summarize(result)
  console.log(JSON.stringify(summary, null, 2))

  const exitCode = ACTION_EXIT_CODES[summary.accion_recomendada]
  process.exit(exitCode ?? 3)
}

main()
