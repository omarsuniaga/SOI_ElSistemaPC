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
