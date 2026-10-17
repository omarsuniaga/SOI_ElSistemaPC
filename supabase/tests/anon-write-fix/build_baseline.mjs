// Builds an isolated PostgreSQL database that approximates the SOI production
// database as described by the repository:
//   1. Supabase platform bootstrap (roles, auth/storage stubs, legacy default grants)
//   2. supabase/migrations/schema_reference.sql  (catalog dump of 2026-09-08)
//   3. GRANT/REVOKE/DEFAULT PRIVILEGES statements of every earlier migration
//      (the dump carries no ACLs)
//   4. Every migration newer than the dump, executed in version order
//
// TEST HARNESS ONLY. Needs a throw-away PostgreSQL; never point it at a real project.
//
// Usage: node build_baseline.mjs <dbname> [--through <version>] [--skip <file,...>]
//   env: PGHOST PGPORT PGUSER PGPASSWORD (defaults: 127.0.0.1 54329 postgres test)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const here = path.dirname(fileURLToPath(import.meta.url));
const MIG = path.resolve(here, '../../migrations');
const DUMP_CUTOFF = '20260908142000'; // schema_reference.sql was extracted right after this migration

const args = process.argv.slice(2);
const dbName = args[0];
if (!dbName) throw new Error('usage: build_baseline.mjs <dbname> [--through <version>] [--skip a.sql,b.sql]');
const opt = (k) => (args.includes(k) ? args[args.indexOf(k) + 1] : undefined);
const through = opt('--through');
const skip = new Set((opt('--skip') || '').split(',').filter(Boolean));

const conn = {
  host: process.env.PGHOST || '127.0.0.1',
  port: Number(process.env.PGPORT || 54329),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'test',
};

/** Splits SQL into statements, honouring quotes, comments and dollar quoting. */
export function splitSql(sql) {
  const out = [];
  let buf = '';
  let i = 0;
  const n = sql.length;
  while (i < n) {
    const c = sql[i];
    const two = sql.substr(i, 2);
    if (two === '--') {
      const e = sql.indexOf('\n', i);
      const end = e === -1 ? n : e;
      buf += sql.slice(i, end);
      i = end;
    } else if (two === '/*') {
      const e = sql.indexOf('*/', i + 2);
      const end = e === -1 ? n : e + 2;
      buf += sql.slice(i, end);
      i = end;
    } else if (c === "'") {
      let j = i + 1;
      while (j < n) {
        if (sql[j] === "'" && sql[j + 1] === "'") j += 2;
        else if (sql[j] === "'") break;
        else j++;
      }
      buf += sql.slice(i, j + 1);
      i = j + 1;
    } else if (c === '"') {
      const e = sql.indexOf('"', i + 1);
      const end = e === -1 ? n : e + 1;
      buf += sql.slice(i, end);
      i = end;
    } else if (c === '$') {
      const m = /^\$([A-Za-z_][A-Za-z0-9_]*)?\$/.exec(sql.slice(i, i + 64));
      if (m) {
        const tag = m[0];
        const e = sql.indexOf(tag, i + tag.length);
        const end = e === -1 ? n : e + tag.length;
        buf += sql.slice(i, end);
        i = end;
      } else {
        buf += c;
        i++;
      }
    } else if (c === ';') {
      if (buf.trim()) out.push(buf.trim());
      buf = '';
      i++;
    } else {
      buf += c;
      i++;
    }
  }
  if (buf.trim()) out.push(buf.trim());
  return out;
}

const stripLeadingComments = (s) => s.replace(/^(\s*--[^\n]*\n|\s*\/\*[\s\S]*?\*\/)+/g, '').trim();
const isAclStatement = (s) =>
  /^(GRANT|REVOKE)\b/i.test(s) || /^ALTER\s+DEFAULT\s+PRIVILEGES\b/i.test(s) || /^ALTER\s+TABLE\b[\s\S]*\b(ENABLE|DISABLE|FORCE|NO\s+FORCE)\s+ROW\s+LEVEL\s+SECURITY\b/i.test(s);

async function run(client, stmt) {
  try {
    await client.query(stmt);
    return null;
  } catch (e) {
    return e;
  }
}

const admin = new pg.Client({ ...conn, database: 'postgres' });
await admin.connect();
await admin.query(`DROP DATABASE IF EXISTS "${dbName}" WITH (FORCE)`);
await admin.query(`CREATE DATABASE "${dbName}"`);
await admin.end();

const db = new pg.Client({ ...conn, database: dbName });
await db.connect();
await db.query(`SET search_path = public, extensions`);

// 1. bootstrap
await db.query(fs.readFileSync(path.join(here, '00_supabase_bootstrap.sql'), 'utf8'));
await db.query(`SET search_path = public, extensions`);

// 1b. enum types: schema_reference.sql omits them, the 2026-09-10 introspection snapshot lists them
{
  const snap = fs.readFileSync(path.resolve(here, '../../../database/schema_reference_2026-09-10.sql'), 'utf8');
  const a = snap.indexOf('-- 3. TIPOS ENUM');
  const b = snap.indexOf('-- 4. TABLAS BASE');
  let n = 0;
  for (const s of splitSql(snap.slice(a, b)).map(stripLeadingComments).filter(Boolean)) if (!(await run(db, s))) n++;
  console.log(`enum types created: ${n}`);
}

// 2. canonical dump, multi-pass until no progress (forward references)
// Inline foreign keys form cycles in the dump: lift them out of CREATE TABLE and add them last.
const deferredFks = [];
function liftForeignKeys(stmt) {
  const m = /^CREATE TABLE\s+(public\."?[\w]+"?)\s*\(/i.exec(stmt);
  if (!m) return stmt;
  // the dump prints array columns as bare "ARRAY": recover the element type from the default
  const lines = stmt.split('\n').map((l) => l.replace(/^(\s*"\w+"\s+)ARRAY(?=[\s,]|$)/, (_, pre) => {
    const t = /::(\w+)\[\]/.exec(l);
    return `${pre}${t ? t[1] : 'text'}[]`;
  }));
  const kept = [];
  for (const line of lines) {
    const fk = /^\s*CONSTRAINT\s+("?[\w]+"?)\s+FOREIGN KEY(.*?),?\s*$/i.exec(line);
    if (fk) deferredFks.push(`ALTER TABLE ${m[1]} ADD CONSTRAINT ${fk[1]} FOREIGN KEY${fk[2]}`);
    else kept.push(line);
  }
  // drop a dangling comma before the closing parenthesis
  for (let k = kept.length - 1; k > 0; k--) {
    if (/^\)/.test(kept[k].trim())) { kept[k - 1] = kept[k - 1].replace(/,\s*$/, ''); break; }
  }
  return kept.join('\n');
}
let pending = splitSql(fs.readFileSync(path.join(MIG, 'schema_reference.sql'), 'utf8'))
  .map(stripLeadingComments)
  .filter(Boolean)
  .map(liftForeignKeys);
// functions may reference tables; policies reference functions: order is resolved by the multi-pass loop

const total = pending.length;
for (let pass = 1; pass <= 12 && pending.length; pass++) {
  const next = [];
  let progressed = 0;
  for (const stmt of pending) {
    const err = await run(db, stmt);
    if (!err || /already exists/.test(err.message)) progressed++;
    else next.push(stmt);
  }
  console.log(`dump pass ${pass}: ok=${progressed} pending=${next.length}`);
  if (!progressed) { pending = next; break; }
  pending = next;
}
let fkOk = 0;
for (const fk of deferredFks) { if (!(await run(db, fk))) fkOk++; }
console.log(`foreign keys: ${fkOk}/${deferredFks.length}`);
fs.writeFileSync(path.join(process.env.TEMP || '/tmp', `dump_unloaded_${dbName}.sql`), pending.join(';\n\n') + ';\n');
console.log(`dump: ${total - pending.length}/${total} statements applied`);

// 3/4. migrations
const files = fs.readdirSync(MIG).filter((f) => /^\d+_.*\.sql$/.test(f)).sort((a, b) => {
  const va = a.split('_')[0], vb = b.split('_')[0];
  return va === vb ? a.localeCompare(b) : va.localeCompare(vb);
});
// normalise short versions (e.g. 20260507) vs long ones for cutoff comparison
const pad = (v) => v.padEnd(14, '0');
const errors = [];
let aclApplied = 0, migApplied = 0, migFailed = 0;
for (const f of files) {
  const v = f.split('_')[0];
  if (through && pad(v) > pad(through)) break;
  if (skip.has(f)) continue;
  const stmts = splitSql(fs.readFileSync(path.join(MIG, f), 'utf8')).map(stripLeadingComments).filter(Boolean);
  const afterDump = pad(v) > pad(DUMP_CUTOFF);
  if (!afterDump) {
    for (const s of stmts) if (isAclStatement(s)) { if (!(await run(db, s))) aclApplied++; }
  } else {
    let failed = false;
    for (const s of stmts) {
      if (/^(BEGIN|COMMIT|ROLLBACK)$/i.test(s)) continue;
      const err = await run(db, s);
      if (err) { failed = true; errors.push(`${f}: ${err.message}`); }
    }
    failed ? migFailed++ : migApplied++;
  }
}
console.log(`pre-dump ACL statements applied: ${aclApplied}; post-dump migrations clean=${migApplied} with_errors=${migFailed}`);
fs.writeFileSync(path.join(process.env.TEMP || '/tmp', `migration_errors_${dbName}.log`), errors.join('\n'));
await db.end();
