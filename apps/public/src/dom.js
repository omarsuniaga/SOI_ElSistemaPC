/** dom.js — constructor de nodos sin innerHTML: el contenido de la base de datos solo entra como texto. */
export function h(tag, props = {}, ...children) {
  const el = document.createElement(tag)
  for (const [k, v] of Object.entries(props ?? {})) {
    if (v === false || v == null) continue
    if (k === 'class') el.className = v
    else if (k === 'text') el.textContent = v
    else el.setAttribute(k, v === true ? '' : String(v))
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue
    el.append(c.nodeType ? c : document.createTextNode(String(c)))
  }
  return el
}

export const formatDate = (iso) =>
  iso ? new Date(`${iso}T00:00:00`).toLocaleDateString('es-DO', { year: 'numeric', month: 'long', day: 'numeric' }) : ''
