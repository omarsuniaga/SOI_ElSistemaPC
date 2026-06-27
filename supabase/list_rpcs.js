import fetch from 'node-fetch'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../.env.local') })

const URL = process.env.VITE_SUPABASE_URL
const KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!URL || !KEY) {
  console.error('Missing env vars')
  process.exit(1)
}

async function listRpcs() {
  try {
    const res = await fetch(`${URL}/rest/v1/`, {
      headers: {
        'apikey': KEY,
        'Authorization': `Bearer ${KEY}`
      }
    })
    
    if (!res.ok) {
      throw new Error(`Failed to fetch schema: ${res.statusText}`)
    }

    const schema = await res.json()
    const paths = schema.paths || {}
    const rpcs = []
    for (const p of Object.keys(paths)) {
      if (p.startsWith('/rpc/')) {
        const rpcName = p.substring(5)
        rpcs.push(rpcName)
      }
    }
    fs.writeFileSync(path.join(__dirname, 'all_rpcs.json'), JSON.stringify(rpcs, null, 2))
    console.log(`Saved ${rpcs.length} RPCs to all_rpcs.json`)
    
    // Print matching ones
    const keywords = ['sql', 'exec', 'query', 'run', 'migra', 'db', 'system', 'cmd', 'command']
    const matches = rpcs.filter(name => keywords.some(kw => name.toLowerCase().includes(kw)))
    console.log('Matches:', matches)
  } catch (err) {
    console.error('Error listing RPCs:', err.message)
  }
}

listRpcs()
