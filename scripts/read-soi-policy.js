#!/usr/bin/env node
import { resolveSoiPolicy } from './lib/soi-policy-resolver.js'

function parseArgs(argv) {
  const args = { query: '', freeText: [] }
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i]
    if (token === '--category') args.category = argv[++i]
    else if (token === '--doc-id') args.docId = argv[++i]
    else args.freeText.push(token)
  }
  args.query = args.freeText.join(' ').trim()
  delete args.freeText
  return args
}

const params = parseArgs(process.argv.slice(2))
const result = resolveSoiPolicy(params)
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
process.exit(result.ok ? 0 : 1)
