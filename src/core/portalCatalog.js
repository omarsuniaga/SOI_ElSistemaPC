const definePortal = definition => Object.freeze({
  ...definition,
  aliases: Object.freeze(definition.aliases || []),
  allowedRoles: Object.freeze(definition.allowedRoles || []),
})

/** Current portal topology, recorded for comparison only. */
export const portalCatalog = Object.freeze([
  definePortal({ portalId: 'admin', path: '/admin', entry: 'admin.html', shell: 'admin-main', defaultRoute: 'dir-score', owner: 'DIR', lifecycle: 'legacy-static', health: 'unknown', allowedRoles: ['admin'] }),
  definePortal({ portalId: 'ADM', path: '/adm', entry: 'adm.html', shell: 'department-admin', defaultRoute: 'clases-hoy', hermesDept: 'ADM', owner: 'ADM', lifecycle: 'legacy-static', health: 'unknown', allowedRoles: ['admin', 'superadmin', 'coordinacion_academica'] }),
  definePortal({ portalId: 'ACM', path: '/acm', entry: 'acm.html', shell: 'department-admin', defaultRoute: 'clases', hermesDept: 'ACM', owner: 'ACM', lifecycle: 'legacy-static', health: 'unknown', allowedRoles: ['admin'] }),
  definePortal({ portalId: 'MAESTROS', path: '/', entry: 'index.html', aliases: ['/maestros.html'], shell: 'teacher', defaultRoute: 'hoy', owner: 'ACM', lifecycle: 'legacy-static', health: 'unknown', allowedRoles: ['maestro', 'admin-maestro'] }),
])

export const findPortal = portalId => portalCatalog.find(portal => portal.portalId === portalId) || null
