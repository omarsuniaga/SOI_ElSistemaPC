<template>
  <div class="dashboard-filter-bar bg-white border-b border-gray-200 px-6 py-4">
    <div class="flex items-center gap-4">
      <!-- Período selector -->
      <div>
        <label class="text-sm font-medium text-gray-700">Período</label>
        <select
          v-model="selectedPeriodo"
          @change="$emit('filter-change', { periodo: selectedPeriodo, riesgo: selectedRiesgo })"
          class="mt-1 block rounded-md border-gray-300 shadow-sm"
        >
          <option v-for="p in periodos" :key="p.id" :value="p.id">
            {{ p.nombre }}
          </option>
        </select>
      </div>

      <!-- Riesgo filter -->
      <div>
        <label class="text-sm font-medium text-gray-700">Estado</label>
        <select
          v-model="selectedRiesgo"
          @change="$emit('filter-change', { periodo: selectedPeriodo, riesgo: selectedRiesgo })"
          class="mt-1 block rounded-md border-gray-300 shadow-sm"
        >
          <option value="all">Todos</option>
          <option value="ok">OK</option>
          <option value="en_riesgo">En Riesgo</option>
          <option value="sin_datos">Sin datos</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  periodos: {
    type: Array,
    default: () => [],
  },
})

const selectedPeriodo = ref('')
const selectedRiesgo = ref('all')
</script>
