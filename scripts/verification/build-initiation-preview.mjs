import {build} from 'vite'
import {mkdtemp,writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
const root=fileURLToPath(new URL('../../',import.meta.url)),scratch=await mkdtemp(join(tmpdir(),'soi-initiation-preview-'))
const entry=join(scratch,'entry.js')
await writeFile(entry,`import {mountSemester} from ${JSON.stringify(join(root,'src/modules/audiciones/initiation/semesterView.js'))};mountSemester(document.getElementById('app'));`)
const bundle=await build({configFile:false,root,envDir:false,logLevel:'warn',define:{'import.meta.env.VITE_USE_MOCK':JSON.stringify('true'),'import.meta.env.VITE_SUPABASE_URL':JSON.stringify(''),'import.meta.env.VITE_SUPABASE_ANON_KEY':JSON.stringify('')},build:{write:false,minify:true,cssCodeSplit:false,rolldownOptions:{input:entry,output:{codeSplitting:false}}}})
const output=bundle.output
const script=output.filter(item=>item.type==='chunk').map(item=>item.code).join('\n').replace(/<\/script/gi,'<\\/script')
const css=output.filter(item=>item.type==='asset'&&item.fileName.endsWith('.css')).map(item=>item.source).join('\n')
const destination=resolve(process.argv[2]||'/tmp/SOI_Audiciones_Revision.html')
await writeFile(destination,`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SOI · Audiciones semestrales · Revisión</title><style>body{margin:0;background:#020617;color:#e5e7eb}${css}</style></head><body><div id="app"></div><script type="module">${script}</script></body></html>`)
console.log(destination)
