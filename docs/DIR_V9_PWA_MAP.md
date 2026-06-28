# Mapa DIR V9 vs PWA

## Fuente verificada
- `01_DEPARTAMENTOS/01_DIR_DIRECCION_EJECUTIVA/DIR_EJEC_V9.md`
- `00_SISTEMA_MAESTRO/SOI_MASTER_BOOK_V9.md`
- `09_SOI_WEB_PORTAL/sistema-academico-pwa/src/main.js`

## Hallazgo
La PWA ya tenía capacidades útiles para Dirección, pero estaban repartidas entre `Análisis` y `Sistema`, mientras la sección `Dirección` solo mostraba `Score del Director`. Eso NO representaba bien el rol V9 de DIR-EJEC como articulador de capas, aprobador, supervisor de actividad y lector operativo de Hermes.

## Mapeo operativo aplicado
### Responsabilidad V9 DIR-EJEC -> Vista PWA
- Vista global de carga institucional -> `dir-score`
- Seguimiento por caso/procedimiento -> `dir-procedimientos`
- Consulta factual a Hermes -> `dir-hermes-consulta`
- Reportería institucional -> `admin-dashboard-reportes`
- Tendencias institucionales -> `admin-dashboard-tendencias`
- Alertas y actividad crítica -> `admin-notificaciones`
- Aprobaciones operativas -> `admin-aprobacion`
- Gobernanza básica de permisos -> `permisos`

## Cambio ejecutado
Se actualizó `src/main.js` para que la navegación del grupo `Dirección` exponga explícitamente estas capacidades y se registraron las rutas faltantes:
- `dir-procedimientos`
- `dir-hermes-consulta`

## Gap todavía abierto
Todavía falta una capa DIR V9 más formal para:
- reuniones obligatorias y actas
- doble firma financiera > RD$50,000
- decisiones/vetos con huella documental
- tablero de Junta Directiva
- gestión de talento DIR (contrataciones, sanciones, desvinculaciones)
