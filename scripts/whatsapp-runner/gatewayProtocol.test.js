import test from 'node:test'
import assert from 'node:assert/strict'
import { createGatewaySnapshot, parseGatewayAuthMessage } from './gatewayProtocol.js'

test('expires QR values from gateway snapshots', () => {
  const snapshot = createGatewaySnapshot({
    instanceName: 'soi-main',
    qr: 'data:image/png;base64,test',
    qrExpiresAt: Date.now() - 1,
    connected: false,
  })
  assert.equal(snapshot.qr, null)
  assert.equal(snapshot.qrExpiresAt, null)
})

test('keeps a current QR and connection state in the snapshot', () => {
  const snapshot = createGatewaySnapshot({
    instanceName: 'soi-main',
    qr: 'data:image/png;base64,test',
    qrExpiresAt: Date.now() + 60_000,
    connected: false,
  })
  assert.equal(snapshot.type, 'gateway.status')
  assert.equal(snapshot.qr, 'data:image/png;base64,test')
  assert.equal(snapshot.connected, false)
})

test('accepts only typed key or token authentication messages', () => {
  assert.deepEqual(parseGatewayAuthMessage('{"type":"auth","token":"jwt"}'), { key: null, token: 'jwt' })
  assert.deepEqual(parseGatewayAuthMessage('{"type":"auth","key":"internal"}'), { key: 'internal', token: null })
  assert.equal(parseGatewayAuthMessage('{"type":"status"}'), null)
  assert.equal(parseGatewayAuthMessage('not-json'), null)
})
