# Babysit-PRs — triage de CI con Jev

Extensión repo-específica al flujo de "CI red" que sigue un agente de IA
(Claude Code u otro) mientras cuida un PR. No reemplaza esas reglas — agrega
un paso previo, opcional y de bajo costo, antes de decidir si un fallo de CI
es un flake o un bug real.

## Paso 0 — antes de re-diagnosticar a mano: consultar Jev

Si `AI_GATEWAY_API_KEY` está disponible en el entorno de la sesión:

```bash
npm run jev:triage-ci -- --state "<descripción del fallo, ver abajo>"
```

**Cómo armar `--state`:** un párrafo con lo objetivamente verificable del log
de CI — nombre del job, archivo/test que falló, mensaje de error completo,
conteo pass/fail, si el test toca red/DB/servicios externos o es puramente
en memoria, y si el mismo commit pasó en una corrida anterior. No incluir
opiniones ni la conclusión a la que ya llegaste — la gracia es que Jev
clasifique sobre evidencia cruda, no que confirme un diagnóstico previo.

**Si `AI_GATEWAY_API_KEY` no está disponible:** seguir el flujo normal sin
Jev — este paso es un acelerador opcional, nunca un bloqueo. No pedir la key
ni detener el babysitting por esto.

## Cómo usar el resultado

El script devuelve JSON + exit code. Interpretarlo así, **dentro** de las
reglas de "CI red" que ya rigen el babysitting (nunca las reemplaza, nunca
autoriza más de un re-run, nunca excusa root-cause en fallos reales):

| exit code / `accion_recomendada` | Qué hacer |
|---|---|
| `0` / `auto_retry` (con `es_flake` alto, `accion_confianza` alta) | Candidato natural para **el único re-run permitido** por las reglas de CI red — si aún no se usó ese re-run, úsalo ahora. Si ya se usó y vuelve a fallar igual, tratarlo como real pese al veredicto de Jev. |
| `1` / `retry_with_review` | Caso ambiguo — no es excusa para re-run ciego. Mirar el log igual antes de decidir, usar el output de Jev como pista, no como veredicto. |
| `2` / `investigate_first` | No gastar el re-run acá. Ir directo a root-cause: es código que el PR toca, o portar un fix existente si es ajeno (regla ya vigente). |
| `accion_confianza` por debajo de ~0.5, sin importar qué eligió | Tratar como si Jev no hubiera respondido — decidir con el criterio normal, sin anclarse a una elección de baja confianza. |

## Lo que esto NO cambia

- Sigue habiendo como máximo **un** re-run por el mecanismo de "flake" de las
  reglas base, lo diga Jev o no.
- Un fallo que reproduce dos veces **es real**, sin importar qué haya dicho
  Jev la primera vez.
- Jev no escribe nada, no comenta en el PR, no decide por sí solo — es una
  entrada más al juicio del agente, igual que leer el log a mano, solo que
  más rápida y más barata (~$0.00003 por llamada, ~200-400ms).
- Ningún finding de revisión de código, merge conflict, ni comentario humano
  pasa por Jev — esto es específicamente para el triage de fallos de CI.

## Referencia

Script: `scripts/jev-triage-ci.mjs`. Calibración documentada en el mensaje
de commit que lo introdujo (`feat(scripts): add Jev CI-failure triage via
Vercel AI Gateway`) — 3 casos sintéticos más un caso real verificado contra
el resultado conocido (GitHub Actions run `35678701591`).
