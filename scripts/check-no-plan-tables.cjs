#!/usr/bin/env node
/**
 * CI guard: ensures no plan_* table references remain in src/.
 * Run with: npm run check:no-plan-tables
 * Exits 1 if any match is found; exits 0 if clean.
 */

const fs = require('fs');
const path = require('path');

const DEPRECATED_TABLES = [
  'plan_clases',
  'plan_niveles',
  'plan_temas',
  'plan_objetivos',
  'plan_indicadores',
];

const SRC_DIR = path.resolve(__dirname, '..', 'src');
const PATTERN = new RegExp(DEPRECATED_TABLES.join('|'));

// Legacy CRUD admin files that manage plan_* tables directly are allowed as exceptions.
// These files are deprecated and should be removed once plan_* tables are dropped.
// These two files contain the legacy CRUD admin for plan_* tables.
// They must be removed once the tables are dropped in a future migration.
const ALLOWED_EXCEPTIONS = [
  path.normalize('portal-maestros/views/components/routeConfigurator.js'),
  path.normalize('portal-maestros/views/planificacionView.js'),
];

let found = false;

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath);
    } else if (entry.isFile() && /\.(js|ts|jsx|tsx)$/.test(entry.name)) {
      // Skip allowed legacy CRUD exceptions
      const relPath = path.relative(SRC_DIR, fullPath);
      if (ALLOWED_EXCEPTIONS.some(ex => relPath.includes(ex) || path.normalize(relPath) === ex)) return;

      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (PATTERN.test(line)) {
          // Ignore comment-only lines
          const trimmed = line.trim();
          if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;
          console.error(`FOUND: ${fullPath}:${idx + 1}: ${line.trim()}`);
          found = true;
        }
      });
    }
  }
}

walkDir(SRC_DIR);

if (found) {
  console.error('\nERROR: plan_* table references found in src/. Migrate to routes hierarchy.');
  process.exit(1);
} else {
  console.log('OK: no plan_* table references in src/');
  process.exit(0);
}
