/**
 * CatalogCache - IndexedDB para catálogos offline
 * Almacena catálogos (alumnos, contenidos, medidas, nodos, etc.) para uso offline
 */

import { openDB } from 'idb';

const DB_NAME = 'portal-maestros-catalogs';
const DB_VERSION = 1;

// Stores y sus TTL (en milisegundos)
const STORE_CONFIG = {
  'alumnos': { ttl: 24 * 60 * 60 * 1000 },        // 24 horas
  'contenidos': { ttl: 7 * 24 * 60 * 60 * 1000 }, // 7 días
  'medidas': { ttl: 30 * 24 * 60 * 60 * 1000 },   // 30 días
  'sugerencias': { ttl: 30 * 24 * 60 * 60 * 1000 },
  'tareas': { ttl: 30 * 24 * 60 * 60 * 1000 },
  'nodos': { ttl: 7 * 24 * 60 * 60 * 1000 },
  'niveles': { ttl: 7 * 24 * 60 * 60 * 1000 },
  'indicadores': { ttl: 7 * 24 * 60 * 60 * 1000 },
  'historial': { ttl: null }  // Sin expiración (local-only)
};

let _db = null;

/**
 * Inicializa la base de datos IndexedDB
 */
async function getDB() {
  if (_db) return _db;
  
  _db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Crear stores para cada tipo de catálogo
      for (const [storeName, config] of Object.entries(STORE_CONFIG)) {
        if (!db.objectStoreNames.contains(storeName)) {
          const store = db.createObjectStore(storeName, { keyPath: 'id' });
          store.createIndex('by_updated', 'updated_at');
          if (storeName === 'alumnos') {
            store.createIndex('by_clase', 'clase_id');
          }
        }
      }
    },
  });
  
  return _db;
}

/**
 * Obtiene un elemento por su ID
 */
export async function get(storeName, id) {
  const db = await getDB();
  const item = await db.get(storeName, id);
  
  if (!item) return null;
  
  // Verificar TTL
  const config = STORE_CONFIG[storeName];
  if (config?.ttl && item.updated_at) {
    const expiresAt = new Date(item.updated_at).getTime() + config.ttl;
    if (Date.now() > expiresAt) {
      // Expirado, eliminar
      await db.delete(storeName, id);
      return null;
    }
  }
  
  return item;
}

/**
 * Obtiene todos los elementos de un store
 */
export async function getAll(storeName) {
  const db = await getDB();
  const items = await db.getAll(storeName);
  
  const config = STORE_CONFIG[storeName];
  if (!config?.ttl) return items;
  
  // Filtrar elementos no expirados
  const now = Date.now();
  return items.filter(item => {
    if (!item.updated_at) return true;
    return now <= new Date(item.updated_at).getTime() + config.ttl;
  });
}

/**
 * Obtiene elementos por índice
 */
export async function getByIndex(storeName, indexName, value) {
  const db = await getDB();
  return db.getAllFromIndex(storeName, indexName, value);
}

/**
 * Guarda un elemento (o actualiza si existe)
 */
export async function set(storeName, item) {
  const db = await getDB();
  const data = {
    ...item,
    updated_at: new Date().toISOString()
  };
  await db.put(storeName, data);
  return data;
}

/**
 * Guarda múltiples elementos (bulk)
 */
export async function setBulk(storeName, items) {
  const db = await getDB();
  const tx = db.transaction(storeName, 'readwrite');
  
  for (const item of items) {
    await tx.store.put({
      ...item,
      updated_at: new Date().toISOString()
    });
  }
  
  await tx.done;
}

/**
 * Elimina un elemento por ID
 */
export async function remove(storeName, id) {
  const db = await getDB();
  await db.delete(storeName, id);
}

/**
 * Limpia un store completo
 */
export async function clear(storeName) {
  const db = await getDB();
  await db.clear(storeName);
}

/**
 * Limpia todos los elementos expirados de un store
 */
export async function cleanExpired(storeName) {
  const db = await getDB();
  const config = STORE_CONFIG[storeName];
  if (!config?.ttl) return;
  
  const items = await db.getAll(storeName);
  const now = Date.now();
  
  for (const item of items) {
    if (item.updated_at) {
      const expiresAt = new Date(item.updated_at).getTime() + config.ttl;
      if (now > expiresAt) {
        await db.delete(storeName, item.id);
      }
    }
  }
}

/**
 * Limpia todos los stores
 */
export async function clearAll() {
  const db = await getDB();
  for (const storeName of Object.keys(STORE_CONFIG)) {
    await db.clear(storeName);
  }
}

/**
 * Obtiene el tamaño aproximado del store
 */
export async function getStoreSize(storeName) {
  const items = await getAll(storeName);
  return items.length;
}

/**
 * Agrega al historial de uso (para priorizar autocompletados)
 */
export async function addToHistorial(trigger, selectedValue) {
  const db = await getDB();
  const now = new Date().toISOString();
  
  // El ID del historial ES el trigger, no necesitamos un índice separado
  const existing = await db.get('historial', trigger);
  
  if (existing) {
    existing.count = (existing.count || 0) + 1;
    existing.last_used = now;
    existing.recent_selections = [
      selectedValue,
      ...(existing.recent_selections || []).slice(0, 9)
    ];
    await db.put('historial', existing);
  } else {
    await db.put('historial', {
      id: trigger,
      trigger: trigger,
      count: 1,
      last_used: now,
      recent_selections: [selectedValue],
      updated_at: now
    });
  }
}

/**
 * Obtiene historial por trigger
 */
export async function getHistorial(trigger) {
  const db = await getDB();
  return db.get('historial', trigger);
}

/**
 * Obtiene los más usados de cada trigger (para fuzzy search)
 */
export async function getTopUsed(trigger, limit = 5) {
  const db = await getDB();
  const items = await db.getAll('historial');
  
  // Filtrar por trigger y ordenar por count
  return items
    .filter(i => i.trigger === trigger)
    .sort((a, b) => (b.count || 0) - (a.count || 0))
    .slice(0, limit);
}

export default {
  get,
  getAll,
  getByIndex,
  set,
  setBulk,
  remove,
  clear,
  cleanExpired,
  clearAll,
  getStoreSize,
  addToHistorial,
  getHistorial,
  getTopUsed
};