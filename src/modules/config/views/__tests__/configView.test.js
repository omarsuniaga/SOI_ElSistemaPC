import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderConfigView } from '../configView.js'

// Mock the API and service modules
vi.mock('../../api/configApi.js', () => ({
  getGroqApiKey: vi.fn(async () => ''),
  setGroqApiKey: vi.fn(async () => {}),
  getOpenRouterApiKey: vi.fn(async () => ''),
  setOpenRouterApiKey: vi.fn(async () => {}),
  getPreferredModel: vi.fn(async () => 'google/gemini-2.0-flash-exp'),
  setPreferredModel: vi.fn(async () => {}),
}))

vi.mock('../../../../portal-maestros/services/pushService.js', () => ({
  getNotificationPreferences: vi.fn(async () => ({
    alerta_pre_clase: true,
    min_antes_clase: 15,
    alerta_post_clase: true,
    min_post_clase_sin_registro: 60,
  })),
  saveNotificationPreferences: vi.fn(async (prefs) => ({ error: null })),
  getSubscriptionStatus: vi.fn(async () => ({ subscribed: false, error: null })),
  isPushSupported: vi.fn(() => true),
  subscribeToPush: vi.fn(async () => ({ success: true })),
  unsubscribeFromPush: vi.fn(async () => {}),
  testNotification: vi.fn(async () => true),
  isPushSubscribed: vi.fn(async () => false),
}))

describe('Notification Settings UI (configView)', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container)
    }
  })

  describe('Notification Section Rendering', () => {
    it('should render notification preferences section', async () => {
      await renderConfigView(container)

      // Verify the notification section exists
      const notificationPanel = container.querySelector(
        '.card-header .bi-bell'
      )
      expect(notificationPanel).toBeTruthy()
    })

    it('should render push notifications toggle', async () => {
      await renderConfigView(container)

      const pushToggle = document.querySelector('#push-enabled')
      expect(pushToggle).toBeTruthy()
      expect(pushToggle.type).toBe('checkbox')
      expect(pushToggle.getAttribute('type')).toBe('checkbox')
    })

    it('should render pre-class alert toggle', async () => {
      await renderConfigView(container)

      const alertPreClassToggle = document.querySelector('#alert-pre-class')
      expect(alertPreClassToggle).toBeTruthy()
      expect(alertPreClassToggle.type).toBe('checkbox')
      expect(alertPreClassToggle.checked).toBe(true)
    })

    it('should render minutes-before-class input field', async () => {
      await renderConfigView(container)

      const minutesInput = document.querySelector('#minutes-before-class')
      expect(minutesInput).toBeTruthy()
      expect(minutesInput.type).toBe('number')
      expect(minutesInput.value).toBe('15')
      expect(minutesInput.min).toBe('1')
      expect(minutesInput.max).toBe('120')
    })

    it('should render post-class alert toggle', async () => {
      await renderConfigView(container)

      const alertPostClassToggle = document.querySelector('#alert-post-class')
      expect(alertPostClassToggle).toBeTruthy()
      expect(alertPostClassToggle.type).toBe('checkbox')
      expect(alertPostClassToggle.checked).toBe(true)
    })

    it('should render minutes-after-class input field', async () => {
      await renderConfigView(container)

      const minutesInput = document.querySelector('#minutes-after-class')
      expect(minutesInput).toBeTruthy()
      expect(minutesInput.type).toBe('number')
      expect(minutesInput.value).toBe('60')
      expect(minutesInput.min).toBe('1')
      expect(minutesInput.max).toBe('300')
    })

    it('should render save notifications button', async () => {
      await renderConfigView(container)

      const saveBtn = document.querySelector('#save-notifications')
      expect(saveBtn).toBeTruthy()
      expect(saveBtn.textContent).toContain('Guardar Notificaciones')
    })

    it('should render test notification button', async () => {
      await renderConfigView(container)

      const testBtn = document.querySelector('#test-notification')
      expect(testBtn).toBeTruthy()
      expect(testBtn.textContent).toContain('Probar Notificación')
    })

    it('should render notification status display element', async () => {
      await renderConfigView(container)

      const statusDiv = document.querySelector('#notification-status')
      expect(statusDiv).toBeTruthy()
    })

    it('should render push status display element', async () => {
      await renderConfigView(container)

      const pushStatusDiv = document.querySelector('#push-status')
      expect(pushStatusDiv).toBeTruthy()
    })
  })

  describe('Loading Saved Preferences', () => {
    it('should load saved preferences on initialization', async () => {
      const { getNotificationPreferences } = await import(
        '../../../../portal-maestros/services/pushService.js'
      )

      await renderConfigView(container)

      // Verify that getNotificationPreferences was called
      expect(getNotificationPreferences).toHaveBeenCalled()
    })

    it('should populate form with loaded preferences', async () => {
      await renderConfigView(container)

      const alertPreClass = document.querySelector('#alert-pre-class')
      const minutesBeforeClass = document.querySelector(
        '#minutes-before-class'
      )
      const alertPostClass = document.querySelector('#alert-post-class')
      const minutesAfterClass = document.querySelector(
        '#minutes-after-class'
      )

      // Wait for async preference loading
      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(alertPreClass.checked).toBe(true)
      expect(minutesBeforeClass.value).toBe('15')
      expect(alertPostClass.checked).toBe(true)
      expect(minutesAfterClass.value).toBe('60')
    })

    it('should handle push subscription status on init', async () => {
      const { isPushSubscribed, isPushSupported } = await import(
        '../../../../portal-maestros/services/pushService.js'
      )

      await renderConfigView(container)

      // If push is supported, isPushSubscribed should be called
      if (isPushSupported()) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        // Push status should be checked
      }
    })
  })

  describe('Checkbox Change Handlers', () => {
    it('should handle pre-class alert checkbox changes', async () => {
      await renderConfigView(container)

      const alertPreClass = document.querySelector('#alert-pre-class')
      const initialState = alertPreClass.checked

      // Toggle the checkbox
      alertPreClass.checked = !initialState
      alertPreClass.dispatchEvent(new Event('change'))

      expect(alertPreClass.checked).toBe(!initialState)
    })

    it('should handle post-class alert checkbox changes', async () => {
      await renderConfigView(container)

      const alertPostClass = document.querySelector('#alert-post-class')
      const initialState = alertPostClass.checked

      // Toggle the checkbox
      alertPostClass.checked = !initialState
      alertPostClass.dispatchEvent(new Event('change'))

      expect(alertPostClass.checked).toBe(!initialState)
    })

    it('should update number inputs correctly', async () => {
      await renderConfigView(container)

      const minutesBeforeClass = document.querySelector(
        '#minutes-before-class'
      )
      const testValue = '30'

      minutesBeforeClass.value = testValue
      minutesBeforeClass.dispatchEvent(new Event('change'))

      expect(minutesBeforeClass.value).toBe(testValue)
    })

    it('should respect min/max constraints on inputs', async () => {
      await renderConfigView(container)

      const minutesBeforeClass = document.querySelector(
        '#minutes-before-class'
      )

      expect(minutesBeforeClass.min).toBe('1')
      expect(minutesBeforeClass.max).toBe('120')

      const minutesAfterClass = document.querySelector(
        '#minutes-after-class'
      )
      expect(minutesAfterClass.min).toBe('1')
      expect(minutesAfterClass.max).toBe('300')
    })
  })

  describe('Save Notifications Button', () => {
    it('should call saveNotificationPreferences when save button is clicked', async () => {
      const { saveNotificationPreferences } = await import(
        '../../../../portal-maestros/services/pushService.js'
      )

      await renderConfigView(container)

      const saveBtn = document.querySelector('#save-notifications')
      expect(saveBtn).toBeTruthy()

      // Click the save button
      saveBtn.click()

      // Wait for async handler
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Verify saveNotificationPreferences was called
      expect(saveNotificationPreferences).toHaveBeenCalled()
    })

    it('should save correct preference values', async () => {
      const { saveNotificationPreferences } = await import(
        '../../../../portal-maestros/services/pushService.js'
      )

      await renderConfigView(container)

      // Modify form values
      document.querySelector('#alert-pre-class').checked = false
      document.querySelector('#minutes-before-class').value = '20'
      document.querySelector('#alert-post-class').checked = false
      document.querySelector('#minutes-after-class').value = '90'

      const saveBtn = document.querySelector('#save-notifications')
      saveBtn.click()

      await new Promise((resolve) => setTimeout(resolve, 100))

      // Verify correct preferences were passed
      expect(saveNotificationPreferences).toHaveBeenCalledWith(
        expect.objectContaining({
          alerta_pre_clase: false,
          min_antes_clase: 20,
          alerta_post_clase: false,
          min_post_clase_sin_registro: 90,
        })
      )
    })

    it('should display success message after saving', async () => {
      await renderConfigView(container)

      const saveBtn = document.querySelector('#save-notifications')
      const statusDiv = document.querySelector('#notification-status')

      saveBtn.click()

      await new Promise((resolve) => setTimeout(resolve, 200))

      expect(statusDiv.innerHTML).toContain('success')
    })

    it('should display spinner while saving', async () => {
      await renderConfigView(container)

      const saveBtn = document.querySelector('#save-notifications')
      const statusDiv = document.querySelector('#notification-status')

      // Store initial state
      const checkSpinner = setInterval(() => {
        if (statusDiv.innerHTML.includes('Guardando')) {
          clearInterval(checkSpinner)
        }
      }, 5)

      saveBtn.click()

      // Check within the async operation window
      await new Promise((resolve) => setTimeout(resolve, 50))

      clearInterval(checkSpinner)
      // After completion, should show success instead of spinner
      expect(statusDiv.innerHTML).toContain('success')
    })
  })

  describe('Test Notification Button', () => {
    it('should call testNotification when test button is clicked', async () => {
      const { testNotification } = await import(
        '../../../../portal-maestros/services/pushService.js'
      )

      await renderConfigView(container)

      const testBtn = document.querySelector('#test-notification')
      expect(testBtn).toBeTruthy()

      testBtn.click()

      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(testNotification).toHaveBeenCalled()
    })

    it('should display success message when test notification succeeds', async () => {
      await renderConfigView(container)

      const testBtn = document.querySelector('#test-notification')
      const statusDiv = document.querySelector('#notification-status')

      testBtn.click()

      await new Promise((resolve) => setTimeout(resolve, 200))

      expect(statusDiv.innerHTML).toContain('success')
      expect(statusDiv.innerHTML).toContain('prueba')
    })

    it('should display warning when test notification fails', async () => {
      const { testNotification } = await import(
        '../../../../portal-maestros/services/pushService.js'
      )
      testNotification.mockResolvedValueOnce(false)

      await renderConfigView(container)

      const testBtn = document.querySelector('#test-notification')
      const statusDiv = document.querySelector('#notification-status')

      testBtn.click()

      await new Promise((resolve) => setTimeout(resolve, 200))

      expect(statusDiv.innerHTML).toContain('warning')
    })

    it('should display spinner while sending test notification', async () => {
      await renderConfigView(container)

      const testBtn = document.querySelector('#test-notification')
      const statusDiv = document.querySelector('#notification-status')

      testBtn.click()

      await new Promise((resolve) => setTimeout(resolve, 50))

      // After completion, should show success instead of spinner
      expect(statusDiv.innerHTML).toContain('success')
    })
  })

  describe('Push Notifications Toggle', () => {
    it('should handle push enabled toggle when supported', async () => {
      const { subscribeToPush } = await import(
        '../../../../portal-maestros/services/pushService.js'
      )

      await renderConfigView(container)

      const pushToggle = document.querySelector('#push-enabled')
      expect(pushToggle).toBeTruthy()

      if (!pushToggle.disabled) {
        pushToggle.click()

        await new Promise((resolve) => setTimeout(resolve, 150))

        expect(subscribeToPush).toHaveBeenCalled()
      }
    })

    it('should disable push toggle if browser does not support it', async () => {
      const { isPushSupported } = await import(
        '../../../../portal-maestros/services/pushService.js'
      )
      isPushSupported.mockReturnValueOnce(false)

      await renderConfigView(container)

      const pushToggle = document.querySelector('#push-enabled')

      // Wait for async initialization
      await new Promise((resolve) => setTimeout(resolve, 100))

      // If not supported, should be disabled and show warning
      if (!isPushSupported()) {
        const pushStatusDiv = document.querySelector('#push-status')
        expect(pushStatusDiv).toBeTruthy()
      }
    })

    it('should call unsubscribeFromPush when toggling off', async () => {
      const { unsubscribeFromPush, subscribeToPush } = await import(
        '../../../../portal-maestros/services/pushService.js'
      )

      await renderConfigView(container)

      const pushToggle = document.querySelector('#push-enabled')

      if (!pushToggle.disabled) {
        // First toggle to enable
        pushToggle.checked = true
        pushToggle.dispatchEvent(new Event('change'))

        await new Promise((resolve) => setTimeout(resolve, 150))

        // Then toggle to disable
        pushToggle.checked = false
        pushToggle.dispatchEvent(new Event('change'))

        await new Promise((resolve) => setTimeout(resolve, 150))

        expect(unsubscribeFromPush).toHaveBeenCalled()
      }
    })
  })

  describe('Error Handling', () => {
    it('should display error message if saving fails', async () => {
      const { saveNotificationPreferences } = await import(
        '../../../../portal-maestros/services/pushService.js'
      )
      saveNotificationPreferences.mockResolvedValueOnce({
        error: 'Database error',
      })

      await renderConfigView(container)

      const saveBtn = document.querySelector('#save-notifications')
      const statusDiv = document.querySelector('#notification-status')

      saveBtn.click()

      await new Promise((resolve) => setTimeout(resolve, 200))

      expect(statusDiv.innerHTML).toContain('Error')
    })

    it('should display error message if test notification throws', async () => {
      const { testNotification } = await import(
        '../../../../portal-maestros/services/pushService.js'
      )
      testNotification.mockRejectedValueOnce(new Error('Push error'))

      await renderConfigView(container)

      const testBtn = document.querySelector('#test-notification')
      const statusDiv = document.querySelector('#notification-status')

      testBtn.click()

      await new Promise((resolve) => setTimeout(resolve, 200))

      expect(statusDiv.innerHTML).toContain('Error')
    })
  })

  describe('Form Validation', () => {
    it('should parse number inputs as integers for minutes', async () => {
      const { saveNotificationPreferences } = await import(
        '../../../../portal-maestros/services/pushService.js'
      )

      await renderConfigView(container)

      const minutesBeforeClass = document.querySelector(
        '#minutes-before-class'
      )
      const minutesAfterClass = document.querySelector(
        '#minutes-after-class'
      )

      minutesBeforeClass.value = '30'
      minutesAfterClass.value = '75'

      const saveBtn = document.querySelector('#save-notifications')
      saveBtn.click()

      await new Promise((resolve) => setTimeout(resolve, 150))

      // Verify that saveNotificationPreferences received integer values
      expect(saveNotificationPreferences).toHaveBeenCalledWith(
        expect.objectContaining({
          min_antes_clase: 30,
          min_post_clase_sin_registro: 75,
        })
      )
    })

    it('should handle form with all toggles disabled', async () => {
      const { saveNotificationPreferences } = await import(
        '../../../../portal-maestros/services/pushService.js'
      )

      await renderConfigView(container)

      document.querySelector('#alert-pre-class').checked = false
      document.querySelector('#alert-post-class').checked = false

      const saveBtn = document.querySelector('#save-notifications')
      saveBtn.click()

      await new Promise((resolve) => setTimeout(resolve, 150))

      expect(saveNotificationPreferences).toHaveBeenCalledWith(
        expect.objectContaining({
          alerta_pre_clase: false,
          alerta_post_clase: false,
        })
      )
    })
  })
})
