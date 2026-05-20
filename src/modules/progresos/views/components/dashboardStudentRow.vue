<template>
  <tr @click="$emit('row-click', row.alumnoId)" class="dashboard-row cursor-pointer hover:bg-gray-50">
    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
      {{ row.nombre }}
    </td>
    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
      {{ row.asistencia_pct ?? '—' }}
    </td>
    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
      {{ row.promedio_notas ?? '—' }}
    </td>
    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
      {{ row.prom_indicadores_pct ?? '—' }}
    </td>
    <td class="px-6 py-4 whitespace-nowrap">
      <span
        role="status"
        :class="[
          'inline-flex px-3 py-1 text-xs font-semibold rounded-full',
          estadoClasses
        ]"
      >
        {{ row.estado_riesgo }}
      </span>
    </td>
  </tr>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  row: {
    type: Object,
    required: true,
  },
})

const estadoClasses = computed(() => {
  switch (props.row.estado_riesgo) {
    case 'ok':
      return 'estado-ok bg-green-100 text-green-800'
    case 'en_riesgo':
      return 'estado-en-riesgo bg-red-100 text-red-800'
    case 'sin_datos':
      return 'estado-sin-datos bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
})
</script>
