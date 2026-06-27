import{i as e,n as t,r as n}from"./rolldown-runtime-DlOssbPu.js";var r=n({glossary:()=>i}),i,a=t((()=>{i={cumplimiento:{title:`Cumplimiento`,description:`Porcentaje de observaciones registradas por el maestro durante el período. Mide qué tan consistente es el registro de información sobre los alumnos.`,example:`72% significa que el maestro completó 7 de cada 10 sesiones de observación esperadas.`},cumplimiento_sesiones:{title:`Cumplimiento de Sesiones`,description:`Número de sesiones registradas vs. sesiones programadas. Indica si el maestro está documentando todas sus clases.`,example:`12/16 sesiones significa 16 clases programadas, 12 registradas.`},progreso_alumno:{title:`Progreso del Alumno`,description:`Nivel de avance en los objetivos curriculares. Se mide en tres niveles: Introducido (inicio) → En Progreso (desarrollando) → Dominado (completo).`,example:`Un alumno en "Escalas" puede estar "Introducido" en La mayor, "En progreso" en Re mayor, y "Dominado" en Sol mayor.`},madurez:{title:`Madurez de Conocimiento`,description:`Estado evolutivo del conocimiento del alumno en un tema o habilidad específica.`,example:`Un alumno pasa de "Introducido" en técnica de detaché a "Dominado" conforme avanza.`},confianza_ia:{title:`Confianza de IA`,description:`Nivel de certeza con el que el sistema extrajo la información de las observaciones. De 0 a 1: valores altos (>0.85) significan que el sistema está muy seguro; valores bajos requieren confirmación del maestro.`,example:`Confianza 0.95 = el sistema está casi seguro de la aserción. Confianza 0.60 = el maestro debe revisar y confirmar.`},riesgo_alumno:{title:`Riesgo`,description:`Indicador de que un alumno necesita atención. Puede ser por asistencia baja, tardanzas, problemas pedagógicos, justificaciones incompletas, o documentación faltante.`,example:`Un alumno con "Riesgo alto" tiene <80% asistencia o 3+ problemas pedagógicos registrados.`},asistencia_riesgo:{title:`Riesgo de Asistencia`,description:`Porcentaje de clases a las que el alumno no asistió. Si está por debajo del 80%, se considera riesgo.`,example:`75% asistencia = 1 de cada 4 clases faltadas = riesgo.`},tardanzas_riesgo:{title:`Riesgo de Tardanzas`,description:`Número de veces que el alumno llegó tarde a clase. Si supera el umbral de la institución (típicamente 3+), es riesgo.`,example:`5 tardanzas en el mes = riesgo de tardanza.`},observacion_riesgo:{title:`Riesgo de Observación`,description:`Problema pedagógico detectado en las observaciones (falta de concentración, dificultad técnica, falta de práctica, etc.).`,example:`Una observación que dice "desfase en los solos" genera un riesgo de observación automáticamente.`},cobertura_curricular:{title:`Cobertura Curricular`,description:`Porcentaje de objetivos del currículo que han sido observados y registrados en los alumnos de la clase.`,example:`34% cobertura = de 4163 objetivos del plan, solo ~1400 han sido observados en algún alumno.`},objetivo_curricular:{title:`Objetivo Curricular`,description:`Meta específica del plan de estudios que el alumno debe alcanzar (p. ej., "Dominar la afinación" o "Cantar con vibrato").`,example:`>VL-N2-12 "Afinación" es un objetivo de Violín Nivel 2.`},indicador:{title:`Indicador`,description:`Signo observable de que un objetivo está siendo alcanzado. Es lo que el maestro ve y documenta en las observaciones.`,example:`El objetivo "Afinación" tiene como indicador "ejecuta notas con desviación <50 cents".`},casos_abiertos:{title:`Casos Abiertos`,description:`Número de alertas o situaciones en seguimiento. Pueden ser observaciones sobre alumnos en riesgo, necesidades de intervención, o amonestaciones pendientes.`,example:`2 casos abiertos = 1 alumno con riesgo alto + 1 amonestación en proceso.`},accion_caso:{title:`Acción de Caso`,description:`Intervención registrada (llamado de atención, amonestación, sesión de seguimiento, derivación, etc.).`,example:`Se abrió un caso para un alumno y se registró una "amonestación escrita" como acción.`},observacion:{title:`Observación`,description:`Registro que hace el maestro sobre un alumno o una sesión. Puede incluir logros, dificultades, comportamientos, técnica, etc.`,example:`"Dyakenson dominó la escala de La mayor. Necesita trabajar vibrato lento." — observación sobre un alumno.`},observacion_propuesta:{title:`Observación Propuesta`,description:`Aserción extraída automáticamente del texto de observación, pendiente de confirmación por el maestro. No es oficial hasta que se confirme.`,example:`El sistema propone "domina vibrato lento" (confianza 0.72). El maestro puede confirmarla o descartar si no es correcta.`},observacion_confirmada:{title:`Observación Confirmada`,description:`Aserción que el maestro revisó y aprobó. Ahora es parte oficial del perfil del alumno.`,example:`El maestro confirmó "domina vibrato lento" y ahora aparece en el perfil.`},dimension_objetivo:{title:`Dimensión: Objetivo`,description:`Objetivos del currículo oficial (p. ej., "afinación", "técnica de arco").`,example:`VL-N2-12 "Afinación" es un objetivo curricular.`},dimension_escala:{title:`Dimensión: Escala`,description:`Escalas musicales que el alumno está aprendiendo (La mayor, Re mayor, etc.).`,example:`El alumno domina "Escala de La mayor, 1 octava".`},dimension_repertorio:{title:`Dimensión: Repertorio`,description:`Piezas musicales o canciones que el alumno está estudiando o ha dominado.`,example:`El alumno domina "Canción Nacional".`},dimension_tecnica:{title:`Dimensión: Técnica`,description:`Habilidades técnicas específicas del instrumento (detaché, legato, spiccato, vibrato, etc.).`,example:`El alumno está "en progreso" en "Spiccato".`},dimension_problema:{title:`Dimensión: Problema`,description:`Dificultades o áreas de riesgo pedagógico detectadas (falta de concentración, desfase, etc.).`,example:`Se registró el problema "desfase en solos" como área de mejora.`},trayectoria:{title:`Trayectoria`,description:`Historial de cambios en la madurez de un conocimiento. Muestra el progreso a lo largo del tiempo.`,example:`La mayor: Introducido (04-12) → En Progreso (05-03) → Dominado (06-05).`},feedback_maestro:{title:`Feedback del Maestro`,description:`Comentarios o sugerencias que el maestro registra sobre el alumno o la clase (p. ej., "necesita practicar más", "trabajo excelente").`,example:`"Necesita reforzar la posición del arco antes de avanzar a técnicas más complejas".`},analitca_comportamiento:{title:`Comportamiento de Registro`,description:`Patrones de cómo el maestro registra información (cuándo registra, con qué frecuencia, qué detalle).`,example:`Un maestro registra 1 observación por alumno por semana. Otro registra 3 por semana.`}}}));function o(e,t={}){let{placement:n=`top`,className:r=``}=t;return`
    <span
      class="info-tooltip ${r}"
      data-term="${e}"
      data-placement="${n}"
      title="Click para más info"
      role="button"
      tabindex="0"
    >
      <i class="bi bi-info-circle-fill"></i>
    </span>
  `}function s(e){e&&e.querySelectorAll(`.info-tooltip`).forEach(e=>{let t=e.dataset.term;t&&(e.addEventListener(`click`,e=>{e.stopPropagation(),c(t)}),e.addEventListener(`keydown`,e=>{(e.key===`Enter`||e.key===` `)&&(e.preventDefault(),c(t))}))})}function c(t){let{glossary:n}=(a(),e(r)),i=n[t];if(!i)return;let o=document.getElementById(`infoModalBackdrop`);o&&o.remove();let s=document.createElement(`div`);s.id=`infoModalBackdrop`,s.className=`info-modal-backdrop`,s.innerHTML=`
    <div class="info-modal-content">
      <div class="info-modal-header">
        <h5>${l(i.title)}</h5>
        <button class="info-modal-close" aria-label="Cerrar">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
      <div class="info-modal-body">
        <p>${l(i.description)}</p>
        ${i.example?`<p class="text-muted"><small><strong>Ej:</strong> ${l(i.example)}</small></p>`:``}
      </div>
    </div>
  `,document.body.appendChild(s),s.querySelector(`.info-modal-close`).addEventListener(`click`,()=>s.remove()),s.addEventListener(`click`,e=>{e.target===s&&s.remove()})}function l(e){return typeof e==`string`?e.replace(/[&<>]/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`})[e]):``}function u(){let e=`info-tooltip-styles`;if(document.getElementById(e))return;let t=document.createElement(`style`);t.id=e,t.textContent=`
    .info-tooltip {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      margin-left: 0.4rem;
      color: var(--bs-info, #0dcaf0);
      cursor: pointer;
      font-size: 0.9rem;
      vertical-align: middle;
      transition: color 0.2s;
    }

    .info-tooltip:hover {
      color: var(--bs-info-focus, #0ab8e6);
      opacity: 0.8;
    }

    .info-tooltip:focus {
      outline: 2px solid var(--bs-info);
      outline-offset: 2px;
      border-radius: 50%;
    }

    .info-modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .info-modal-content {
      background: var(--bs-body-bg);
      border-radius: 0.5rem;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      max-width: 400px;
      width: 90%;
      overflow: hidden;
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .info-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid var(--bs-border-color);
      background: var(--bs-secondary-bg);
    }

    .info-modal-header h5 {
      margin: 0;
      font-weight: 600;
      color: var(--bs-body-color);
    }

    .info-modal-close {
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      color: var(--bs-secondary);
      transition: color 0.2s;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 0.25rem;
    }

    .info-modal-close:hover {
      color: var(--bs-body-color);
      background: var(--bs-border-color);
    }

    .info-modal-body {
      padding: 1rem;
      font-size: 0.95rem;
      line-height: 1.5;
      color: var(--bs-body-color);
    }

    .info-modal-body p {
      margin-bottom: 0.75rem;
    }

    .info-modal-body p:last-child {
      margin-bottom: 0;
    }
  `,document.head.appendChild(t)}export{s as n,u as r,o as t};