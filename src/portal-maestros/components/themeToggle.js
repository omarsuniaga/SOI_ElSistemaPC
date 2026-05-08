/**
 * Theme Toggle Component - Portal Maestros
 * Maneja el cambio entre tema claro y oscuro con persistencia
 */
export class ThemeToggle {
  constructor() {
    this.storageKey = 'portal-maestros-theme'
    this.init()
  }

  init() {
    // Cargar tema guardado o detectar preferencia del sistema
    const savedTheme = localStorage.getItem(this.storageKey)
    const systemPrefers = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    
    this.currentTheme = savedTheme || systemPrefers
    this.applyTheme(this.currentTheme)
    
    // Escuchar cambios en preferencias del sistema
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(this.storageKey)) {
        this.currentTheme = e.matches ? 'dark' : 'light'
        this.applyTheme(this.currentTheme)
      }
    })
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-bs-theme', theme)
    document.documentElement.setAttribute('data-portal-theme', theme)
    
    // Actualizar variables CSS personalizadas si es necesario
    this.updateCustomProperties(theme)
  }

  updateCustomProperties(theme) {
    const root = document.documentElement
    
    if (theme === 'dark') {
      root.style.setProperty('--pm-glass-bg', 'rgba(30, 41, 59, 0.8)')
      root.style.setProperty('--pm-glass-border', 'rgba(255, 255, 255, 0.1)')
      root.style.setProperty('--pm-header-glass', 'rgba(15, 23, 42, 0.95)')
    } else {
      root.style.setProperty('--pm-glass-bg', 'rgba(255, 255, 255, 0.8)')
      root.style.setProperty('--pm-glass-border', 'rgba(0, 0, 0, 0.1)')
      root.style.setProperty('--pm-header-glass', 'rgba(242, 242, 247, 0.95)')
    }
  }

  toggle() {
    this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark'
    this.applyTheme(this.currentTheme)
    localStorage.setItem(this.storageKey, this.currentTheme)
    
    // Disparar evento para que otros componentes sepan del cambio
    window.dispatchEvent(new CustomEvent('themeChanged', { 
      detail: { theme: this.currentTheme } 
    }))
  }

  getCurrentTheme() {
    return this.currentTheme
  }

  // Crear botón de toggle con diseño mejorado
  createToggleButton() {
    const button = document.createElement('button')
    button.className = 'pm-theme-toggle'
    button.setAttribute('aria-label', 'Cambiar tema')
    button.innerHTML = `
      <div class="pm-theme-toggle-track">
        <div class="pm-theme-toggle-thumb">
          <i class="bi ${this.currentTheme === 'dark' ? 'bi-moon-fill' : 'bi-sun-fill'} pm-theme-icon"></i>
        </div>
      </div>
    `

    button.addEventListener('click', () => {
      this.toggle()
      this.updateButtonIcon(button)
    })

    // Escuchar cambios de tema para actualizar el ícono
    window.addEventListener('themeChanged', () => {
      this.updateButtonIcon(button)
    })

    return button
  }

  updateButtonIcon(button) {
    const icon = button.querySelector('.pm-theme-icon')
    if (icon) {
      icon.className = `bi ${this.currentTheme === 'dark' ? 'bi-moon-fill' : 'bi-sun-fill'} pm-theme-icon`
    }
  }
}

// Instancia global
export const themeToggle = new ThemeToggle()
