/**
 * CatalogService - Servicio de catálogos con cache offline-first
 * Punto de entrada único para obtener catálogos: memoria → IndexedDB → Supabase
 */

import { supabase } from '../../lib/supabaseClient.js';
import catalogCache from './catalogCache.js';

/**
 * Obtiene los alumnos de una clase específica
 * @param {string} claseId - ID de la clase
 * @returns {Promise<Array>}
 */
export async function getAlumnos(claseId) {
  if (!claseId) return [];
  
  // Alumnos SIEMPRE del backend filtrado por claseId (no usar cache, evita stale data de otras clases)
  try {
    const { data, error } = await supabase
      .from('alumnos_clases')
      .select('alumno_id, alumnos(id, nombre_completo, instrumento_principal)')
      .eq('clase_id', claseId)
      .eq('activo', true);
    
    if (error) throw error;
    
    if (data) {
      const alumnos = data
        .map(i => i.alumnos)
        .filter(Boolean)
        .map(a => ({
          id: a.id,
          nombre: a.nombre_completo || '',
          instrumento: a.instrumento_principal
        }));
      
      return alumnos;
    }
  } catch (err) {
    console.warn('[CatalogService] Error cargando alumnos:', err);
  }
  
  return [];
}

/**
 * Obtiene el catálogo de contenidos
 * @returns {Promise<Array>}
 */
export async function getContenidos() {
  // 1. Cache
  const cached = await catalogCache.getAll('contenidos');
  if (cached.length > 0) return cached;
  
  // 2. Supabase
  try {
    const { data, error } = await supabase
      .from('catalogos')
      .select('id, nombre, descripcion')
      .eq('tipo', 'contenidos')
      .eq('activo', true)
      .order('orden', { ascending: true });
    
    if (error) throw error;
    
    if (data) {
      await catalogCache.setBulk('contenidos', data);
      return data;
    }
  } catch (err) {
    console.warn('[CatalogService] Error cargando contenidos:', err);
  }
  
  return [];
}

/**
 * Obtiene el catálogo de medidas técnicas
 * @returns {Promise<Array>}
 */
export async function getMedidas() {
  // 1. Cache
  const cached = await catalogCache.getAll('medidas');
  if (cached.length > 0) return cached;
  
  // 2. Supabase
  try {
    const { data, error } = await supabase
      .from('catalogos')
      .select('id, nombre, codigo, categoria')
      .eq('tipo', 'medidas')
      .eq('activo', true)
      .order('orden', { ascending: true });
    
    if (error) throw error;
    
    if (data) {
      await catalogCache.setBulk('medidas', data);
      return data;
    }
  } catch (err) {
    console.warn('[CatalogService] Error cargando medidas:', err);
  }
  
  return [];
}

/**
 * Obtiene el catálogo de sugerencias
 * @returns {Promise<Array>}
 */
export async function getSugerencias() {
  const cached = await catalogCache.getAll('sugerencias');
  if (cached.length > 0) return cached;
  
  try {
    const { data, error } = await supabase
      .from('catalogos')
      .select('id, nombre, descripcion')
      .eq('tipo', 'sugerencias')
      .eq('activo', true)
      .order('orden', { ascending: true });
    
    if (error) throw error;
    
    if (data) {
      await catalogCache.setBulk('sugerencias', data);
      return data;
    }
  } catch (err) {
    console.warn('[CatalogService] Error cargando sugerencias:', err);
  }
  
  return [];
}

/**
 * Obtiene el catálogo de tareas
 * @returns {Promise<Array>}
 */
export async function getTareas() {
  const cached = await catalogCache.getAll('tareas');
  if (cached.length > 0) return cached;
  
  try {
    const { data, error } = await supabase
      .from('catalogos')
      .select('id, nombre, descripcion')
      .eq('tipo', 'tareas')
      .eq('activo', true)
      .order('orden', { ascending: true });
    
    if (error) throw error;
    
    if (data) {
      await catalogCache.setBulk('tareas', data);
      return data;
    }
  } catch (err) {
    console.warn('[CatalogService] Error cargando tareas:', err);
  }
  
  return [];
}

/**
 * Obtiene los niveles de la Ruta Académica
 * @returns {Promise<Array>}
 */
export async function getNiveles() {
  const cached = await catalogCache.getAll('niveles');
  if (cached.length > 0) return cached;
  
  try {
    // Obtener versión publicada de Violín
    const { data: routeData } = await supabase
      .from('routes')
      .select('id')
      .eq('instrument', 'violín')
      .eq('status', 'published')
      .limit(1);
    
    if (!routeData || routeData.length === 0) return [];
    
    const routeId = routeData[0].id;
    
    const { data: versionData } = await supabase
      .from('route_versions')
      .select('id')
      .eq('route_id', routeId)
      .eq('status', 'published')
      .order('version', { ascending: false })
      .limit(1);
    
    if (!versionData || versionData.length === 0) return [];
    
    const versionId = versionData[0].id;
    
    const { data, error } = await supabase
      .from('levels')
      .select('id, level_number, name, main_objective')
      .eq('route_version_id', versionId)
      .order('level_number', { ascending: true });
    
    if (error) throw error;
    
    if (data) {
      await catalogCache.setBulk('niveles', data);
      return data;
    }
  } catch (err) {
    console.warn('[CatalogService] Error cargando niveles:', err);
  }
  
  return [];
}

/**
 * Obtiene los nodos de un nivel específico o todos
 * @param {string|null} nivelId - ID del nivel (opcional)
 * @returns {Promise<Array>}
 */
export async function getNodos(nivelId = null) {
  // Intentar cache primero
  let cached = await catalogCache.getAll('nodos');
  if (nivelId && cached.length > 0) {
    cached = cached.filter(n => n.level_id === nivelId);
    if (cached.length > 0) return cached;
  } else if (cached.length > 0) {
    return cached;
  }
  
  // Cargar de Supabase
  try {
    let query = supabase
      .from('nodes')
      .select('id, name, type, is_critical, is_required, objective, level_id, order_index');
    
    if (nivelId) {
      query = query.eq('level_id', nivelId);
    }
    
    const { data, error } = await query.order('order_index', { ascending: true });
    
    if (error) throw error;
    
    if (data) {
      await catalogCache.setBulk('nodos', data);
      return data;
    }
  } catch (err) {
    console.warn('[CatalogService] Error cargando nodos:', err);
  }
  
  return [];
}

/**
 * Obtiene el árbol completo de una route_version: bloques → niveles → nodos → indicadores
 * @param {string} routeVersionId - ID de la route_version
 * @returns {Promise<{niveles: Array}>}
 */
export async function getRouteTree(routeVersionId) {
  if (!routeVersionId) return { niveles: [] };

  const cacheKey = `route_tree_${routeVersionId}`;

  // 1. Cache — reutilizamos el store 'contenidos' con clave compuesta
  const cached = await catalogCache.getAll('route_trees');
  const cachedTree = cached.find(c => c.id === cacheKey);
  if (cachedTree) return cachedTree.tree;

  try {
    // 2. Niveles para esta route_version
    const { data: levelsData, error: levelsError } = await supabase
      .from('levels')
      .select('id, name, level_number, main_objective, order_index')
      .eq('route_version_id', routeVersionId)
      .order('order_index', { ascending: true });

    if (levelsError) throw levelsError;
    if (!levelsData || levelsData.length === 0) return { niveles: [] };

    // 3. Nodos para todos los niveles (una sola query)
    const levelIds = levelsData.map(l => l.id);
    const { data: nodesData, error: nodesError } = await supabase
      .from('nodes')
      .select('id, name, type, objective, level_id, order_index, is_critical, is_required')
      .in('level_id', levelIds)
      .order('order_index', { ascending: true });

    if (nodesError) throw nodesError;

    // 4. Indicadores para todos los nodos (una sola query)
    const nodeIds = (nodesData || []).map(n => n.id);
    let indicatorsData = [];
    if (nodeIds.length > 0) {
      const { data: indData, error: indError } = await supabase
        .from('indicators')
        .select('id, node_id, description, nombre, activo, order_index')
        .in('node_id', nodeIds)
        .eq('activo', true)
        .order('order_index', { ascending: true });

      if (indError) throw indError;
      indicatorsData = indData || [];
    }

    // 5. Armar árbol en memoria
    const indicatorsByNode = indicatorsData.reduce((acc, ind) => {
      if (!acc[ind.node_id]) acc[ind.node_id] = [];
      acc[ind.node_id].push(ind);
      return acc;
    }, {});

    const nodesByLevel = (nodesData || []).reduce((acc, node) => {
      if (!acc[node.level_id]) acc[node.level_id] = [];
      acc[node.level_id].push({
        ...node,
        indicadores: indicatorsByNode[node.id] || []
      });
      return acc;
    }, {});

    const tree = {
      niveles: levelsData.map(level => ({
        id: level.id,
        name: level.name,
        orden: level.order_index ?? level.level_number,
        nodos: nodesByLevel[level.id] || []
      }))
    };

    // 6. Guardar en cache
    await catalogCache.set('route_trees', { id: cacheKey, tree });

    return tree;
  } catch (err) {
    console.warn('[CatalogService] Error cargando route tree:', err);
    return { niveles: [] };
  }
}

/**
 * Obtiene los indicadores de un nodo
 * @param {string} nodoId - ID del nodo
 * @returns {Promise<Array>}
 */
export async function getIndicadores(nodoId) {
  if (!nodoId) return [];
  
  const cached = await catalogCache.getAll('indicadores');
  const filtered = cached.filter(i => i.node_id === nodoId);
  if (filtered.length > 0) return filtered;
  
  try {
    const { data, error } = await supabase
      .from('indicators')
      .select('id, description, minimum_criteria, is_required, order_index')
      .eq('node_id', nodoId)
      .order('order_index', { ascending: true });
    
    if (error) throw error;
    
    if (data) {
      await catalogCache.setBulk('indicadores', data);
      return data;
    }
  } catch (err) {
    console.warn('[CatalogService] Error cargando indicadores:', err);
  }
  
  return [];
}

/**
 * Obtiene opciones para un trigger específico (para autocompletado)
 * @param {string} trigger - Trigger (#, [, (, {, $, >)
 * @param {string} query - Query de búsqueda
 * @param {Object} context - Contexto adicional (claseId, nivelId, etc.)
 * @returns {Promise<Array>}
 */
export async function getOptionsForTrigger(trigger, query = '', context = {}) {
  let options = [];
  
  switch (trigger) {
    case '#': // Alumnos (con #todos siempre primero)
      options = [
        { label: 'todos', value: 'todos', icon: '👥', description: 'Todos los presentes' }
      ];
      options = options.concat(await getAlumnos(context.claseId));
      break;
      
    case '[': // Contenidos
      options = await getContenidos();
      break;
      
    case '(': // Sugerencias
      options = await getSugerencias();
      break;
      
    case '{': // Tareas
      options = await getTareas();
      break;
      
    case '$': // Medidas
      options = await getMedidas();
      break;
      
    case '>': // Objetivos (niveles o nodos)
      if (query.toUpperCase().startsWith('NIVEL')) {
        options = await getNiveles();
      } else {
        options = await getNodos(context.nivelId);
      }
      break;
      
    default:
      options = [];
  }
  
  // Aplicar fuzzy search si hay query
  if (query && options.length > 0) {
    options = fuzzySearch(options, query);
  }
  
  // Agregar opciones del historial del maestro (priorizadas)
  // Solo para triggers que NO son alumnos (#), para evitar mezclar alumnos de otras clases
  if (trigger && trigger !== '#') {
    const historial = await catalogCache.getTopUsed(trigger, 3);
    const historialOptions = historial
      .flatMap(h => h.recent_selections || [])
      .filter(Boolean)
      .slice(0, 3);
    
    // Agregar al inicio si no están ya
    for (const h of historialOptions) {
      const exists = options.some(o => 
        (o.nombre || o.name || '').toLowerCase() === h.toLowerCase()
      );
      if (!exists) {
        options.unshift({ 
          nombre: h, 
          id: `hist-${h}`, 
          is_historial: true 
        });
      }
    }
  }
  
  return options;
}

/**
 * Fuzzy search simple - tolerancia a errores de tipeo
 * @param {Array} items - Array de objetos a buscar
 * @param {string} query - Query de búsqueda
 * @param {string} field - Campo a buscar (default: nombre)
 * @returns {Array}
 */
function fuzzySearch(items, query, field = 'nombre') {
  if (!query) return items;
  
  const q = query.toLowerCase();
  const qLen = q.length;
  
  // Scoring: 
  // - Comienza con el query = +10 puntos
  // - Contiene el query = +5 puntos
  // - Menos caracteres de diferencia = más puntos
  
  return items
    .map(item => {
      const text = (item[field] || item.name || item.nombre || '').toLowerCase();
      
      let score = 0;
      
      // Empieza con
      if (text.startsWith(q)) {
        score += 10;
      }
      // Contiene
      else if (text.includes(q)) {
        score += 5;
      }
      // Fuzzy: permite hasta 2 errores de tipeo
      else {
        const distance = levenshteinDistance(text, q);
        if (distance <= 2 && qLen > 3) {
          score += 3 - distance; // menos errores = más puntos
        } else {
          return null; // Excluir si no hay coincidencia
        }
      }
      
      // Bonus por longitud menor (probablemente más específico)
      if (text.length < 20) score += 1;
      
      return { ...item, _score: score };
    })
    .filter(Boolean)
    .sort((a, b) => (b._score || 0) - (a._score || 0))
    .slice(0, 15); // Limitar resultados
}

/**
 * Calcula la distancia de Levenshtein para fuzzy search
 */
function levenshteinDistance(a, b) {
  const matrix = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}

/**
 * Registra selección del usuario para mejorar fuzzy search
 * @param {string} trigger 
 * @param {string} value 
 */
export async function recordSelection(trigger, value) {
  await catalogCache.addToHistorial(trigger, value);
}

/**
 * Refresca todos los catálogos desde Supabase
 */
export async function refreshAll() {
  await Promise.all([
    getContenidos(),
    getMedidas(),
    getSugerencias(),
    getTareas(),
    getNiveles(),
    getNodos()
  ]);
}

/**
 * Limpia la cache de catálogos
 */
export async function clearCache() {
  await catalogCache.clearAll();
}

export default {
  getAlumnos,
  getContenidos,
  getMedidas,
  getSugerencias,
  getTareas,
  getNiveles,
  getNodos,
  getIndicadores,
  getRouteTree,
  getOptionsForTrigger,
  recordSelection,
  refreshAll,
  clearCache
};