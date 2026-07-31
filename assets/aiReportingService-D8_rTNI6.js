import{o as e}from"./asistenciasApi-D2Jkgv58.js";import{x as t}from"./scoreDirectorView-DSCcKHpJ.js";import{n}from"./groqService-Cu889xeB.js";var r=`soi_reportes_director_logs`;function i(){try{let e=localStorage.getItem(r);return e?JSON.parse(e):[]}catch(e){return console.error(`[aiReportingService] Error reading reports:`,e),[]}}function a(e){try{let t=i();t.unshift({id:`report_${Date.now()}`,created_at:new Date().toISOString(),...e}),localStorage.setItem(r,JSON.stringify(t))}catch(e){console.error(`[aiReportingService] Error saving report:`,e)}}async function o(){let r=await t(),{resumenGlobal:i,timelineByDate:o}=await e(),s=i?.totalClases||0,c=i?.totalSesiones||0,l=i?.totalPresentes||0,u=i?.totalAusentes||0,d=i?.totalRegistros||0,f=d>0?(l/d*100).toFixed(1):`0`,p={};o&&o.forEach(e=>{e.clases.forEach(e=>{e.asistencias&&e.asistencias.forEach(e=>{let t=e.instrumento||`General`;p[t]||(p[t]={presentes:0,total:0}),p[t].total++,e.estado===`presente`&&p[t].presentes++})})});let m=Object.entries(p).map(([e,t])=>`* ${e}: ${t.total>0?(t.presentes/t.total*100).toFixed(1):`0`}% (${t.presentes}/${t.total})`).join(`
`),h=r.filter(e=>e.nivelRiesgo===`critico`||e.nivelRiesgo===`alto`),g=h.map(e=>`* ${e.alumnoNombre} (Riesgo: ${e.nivelRiesgo.toUpperCase()}, Score: ${e.score}): ${e.razones.join(` · `)}`).join(`
`)||`* Ningún alumno en riesgo crítico o alto detectado.`,_=`A continuación se detallan las estadísticas consolidadas de la última semana:

📊 ESTADÍSTICAS GENERALES DE ASISTENCIA:
- Tasa de Asistencia General: ${f}%
- Total Clases Impartidas: ${s}
- Total Sesiones Registradas: ${c}
- Alumnos Presentes acumulados: ${l}
- Alumnos Ausentes acumulados: ${u}

🎻 ASISTENCIA POR INSTRUMENTO:
${m}

👥 ALUMNOS EN RIESGO DETECTADOS:
${g}

Por favor, genera el reporte en Markdown con las siguientes secciones:
1. 📈 Resumen Ejecutivo (Análisis de la asistencia general e interpretación de los datos).
2. 🎻 Desempeño y Asistencia por Cátedra (Identificar cátedras líderes y cuáles requieren atención).
3. ⚠️ Alumnos de Atención Prioritaria (Análisis de los estudiantes críticos y planes recomendados).
4. 🎯 Recomendaciones Pedagógicas y Operativas para la Dirección.`,v=``;try{let e=await n([{role:`system`,content:`Eres el Coordinador Pedagógico Senior de "El Sistema Punta Cana" (fundación de educación musical).
Tu tarea es redactar el Reporte Consolidado Semanal de Dirección para el Director General.
Debes entregar un análisis detallado, pedagógico, estratégico y formal en base a las estadísticas reales recibidas.
Reglas:
- Redacta en español formal e institucional.
- Sé sumamente claro y estructurado. Usa emojis para los títulos.
- Escribe el reporte en formato Markdown completo y profesional con secciones claras.
- Proporciona planes de acción realistas y concretos para los alumnos en riesgo.`},{role:`user`,content:_}]);v=typeof e==`string`?e.trim():e&&typeof e.content==`string`?e.content.trim():String(e||``).trim()}catch(e){console.error(`[aiReportingService] Groq failed, generating fallback template:`,e),v=`# 📈 Reporte Consolidado Semanal de Dirección

## 📊 Resumen Ejecutivo
La última semana cerró con una tasa de asistencia general del **${f}%**, habiéndose impartido **${s} clases** en **${c} sesiones** registradas. 

## 🎻 Desempeño y Asistencia por Cátedra
El desglose de asistencia acumulada por cátedra de instrumento muestra el siguiente desempeño:
${m}

## ⚠️ Alumnos de Atención Prioritaria
Se identificaron los siguientes casos que requieren intervención inmediata de coordinación social o tutoría:
${g}

## 🎯 Recomendaciones del Coordinador Pedagógico
1. **Intervención Familiar:** Contactar a los representantes de los alumnos con riesgo alto para mitigar deserción.
2. **Refuerzo en Cátedras:** Apoyar a los profesores de los instrumentos con menor porcentaje de asistencia.
3. **Monitoreo de Objetivos:** Sincronizar planes remediales en las clases remediales de la semana entrante.`}let y={titulo:`Reporte consolidado de dirección — ${new Date().toLocaleDateString(`es-ES`)}`,asistencia_general:parseFloat(f),total_clases:s,riesgos_criticos_count:h.length,contenido_markdown:v};return a(y),y}export{o as generarReporteConsolidadoIA,i as obtenerReportesDirector};