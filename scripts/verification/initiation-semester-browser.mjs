// Usage: SOI_PLAYWRIGHT_PATH=/path/to/playwright/index.mjs SOI_CHROMIUM_EXECUTABLE=/path/to/chromium node scripts/verification/initiation-semester-browser.mjs
import { createServer } from 'vite'
import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
const { chromium } = await import(process.env.SOI_PLAYWRIGHT_PATH || 'playwright')
const output = process.env.SOI_BROWSER_OUTPUT || '/tmp/soi-initiation-browser'
await mkdir(output, { recursive: true })
process.env.VITE_USE_MOCK = 'true'
const root = fileURLToPath(new URL('../../', import.meta.url))
const server = await createServer({
  root,
  server: { host: '127.0.0.1', port: 4176, strictPort: true },
})
await server.listen()
const browser = await chromium.launch({
  executablePath: process.env.SOI_CHROMIUM_EXECUTABLE || undefined,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } }),
  errors = []
page.on('pageerror', (error) => errors.push(error.message))
const form = (name) => page.locator(`[data-form="${name}"]`)
async function saved() {
  await page.locator('[data-status]').filter({ hasText: 'Guardado correctamente' }).waitFor()
  const error = page.locator('[data-error]')
  if (await error.isVisible()) throw new Error(await error.textContent())
}
async function expand(text) {
  const summary = page.locator('summary').filter({ hasText: text }).first()
  if ((await summary.locator('..').getAttribute('open'))===null) await summary.click()
}
async function send(name) {
  await form(name).getByRole('button').last().click()
  await saved()
}
async function actor(id) {
  await page.locator('select[name=demo_actor]').selectOption(id)
  await page
    .locator('[data-status]')
    .filter({ hasText: 'Perfil de demostración cambiado' })
    .waitFor()
}
async function create(name, type, jurors) {
  await expand('Crear audición')
  const f = form('crear')
  await f.locator('[name=nombre]').fill(name)
  await f.locator('[name=periodo]').fill('Semestre 2026-2 · prueba sintética')
  await f.locator('[name=tipo]').selectOption(type)
  await f.locator('[name=fecha_audicion]').fill('2026-12-15')
  await f.locator('[name=clases_origen]').selectOption(['source', 'source-b'])
  await f.locator('[name=jurados]').selectOption(jurors)
  await f.locator('[name=responsables]').selectOption('demo-admin')
  await f.locator('[name=min_jurados]').fill(String(jurors.length))
  await send('crear')
}
async function open() {
  await expand('Gestión de la convocatoria')
  await page.locator('[data-action=abrir]').click()
  await page.locator('[data-status]').filter({ hasText: 'Operación guardada' }).waitFor()
}
async function grade(destination) {
  if (destination)
    await form('valorar').locator('[name=destino_revision_id]').selectOption(destination)
  const f = form('valorar')
  for (const input of await f.locator('select[name^=score_]').all()) await input.selectOption('3')
  await f
    .locator('[name=observacion]')
    .fill('Reproduce el motivo trabajado con pulso estable y apoyo puntual.')
  await f.locator('[name=fortalezas]').fill('Mantiene pulso y atiende entradas.')
  await f.locator('[name=apoyos]').fill('Repetir con escucha guiada.')
  await f.locator('[name=recomendacion]').selectOption('preparado')
  await send('valorar')
}
async function resolveResult() {
  const f = form('resolver')
  await f
    .locator('[name=conclusion_jurado]')
    .fill('El jurado concluye que está preparado; se revisaron evidencias y recomendaciones.')
  await f
    .locator('[name=conclusion]')
    .fill('Coordinación ratifica preparación y acompaña la continuidad de teoría y solfeo.')
  await f.locator('[name=fortalezas]').fill('Pulso estable y participación.')
  await f.locator('[name=apoyos]').fill('Escucha guiada durante el semestre.')
  await send('resolver')
  await expand('Gestión de la convocatoria')
  await page.locator('[data-action=publicar]').click()
  await page.locator('[data-status]').filter({ hasText: 'Operación guardada' }).waitFor()
}
async function authorize(classId) {
  await expand('Autorizar una clase')
  const f = form('autorizar')
  await f.locator('[name=clase_id]').selectOption(classId)
  await f.locator('[name=objetivos]').fill('Sostener pulso en grupo y seguir entradas.')
  await f.locator('[name=inicio]').fill('2026-10-22')
  await f.locator('[name=revision]').fill('2099-01-01')
  await f
    .locator('[name=requiere_instrumento]')
    .selectOption(classId === 'choir' ? 'false' : 'true')
  if (classId !== 'choir') await f.locator('[name=recurso_referencia]').fill('FL-DEMO-001')
  await f
    .locator('[name=comprobacion]')
    .fill(
      classId === 'choir'
        ? 'No aplica instrumento individual.'
        : 'Recurso sintético FL-DEMO-001 comprobado.',
    )
  await f
    .locator('[name=observacion]')
    .fill('Destino acordado tras preferencia, cupo y horario revisados.')
  await send('autorizar')
}
try {
  await page.goto(process.env.SOI_BROWSER_URL||'http://127.0.0.1:4176/audiciones.html#iniciacion')
  await page.getByRole('heading', { name: 'Audiciones e invitados', exact: true }).waitFor()
  await create('Diagnóstico de medio semestre', 'medio', ['demo-jury', 'demo-admin'])
  await expand('Gestión de la convocatoria')
  await form('agregar').locator('[name=alumno_id]').selectOption('demo-student-a')
  await form('agregar').locator('[name=regular_clase_id]').selectOption('source')
  await send('agregar')
  await open()
  await grade()
  await actor('demo-jury')
  await grade()
  await actor('demo-admin')
  await resolveResult()
  await form('preferencia').locator('[name=preferencia]').fill('Le interesan coro y flauta.')
  await send('preferencia')
  await authorize('choir')
  await authorize('flute')
  await page.screenshot({ path: resolve(output, '01-coordination.png'), fullPage: true })
  await actor('demo-receiver')
  await page.locator('[data-action=section-invitations]').click()
  const ids = await page
    .locator('[data-form=incorporar]')
    .evaluateAll((forms) => forms.map((f) => f.dataset.id))
  for (const id of ids) {
    const f = page.locator(`[data-form=incorporar][data-id="${id}"]`)
    for (const box of await f.locator('input[type=checkbox]').all()) await box.check()
    await f.getByRole('button').click()
    await saved()
  }
  await page.screenshot({ path: resolve(output, '02-receiver.png'), fullPage: true })
  for (const id of ids) {
    await page.locator(`[data-action=expediente][data-id="${id}"]`).click()
    await form('seguimiento').waitFor()
    await form('seguimiento')
      .locator('[name=avances]')
      .fill('Participa y sigue entradas con autonomía creciente.')
    await form('seguimiento')
      .locator('[name=apoyos]')
      .fill('Mantener apoyo para escuchar al grupo.')
    await form('seguimiento')
      .locator('[name=recomendacion]')
      .fill('Revisar objetivos al cierre del semestre.')
    await form('seguimiento')
      .locator('[name=evidencia]')
      .fill('Referencia sintética al registro de clase.')
    await send('seguimiento')
  }
  await actor('demo-admin')
  await page.locator('[data-action=section-campaigns]').click()
  await create('Audición final de semestre', 'final', ['demo-jury'])
  for (const id of ids) {
    await expand('Gestión de la convocatoria')
    await form('vincular_final').locator('[name=revision_id]').selectOption(id)
    await send('vincular_final')
  }
  await open()
  await actor('demo-jury')
  await page.locator('[data-action=campaign]').filter({ hasText: 'Audición final' }).click()
  await form('valorar').waitFor()
  for (const id of ids) await grade(id)
  await page.locator('[data-action=comparar]').first().click()
  await page.locator('[data-report]').waitFor({ state: 'visible' })
  await page.screenshot({ path: resolve(output, '03-final-comparison.png'), fullPage: true })
  await actor('demo-admin')
  await page.locator('[data-action=campaign]').filter({ hasText: 'Audición final' }).click()
  await resolveResult()
  await page.locator('[data-action=section-invitations]').click()
  for (const [index, id] of ids.entries()) {
    await page.locator(`[data-action=expediente][data-id="${id}"]`).click()
    const f = form('resolver_invitacion')
    await f.waitFor()
    await f.locator('[name=accion]').selectOption(index === 0 ? 'confirmar' : 'prorrogar')
    await f
      .locator('[name=observacion]')
      .fill(
        index === 0
          ? 'Cumplió objetivos y se adapta al grupo.'
          : 'Necesita tiempo adicional en la clase instrumental.',
      )
    await f.locator('[name=plan]').fill('Conserva teoría y solfeo y acompañamiento.')
    if (index === 1) {
      await f.locator('[name=revision]').fill('2099-03-01')
      await f.locator('[name=objetivos]').fill('Ajustar escucha y entradas de forma autónoma.')
    }
    await send('resolver_invitacion')
  }
  await page.getByText('Miembro oficial', { exact: true }).first().waitFor()
  await page.getByText('Invitado · En periodo de prueba', { exact: true }).first().waitFor()
  await page.reload()
  await page.getByRole('heading', { name: 'Audiciones e invitados', exact: true }).waitFor()
  await page.locator('[data-action=section-invitations]').click()
  await page.getByText('Miembro oficial', { exact: true }).first().waitFor()
  await page.setViewportSize({ width: 390, height: 844 })
  await page.screenshot({ path: resolve(output, '04-mobile.png'), fullPage: true })
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  )
  if (overflow) throw new Error('La vista tiene desbordamiento horizontal en móvil')
  await actor('demo-other')
  if (await page.locator('[data-form=valorar]').count())
    throw new Error('El maestro no asignado obtuvo formulario de jurado')
  if (errors.length) throw new Error(errors.join('\n'))
  await writeFile(
    resolve(output, 'result.json'),
    JSON.stringify(
      {
        passed: true,
        roles: ['administración académica', 'jurado asignado', 'receptor', 'maestro no asignado'],
        twoIndependentDestinations: true,
        persistsAfterReload: true,
        mobileOverflow: false,
        javascriptErrors: errors,
      },
      null,
      2,
    ),
  )
  console.log(
    'PASS: flujo completo de dos destinos, revisión final, persistencia y móvil; datos sintéticos.',
  )
} finally {
  await browser.close()
  await server.close()
}
