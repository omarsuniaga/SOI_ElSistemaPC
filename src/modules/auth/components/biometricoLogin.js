import { config } from '../../../core/config/config.js'

export class BiometricoLogin {
  constructor(container, opciones = {}) {
    this.container = container
    this.onSuccess = opciones.onSuccess || (() => {})
    this.onError = opciones.onError || (() => {})
    this.supported = false
    this.credential = null
  }

  async init() {
    this.supported = 'credentials' in navigator && !!navigator.credentials
    if (!this.supported) {
      this.renderUnsupported()
      return
    }
    await this.loadCredential()
    this.render()
  }

  async loadCredential() {
    try {
      this.credential = await navigator.credentials.get({ publicKey: { allowList: [] } })
    } catch {
      this.credential = null
    }
  }

  render() {
    this.container.innerHTML = `
      <div class="biometrico-login">
        ${this.credential
          ? `<div class="text-center">
              <i class="bi bi-fingerprint" style="font-size:3rem;color:var(--bs-primary)"></i>
              <p class="mt-2">Usar biometricos guardados</p>
              <button class="btn btn-primary" id="biometrico-login-btn">Iniciar con Huella/Face</button>
            </div>`
          : `<div class="text-center">
              <i class="bi bi-camera" style="font-size:3rem;color:var(--bs-secondary)"></i>
              <p class="mt-2">Registrar método biométrico</p>
              <button class="btn btn-outline-primary" id="biometrico-register-btn">Activar Login Biométrico</button>
            </div>`
        }
      </div>
    `

    const loginBtn = document.getElementById('biometrico-login-btn')
    const registerBtn = document.getElementById('biometrico-register-btn')

    loginBtn?.addEventListener('click', () => this.login())
    registerBtn?.addEventListener('click', () => this.register())
  }

  renderUnsupported() {
    this.container.innerHTML = `
      <div class="biometrico-login alert alert-warning">
        <i class="bi bi-exclamation-triangle"></i>
        Tu navegador no soporta WebAuthn. Usá login tradicional.
      </div>
    `
  }

  async login() {
    try {
      const credencial = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32),
          allowList: [{ type: 'public-key' }]
        }
      })
      this.onSuccess?.(credencial)
    } catch (error) {
      this.onError?.(error)
    }
  }

  async register() {
    try {
      const credencial = await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array(32),
          rp: { name: 'SOI Sistema Académico' },
          user: { id: new Uint8Array(16), name: 'maestro' },
          pubKeyCredParams: [
            { type: 'public-key', alg: -7 },
            { type: 'public-key', alg: -257 }
          ]
        }
      })
      localStorage.setItem('biometric_credential', JSON.stringify(credencial))
      this.credential = credencial
      this.render()
    } catch (error) {
      this.onError?.(error)
    }
  }
}

export function createBiometricoLogin(container, opciones) {
  const instancia = new BiometricoLogin(container, opciones)
  instancia.init()
  return instancia
}

export function renderBiometricoLogin(container, opciones = {}) {
  return createBiometricoLogin(container, opciones)
}