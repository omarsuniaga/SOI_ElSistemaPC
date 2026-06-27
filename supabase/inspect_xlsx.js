import XLSX from 'xlsx'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const xlsxPath = path.join(__dirname, '../src/modules/inventario/inventario_supabase_estructurado.xlsx')

function inspect() {
  try {
    const workbook = XLSX.readFile(xlsxPath)
    console.log('Sheet Names:', workbook.SheetNames)
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName]
      const json = XLSX.utils.sheet_to_json(sheet)
      console.log(`Sheet: ${sheetName}`)
      console.log(`Number of rows: ${json.length}`)
      if (json.length > 0) {
        console.log('First row keys:', Object.keys(json[0]))
        console.log('First row values:', json[0])
      }
      console.log('-----------------------------')
    }
  } catch (err) {
    console.error('Error reading xlsx:', err.message)
  }
}

inspect()
