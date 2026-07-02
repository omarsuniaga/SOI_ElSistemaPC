# SOI Backbone Spec + Process Index

La columna vertebral SOI conecta documentaci?n can?nica con ejecuci?n auditable en Hermes.

## Backbone

`documento SOI ? process_code/contrato ? caso Hermes/correlation_id ? departamentos responsables ? tareas ? tareasView ? cierre/evidencias`

## Datos indexados

- Total documentos can?nicos detectados por nombre de archivo: **62**
- Por tipo: annex: 4, form: 4, process: 48, record: 6
- Por departamento: ACM: 11, ADM: 8, COM: 1, DIR: 12, EVT: 3, FIN: 15, LOG: 2, OPR: 10

## Contratos implementados como seeds V1

| process_code | Alcance | Departamentos | Tareas iniciales | Evidencias |
|---|---|---|---|---|
| `ACM-P02` | Attendance and class content capture. | ACM, ADM | ACM: Registrar asistencia y contenido | Registro de asistencia; Contenido trabajado |
| `FIN-P13` | Debt status verification, representative contact, agreement/case decision. | FIN, COM, DIR | FIN: Verificar estado de mora; COM: Contactar representante por mora | Estado de cuenta; Registro de contacto |
| `OPR-P10` | Lutherie/taller diagnosis, evidence, repair/cost decision. | LUT, FIN, ACM, COM | LUT: Diagnosticar instrumento en taller; FIN: Evaluar costo de reparaci?n | Diagn?stico t?cnico; Evidencia fotogr?fica; Nota de cierre |

## ?ndice can?nico inicial

| C?digo | Tipo | Due?o | Nombre | Estado contrato | Documento |
|---|---|---|---|---|---|
| `ACM-F04` | form | ACM | Bitacora Recurrente Monitores | indexed_pending_contract | `01_DEPARTAMENTOS/02_ACM_ACADEMICO_MUSICAL/ACM-F04_Bitacora_Recurrente_Monitores_V8.md` |
| `ACM-P02` | process | ACM | Asistencia y Contenido | implemented_seed | `01_DEPARTAMENTOS/02_ACM_ACADEMICO_MUSICAL/ACM-P02_Asistencia_y_Contenido_V8.md` |
| `ACM-P03` | process | ACM | Ficha y Rubrica | indexed_pending_contract | `01_DEPARTAMENTOS/02_ACM_ACADEMICO_MUSICAL/ACM-P03_Ficha_y_Rubrica_V8.md` |
| `ACM-P04` | process | ACM | Manual Monitores | indexed_pending_contract | `01_DEPARTAMENTOS/02_ACM_ACADEMICO_MUSICAL/ACM-P04_Manual_Monitores_V8.md` |
| `ACM-P05` | process | ACM | Clases Instrumentales | indexed_pending_contract | `01_DEPARTAMENTOS/02_ACM_ACADEMICO_MUSICAL/ACM-P05_Clases_Instrumentales_V8.md` |
| `ACM-P07` | process | ACM | Recitales Semestrales | indexed_pending_contract | `01_DEPARTAMENTOS/02_ACM_ACADEMICO_MUSICAL/ACM-P07_Recitales_Semestrales_V8.md` |
| `ACM-P09` | process | ACM | Masterclasses Internacionales | indexed_pending_contract | `01_DEPARTAMENTOS/02_ACM_ACADEMICO_MUSICAL/ACM-P09_Masterclasses_Internacionales_V8.md` |
| `ACM-P11` | process | ACM | Clases Iniciacion Contrabajo | indexed_pending_contract | `01_DEPARTAMENTOS/02_ACM_ACADEMICO_MUSICAL/ACM-P11_Clases_Iniciacion_Contrabajo_V9.md` |
| `ACM-P12` | process | ACM | Planificacion Iniciacion Musical | indexed_pending_contract | `01_DEPARTAMENTOS/02_ACM_ACADEMICO_MUSICAL/ACM-P12_Planificacion_Iniciacion_Musical_V9.md` |
| `ACM-P13` | process | ACM | Audicion Iniciacion | indexed_pending_contract | `01_DEPARTAMENTOS/02_ACM_ACADEMICO_MUSICAL/ACM-P13_Audicion_Iniciacion_V8.md` |
| `ACM-R08` | record | ACM | V8 Minuta 2026 05 14 | indexed_pending_contract | `01_DEPARTAMENTOS/02_ACM_ACADEMICO_MUSICAL/minutas/2026/V8/ACM-R08-V8_Minuta_2026-05-14.md` |
| `ADM-A02` | annex | ADM | Plantillas Inscripcion | indexed_pending_contract | `01_DEPARTAMENTOS/05_ADM_FIN_ADMINISTRATIVO_FINANCIERO/ADM-A02_Plantillas_Inscripcion_V8.md` |
| `ADM-F11` | form | ADM | Plantilla Comunicacion Cese | indexed_pending_contract | `01_DEPARTAMENTOS/05_ADM_FIN_ADMINISTRATIVO_FINANCIERO/ADM-F11_Plantilla_Comunicacion_Cese_V8.md` |
| `ADM-P02` | process | ADM | Gestion Expedientes Archivo | indexed_pending_contract | `01_DEPARTAMENTOS/05_ADM_FIN_ADMINISTRATIVO_FINANCIERO/ADM-P02_Gestion_Expedientes_Archivo_V8.md` |
| `ADM-P08` | process | ADM | Gestion Justificaciones | indexed_pending_contract | `01_DEPARTAMENTOS/05_ADM_FIN_ADMINISTRATIVO_FINANCIERO/ADM-P08_Gestion_Justificaciones_V8.md` |
| `ADM-P09` | process | ADM | Control Uniforme | indexed_pending_contract | `01_DEPARTAMENTOS/05_ADM_FIN_ADMINISTRATIVO_FINANCIERO/ADM-P09_Control_Uniforme_V8.md` |
| `ADM-P10` | process | ADM | Cierre Ciclo Colaboracion | indexed_pending_contract | `01_DEPARTAMENTOS/05_ADM_FIN_ADMINISTRATIVO_FINANCIERO/ADM-P10_Cierre_Ciclo_Colaboracion_V8.md` |
| `ADM-P11` | process | ADM | Gestion Calendario | indexed_pending_contract | `01_DEPARTAMENTOS/05_ADM_FIN_ADMINISTRATIVO_FINANCIERO/ADM-P11_Gestion_Calendario_V9.md` |
| `ADM-P12` | process | ADM | Asistencia Equipo | indexed_pending_contract | `01_DEPARTAMENTOS/05_ADM_FIN_ADMINISTRATIVO_FINANCIERO/ADM-P12_Asistencia_Equipo_V9.md` |
| `COM-P10` | process | COM | Gestion Plataformas Crowdfunding | indexed_pending_contract | `01_DEPARTAMENTOS/03_COM_COMUNICACIONES/COM-P10_Gestion_Plataformas_Crowdfunding_V8.md` |
| `DIR-A02` | annex | DIR | Calendario Postulaciones 2026 | indexed_pending_contract | `01_DEPARTAMENTOS/01_DIR_DIRECCION_EJECUTIVA/DIR-A02_Calendario_Postulaciones_2026_V8.md` |
| `DIR-A03` | annex | DIR | Estandares Elegibilidad Donantes | indexed_pending_contract | `01_DEPARTAMENTOS/01_DIR_DIRECCION_EJECUTIVA/DIR-A03_Estandares_Elegibilidad_Donantes_V8.md` |
| `DIR-F11` | form | DIR | Plantilla Micro Proyecto | indexed_pending_contract | `01_DEPARTAMENTOS/01_DIR_DIRECCION_EJECUTIVA/DIR-F11_Plantilla_Micro_Proyecto_V8.md` |
| `DIR-P02` | process | DIR | Gestion Alianzas Fundraising | indexed_pending_contract | `01_DEPARTAMENTOS/01_DIR_DIRECCION_EJECUTIVA/DIR-P02_Gestion_Alianzas_Fundraising_V8.md` |
| `DIR-P04` | process | DIR | Dashboard Impacto Social | indexed_pending_contract | `01_DEPARTAMENTOS/01_DIR_DIRECCION_EJECUTIVA/DIR-P04_Dashboard_Impacto_Social_V8.md` |
| `DIR-P05` | process | DIR | Gestion Crisis | indexed_pending_contract | `01_DEPARTAMENTOS/01_DIR_DIRECCION_EJECUTIVA/DIR-P05_Gestion_Crisis_V8.md` |
| `DIR-P06` | process | DIR | REGISTRO TALENTO Y PUESTOS | indexed_pending_contract | `01_DEPARTAMENTOS/01_DIR_DIRECCION_EJECUTIVA/gestion_talento/DIR-P06_REGISTRO_TALENTO_Y_PUESTOS_V9.md` |
| `DIR-P08` | process | DIR | Daily Standup | indexed_pending_contract | `01_DEPARTAMENTOS/01_DIR_DIRECCION_EJECUTIVA/DIR-P08_Daily_Standup_V8.md` |
| `DIR-P09` | process | DIR | Bienestar Estudiantil y Enlace CONANI | indexed_pending_contract | `01_DEPARTAMENTOS/01_DIR_DIRECCION_EJECUTIVA/DIR-P09_Bienestar_Estudiantil_y_Enlace_CONANI_V8.md` |
| `DIR-P10` | process | DIR | Medicion Impacto Social | indexed_pending_contract | `01_DEPARTAMENTOS/01_DIR_DIRECCION_EJECUTIVA/DIR-P10_Medicion_Impacto_Social_V8.md` |
| `DIR-P11` | process | DIR | Formulacion Micro Proyectos | indexed_pending_contract | `01_DEPARTAMENTOS/01_DIR_DIRECCION_EJECUTIVA/DIR-P11_Formulacion_Micro_Proyectos_V8.md` |
| `DIR-R03` | record | DIR | Acta JD 2026 04 06 | indexed_pending_contract | `01_DEPARTAMENTOS/01_DIR_DIRECCION_EJECUTIVA/junta_directiva/actas/2026/DIR-R03_Acta_JD_2026-04-06.md` |
| `EVT-P01` | process | EVT | Gestion Solicitud Eventos | indexed_pending_contract | `01_DEPARTAMENTOS/04_LOG_LOGISTICA_Y_EVENTOS/EVT-P01_Gestion_Solicitud_Eventos_V8.md` |
| `EVT-P02` | process | EVT | Logistica Eventos | indexed_pending_contract | `01_DEPARTAMENTOS/04_LOG_LOGISTICA_Y_EVENTOS/EVT-P02_Logistica_Eventos_V8.md` |
| `EVT-P03` | process | EVT | Calendario Semanal | indexed_pending_contract | `01_DEPARTAMENTOS/04_LOG_LOGISTICA_Y_EVENTOS/EVT-P03_Calendario_Semanal_V8.md` |
| `FIN-A08` | annex | FIN | Certificado Donacion | indexed_pending_contract | `01_DEPARTAMENTOS/05_ADM_FIN_ADMINISTRATIVO_FINANCIERO/FIN-A08_Certificado_Donacion_V8.md` |
| `FIN-P04` | process | FIN | Reporte Financiero Mensual | indexed_pending_contract | `01_DEPARTAMENTOS/05_ADM_FIN_ADMINISTRATIVO_FINANCIERO/FIN-P04_Reporte_Financiero_Mensual_V8.md` |
| `FIN-P05` | process | FIN | Venta Accesorios | indexed_pending_contract | `01_DEPARTAMENTOS/05_ADM_FIN_ADMINISTRATIVO_FINANCIERO/FIN-P05_Venta_Accesorios.md` |
| `FIN-P08` | process | FIN | Certificados Donacion Fiscal | indexed_pending_contract | `01_DEPARTAMENTOS/05_ADM_FIN_ADMINISTRATIVO_FINANCIERO/FIN-P08_Certificados_Donacion_Fiscal_V8.md` |
| `FIN-P10` | process | FIN | Obligaciones Fiscales DGI | indexed_pending_contract | `01_DEPARTAMENTOS/05_ADM_FIN_ADMINISTRATIVO_FINANCIERO/FIN-P10_Obligaciones_Fiscales_DGI_V8.md` |
| `FIN-P11` | process | FIN | Administracion Sede | indexed_pending_contract | `01_DEPARTAMENTOS/05_ADM_FIN_ADMINISTRATIVO_FINANCIERO/FIN-P11_Administracion_Sede_V8.md` |
| `FIN-P12` | process | FIN | Servicios Fijos | indexed_pending_contract | `01_DEPARTAMENTOS/05_ADM_FIN_ADMINISTRATIVO_FINANCIERO/FIN-P12_Servicios_Fijos_V8.md` |
| `FIN-P13` | process | FIN | Gestion Mora y Cobranza | implemented_seed | `01_DEPARTAMENTOS/05_ADM_FIN_ADMINISTRATIVO_FINANCIERO/FIN-P13_Gestion_Mora_y_Cobranza_V8.md` |
| `FIN-P14` | process | FIN | Gestion Caja | indexed_pending_contract | `01_DEPARTAMENTOS/05_ADM_FIN_ADMINISTRATIVO_FINANCIERO/FIN-P14_Gestion_Caja_V9.md` |
| `FIN-P15` | process | FIN | Emision Cheques | indexed_pending_contract | `01_DEPARTAMENTOS/05_ADM_FIN_ADMINISTRATIVO_FINANCIERO/FIN-P15_Emision_Cheques_V9.md` |
| `FIN-P16` | process | FIN | Conciliacion Bancaria | indexed_pending_contract | `01_DEPARTAMENTOS/05_ADM_FIN_ADMINISTRATIVO_FINANCIERO/FIN-P16_Conciliacion_Bancaria_V9.md` |
| `FIN-R01` | record | FIN | Estado Cobranza Abril 2026 | indexed_pending_contract | `01_DEPARTAMENTOS/05_ADM_FIN_ADMINISTRATIVO_FINANCIERO/cobranzas/FIN-R01_Estado_Cobranza_Abril_2026.md` |
| `FIN-R04` | record | FIN | Cierre Abril 2026 | indexed_pending_contract | `01_DEPARTAMENTOS/05_ADM_FIN_ADMINISTRATIVO_FINANCIERO/cierre_mensual/2026/FIN-R04_Cierre_Abril_2026.md` |
| `FIN-R08` | record | FIN | Francois Letaconnoux 2026 04 19 | indexed_pending_contract | `01_DEPARTAMENTOS/05_ADM_FIN_ADMINISTRATIVO_FINANCIERO/certificados_donacion/2026/V8/FIN-R08_Francois_Letaconnoux_2026-04-19.md` |
| `FIN-R08` | record | FIN | John Doe 2026 04 24 | indexed_pending_contract | `01_DEPARTAMENTOS/05_ADM_FIN_ADMINISTRATIVO_FINANCIERO/certificados_donacion/2026/V8/FIN-R08_John_Doe_2026-04-24.md` |
| `LOG-P03` | process | LOG | Reparaciones | indexed_pending_contract | `01_DEPARTAMENTOS/04_LOG_LOGISTICA_Y_EVENTOS/LOG-P03_Reparaciones_V8.md` |
| `LOG-P04` | process | LOG | Inventario | indexed_pending_contract | `01_DEPARTAMENTOS/04_LOG_LOGISTICA_Y_EVENTOS/LOG-P04_Inventario_V8.md` |
| `OPR-F08` | form | OPR | Checklist Apertura Cierre | indexed_pending_contract | `01_DEPARTAMENTOS/06_OPR_OPERACIONES/OPR-F08_Checklist_Apertura_Cierre_V8.md` |
| `OPR-P01` | process | OPR | Gestion Insumos | indexed_pending_contract | `01_DEPARTAMENTOS/06_OPR_OPERACIONES/OPR-P01_Gestion_Insumos_V8.md` |
| `OPR-P03` | process | OPR | Mantenimiento Preventivo | indexed_pending_contract | `01_DEPARTAMENTOS/06_OPR_OPERACIONES/OPR-P03_Mantenimiento_Preventivo_V8.md` |
| `OPR-P04` | process | OPR | Logistica Montaje | indexed_pending_contract | `01_DEPARTAMENTOS/06_OPR_OPERACIONES/OPR-P04_Logistica_Montaje_V8.md` |
| `OPR-P05` | process | OPR | Inventario Instrumentos | indexed_pending_contract | `01_DEPARTAMENTOS/06_OPR_OPERACIONES/OPR-P05_Inventario_Instrumentos_V9.md` |
| `OPR-P06` | process | OPR | Reporte Operativo Sede | indexed_pending_contract | `01_DEPARTAMENTOS/06_OPR_OPERACIONES/OPR-P06_Reporte_Operativo_Sede_V8.md` |
| `OPR-P08` | process | OPR | Gestion Flota Principal | indexed_pending_contract | `01_DEPARTAMENTOS/06_OPR_OPERACIONES/OPR-P08_Gestion_Flota_Principal_V8.md` |
| `OPR-P09` | process | OPR | Gestion Compras | indexed_pending_contract | `01_DEPARTAMENTOS/06_OPR_OPERACIONES/OPR-P09_Gestion_Compras_V9.md` |
| `OPR-P10` | process | OPR | Taller Lutheria Mantenimiento | implemented_seed | `01_DEPARTAMENTOS/06_OPR_OPERACIONES/OPR-P10_Taller_Lutheria_Mantenimiento_V9.md` |
| `OPR-P11` | process | OPR | Gestion Deposito Instrumentos | indexed_pending_contract | `01_DEPARTAMENTOS/06_OPR_OPERACIONES/OPR-P11_Gestion_Deposito_Instrumentos_V9.md` |

## Criterio de cierre/evidencia

- Toda tarea debe mantener `process_code` y `correlation_id`.
- Todo caso Hermes debe cerrarse solo cuando las tareas obligatorias est?n completadas/canceladas con comentario de cierre.
- La evidencia vive en `documentos_adjuntos`, comentarios e historial de cada tarea; el caso conserva snapshots de evidencia requerida y criterios de cierre.
- Si un proceso manual se repite, `recurrence_count` lo convierte en candidato de automatizaci?n.
