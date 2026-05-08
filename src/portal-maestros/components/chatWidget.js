import { createAiService } from '../services/aiService.js'

let aiService = null

export async function renderChatWidget(container) {
  try {
    aiService = await createAiService()
  } catch (e) {
    console.warn('AI service no disponible:', e.message)
  }

  const toggleBtn = document.createElement('button')
  toggleBtn.className = 'pm-chat-toggle'
  toggleBtn.id = 'pm-chat-toggle'
  toggleBtn.innerHTML = '💬'
  toggleBtn.title = 'Abrir asistente IA'
  container.appendChild(toggleBtn)

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
      <input type="text" id="pm-chat-input" placeholder="Escribe tu pregunta..." class="pm-chat-input">
      <button id="pm-chat-send" class="pm-chat-send">➤</button>
    </div>
  `
  container.appendChild(chatContainer)

  const messagesDiv = document.getElementById('pm-chat-messages')
  const input = document.getElementById('pm-chat-input')
  const sendBtn = document.getElementById('pm-chat-send')
  const toggle = document.getElementById('pm-chat-toggle')
  const closeBtn = document.getElementById('pm-chat-close')

  function addMessage(content, isUser = false) {
    const msgDiv = document.createElement('div')
    msgDiv.className = `pm-message pm-message-${isUser ? 'user' : 'ai'}`
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
    loadingDiv.className = 'pm-message pm-message-ai'
    loadingDiv.innerHTML = '<div class="pm-message-content pm-loading"><div class="pm-spinner-small"></div> Escribiendo...</div>'
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

  toggle.addEventListener('click', () => {
    chatContainer.classList.toggle('pm-chat-open')
    toggle.style.display = chatContainer.classList.contains('pm-chat-open') ? 'none' : 'block'
    if (chatContainer.classList.contains('pm-chat-open')) {
      input.focus()
    }
  })

  closeBtn.addEventListener('click', () => {
    chatContainer.classList.remove('pm-chat-open')
    toggle.style.display = 'block'
  })

  sendBtn.addEventListener('click', sendMessage)
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage()
  })
}
  <div class="pm-chat-header">
    <span class="pm-chat-title">🤖 Asistente IA</span>
    <button class="pm-chat-close" id="pm-chat-close">&times;</button>
  </div>
  <div class="pm-chat-messages" id="pm-chat-messages">
    <div class="pm-message pm-message-ai">
      <div class="pm-message-content">
        👋 Hola! Soy el asistente del Sistema Académico SOI. 
        <br><br>
        Puedo ayudarte con:
        <ul>
          <li>Información sobre el sistema</li>
          <li>Cómo usar las diferentes funciones</li>
          <li>Datos de tus estudiantes (usando "Analizar Progreso")</li>
        </ul>
        ¿En qué puedo ayudarte?
      </div>
    </div>
  </div>
  <div class="pm-chat-input-container">
    <input type="text" id="pm-chat-input" placeholder="Escribe tu pregunta..." class="pm-chat-input">
    <button id="pm-chat-send" class="pm-chat-send">➤</button>
  </div>
</div>

<style>
.pm-chat-container {
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 360px;
  max-width: calc(100vw - 40px);
  background: var(--pm-bg, #fff);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
  z-index: 9999;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  display: none;
  overflow: hidden;
}

.pm-chat-container.pm-chat-open {
  display: flex;
  flex-direction: column;
  max-height: 500px;
}

.pm-chat-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 14px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pm-chat-title {
  font-weight: 600;
  font-size: 15px;
}

.pm-chat-close {
  background: none;
  border: none;
  color: white;
  font-size: 22px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.pm-chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 200px;
  max-height: 320px;
}

.pm-message {
  display: flex;
  flex-direction: column;
}

.pm-message-ai {
  align-items: flex-start;
}

.pm-message-user {
  align-items: flex-end;
}

.pm-message-content {
  max-width: 85%;
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
}

.pm-message-ai .pm-message-content {
  background: #f0f2f5;
  color: #1a1a1a;
  border-bottom-left-radius: 4px;
}

.pm-message-user .pm-message-content {
  background: #667eea;
  color: white;
  border-bottom-right-radius: 4px;
}

.pm-message-user .pm-message-content ul {
  margin: 8px 0 0 0;
  padding-left: 18px;
}

.pm-chat-input-container {
  display: flex;
  padding: 12px;
  border-top: 1px solid #eee;
  gap: 8px;
}

.pm-chat-input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.pm-chat-input:focus {
  border-color: #667eea;
}

.pm-chat-send {
  background: #667eea;
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.2s;
}

.pm-chat-send:hover {
  background: #5a6fd6;
}

.pm-chat-toggle {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  font-size: 26px;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
  z-index: 9998;
  transition: transform 0.2s;
}

.pm-chat-toggle:hover {
  transform: scale(1.05);
}

.pm-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #888;
  font-size: 13px;
  padding: 8px 0;
}

.pm-spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid #ddd;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: pm-spin 0.8s linear infinite;
}

@keyframes pm-spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 480px) {
  .pm-chat-container {
    bottom: 70px;
    right: 10px;
    left: 10px;
    width: auto;
  }
  
  .pm-chat-toggle {
    right: 15px;
    bottom: 15px;
  }
}
</style>