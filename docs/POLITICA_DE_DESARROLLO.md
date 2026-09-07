# Política Estructural de Desarrollo

**Vinculante para humanos y agentes.** Complementa [`AGENTS.md`](../AGENTS.md) §8.
Deriva del diagnóstico en [`SOI_RUTA_A_REFERENCIA.md`](./SOI_RUTA_A_REFERENCIA.md).

---

## Por qué existe

El diagnóstico de septiembre 2026 midió el estado real de SOI: **247 tablas en
producción, 123 completamente vacías**. Ninguna de esas 123 se construyó por
error — cada una respondió a una intención razonable. Se acumularon porque
nada en el proceso obligaba a cerrar el circuito.

Esta política no agrega burocracia: **agrega el paso que faltaba** — que cada
cosa que se abre tenga declarado quién la cierra.

> **Principio rector**
> Lo particular de FUNEYCA se configura. Lo común a las organizaciones musicales se convierte en estándar.

---

## Cómo se aplica: trinquete, no muro

El repositorio arrastra deuda real. Una política absoluta ("cero tablas
huérfanas") fallaría el primer día y se desactivaría al segundo.

Por eso la política funciona como **trinquete**, con la misma filosofía que
`scripts/soi-verify-gate.sh`: no exige perfección, **exige no retroceder**.

```
Baseline (deuda conocida, 2026-09-07)
  ├─ 13 tablas huérfanas         ← puede bajar, no subir
  └─ 151 tablas sin institucion_id ← puede bajar, no subir
```

Cuando arreglás deuda, regrabás el baseline y el trinquete queda un diente más
arriba. Nunca vuelve a bajar.

```bash
npm run policy:check
```

---

## Las seis reglas

### R1 · Toda tabla nace con escritor y con fecha de primera fila

**Mecánico** — una tabla creada en una migración y jamás referenciada desde
`src/` bloquea el gate.

**De revisión** — toda tabla nueva declara en el PR: *quién escribe la primera
fila real, y en qué fecha*. Sin ese par, no hay tabla.

> La regla mecánica evita las 13 huérfanas sin código. La regla de revisión evita
> las otras 110: tablas con código que nunca recibieron un dato. Esa segunda mitad
> no se puede automatizar desde el repo — es la que exige disciplina.

**Cómo cumplir:** la migración y el código que escribe en ella viajan en el
**mismo PR**. Si el escritor llega después, la tabla llega después.

---

### R2 · Cerrar el bucle

Toda capacidad que **detecta** algo debe registrar la **acción** y su
**resultado**. Todo **catálogo** que se define debe incluir su **captura de uso**.

**Prohibido entregar la mitad emisora sin la mitad receptora.**

| Anti-patrón real | Cómo se ve hoy |
|---|---|
| Se emiten eventos, no se registra qué se hizo | 1 971 eventos → 0 acciones |
| Se define catálogo, no se capturan intentos | 4 163 indicadores → 20 intentos |
| Se emiten cuotas, no se registran pagos | 474 cuotas → 2 pagos |
| Se abren órdenes, no se cierran con costo | 324 activos → 1 orden de reparación |

**Cómo cumplir:** antes de abrir el PR, respondé *¿dónde queda registrado que
esto se usó?* Si la respuesta es "en ningún lado todavía", el PR está incompleto.

---

### R3 · Multi-institución desde el día uno

**Mecánico** — toda tabla de dominio nueva declara `institucion_id`.

Excepción explícita cuando corresponde (infraestructura, catálogo global,
configuración del sistema), declarada en la propia migración:

```sql
-- policy:exento-institucion_id razón: catálogo global compartido entre instituciones
```

**Por qué:** hoy `instituciones` tiene 0 filas y **ningún archivo de código la
usa**. Cada tabla nueva sin `institucion_id` agranda la deuda de replicabilidad
—que es la única brecha que bloquea toda la visión de referencia externa.

Retrofitear un identificador de inquilino en 151 tablas es caro. En una tabla
nueva cuesta una línea.

---

### R4 · Configuración, no esquema

Lo específico de FUNEYCA —niveles, cátedras, familias instrumentales, calendario,
política de cobranza, reglas reactivas, umbrales de alerta— vive en **datos de
configuración**, nunca cableado en el esquema ni en constantes de código.

**Prueba:** *¿otra organización musical podría usar esto cambiando datos, sin
tocar código ni migraciones?* Si la respuesta es no, no está listo.

---

### R5 · Todo número trazable hasta su evidencia

Ningún indicador se publica en un tablero, informe o comunicación externa sin
ruta navegable a los registros que lo producen.

**Un número sin evidencia no genera confianza** — y un informe a un donante con
una cifra que no se puede sustentar es un riesgo institucional, no un bug.

**Cómo cumplir:** toda vista de indicador expone el *drill-down* a sus filas de
origen. Si la agregación es cara, se cachea; no se desconecta de su fuente.

---

### R6 · La persona decide; el sistema recomienda

Ninguna automatización —Hermes incluido— expulsa, sanciona, etiqueta ni cierra
un caso de alumno por sí sola. Puede detectar, advertir, priorizar y proponer.

Toda recomendación entrega **seis campos**, sin excepción:

1. **Qué ocurrió**
2. **Qué evidencia lo demuestra** (con enlace)
3. **Por qué importa**
4. **Qué acción propone**
5. **Quién debe decidir**
6. **Cuándo debe revisarse**

Y, ligado a protección infantil: **ninguna comunicación sale sin consentimiento
verificable registrado**. Hoy hay 65 mensajes en cola y 0 consentimientos — es la
brecha de mayor riesgo institucional del sistema, y no es técnica.

---

## Checklist de PR

Pegar en la descripción del PR cuando el cambio toque esquema, datos o indicadores:

```markdown
### Política Estructural
- [ ] R1 · Tabla nueva → escritor en este mismo PR; primera fila real: <quién> / <cuándo>
- [ ] R2 · Lo que esto detecta o cataloga queda registrado en: <dónde>
- [ ] R3 · Tablas nuevas con institucion_id (o exención declarada en la migración)
- [ ] R4 · Lo específico de FUNEYCA va en configuración, no en esquema ni constantes
- [ ] R5 · Indicadores nuevos con drill-down a su evidencia
- [ ] R6 · Sin decisiones automáticas sobre personas; recomendaciones con los 6 campos
- [ ] `npm run policy:check` en verde
```

Si una regla no aplica al PR, marcala igual y escribí *n/a*. Marcar sin leer es
peor que no tener checklist.

---

## Excepciones

Se admiten, y se declaran en el PR con esta forma:

```
POLICY-EXCEPTION R<n>: <qué se salta> — <por qué> — <cómo y cuándo se paga>
```

Una excepción sin plan de pago es deuda silenciosa: exactamente el mecanismo que
produjo las 123 tablas vacías.

---

## Dirección estructural

La política empuja hacia las cuatro fases del roadmap. Cada regla existe para
que una fase no se deshaga sola.

| Regla | Fase que protege |
|---|---|
| R1 · Escritor y fecha | **Fase 0** — que la poda no se vuelva a llenar |
| R2 · Cerrar el bucle | **Fase 1** — que los ciclos académico y de acción no vuelvan a cortarse |
| R5 · Trazabilidad | **Fase 2** — que los números de impacto se puedan sostener frente a un donante |
| R3 · Multi-institución · R4 · Configuración | **Fase 3** — que la replicabilidad no se aleje con cada commit |
| R6 · Decisión humana | **Transversal** — protección infantil y control institucional |

---

## Herramientas

| Comando | Qué hace |
|---|---|
| `npm run policy:check` | Verifica R1 y R3 contra el baseline. Falla si la deuda crece. |
| `npm run policy:list` | Lista las tablas huérfanas y las que no tienen `institucion_id`. |
| `npm run policy:record` | Regraba el baseline tras pagar deuda. Revisar el diff antes de commitear. |
| `scripts/soi-verify-gate.sh` | Gate completo de card: aditividad, build, lint, tests **y política**. |

**Regla del baseline:** `policy:record` solo se corre para **bajar** los números.
Si un PR los sube y "arregla" el gate regrabando, la política dejó de existir.
Eso se revisa a mano: el diff de `scripts/.structural-baseline.json` debe tener
más líneas borradas que agregadas.

---

*Vigente desde 2026-09-07 · Revisar junto con el roadmap al cierre de cada fase.*
