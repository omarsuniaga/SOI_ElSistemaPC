<template>
  <div class="progress-dashboard">
    <DashboardFilterBar
      :periodos="periodos"
      @filter-change="applyFilters"
    />

    <div class="px-6 py-6">
      <div v-if="filteredRows.length === 0" class="text-center py-12">
        <p class="text-gray-500">No hay estudiantes en este grupo</p>
      </div>

      <table v-else class="min-w-full divide-y divide-gray-300">
        <thead>
          <tr>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nombre</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Asistencia</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Promedio</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Indicadores</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Estado</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <DashboardStudentRow
            v-for="row in filteredRows"
            :key="row.alumnoId"
            :row="row"
            @row-click="openPanel"
          />
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProgresosStore } from '../../stores/useProgresosStore.js'
import DashboardFilterBar from './dashboardFilterBar.vue'
import DashboardStudentRow from './dashboardStudentRow.vue'

const store = useProgresosStore()

const periodos = ref([])
const filterRiesgo = ref('all')

const filteredRows = computed(() => {
  if (filterRiesgo.value === 'all') {
    return store.dashboardRows
  }
  return store.dashboardRows.filter(r => r.estado_riesgo === filterRiesgo.value)
})

const applyFilters = ({ periodo, riesgo }) => {
  filterRiesgo.value = riesgo
  if (periodo) {
    // Reload dashboard with new period
    store.loadDashboard(store.currentClaseId, periodo)
  }
}

const openPanel = (alumnoId) => {
  store.openPanel(alumnoId)
  // Will open the panel as a modal via store state
}

onMounted(async () => {
  // Load initial data
  await store.loadDashboard()
})
</script>
