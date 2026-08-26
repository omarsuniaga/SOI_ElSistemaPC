/**
 * theme-init.js — Aplica el tema claro/oscuro del Portal FIN antes del primer
 * render, para evitar el parpadeo de tema. Vive en un archivo externo (no
 * inline en fin.html) porque el CSP del proyecto no permite script-src
 * inline sin nonce/hash — un <script> inline aquí queda bloqueado en
 * silencio y el tema nunca se aplica.
 */
;(() => {
  const saved = localStorage.getItem('fin-theme')
  const dark =
    saved === 'dark' || (saved === null && matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.dataset.finTheme = dark ? 'dark' : 'light'
  document.documentElement.dataset.bsTheme = dark ? 'dark' : 'light'
})()
