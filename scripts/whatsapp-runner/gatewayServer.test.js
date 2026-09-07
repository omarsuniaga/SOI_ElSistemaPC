import test from 'node:test'
import assert from 'node:assert/strict'
import WebSocket from 'ws'
import { createGatewayServer } from './gatewayServer.js'

async function startFixture() {
  let logoutCalls = 0
  const gateway = createGatewayServer({
    port: 0,
    key: 'internal-test-key',
    allowedOrigins: ['http://localhost:5173'],
    authorizeToken: async (token) => token === 'admin-token',
    snapshot: () => ({ type: 'gateway.status', connected: false, qr: null, qrExpiresAt: null }),
    onLogout: async () => {
      logoutCalls += 1
      return { ok: true }
    },
  })
  await new Promise((resolve) => gateway.listen(resolve))
  const port = gateway.server.address().port
  return { gateway, port, getLogoutCalls: () => logoutCalls }
}

test('protects HTTP gateway routes and allows administrator token', async (t) => {
  const fixture = await startFixture()
  t.after(() => fixture.gateway.close())

  const denied = await fetch(`http://127.0.0.1:${fixture.port}/health`)
  assert.equal(denied.status, 401)

  const allowed = await fetch(`http://127.0.0.1:${fixture.port}/health`, {
    headers: { Authorization: 'Bearer admin-token' },
  })
  assert.equal(allowed.status, 200)
  assert.equal((await allowed.json()).type, 'gateway.status')

  const logout = await fetch(`http://127.0.0.1:${fixture.port}/logout`, {
    method: 'POST',
    headers: { 'x-gateway-key': 'internal-test-key' },
  })
  assert.equal(logout.status, 200)
  assert.equal(fixture.getLogoutCalls(), 1)
})

test('authenticates WebSocket connections before sending gateway state', async (t) => {
  const fixture = await startFixture()
  t.after(() => fixture.gateway.close())

  const socket = new WebSocket(`ws://127.0.0.1:${fixture.port}/events`)
  const message = await new Promise((resolve, reject) => {
    socket.once('open', () => socket.send(JSON.stringify({ type: 'auth', token: 'admin-token' })))
    socket.once('message', (data) => resolve(JSON.parse(data.toString())))
    socket.once('error', reject)
  })
  assert.equal(message.type, 'gateway.status')
  socket.close()
})

test('closes unauthenticated WebSocket connections', async (t) => {
  const fixture = await startFixture()
  t.after(() => fixture.gateway.close())

  const socket = new WebSocket(`ws://127.0.0.1:${fixture.port}/events`)
  const closeCode = await new Promise((resolve, reject) => {
    socket.once('open', () => socket.send(JSON.stringify({ type: 'auth', token: 'not-admin' })))
    socket.once('close', (code) => resolve(code))
    socket.once('error', reject)
  })
  assert.equal(closeCode, 1008)
})
