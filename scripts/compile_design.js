/**
 * Compilador de Layouts de OpenPencil a HTML/CSS para la SPA del SOI (Nativo ESM)
 * Proceso: `SOI-UI-COMPILE-DESIGN-V1`
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export function compileOpToJs(opFilePath, outputJsPath) {
  if (!fs.existsSync(opFilePath)) {
    console.error(`[Compiler] Error: No se encontró el archivo de diseño ${opFilePath}`)
    return
  }

  const data = JSON.parse(fs.readFileSync(opFilePath, 'utf8'))
  const nodes = data.nodes || []
  
  let cssRules = []
  
  function processNode(node, parentNode = null) {
    // Excluir placeholders y labels vectoriales redundantes superpuestos
    const excludedIds = [
      'text-placeholder-email',
      'text-placeholder-password',
      'text-btn-login-label',
      'text-btn-biometric-label'
    ]
    if (excludedIds.includes(node.id)) {
      return ''
    }

    let x = node.x
    let y = node.y
    if (parentNode) {
      x = node.x - parentNode.x
      y = node.y - parentNode.y
    }

    const name = node.name || ''
    
    // Parsear metadatos opcionales desde el nombre
    // Ejemplo: "Input Email [tag:input][id:pm-email][class:pm-input][type:email]"
    const tagMatch = name.match(/\[tag:([^\]]+)\]/)
    const idMatch = name.match(/\[id:([^\]]+)\]/)
    const classMatch = name.match(/\[class:([^\]]+)\]/)
    const typeMatch = name.match(/\[type:([^\]]+)\]/)
    const hrefMatch = name.match(/\[href:([^\]]+)\]/)
    const placeholderMatch = name.match(/\[placeholder:([^\]]+)\]/)

    const tag = tagMatch ? tagMatch[1] : (node.type === 'text' ? 'div' : 'div')
    const idAttr = idMatch ? ` id="${idMatch[1]}"` : ''
    const typeAttr = typeMatch ? ` type="${typeMatch[1]}"` : ''
    const hrefAttr = hrefMatch ? ` href="${hrefMatch[1]}"` : ''
    const placeholderAttr = placeholderMatch ? ` placeholder="${placeholderMatch[1]}"` : ''
    
    let extraClasses = classMatch ? ` ${classMatch[1]}` : ''

    if (node.type === 'frame') {
      const bg = node.backgroundColor || '#000'
      const radius = node.borderRadius ? `${node.borderRadius}px` : '0px'
      cssRules.push(`
/* Frame: ${node.name} */
.op-frame-${node.id} {
  position: relative;
  width: 100%;
  max-width: ${node.width}px;
  height: ${node.height}px;
  background: ${bg};
  border-radius: ${radius};
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  margin: 0 auto;
}`)
      
      let childrenHtml = ''
      if (node.children) {
        node.children.forEach(child => {
          childrenHtml += processNode(child, node)
        })
      }
      
      return `\n    <div class="op-frame-${node.id}"${idAttr}>${childrenHtml}\n    </div>`
    }
    
    if (node.type === 'rect') {
      const fill = node.fill || 'transparent'
      const radius = node.borderRadius ? `${node.borderRadius}px` : '0px'
      const borderCss = node.border ? `border: ${node.border.width}px solid ${node.border.color};` : ''
      cssRules.push(`
.op-rect-${node.id} {
  position: absolute;
  left: ${x}px;
  top: ${y}px;
  width: ${node.width}px;
  height: ${node.height}px;
  background: ${fill};
  border-radius: ${radius};
  ${borderCss}
  transition: all 0.2s ease-in-out;
}`)
      
      let childrenHtml = ''
      if (node.children) {
        node.children.forEach(child => {
          childrenHtml += processNode(child, node)
        })
      }

      if (node.id === 'rect-form-side') {
        childrenHtml += `\n      <p class="pm-error-msg" id="pm-login-error" aria-live="polite" style="position:absolute; left:240px; top:690px; width:360px; color:#ef4444; font-size:12px; font-weight:600; text-align:center;"></p>`
      }

      const realId = idMatch ? idMatch[1] : ''
      let innerContent = childrenHtml || node.content || ''
      let extraAttrs = ''
      
      if (realId === 'pm-login-btn') {
        innerContent = `
          <span class="pm-btn-text">Iniciar sesión</span>
          <span class="pm-btn-loader d-none">
            <span class="pm-spinner-sm"></span>
            Validando...
          </span>
        `
      } else if (realId === 'pm-toggle-password') {
        innerContent = `<i class="bi bi-eye"></i>`
      } else if (realId === 'pm-biometric-btn') {
        innerContent = `<i class="bi bi-fingerprint"></i> Usar huella o Face ID`
      } else if (realId === 'pm-register-route-link') {
        extraAttrs += ' data-route="register"'
      }

      // Inyección específica de contenido para widgets de Dribbble
      if (node.id === 'rect-glass-tabs') {
        innerContent = `
          <div class="pm-glass-tabs-container">
            <button class="pm-glass-tab active">Clases</button>
            <button class="pm-glass-tab">Alumnos</button>
            <button class="pm-glass-tab">Planificación</button>
          </div>
        `
      } else if (node.id === 'rect-glass-chart') {
        innerContent = `
          <div class="pm-glass-chart-container">
            <div class="pm-chart-header">
              <div class="pm-chart-meta">
                <span class="pm-indicator-dot dot-green"></span>
                <span class="pm-indicator-label">Progreso</span>
                <span class="pm-indicator-value">+18.4%</span>
              </div>
              <div class="pm-chart-meta">
                <span class="pm-indicator-dot dot-blue"></span>
                <span class="pm-indicator-label">Evidencias</span>
                <span class="pm-indicator-value">+42.1%</span>
              </div>
              <div class="pm-avatar-group">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=32&h=32&q=80" alt="Alumna" class="pm-avatar-img" />
                <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=32&h=32&q=80" alt="Alumno" class="pm-avatar-img" />
              </div>
            </div>
            <div class="pm-chart-svg-wrapper">
              <svg class="pm-chart-svg" viewBox="0 0 420 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chart-grad-electric" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#7c3aed" stop-opacity="0.25"/>
                    <stop offset="100%" stop-color="#7c3aed" stop-opacity="0.0"/>
                  </linearGradient>
                </defs>
                <path d="M 0 90 Q 105 85 210 50 T 420 20 L 420 120 L 0 120 Z" fill="url(#chart-grad-electric)" />
                <path d="M 0 90 Q 105 85 210 50 T 420 20" fill="none" stroke="#7c3aed" stroke-width="3" stroke-linecap="round" />
                <circle cx="420" cy="20" r="5" fill="#7c3aed" stroke="#ffffff" stroke-width="2" />
              </svg>
            </div>
            <div class="pm-chart-footer">
              <span>Abril</span>
              <span>Mayo</span>
              <span>Junio</span>
            </div>
          </div>
        `
      }

      // Si es un tag autodefinido interactivo
      if (tag === 'input') {
        return `\n      <input class="op-rect-${node.id}${extraClasses}"${idAttr}${typeAttr}${placeholderAttr} />`
      }
      if (tag === 'button') {
        return `\n      <button class="op-rect-${node.id}${extraClasses}"${idAttr}${typeAttr}>${innerContent}</button>`
      }
      if (tag === 'label') {
        return `\n      <label class="op-rect-${node.id}${extraClasses}"${idAttr}>${innerContent}</label>`
      }

      return `\n      <div class="op-rect-${node.id}${extraClasses}"${idAttr}>${innerContent}</div>`
    }
    
    if (node.type === 'text') {
      const color = node.color || '#fff'
      const size = node.fontSize || 14
      const weight = node.fontWeight || 400
      cssRules.push(`
.op-text-${node.id} {
  position: absolute;
  left: ${x}px;
  top: ${y}px;
  width: ${node.width}px;
  height: ${node.height}px;
  color: ${color};
  font-size: ${size}px;
  font-weight: ${weight};
  line-height: 1.4;
}`)
      
      const realId = idMatch ? idMatch[1] : ''
      let extraAttrs = ''
      if (realId === 'pm-register-route-link') {
        extraAttrs += ' data-route="register"'
      }

      if (tag === 'a') {
        return `\n      <a class="op-text-${node.id}${extraClasses}"${idAttr}${hrefAttr}${extraAttrs}>${node.content || ''}</a>`
      }
      if (tag === 'label') {
        return `\n      <label class="op-text-${node.id}${extraClasses}"${idAttr}>${node.content || ''}</label>`
      }

      return `\n      <div class="op-text-${node.id}${extraClasses}"${idAttr}>${node.content || ''}</div>`
    }
    
    if (node.type === 'group') {
      let childrenHtml = ''
      if (node.children) {
        node.children.forEach(child => {
          childrenHtml += processNode(child, node)
        })
      }
      return `\n      <div class="op-group-${node.id}${extraClasses}"${idAttr}>${childrenHtml}</div>`
    }
    
    return ''
  }

  let htmlResult = ''
  nodes.forEach(node => {
    htmlResult += processNode(node, null)
  })

  // Inyectar reglas responsivas de adaptabilidad premium para el login en móviles y tablets
  cssRules.push(`
/* --- Adaptabilidad Responsive (Auto-inyectado) --- */
@media (max-width: 1024px) {
  .op-frame-frame-login-screen {
    display: flex !important;
    flex-direction: column !important;
    justify-content: center !important;
    align-items: center !important;
    height: auto !important;
    min-height: 100vh !important;
    background: #f1f5f9 !important;
    padding: 20px !important;
  }
  .op-rect-rect-login-container {
    position: relative !important;
    left: auto !important;
    top: auto !important;
    width: 100% !important;
    max-width: 480px !important;
    height: auto !important;
    min-height: auto !important;
    padding: 40px 24px !important;
    margin: 0 auto !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 24px !important;
    box-sizing: border-box !important;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05) !important;
  }
  .op-rect-rect-branding-side,
  .op-rect-rect-form-side {
    display: none !important;
  }
  .op-text-text-branding-logo {
    position: relative !important;
    left: auto !important;
    top: auto !important;
    margin: 0 auto 10px auto !important;
    text-align: center !important;
    width: 64px !important;
    height: 64px !important;
    font-size: 32px !important;
    display: flex !important;
  }
  .op-text-text-card-welcome {
    position: relative !important;
    left: auto !important;
    top: auto !important;
    width: 100% !important;
    height: auto !important;
    text-align: center !important;
    margin-bottom: 5px !important;
    font-size: 24px !important;
  }
  .op-text-text-card-subtitle {
    position: relative !important;
    left: auto !important;
    top: auto !important;
    width: 100% !important;
    height: auto !important;
    text-align: center !important;
    margin-bottom: 5px !important;
  }
  .op-group-group-input-email,
  .op-group-group-input-password {
    position: relative !important;
    left: auto !important;
    top: auto !important;
    width: 100% !important;
    height: auto !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 6px !important;
  }
  .op-rect-rect-input-email,
  .op-rect-rect-input-password {
    position: relative !important;
    left: auto !important;
    top: auto !important;
    width: 100% !important;
    height: 48px !important;
    margin: 0 !important;
  }
  .op-rect-rect-btn-eye {
    position: absolute !important;
    right: 12px !important;
    top: 11px !important;
    left: auto !important;
    width: 26px !important;
    height: 26px !important;
  }
  .op-group-group-checkboxes {
    position: relative !important;
    left: auto !important;
    top: auto !important;
    width: 100% !important;
    height: auto !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 12px !important;
    margin: 5px 0 !important;
  }
  .op-rect-rect-chk-remember {
    position: relative !important;
    left: auto !important;
    top: auto !important;
    display: inline-block !important;
    margin-right: 8px !important;
    vertical-align: middle !important;
  }
  .op-text-text-lbl-remember {
    position: relative !important;
    left: auto !important;
    top: auto !important;
    display: inline-block !important;
    width: auto !important;
    height: auto !important;
    vertical-align: middle !important;
  }
  .op-text-forgot-link {
    position: relative !important;
    left: auto !important;
    top: auto !important;
    display: block !important;
    width: 100% !important;
    height: auto !important;
    margin-top: 5px !important;
  }
  .op-rect-rect-btn-login {
    position: relative !important;
    left: auto !important;
    top: auto !important;
    width: 100% !important;
    height: 48px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    margin-top: 10px !important;
  }
  .op-text-text-btn-login-label {
    display: none !important;
  }
  .op-rect-rect-btn-biometric {
    position: relative !important;
    left: auto !important;
    top: auto !important;
    width: 100% !important;
    height: 45px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }
  .op-text-text-btn-biometric-label {
    display: none !important;
  }
  .op-text-register-link {
    position: relative !important;
    left: auto !important;
    top: auto !important;
    width: 100% !important;
    height: auto !important;
    text-align: center !important;
    margin-top: 5px !important;
  }
  .pm-error-msg {
    position: relative !important;
    left: auto !important;
    top: auto !important;
    width: 100% !important;
    text-align: center !important;
    margin: 15px 0 0 0 !important;
  }
}
`)

  // Inyectar reglas personalizadas de la estética Dribbble en desktop
  cssRules.push(`
/* --- Estilos Personalizados Dribbble (Auto-inyectado) --- */
.op-rect-rect-login-container {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.04) !important;
  border: 1px solid rgba(0, 0, 0, 0.04) !important;
  display: flex !important;
}
.op-rect-rect-branding-side {
  background: #faf5ff !important;
  background-image: 
    radial-gradient(at 10% 20%, rgba(254, 243, 199, 0.4) 0px, transparent 50%),
    radial-gradient(at 90% 10%, rgba(253, 224, 71, 0.25) 0px, transparent 50%),
    radial-gradient(at 50% 80%, rgba(233, 213, 255, 0.5) 0px, transparent 50%),
    radial-gradient(at 80% 90%, rgba(219, 234, 254, 0.3) 0px, transparent 50%) !important;
  background-size: 100% 100% !important;
  position: relative !important;
  overflow: hidden !important;
}
.op-text-text-branding-logo {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  background: #7c3aed !important;
  border-radius: 50% !important;
  box-shadow: 0 10px 20px -3px rgba(124, 58, 237, 0.25) !important;
}
.op-rect-rect-glass-tabs {
  background: rgba(255, 255, 255, 0.45) !important;
  backdrop-filter: blur(20px) !important;
  -webkit-backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(255, 255, 255, 0.7) !important;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.03) !important;
}
.op-rect-rect-glass-chart {
  background: rgba(255, 255, 255, 0.45) !important;
  backdrop-filter: blur(20px) !important;
  -webkit-backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(255, 255, 255, 0.7) !important;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.03) !important;
}
.pm-glass-tabs-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  height: 100%;
  box-sizing: border-box;
  position: relative;
}
.pm-glass-tab {
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 13px;
  font-weight: 700;
  padding: 10px 20px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}
.pm-glass-tab.active {
  background: #ffffff;
  color: #0f172a;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
}
.pm-glass-chart-container {
  display: flex;
  flex-direction: column;
  padding: 24px;
  height: 100%;
  box-sizing: border-box;
  justify-content: space-between;
}
.pm-chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.pm-chart-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
}
.pm-indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.pm-indicator-dot.dot-green {
  background: #10b981;
}
.pm-indicator-dot.dot-blue {
  background: #3b82f6;
}
.pm-indicator-label {
  color: #64748b;
}
.pm-indicator-value {
  color: #0f172a;
}
.pm-avatar-group {
  display: flex;
  align-items: center;
}
.pm-avatar-img {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2.5px solid #ffffff;
  margin-left: -10px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}
.pm-avatar-img:first-child {
  margin-left: 0;
}
.pm-chart-svg-wrapper {
  flex-grow: 1;
  margin: 15px 0;
  position: relative;
}
.pm-chart-svg {
  width: 100%;
  height: 100%;
}
.pm-chart-footer {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  padding-top: 5px;
}
.op-rect-rect-btn-login:hover {
  background: #a3e635 !important;
  transform: translateY(-1px);
  box-shadow: 0 10px 15px -3px rgba(163, 230, 53, 0.15) !important;
}
.op-rect-rect-btn-biometric:hover {
  background: #f8fafc !important;
  border-color: #94a3b8 !important;
}
.op-rect-rect-input-email:focus,
.op-rect-rect-input-password:focus {
  border-color: #7c3aed !important;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.15) !important;
  outline: none !important;
}
`)

  const outputContent = `/**
 * AUTO-GENERATED TEMPLATE FROM OPENPENCIL DESIGN
 * DO NOT EDIT THIS FILE DIRECTLY.
 * Source: ${path.basename(opFilePath)}
 */

export const templateHtml = \`${htmlResult.trim()}\`

export const templateCss = \`${cssRules.join('\n').trim()}\`
`

  fs.writeFileSync(outputJsPath, outputContent, 'utf8')
  console.log(`[Compiler] Éxito: Diseño compiled a ${outputJsPath}`)
}

// Ejecutar compilación directa si el script es invocado desde la terminal
const args = process.argv.slice(2)
if (args.length >= 2) {
  compileOpToJs(args[0], args[1])
}
