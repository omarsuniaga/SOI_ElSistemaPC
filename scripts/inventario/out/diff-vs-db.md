# Diff saneamiento xlsx AGOSTO 2026  vs  inventario_activos (DB)

- xlsx saneado: 317 instrumentos (45 sin código)
- DB: 307 instrumentos
- **Match exacto sin cambios**: 42
- **Match con cambios (UPDATE)**: 211
- **Solo en xlsx (INSERT candidato)**: 19
- **Solo en DB (retirado/no en agosto)**: 54

## INSERT candidatos (19)
- `ESPCVLN171GC` violin 3/4  — disponible
- `ESPCVLN172GC` violin 3/4  — disponible
- `ESPCVLN174OB` violin 3/4 SKYLARK BRAND — disponible
- `ESPCVLC178IH` violoncello 4/4 CECILIO — disponible
- `25284` violin 4/4  — disponible
- `25282` violin 4/4 SCHENK — disponible
- `25280` violin 3/4 SCHENK — disponible
- `25285` violin 4/4 SCHENK — en_reparacion
- `25276` violin 1/2  — disponible
- `25275` violin 1/2 SUZUKI — disponible
- `25278` violin 1/2 STEINER — en_reparacion
- `25281` violin 4/4  — en_reparacion
- `25277` violin 3/4  — disponible
- `25287` contrabajo 1/8 GEWA — disponible
- `25288` contrabajo 1/4  — en_reparacion
- `23.07` clarinete  NOBLET, PARIS, ARTIST — en_reparacion
- `ESPCSAX173GC` saxofon_alto   — disponible
- `ESPCTPA35EX` trompeta  LAFANYELLE — ROANDI NUÑEZ
- `21C0234` piano_digital   — disponible

## Solo en DB — ¿retirados? (54)
- `22.122` bateria  PEARL ROY — activo=true NO
- `22.123` bongo  LINKO PERCUSSIONS — activo=true EN USO
- `22.124` platillos_de_choque  IMPERIAL — activo=true EN USO
- `22.125` teclado  YAMAHA — activo=true 
- `22.126` teclado_digital  YAMAHA — activo=true 
- `23.070` clarinete  NOBLET, PARIS, ARTIST — activo=false DAÑADO
- `23.250.` bombo  REMO — activo=true NO
- `23050-313` timpani 23" SONOR — activo=true EN USO
- `23050-314` timpani 26" SONOR — activo=true EN USO
- `23050-315` timpani 29" SONOR — activo=true EN USO
- `24.084` bombo  EUGEN GIANNINI — activo=true EN USO
- `24.085` piano_digital  ROLAND — activo=true 
- `24.097` campanas_tubulares  TROMMELBAU GIANNINI — activo=true EN USO
- `AUTO-PER-290` baqueta XILOFONO  — activo=true EN USO
- `AUTO-PER-291` baqueta TIMPANI  — activo=true EN USO
- `AUTO-PER-292` baqueta MARIMBA  — activo=true EN USO
- `AUTO-PER-293` baqueta 7 TRIANGULO  — activo=true EN USO
- `AUTO-PER-294` baqueta CAJON BRUSH  — activo=true EN USO
- `AUTO-PER-295` baqueta CAJON BRUSH  — activo=true EN USO
- `AUTO-PER-296` baquetas BASICAS  — activo=true EN USO
- `AUTO-PER-310` palillos_2 1  — activo=true EN USO
- `C-001` chelo  Luthier SOI — activo=true 
- `DONADO-297` baquetas_de_timpani   — activo=true EN USO
- `DONADO-308` guira 1  — activo=true EN USO
- `DONADO-309` guira_pequena 1  — activo=true EN USO
- `ESPCBMO90EX` bombo 1 MUSIK SCHLAGZEUG — activo=true EN USO
- `ESPCBNG141IH` bongos LP  — activo=true 
- `ESPCCLE96OB` clave UN PAR  — activo=true EN USO
- `ESPCCPA97OB` campana UN PAR (BRONCE)  — activo=true EN USO
- `ESPCCPA98OB` campana (TIPO CLAVE CON BAQUETS)  — activo=true EN USO
- `ESPCGRA91RO` guira 1  — activo=true EN USO
- `ESPCPAD168IH-323` pads_de_goma EVANS REALFEEL  — activo=true 
- `ESPCPAD168IH-324` pads_de_goma EVANS REALFEEL  — activo=true 
- `ESPCPAD168IH-325` pads_de_goma EVANS REALFEEL  — activo=true 
- `ESPCPAD168IH-326` pads_de_goma EVANS REALFEEL  — activo=true 
- `ESPCPAD168IH-327` pads_de_goma EVANS REALFEEL  — activo=true 
- `ESPCPDR92RO` pandereta 1  — activo=true EN USO
- `ESPCPNO101RO` teclado  HAMZER — activo=true 
- `ESPCPNO102RO` piano  YAMAHA — activo=true 
- `ESPCPNO103FR` piano_digital  YAMAHA — activo=true 
- `ESPCPNO104RO` piano_digital  YAMAHA — activo=true 
- `ESPCPNO105RO` teclado  YAMAHA — activo=true DARALING PEGUERO
- `ESPCTGL94RO` triangulo   — activo=true EN USO
- `ESPCTGL95RO` triangulo   — activo=true EN USO
- `ESPCVLN35RO` violin 4/4 VALENCIA — activo=true NO
- `ESPCXFO100RO` xilofono   — activo=true 
- `ESPCXFO142IH` xilofono INSTRUMENTAL HORIZONS  — activo=true 
- `ESPCXFO143IH` xilofono INSTRUMENTAL HORIZONS  — activo=true 
- `ESPCXFO99RO` xilofono   — activo=true MARTHIN RAMOS
- `INV-C-001` chelo  Luthier SOI — activo=true 
- `INV-V-001` violin  Luthier SOI — activo=true 
- `INV-V-002` violin  Luthier SOI — activo=true 
- `V-001` violin  Luthier SOI — activo=true 
- `V-002` violin  Luthier SOI — activo=true 

## UPDATE — cambios por campo (top 60)

Resumen: {"marca":3,"modelo":3,"estado_uso":59,"asignado_texto":167,"estado_conservacion":125,"tamano":2,"numero_serie":4,"tipo_instrumento":3}

### `23051`
- marca: DB=`STEG: BUCHWALDER` → xlsx=`STEG`
- modelo: DB=`null` → xlsx=`BUCHWALDER`
### `ESPCCTB11YA`
- estado_uso: DB=`prestado` → xlsx=`disponible`
- asignado_texto: DB=`COMPARTIDO` → xlsx=`null`
### `ESPCCTB12YA`
- estado_conservacion: DB=`mantenimiento` → xlsx=`regular`
### `22127`
- estado_conservacion: DB=`mantenimiento` → xlsx=`regular`
- asignado_texto: DB=`NO` → xlsx=`null`
### `22128`
- estado_conservacion: DB=`mantenimiento` → xlsx=`bueno`
- asignado_texto: DB=`NO` → xlsx=`null`
### `22129`
- estado_uso: DB=`disponible` → xlsx=`en_reparacion`
- asignado_texto: DB=`NO` → xlsx=`null`
### `ESPCGTR86EX`
- asignado_texto: DB=`NO` → xlsx=`null`
### `ESPCGTR87EX`
- asignado_texto: DB=`NO` → xlsx=`null`
### `ESPCGTR88EX`
- estado_conservacion: DB=`mantenimiento` → xlsx=`bueno`
- asignado_texto: DB=`NO` → xlsx=`null`
### `24088`
- estado_conservacion: DB=`mantenimiento` → xlsx=`excelente`
### `ESPCVLA22EX`
- estado_conservacion: DB=`mantenimiento` → xlsx=`regular`
### `ESPCVLA23EX`
- estado_conservacion: DB=`mantenimiento` → xlsx=`regular`
### `25185`
- tamano: DB=`4/4 (12)` → xlsx=`4/4`
### `25186`
- tamano: DB=`4/4 (12)` → xlsx=`4/4`
- estado_conservacion: DB=`mantenimiento` → xlsx=`excelente`
### `ESPCVLA117OB`
- asignado_texto: DB=`DISPONIBLE` → xlsx=`null`
### `ESPCVLA130IH`
- estado_conservacion: DB=`mantenimiento` → xlsx=`excelente`
- asignado_texto: DB=`DISPONIBLE` → xlsx=`null`
### `ESPCVLA21EX`
- estado_uso: DB=`prestado` → xlsx=`disponible`
- asignado_texto: DB=`BRANYAN PEGUERO` → xlsx=`null`
### `22079`
- estado_conservacion: DB=`de_baja` → xlsx=`regular`
- estado_uso: DB=`de_baja` → xlsx=`disponible`
- asignado_texto: DB=`DAÑADO` → xlsx=`null`
### `22080`
- estado_conservacion: DB=`excelente` → xlsx=`bueno`
### `22081`
- estado_conservacion: DB=`mantenimiento` → xlsx=`excelente`
### `22082`
- estado_conservacion: DB=`mantenimiento` → xlsx=`bueno`
- estado_uso: DB=`disponible` → xlsx=`prestado`
### `22084`
- estado_conservacion: DB=`excelente` → xlsx=`bueno`
### `22085`
- estado_conservacion: DB=`mantenimiento` → xlsx=`bueno`
### `22086`
- asignado_texto: DB=`NO` → xlsx=`null`
### `22087`
- estado_uso: DB=`prestado` → xlsx=`disponible`
- asignado_texto: DB=`ANGELITA STJUSTE` → xlsx=`null`
### `22088`
- estado_uso: DB=`disponible` → xlsx=`en_reparacion`
- asignado_texto: DB=`DISPONIBLE` → xlsx=`null`
### `22089`
- estado_conservacion: DB=`mantenimiento` → xlsx=`bueno`
- estado_uso: DB=`disponible` → xlsx=`prestado`
### `22090`
- estado_conservacion: DB=`mantenimiento` → xlsx=`regular`
### `22091`
- estado_uso: DB=`prestado` → xlsx=`en_reparacion`
- asignado_texto: DB=`HELEN SIRI` → xlsx=`null`
### `22092`
- estado_conservacion: DB=`mantenimiento` → xlsx=`regular`
### `22093`
- estado_conservacion: DB=`mantenimiento` → xlsx=`regular`
### `23055`
- estado_conservacion: DB=`mantenimiento` → xlsx=`bueno`
- estado_uso: DB=`prestado` → xlsx=`disponible`
- asignado_texto: DB=`GABRIELA MARTE` → xlsx=`null`
### `23057`
- estado_conservacion: DB=`mantenimiento` → xlsx=`bueno`
- estado_uso: DB=`disponible` → xlsx=`en_reparacion`
- asignado_texto: DB=`DEPOSITO` → xlsx=`null`
### `23058`
- estado_conservacion: DB=`mantenimiento` → xlsx=`excelente`
- estado_uso: DB=`prestado` → xlsx=`en_reparacion`
- asignado_texto: DB=`ESCARLET MARTINEZ` → xlsx=`null`
### `23060`
- estado_conservacion: DB=`excelente` → xlsx=`bueno`
- estado_uso: DB=`prestado` → xlsx=`disponible`
- asignado_texto: DB=`AMELIE FERNANDEZ` → xlsx=`null`
### `23061`
- estado_conservacion: DB=`mantenimiento` → xlsx=`bueno`
### `23063`
- estado_uso: DB=`prestado` → xlsx=`disponible`
- asignado_texto: DB=`MELANY PEGUERO` → xlsx=`null`
### `23064`
- estado_conservacion: DB=`de_baja` → xlsx=`bueno`
- estado_uso: DB=`de_baja` → xlsx=`prestado`
- asignado_texto: DB=`DAÑADO` → xlsx=`WAILANI GARCIA`
### `23065`
- estado_conservacion: DB=`de_baja` → xlsx=`bueno`
- estado_uso: DB=`de_baja` → xlsx=`en_reparacion`
- asignado_texto: DB=`ROBNER ALLAN GARCÍA` → xlsx=`null`
### `23066`
- estado_conservacion: DB=`excelente` → xlsx=`bueno`
### `ESPCVLN25SG`
- estado_conservacion: DB=`mantenimiento` → xlsx=`regular`
### `ESPCVLN26SG`
- estado_conservacion: DB=`mantenimiento` → xlsx=`bueno`
### `ESPCVLN28SG`
- estado_conservacion: DB=`mantenimiento` → xlsx=`bueno`
- asignado_texto: DB=`DISPONIBLE` → xlsx=`null`
### `ESPCVLN30RO`
- estado_conservacion: DB=`mantenimiento` → xlsx=`bueno`
### `ESPCVLN31RO`
- estado_conservacion: DB=`mantenimiento` → xlsx=`bueno`
### `ESPCVLN32RO`
- estado_conservacion: DB=`mantenimiento` → xlsx=`bueno`
- asignado_texto: DB=`DISPONIBLE` → xlsx=`null`
### `ESPCVLN33RO`
- estado_conservacion: DB=`mantenimiento` → xlsx=`regular`
- asignado_texto: DB=`EVAN RODRIGUEZ` → xlsx=`null`
### `ESPCVLN34RO`
- estado_conservacion: DB=`mantenimiento` → xlsx=`bueno`
- estado_uso: DB=`disponible` → xlsx=`prestado`
- asignado_texto: DB=`NO` → xlsx=`ALEJANDRA PÉREZ`
### `ESPCVLN36RO`
- estado_conservacion: DB=`mantenimiento` → xlsx=`regular`
### `ESPCVLN37RO`
- estado_conservacion: DB=`mantenimiento` → xlsx=`bueno`
- asignado_texto: DB=`DAÑADO` → xlsx=`null`
### `ESPCVLN38EX`
- estado_conservacion: DB=`mantenimiento` → xlsx=`bueno`
### `ESPCVLN39EX`
- estado_conservacion: DB=`mantenimiento` → xlsx=`excelente`
### `ESPCVLN40AR`
- estado_conservacion: DB=`mantenimiento` → xlsx=`bueno`
- estado_uso: DB=`en_reparacion` → xlsx=`disponible`
- asignado_texto: DB=`DISPONIBLE` → xlsx=`null`
### `ESPCVLN41EX`
- estado_conservacion: DB=`mantenimiento` → xlsx=`bueno`
- estado_uso: DB=`en_reparacion` → xlsx=`disponible`
- asignado_texto: DB=`DISPONIBLE` → xlsx=`null`
### `ESPCVLN42MU`
- estado_uso: DB=`prestado` → xlsx=`disponible`
- asignado_texto: DB=`DYAKENSON LAMERIQUE` → xlsx=`null`
### `ESPCVLN43LI`
- asignado_texto: DB=`DISPONIBLE` → xlsx=`null`
### `ESPCVLN46YS`
- modelo: DB=`null` → xlsx=`-`
- numero_serie: DB=`null` → xlsx=`-`
- estado_uso: DB=`en_reparacion` → xlsx=`disponible`
- asignado_texto: DB=`DISPONIBLE` → xlsx=`null`
### `ESPCVLN48MA`
- estado_conservacion: DB=`mantenimiento` → xlsx=`regular`
### `25175`
- estado_conservacion: DB=`mantenimiento` → xlsx=`excelente`
### `25183`
- estado_uso: DB=`en_reparacion` → xlsx=`prestado`
- asignado_texto: DB=`DISPONIBLE` → xlsx=`ANGELITA STJUSTE`

… y 151 más (ver diff-updates.json)
