/**
 * Pinia store for progresos (progress) state
 * Manages dashboard data, student progress, and history caching
 */

import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'
import * as progresosApi from '../api/progresosApi.js'

export const useProgresosStore = defineStore('progresos', () => {
  // State
  const currentClaseId = ref(null)
  const currentPeriodoId = ref(null)
  const dashboardRows = ref([])
  const progressByAlumno = reactive(new Map())
  const historyByAlumno = reactive(new Map())
  const selectedAlumnoId = ref(null)
  const isPanelOpen = ref(false)

  // Computed
  const selectedProgress = computed(() => {
    return selectedAlumnoId.value ? progressByAlumno.get(selectedAlumnoId.value) : null
  })

  // Actions
  async function loadDashboard(claseId = currentClaseId.value, periodoId = currentPeriodoId.value) {
    if (!claseId) return

    currentClaseId.value = claseId
    currentPeriodoId.value = periodoId

    try {
      // Get list of students for this clase/periodo (simplified - in real app would fetch from API)
      const alumnoIds = [] // This would be populated from the clase/periodo data

      if (alumnoIds.length === 0) {
        dashboardRows.value = []
        return
      }

      // Fetch progress batch for all students in this clase
      const progressMap = await progresosApi.getStudentProgressBatch(alumnoIds, {
        claseId,
        periodoId,
        from: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0],
      })

      // Cache the progress data
      progressMap.forEach((progress, alumnoId) => {
        progressByAlumno.set(alumnoId, progress)
      })

      // Transform to DashboardRow format
      dashboardRows.value = Array.from(progressMap.values()).map(progress => {
        const estado_riesgo =
          progress.indicators.total === 0 &&
          progress.grades.count === 0 &&
          progress.attendance.total === 0
            ? 'sin_datos'
            : progress.risk.en_riesgo
            ? 'en_riesgo'
            : 'ok'

        return {
          alumnoId: progress.alumnoId,
          nombre: progress.alumnoId, // In real app would fetch from alumno record
          asistencia_pct:
            progress.attendance.rate !== null
              ? Math.round(progress.attendance.rate * 100) + '%'
              : null,
          promedio_notas:
            progress.grades.promedio !== null
              ? progress.grades.promedio.toFixed(2)
              : null,
          prom_indicadores_pct:
            progress.indicators.pass_rate !== null
              ? Math.round(progress.indicators.pass_rate * 100) + '%'
              : null,
          estado_riesgo,
          risk_reasons: progress.risk.risk_reasons,
        }
      })
    } catch (error) {
      console.error('Error loading dashboard:', error)
      dashboardRows.value = []
    }
  }

  function openPanel(alumnoId) {
    selectedAlumnoId.value = alumnoId
    isPanelOpen.value = true
    // Note: reuses already-fetched DTO from cache (progressByAlumno)
    // No separate API call
  }

  function closePanel() {
    isPanelOpen.value = false
    selectedAlumnoId.value = null
  }

  async function loadHistory(alumnoId, window, granularity = 'week') {
    try {
      const key = `${alumnoId}:${granularity}`
      const result = await progresosApi.getProgressHistory({
        alumnoIds: [alumnoId],
        from: window.from,
        to: window.to,
        granularity,
      })
      historyByAlumno.set(key, result.get(alumnoId))
    } catch (error) {
      console.error('Error loading history:', error)
    }
  }

  return {
    // State
    currentClaseId,
    currentPeriodoId,
    dashboardRows,
    progressByAlumno,
    historyByAlumno,
    selectedAlumnoId,
    isPanelOpen,

    // Computed
    selectedProgress,

    // Actions
    loadDashboard,
    openPanel,
    closePanel,
    loadHistory,
  }
})
