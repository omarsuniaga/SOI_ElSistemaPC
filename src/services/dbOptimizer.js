/**
 * Database Optimizer
 * Index definitions and query optimization
 */

const DATABASE_INDEXES = [
  {
    table: 'observations',
    columns: ['student_id', 'created_at'],
    name: 'obs_student_date',
    type: 'btree',
    reason: 'Query by student over time',
  },
  {
    table: 'observations',
    columns: ['maestro_id', 'created_at'],
    name: 'obs_maestro_date',
    type: 'btree',
    reason: 'Teacher view of observations',
  },
  {
    table: 'evaluations',
    columns: ['student_id', 'route_id'],
    name: 'eval_student_route',
    type: 'btree',
    reason: 'Progress tracking queries',
  },
  {
    table: 'audit_logs',
    columns: ['user_id', 'created_at'],
    name: 'audit_user_date',
    type: 'btree',
    reason: 'Audit log queries',
  },
  {
    table: 'notifications',
    columns: ['user_id', 'leida', 'created_at'],
    name: 'notif_user_read_date',
    type: 'btree',
    reason: 'Notification fetching',
  },
  {
    table: 'lesson_plans',
    columns: ['maestro_id', 'published', 'created_at'],
    name: 'plan_maestro_published',
    type: 'btree',
    reason: 'Teacher lesson plans',
  },
  {
    table: 'students',
    columns: ['maestro_id', 'route_id'],
    name: 'student_maestro_route',
    type: 'btree',
    reason: 'Student roster queries',
  },
]

const QUERY_COLUMNS = {
  observations: ['student_id', 'maestro_id', 'clase_id', 'created_at'],
  evaluations: ['student_id', 'maestro_id', 'route_id', 'period'],
  notifications: ['user_id', 'leida', 'created_at'],
  lesson_plans: ['maestro_id', 'route_id', 'published'],
  students: ['maestro_id', 'route_id', 'nombre'],
  audit_logs: ['user_id', 'action', 'entity', 'created_at'],
}

let queryStats = {
  totalQueries: 0,
  slowQueries: 0,
  indexHits: 0,
  indexMisses: 0,
}

/**
 * Get all defined indexes
 */
export function getIndexes() {
  return [...DATABASE_INDEXES]
}

/**
 * Optimize a query based on available indexes
 * @param {Object} query - Query object
 * @returns {Object} Optimization result
 */
export function optimizeQuery(query) {
  queryStats.totalQueries++

  const { table, where = {} } = query
  const whereKeys = Object.keys(where)
  const tableIndexes = DATABASE_INDEXES.filter(idx => idx.table === table)

  const result = {
    table,
    where: whereKeys,
    optimized: false,
    usesIndex: false,
    suggestIndex: null,
  }

  for (const index of tableIndexes) {
    const indexCols = index.columns
    const matchingCols = whereKeys.filter(key => indexCols.includes(key))

    if (matchingCols.length > 0) {
      result.usesIndex = true
      result.usedIndex = index.name
      result.optimized = true
      queryStats.indexHits++
      return result
    }
  }

  queryStats.indexMisses++

  const missingCols = whereKeys.filter(key => !QUERY_COLUMNS[table]?.includes(key))
  if (missingCols.length > 0) {
    result.suggestIndex = {
      table,
      columns: missingCols,
      name: `${table}_${missingCols.join('_')}`,
    }
  }

  return result
}

/**
 * Explain query execution plan
 * @param {Object} query - Query object
 */
export function explainQuery(query) {
  const optimization = optimizeQuery(query)

  return {
    query,
    type: optimization.usesIndex ? 'index_scan' : 'seq_scan',
    usedIndex: optimization.usedIndex || null,
    estimatedRows: optimization.usesIndex ? 10 : 1000,
    recommendations: optimization.suggestIndex 
      ? [`Create index on ${optimization.suggestIndex.table}(${optimization.suggestIndex.columns.join(', ')})`]
      : [],
  }
}

/**
 * Get query statistics
 */
export function getQueryStats() {
  return { ...queryStats }
}

/**
 * Reset query statistics
 */
export function resetStats() {
  queryStats = {
    totalQueries: 0,
    slowQueries: 0,
    indexHits: 0,
    indexMisses: 0,
  }
}

/**
 * Generate SQL for creating indexes
 */
export function generateIndexSQL() {
  return DATABASE_INDEXES.map(idx => 
    `CREATE INDEX IF NOT EXISTS ${idx.name} ON ${idx.table} (${idx.columns.join(', ')});`
  ).join('\n')
}

/**
 * Apply/execute a suggested SQL index in-memory
 * @param {string} sql - SQL statement like "CREATE INDEX IF NOT EXISTS idx_name ON table (col1, col2);"
 * @returns {Object} Result with success status and message
 */
export function applyIndex(sql) {
  if (!sql) return { success: false, error: 'No SQL provided' }
  try {
    // Matches: CREATE INDEX [IF NOT EXISTS] (\w+) ON (\w+)\s*\(([^)]+)\)
    const regex = /CREATE\s+INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)\s+ON\s+(\w+)\s*\(([^)]+)\)/i
    const match = sql.match(regex)
    if (!match) {
      return { success: false, error: 'Could not parse SQL statement format' }
    }
    const [, name, table, columnsStr] = match
    const columns = columnsStr.split(',').map(c => c.trim().replace(/['"`]/g, ''))
    
    // Check if index already exists
    const exists = DATABASE_INDEXES.some(idx => idx.name.toLowerCase() === name.toLowerCase())
    if (exists) {
      return { success: true, message: `Index '${name}' already exists.`, added: false }
    }

    DATABASE_INDEXES.push({
      table: table.toLowerCase(),
      columns,
      name,
      type: 'btree',
      reason: 'AI/User optimized'
    })

    return { success: true, message: `Index '${name}' applied successfully.`, added: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export default {
  getIndexes,
  optimizeQuery,
  explainQuery,
  getQueryStats,
  resetStats,
  generateIndexSQL,
  applyIndex,
}