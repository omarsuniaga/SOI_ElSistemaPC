import { createAiService } from '../services/aiService.js'

let aiService = null

/**
 * renderChatWidget - Sistema de asistencia por chat inteligente.
 * @param {HTMLElement} container 
 */
export async function renderChatWidget(container) {
  try {
    aiService = await createAiService()
  } catch (e) {
    console.warn('AI service no disponible:', e.message)
  }

  // 1. Botón toggle flotante
  const toggleBtn = document.createElement('button')
  toggleBtn.className = 'pm-chat-toggle'
  toggleBtn.id = 'pm-chat-toggle'
  toggleBtn.innerHTML = '💬'
  toggleBtn.title = 'Abrir asistente IA'
  container.appendChild(toggleBtn)

  // 2. Contenedor de Chat
  const chatContainer = document.createElement('div')
  chatContainer.id = 'pm-chat-container'
  chatContainer.className = 'pm-chat-container'
  chatContainer.innerHTML = `
    <div class="pm-chat-header">
      <span class="pm-chat-title">🤖 Asistente IA</span>
      <button class="pm-chat-close" id="pm-chat-close">&times;</button>
    </div>
    <div class="pm-chat-messages" id="pm-chat-messages">
      <div class="pm-message pm-message-ai">
        <div class="pm-message-content">
          👋 <strong>Hola!</strong> Soy el asistente del Sistema Académico SOI.
          <br><br>
          Puedo ayudarte con:
          <ul>
            <li>Información sobre el sistema</li>
            <li>Cómo usar las diferentes funciones</li>
            <li>Analizar progreso de estudiantes</li>
          </ul>
          ¿En qué puedo ayudarte?
        </div>
      </div>
    </div>
    <div class="pm-chat-input-container">
      <input type="text" id="pm-chat-input" placeholder="Escribe tu pregunta..." class="pm-chat-input" autocomplete="off">
      <button id="pm-chat-send" class="pm-chat-send">➤</button>
    </div>
  `
  container.appendChild(chatContainer)

  const messagesDiv = chatContainer.querySelector('#pm-chat-messages')
  const input = chatContainer.querySelector('#pm-chat-input')
  const sendBtn = chatContainer.querySelector('#pm-chat-send')
  const closeBtn = chatContainer.querySelector('#pm-chat-close')

  function addMessage(content, isUser = false) {
    const msgDiv = document.createElement('div')
    msgDiv.className = `pm-message pm-message-${isUser ? 'user' : 'ai'} mb-2`
    msgDiv.innerHTML = `<div class="pm-message-content">${content}</div>`
    messagesDiv.appendChild(msgDiv)
    messagesDiv.scrollTop = messagesDiv.scrollHeight
  }

  async function sendMessage() {
    const text = input.value.trim()
    if (!text) return

    addMessage(text, true)
    input.value = ''

    if (!aiService) {
      addMessage('⚠️ El servicio de IA no está configurado. Ve a Sistema → Configuración para agregar tu API key.')
      return
    }

    const loadingDiv = document.createElement('div')
    loadingDiv.className = 'pm-message pm-message-ai mb-2'
    loadingDiv.innerHTML = '<div class="pm-message-content pm-loading"><div class="spinner-border spinner-border-sm me-2" role="status"></div> Escribiendo...</div>'
    messagesDiv.appendChild(loadingDiv)
    messagesDiv.scrollTop = messagesDiv.scrollHeight

    try {
      const response = await aiService.chat(text)
      loadingDiv.remove()
      addMessage(response)
    } catch (err) {
      loadingDiv.remove()
      addMessage(`❌ Error: ${err.message}`)
    }
  }

  toggleBtn.addEventListener('click', () => {
    chatContainer.classList.toggle('pm-chat-open')
    toggleBtn.style.display = chatContainer.classList.contains('pm-chat-open') ? 'none' : 'block'
    if (chatContainer.classList.contains('pm-chat-open')) {
      input.focus()
    }
  })

  closeBtn.addEventListener('click', () => {
    chatContainer.classList.remove('pm-chat-open')
    toggleBtn.style.display = 'block'
  })

  sendBtn.addEventListener('click', sendMessage)
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage()
  })
}
