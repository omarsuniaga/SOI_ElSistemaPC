import { openDB } from 'idb'

const DB_NAME    = 'portal-maestros'
const DB_VERSION = 1
const STORE_NAME = 'sync_queue'

/** @type {import('idb').IDBPDatabase | null} */
let _db = null

async function getDB() {
  if (_db) return _db
  _db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath:       'id',
          autoIncrement: true,
        })
        store.createIndex('by_created_at', 'created_at')
      }
    },
  })
  return _db
}

/**
 * Agrega una operación a la cola de sincronización.
 * @param {{ tabla: string, operacion: 'insert'|'update'|'delete', payload: object }} item
 */
export async function enqueue({ tabla, operacion, payload }) {
  const db = await getDB()
  await db.add(STORE_NAME, {
    tabla,
    operacion,
    payload,
    intentos: 0,
    created_at: new Date().toISOString(),
  })
}

/**
 * Devuelve todos los items pendientes en la cola, en orden FIFO.
 * @returns {Promise<Array>}
 */
export async function getQueue() {
  const db = await getDB()
  return db.getAll(STORE_NAME)
}

/**
 * Elimina un item de la cola por su id (tras sincronización exitosa).
 * @param {number} id
 */
export async function dequeue(id) {
  const db = await getDB()
  await db.delete(STORE_NAME, id)
}

/**
 * Limpia toda la cola (uso en tests o reset manual).
 */
export async function clearQueue() {
  const db = await getDB()
  const tx    = db.transaction(STORE_NAME, 'readwrite')
  await tx.store.clear()
  await tx.done
}

/**
 * Procesa la cola: intenta sincronizar cada item con Supabase.
 * Llama a `syncFn` por cada item. Si tiene éxito, lo elimina.
 * Si falla, incrementa intentos (máximo 5 reintentos).
 * @param {(item: object) => Promise<void>} syncFn
 */
export async function processQueue(syncFn) {
  const queue = await getQueue()
  for (const item of queue) {
    try {
      await syncFn(item)
      await dequeue(item.id)
    } catch (_err) {
      const db = await getDB()
      const MAX_INTENTOS = 5
      if (item.intentos >= MAX_INTENTOS) {
        await dequeue(item.id)
      } else {
        await db.put(STORE_NAME, { ...item, intentos: item.intentos + 1 })
      }
    }
  }
}
