import { createTextElement } from './safeDom.js'

/**
 * Pinta el panel global de error en `app`. La plantilla es estática; los
 * detalles dinámicos (mensajes, nombres de archivo) se asignan como texto.
 * @param {HTMLElement} app
 * @param {{ icon: string, title: string, subtitle: string, details?: Array<{ text: string, style?: string }> }} options
 */
export function renderFatalErrorPanel(app, { icon, title, subtitle, details = [] }) {
  app.innerHTML = `
  <div style="padding:40px;color:#fff;font-family:'Outfit',sans-serif;background:radial-gradient(circle at top right,#1e293b,#0f172a);z-index:9999;position:fixed;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;">
    <div style="background:rgba(255,255,255,0.05);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.1);border-radius:24px;padding:40px;max-width:600px;width:90%;box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);">
      <div style="width:80px;height:80px;background:rgba(239,68,68,0.1);color:#ef4444;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:40px;margin:0 auto 24px;"><i class="bi ${icon}"></i></div>
      <h2 data-error-title style="margin-bottom:16px;font-weight:700;"></h2>
      <p data-error-subtitle style="color:rgba(255,255,255,0.6);margin-bottom:24px;"></p>
      <div data-error-details style="background:rgba(0,0,0,0.3);padding:16px;border-radius:12px;text-align:left;font-family:monospace;font-size:13px;margin-bottom:24px;overflow:auto;max-height:200px;border-left:4px solid #ef4444;"></div>
      <button onclick="window.location.reload()" style="background:var(--pm-primary,#3b82f6);color:white;border:none;padding:12px 32px;border-radius:12px;font-weight:600;cursor:pointer;">Recargar Aplicación</button>
    </div>
  </div>`

  app.querySelector('[data-error-title]').textContent = title
  app.querySelector('[data-error-subtitle]').textContent = subtitle
  const detailsBox = app.querySelector('[data-error-details]')
  for (const detail of details) {
    const line = createTextElement('div', detail.text)
    if (detail.style) line.style.cssText = detail.style
    detailsBox.appendChild(line)
  }
}
