import { createServer } from 'http'
import { WebSocketServer } from 'ws'
import { parseGatewayAuthMessage } from './gatewayProtocol.js'

export function createGatewayServer({ port, key, allowedOrigins = [], authorizeToken, snapshot, onLogout }) {
  const clients = new Set()
  const cors = (req, res) => {
    const origin = req.headers.origin || ''
    if (!origin || !allowedOrigins.includes(origin)) return
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Headers', 'authorization, content-type, x-gateway-key')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Vary', 'Origin')
  }

  const isAuthorizedRequest = async (req) => {
    if (req.headers['x-gateway-key'] === key) return true
    const authorization = req.headers.authorization || ''
    return authorization.startsWith('Bearer ') && authorizeToken(authorization.slice(7))
  }

  const server = createServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    cors(req, res)

    if (req.method === 'OPTIONS') {
      res.writeHead(204)
      res.end()
      return
    }
    if (!(await isAuthorizedRequest(req))) {
      res.writeHead(401)
      res.end(JSON.stringify({ error: 'No autorizado' }))
      return
    }

    if (req.method === 'GET' && url.pathname === '/health') {
      res.writeHead(200)
      res.end(JSON.stringify(snapshot()))
      return
    }
    if (req.method === 'GET' && url.pathname === '/qr') {
      const current = snapshot()
      res.writeHead(200)
      res.end(JSON.stringify({ qr: current.qr, expiresAt: current.qrExpiresAt }))
      return
    }
    if (req.method === 'POST' && url.pathname === '/logout') {
      try {
        const result = await onLogout()
        res.writeHead(200)
        res.end(JSON.stringify(result || { ok: true }))
      } catch (error) {
        res.writeHead(409)
        res.end(JSON.stringify({ error: error.message }))
      }
      return
    }
    res.writeHead(404)
    res.end(JSON.stringify({ error: 'Ruta no encontrada' }))
  })

  const wss = new WebSocketServer({ noServer: true })
  wss.on('connection', (client) => {
    let authorized = false
    const timeout = setTimeout(() => {
      if (!authorized) client.close(1008, 'Autorización requerida')
    }, 5000)

    client.on('message', async (raw) => {
      const message = parseGatewayAuthMessage(raw)
      const validKey = message?.key === key
      const validToken = await authorizeToken(message?.token)
      if (!validKey && !validToken) {
        client.close(1008, 'No autorizado')
        return
      }
      authorized = true
      clearTimeout(timeout)
      clients.add(client)
      client.send(JSON.stringify(snapshot()))
    })
    client.on('close', () => {
      clearTimeout(timeout)
      clients.delete(client)
    })
  })

  server.on('upgrade', (request, socket, head) => {
    const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`)
    if (url.pathname !== '/events') {
      socket.destroy()
      return
    }
    wss.handleUpgrade(request, socket, head, (client) => wss.emit('connection', client, request))
  })

  return {
    server,
    broadcast(payload) {
      const serialized = JSON.stringify(payload)
      for (const client of clients) {
        if (client.readyState === 1) client.send(serialized)
      }
    },
    listen(callback) {
      server.listen(port, '127.0.0.1', callback)
    },
    close() {
      for (const client of clients) client.close()
      wss.close()
      server.close()
    },
  }
}
