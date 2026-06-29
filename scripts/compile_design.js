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
  
  function processNode(node, parentFrame = null) {
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
    if (parentFrame) {
      x = node.x - parentFrame.x
      y = node.y - parentFrame.y
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
  box-shadow: 0 10px 30px rgba(0,0,0,0.25);
  margin: 0 auto;
}`)
      
      let childrenHtml = ''
      if (node.children) {
        node.children.forEach(child => {
          childrenHtml += processNode(child, node)
        })
      }
      
      const realId = idMatch ? idMatch[1] : ''
      if (realId === 'frame-login-screen' || node.id === 'frame-login-screen') {
        childrenHtml += `\n      <p class="pm-error-msg" id="pm-login-error" aria-live="polite" style="position:absolute; left:900px; top:690px; width:360px; color:#ef4444; font-size:12px; font-weight:600;"></p>`
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
          childrenHtml += processNode(child, parentFrame)
        })
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
          childrenHtml += processNode(child, parentFrame)
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
    height: 100vh !important;
    min-height: 100vh !important;
    background: #0f172a !important;
    padding: 20px !important;
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
    width: auto !important;
    height: auto !important;
    font-size: 48px !important;
    display: block !important;
  }
  .op-text-text-branding-title {
    position: relative !important;
    left: auto !important;
    top: auto !important;
    margin: 0 auto 5px auto !important;
    text-align: center !important;
    width: auto !important;
    height: auto !important;
    font-size: 28px !important;
    font-weight: 800 !important;
    display: block !important;
  }
  .op-text-text-branding-subtitle {
    position: relative !important;
    left: auto !important;
    top: auto !important;
    margin: 0 auto 20px auto !important;
    text-align: center !important;
    width: auto !important;
    height: auto !important;
    font-size: 13px !important;
    color: rgba(255, 255, 255, 0.6) !important;
    display: block !important;
  }
  .op-rect-rect-login-card {
    position: relative !important;
    left: auto !important;
    top: auto !important;
    width: 100% !important;
    max-width: 460px !important;
    height: auto !important;
    min-height: auto !important;
    padding: 40px !important;
    margin: 0 auto !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 20px !important;
    box-sizing: border-box !important;
  }
  .op-text-text-card-title {
    position: relative !important;
    left: auto !important;
    top: auto !important;
    width: 100% !important;
    height: auto !important;
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
  .op-text-text-label-email,
  .op-text-text-label-password {
    position: relative !important;
    left: auto !important;
    top: auto !important;
    width: auto !important;
    height: auto !important;
  }
  .op-rect-rect-input-email,
  .op-rect-rect-input-password {
    position: relative !important;
    left: auto !important;
    top: auto !important;
    width: 100% !important;
    height: 45px !important;
    margin: 0 !important;
  }
  .op-rect-rect-btn-eye {
    position: absolute !important;
    right: 12px !important;
    top: 31px !important;
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
  .op-rect-rect-chk-remember,
  .op-rect-rect-chk-keep {
    position: relative !important;
    left: auto !important;
    top: auto !important;
    display: inline-block !important;
    margin-right: 8px !important;
    vertical-align: middle !important;
  }
  .op-text-text-lbl-remember,
  .op-text-text-lbl-keep {
    position: relative !important;
    left: auto !important;
    top: auto !important;
    display: inline-block !important;
    width: auto !important;
    height: auto !important;
    vertical-align: middle !important;
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
    height: 42px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }
  .op-text-text-btn-biometric-label {
    display: none !important;
  }
  .op-text-text-register-link {
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
    margin: 5px 0 !important;
  }
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

  const dir = path.dirname(outputJsPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  fs.writeFileSync(outputJsPath, outputContent, 'utf8')
  console.log(`[Compiler] Éxito: Diseño compiled a ${outputJsPath}`)
}

const argv = process.argv
if (argv[1] && argv[1].endsWith('compile_design.js')) {
  const args = argv.slice(2)
  if (args.length < 2) {
    console.log('Uso: node scripts/compile_design.js <path_to_op_file> <path_to_output_js>')
    process.exit(1)
  }
  compileOpToJs(args[0], args[1])
}
