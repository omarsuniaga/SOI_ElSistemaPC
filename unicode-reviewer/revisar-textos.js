#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const process = require('node:process');
const { createInterface } = require('node:readline/promises');
const { TextDecoder } = require('node:util');

const DEFAULT_EXTENSIONS = new Set([
  '.html', '.js', '.jsx', '.ts', '.tsx', '.vue', '.css', '.json',
]);

const IGNORED_DIRECTORIES = new Set([
  'node_modules', 'dist', 'build', '.git',
]);

const SAFE_REPLACEMENTS = new Map([
  ['\u2018', "'"], // left single quotation mark
  ['\u2019', "'"], // right single quotation mark
  ['\u201C', '"'], // left double quotation mark
  ['\u201D', '"'], // right double quotation mark
  ['\u2013', '-'],  // en dash
  ['\u2014', '-'],  // em dash
  ['\u2026', '...'], // ellipsis
  ['\u00A0', ' '],  // non-breaking space
]);

const SPANISH_PRECOMPOSED = new Set([
  'á', 'é', 'í', 'ó', 'ú', 'ü', 'ñ',
  'Á', 'É', 'Í', 'Ó', 'Ú', 'Ü', 'Ñ',
  '¿', '¡',
]);

function createSummary() {
  return {
    scannedFiles: 0,
    ignoredFiles: 0,
    filesContainingSuspicious: 0,
    suspiciousOccurrences: 0,
    automaticReplacements: 0,
    manualReplacements: 0,
    deletedCharacters: 0,
    modifiedFiles: 0,
    backupsCreated: 0,
    unresolvedOccurrences: 0,
    plannedModifiedFiles: 0,
    stoppedEarly: false,
    errors: [],
  };
}

function parseArguments(argv) {
  const options = {
    targetPath: null,
    dryRun: false,
    autoFix: false,
    extensions: new Set(DEFAULT_EXTENSIONS),
    help: false,
  };

  for (const argument of argv) {
    if (argument === '--dry-run') {
      options.dryRun = true;
    } else if (argument === '--auto-fix') {
      options.autoFix = true;
    } else if (argument === '--no-auto-fix') {
      options.autoFix = false;
    } else if (argument === '--help' || argument === '-h') {
      options.help = true;
    } else if (argument.startsWith('--extensions=')) {
      const raw = argument.slice('--extensions='.length);
      const extensions = raw
        .split(',')
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean)
        .map((item) => (item.startsWith('.') ? item : `.${item}`));

      if (extensions.length === 0) {
        throw new Error('--extensions requires at least one extension.');
      }
      options.extensions = new Set(extensions);
    } else if (argument.startsWith('-')) {
      throw new Error(`Unknown option: ${argument}`);
    } else if (options.targetPath === null) {
      options.targetPath = argument;
    } else {
      throw new Error(`Unexpected positional argument: ${argument}`);
    }
  }

  if (!options.help && options.targetPath === null) {
    throw new Error('A target file or directory is required.');
  }

  return options;
}

function printHelp() {
  console.log(`Usage:
  node revisar-textos.js <path> [options]

Options:
  --dry-run                 Review and simulate changes without writing files.
  --auto-fix                Apply documented normalization rules automatically.
  --no-auto-fix             Require manual review (the safe default).
  --extensions=.js,.ts      Override the default extension list.
  -h, --help                Show this help.

Default extensions:
  ${[...DEFAULT_EXTENSIONS].join(', ')}

Ignored directories:
  ${[...IGNORED_DIRECTORIES].join(', ')}`);
}

function normalizeExtension(extension) {
  const value = String(extension).trim().toLowerCase();
  return value.startsWith('.') ? value : `.${value}`;
}

function isSupportedFile(filePath, extensions = DEFAULT_EXTENSIONS) {
  return extensions.has(path.extname(filePath).toLowerCase());
}

function shouldIgnoreDirectory(directoryName, ignored = IGNORED_DIRECTORIES) {
  return ignored.has(directoryName);
}

function isProbablyBinary(buffer, sampleSize = 8192) {
  const sample = buffer.subarray(0, Math.min(buffer.length, sampleSize));
  if (sample.length === 0) return false;
  if (sample.includes(0)) return true;

  let suspiciousControlBytes = 0;
  for (const byte of sample) {
    const isAllowedControl = byte === 9 || byte === 10 || byte === 13;
    const isOtherControl = byte < 32 && !isAllowedControl;
    if (isOtherControl) suspiciousControlBytes += 1;
  }

  return suspiciousControlBytes / sample.length > 0.30;
}

function decodeUtf8(buffer) {
  const hasBom = buffer.length >= 3
    && buffer[0] === 0xEF
    && buffer[1] === 0xBB
    && buffer[2] === 0xBF;
  const payload = hasBom ? buffer.subarray(3) : buffer;
  const decoder = new TextDecoder('utf-8', { fatal: true });
  return {
    text: decoder.decode(payload),
    hasBom,
  };
}

function encodeUtf8(text, hasBom = false) {
  const body = Buffer.from(text, 'utf8');
  return hasBom
    ? Buffer.concat([Buffer.from([0xEF, 0xBB, 0xBF]), body])
    : body;
}

function detectLineEnding(text) {
  const crlf = (text.match(/\r\n/g) || []).length;
  const withoutCrlf = text.replace(/\r\n/g, '');
  const lf = (withoutCrlf.match(/\n/g) || []).length;
  const cr = (withoutCrlf.match(/\r/g) || []).length;

  if (crlf >= lf && crlf >= cr && crlf > 0) return '\r\n';
  if (lf >= cr && lf > 0) return '\n';
  if (cr > 0) return '\r';
  return null;
}

function isAllowedCharacter(character, previousCharacter = '') {
  const codePoint = character.codePointAt(0);

  if (character === '\t' || character === '\n' || character === '\r') return true;
  if (codePoint >= 0x20 && codePoint <= 0x7E) return true;
  if (SPANISH_PRECOMPOSED.has(character)) return true;

  // Permit common decomposed Spanish forms, while rejecting standalone marks.
  if (character === '\u0301' && /[AEIOUaeiou]/.test(previousCharacter)) return true;
  if (character === '\u0308' && /[Uu]/.test(previousCharacter)) return true;

  return false;
}

function formatCodePoint(character) {
  const value = character.codePointAt(0).toString(16).toUpperCase();
  return `U+${value.padStart(4, '0')}`;
}

function unicodeEscape(character) {
  const codePoint = character.codePointAt(0);
  return codePoint <= 0xFFFF
    ? `\\u${codePoint.toString(16).toUpperCase().padStart(4, '0')}`
    : `\\u{${codePoint.toString(16).toUpperCase()}}`;
}

function displayCharacter(character) {
  const invisible = new Map([
    ['\u200B', '<ZERO WIDTH SPACE>'],
    ['\u200C', '<ZERO WIDTH NON-JOINER>'],
    ['\u200D', '<ZERO WIDTH JOINER>'],
    ['\u2060', '<WORD JOINER>'],
    ['\uFEFF', '<ZERO WIDTH NO-BREAK SPACE>'],
    ['\u202A', '<LEFT-TO-RIGHT EMBEDDING>'],
    ['\u202B', '<RIGHT-TO-LEFT EMBEDDING>'],
    ['\u202C', '<POP DIRECTIONAL FORMATTING>'],
    ['\u202D', '<LEFT-TO-RIGHT OVERRIDE>'],
    ['\u202E', '<RIGHT-TO-LEFT OVERRIDE>'],
    ['\u2066', '<LEFT-TO-RIGHT ISOLATE>'],
    ['\u2067', '<RIGHT-TO-LEFT ISOLATE>'],
    ['\u2068', '<FIRST STRONG ISOLATE>'],
    ['\u2069', '<POP DIRECTIONAL ISOLATE>'],
  ]);
  return invisible.get(character) || character;
}

function indexToPosition(text, codeUnitIndex) {
  let line = 1;
  let column = 1;
  let index = 0;

  while (index < codeUnitIndex) {
    const codePoint = text.codePointAt(index);
    const character = String.fromCodePoint(codePoint);

    if (character === '\r' && text[index + 1] === '\n') {
      line += 1;
      column = 1;
      index += 2;
      continue;
    }
    if (character === '\r' || character === '\n') {
      line += 1;
      column = 1;
    } else {
      column += 1;
    }
    index += character.length;
  }

  return { line, column };
}

function findLineBounds(text, codeUnitIndex) {
  let start = codeUnitIndex;
  while (start > 0 && text[start - 1] !== '\n' && text[start - 1] !== '\r') {
    start -= 1;
  }

  let end = codeUnitIndex;
  while (end < text.length && text[end] !== '\n' && text[end] !== '\r') {
    end += 1;
  }

  return { start, end };
}

function buildContext(text, codeUnitIndex, radius = 45) {
  const { start, end } = findLineBounds(text, codeUnitIndex);
  const lineText = text.slice(start, end);
  const relativeCodeUnitIndex = codeUnitIndex - start;
  const before = lineText.slice(0, relativeCodeUnitIndex);
  const character = String.fromCodePoint(lineText.codePointAt(relativeCodeUnitIndex));
  const after = lineText.slice(relativeCodeUnitIndex + character.length);

  const beforePoints = Array.from(before);
  const afterPoints = Array.from(after);
  const clippedBefore = beforePoints.slice(-radius).join('');
  const clippedAfter = afterPoints.slice(0, radius).join('');

  return `${beforePoints.length > radius ? '…' : ''}${clippedBefore}⟦${displayCharacter(character)}⟧${clippedAfter}${afterPoints.length > radius ? '…' : ''}`;
}

function findSuspiciousCharacters(text, startCodeUnitIndex = 0) {
  const findings = [];
  let index = 0;
  let line = 1;
  let column = 1;
  let previousCharacter = '';

  for (const character of text) {
    if (index >= startCodeUnitIndex && !isAllowedCharacter(character, previousCharacter)) {
      findings.push({
        character,
        codeUnitIndex: index,
        line,
        column,
        codePoint: formatCodePoint(character),
        unicode: unicodeEscape(character),
        context: buildContext(text, index),
      });
    }

    if (character === '\r' && text[index + 1] === '\n') {
      // The following LF is consumed by the for...of loop, so avoid counting it twice.
      line += 1;
      column = 1;
    } else if (character === '\n' && previousCharacter === '\r') {
      // Already counted as part of CRLF.
    } else if (character === '\r' || character === '\n') {
      line += 1;
      column = 1;
    } else {
      column += 1;
    }

    previousCharacter = character;
    index += character.length;
  }

  return findings;
}

function countOccurrences(text, search) {
  if (search === '') return 0;
  let count = 0;
  let index = 0;
  while (true) {
    index = text.indexOf(search, index);
    if (index === -1) return count;
    count += 1;
    index += search.length;
  }
}

function applySafeReplacements(text, replacements = SAFE_REPLACEMENTS) {
  let output = '';
  let count = 0;
  const byCharacter = {};

  for (const character of text) {
    if (replacements.has(character)) {
      output += replacements.get(character);
      count += 1;
      byCharacter[formatCodePoint(character)] = (byCharacter[formatCodePoint(character)] || 0) + 1;
    } else {
      output += character;
    }
  }

  return { text: output, count, byCharacter };
}

function replaceOccurrence(text, codeUnitIndex, expectedCharacter, replacement) {
  if (!text.startsWith(expectedCharacter, codeUnitIndex)) {
    throw new Error('The selected occurrence no longer matches the current text.');
  }
  return text.slice(0, codeUnitIndex)
    + replacement
    + text.slice(codeUnitIndex + expectedCharacter.length);
}

function replaceAllOccurrences(text, search, replacement) {
  const count = countOccurrences(text, search);
  return {
    text: count === 0 ? text : text.split(search).join(replacement),
    count,
  };
}

function rewriteLine(text, codeUnitIndex, replacementLine) {
  const { start, end } = findLineBounds(text, codeUnitIndex);
  return text.slice(0, start) + replacementLine + text.slice(end);
}

function isPathInside(parentPath, candidatePath) {
  const relative = path.relative(parentPath, candidatePath);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

async function validateTargetPath(targetPath) {
  const resolved = path.resolve(targetPath);
  const stats = await fsp.lstat(resolved);
  if (stats.isSymbolicLink()) {
    throw new Error('The target path cannot be a symbolic link.');
  }
  if (!stats.isFile() && !stats.isDirectory()) {
    throw new Error('The target must be a regular file or directory.');
  }
  return { resolved, stats };
}

async function collectFiles(targetPath, options, summary) {
  const files = [];

  async function walk(currentPath) {
    let stats;
    try {
      stats = await fsp.lstat(currentPath);
    } catch (error) {
      summary.errors.push(`${currentPath}: ${error.message}`);
      return;
    }

    if (stats.isSymbolicLink()) {
      summary.ignoredFiles += 1;
      return;
    }

    if (stats.isFile()) {
      if (isSupportedFile(currentPath, options.extensions)) {
        files.push(currentPath);
      } else {
        summary.ignoredFiles += 1;
      }
      return;
    }

    if (!stats.isDirectory()) {
      summary.ignoredFiles += 1;
      return;
    }

    let entries;
    try {
      entries = await fsp.readdir(currentPath, { withFileTypes: true });
    } catch (error) {
      summary.errors.push(`${currentPath}: ${error.message}`);
      return;
    }

    entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      if (entry.isDirectory() && shouldIgnoreDirectory(entry.name)) {
        continue;
      }
      await walk(path.join(currentPath, entry.name));
    }
  }

  await walk(targetPath);
  return files;
}

async function readTextFile(filePath) {
  const buffer = await fsp.readFile(filePath);
  if (isProbablyBinary(buffer)) {
    return { binary: true };
  }

  const decoded = decodeUtf8(buffer);
  return {
    binary: false,
    text: decoded.text,
    hasBom: decoded.hasBom,
    lineEnding: detectLineEnding(decoded.text),
  };
}

async function nextBackupPath(filePath) {
  let candidate = `${filePath}.bak`;
  let suffix = 1;

  while (true) {
    try {
      await fsp.access(candidate, fs.constants.F_OK);
      candidate = `${filePath}.bak.${suffix}`;
      suffix += 1;
    } catch (error) {
      if (error.code === 'ENOENT') return candidate;
      throw error;
    }
  }
}

async function createBackup(filePath) {
  const backupPath = await nextBackupPath(filePath);
  await fsp.copyFile(filePath, backupPath, fs.constants.COPYFILE_EXCL);
  return backupPath;
}

async function writeFileAtomically(filePath, buffer) {
  const directory = path.dirname(filePath);
  const base = path.basename(filePath);
  const temporaryPath = path.join(
    directory,
    `.${base}.${process.pid}.${Date.now()}.${Math.random().toString(16).slice(2)}.tmp`,
  );
  const stats = await fsp.stat(filePath);

  try {
    const handle = await fsp.open(temporaryPath, 'wx', stats.mode);
    try {
      await handle.writeFile(buffer);
      await handle.sync();
    } finally {
      await handle.close();
    }
    await fsp.rename(temporaryPath, filePath);
  } catch (error) {
    await fsp.rm(temporaryPath, { force: true }).catch(() => {});
    throw error;
  }
}

function createQuestionInterface() {
  return createInterface({ input: process.stdin, output: process.stdout });
}

async function askForAction(rl) {
  while (true) {
    const answer = (await rl.question(
      '[i]gnore, [r]eplace once, replace [a]ll in file, rewrite [l]ine, [d]elete, [k]skip file, [q]uit: ',
    )).trim().toLowerCase();

    if (['i', 'r', 'a', 'l', 'd', 'k', 'q'].includes(answer)) return answer;
    console.log('Invalid option. Enter i, r, a, l, d, k, or q.');
  }
}

function printFinding(filePath, finding) {
  console.log('\nSuspicious character found');
  console.log(`  File:      ${filePath}`);
  console.log(`  Line:      ${finding.line}`);
  console.log(`  Column:    ${finding.column}`);
  console.log(`  Character: ${displayCharacter(finding.character)}`);
  console.log(`  Code point:${finding.codePoint}`);
  console.log(`  Unicode:   ${finding.unicode}`);
  console.log(`  Context:   ${finding.context}`);
}

async function reviewSuspiciousCharacters(filePath, initialText, rl) {
  let text = initialText;
  let cursor = 0;
  let stopAll = false;
  let skippedFile = false;
  let manualReplacements = 0;
  let deletedCharacters = 0;

  while (true) {
    const finding = findSuspiciousCharacters(text, cursor)[0];
    if (!finding) break;

    printFinding(filePath, finding);
    const action = await askForAction(rl);

    if (action === 'i') {
      cursor = finding.codeUnitIndex + finding.character.length;
      continue;
    }

    if (action === 'r') {
      const replacement = await rl.question('Replacement text: ');
      text = replaceOccurrence(text, finding.codeUnitIndex, finding.character, replacement);
      manualReplacements += 1;
      cursor = finding.codeUnitIndex + replacement.length;
      continue;
    }

    if (action === 'a') {
      const replacement = await rl.question('Replacement text for all occurrences in this file: ');
      const result = replaceAllOccurrences(text, finding.character, replacement);
      text = result.text;
      manualReplacements += result.count;
      cursor = 0;
      continue;
    }

    if (action === 'l') {
      const replacementLine = await rl.question('New complete line: ');
      const { start } = findLineBounds(text, finding.codeUnitIndex);
      text = rewriteLine(text, finding.codeUnitIndex, replacementLine);
      manualReplacements += 1;
      cursor = start + replacementLine.length;
      continue;
    }

    if (action === 'd') {
      text = replaceOccurrence(text, finding.codeUnitIndex, finding.character, '');
      deletedCharacters += 1;
      cursor = finding.codeUnitIndex;
      continue;
    }

    if (action === 'k') {
      skippedFile = true;
      break;
    }

    if (action === 'q') {
      stopAll = true;
      break;
    }
  }

  return {
    text,
    stopAll,
    skippedFile,
    manualReplacements,
    deletedCharacters,
  };
}

async function processFile(filePath, options, rl, summary) {
  summary.scannedFiles += 1;

  let loaded;
  try {
    loaded = await readTextFile(filePath);
  } catch (error) {
    summary.errors.push(`${filePath}: ${error.message}`);
    return { stopAll: false };
  }

  if (loaded.binary) {
    summary.ignoredFiles += 1;
    return { stopAll: false };
  }

  const originalText = loaded.text;
  let workingText = originalText;
  let automaticCount = 0;

  if (options.autoFix) {
    const normalized = applySafeReplacements(workingText);
    workingText = normalized.text;
    automaticCount = normalized.count;
  }

  const suspiciousBeforeReview = findSuspiciousCharacters(workingText);
  const totalDetected = automaticCount + suspiciousBeforeReview.length;

  if (totalDetected > 0) {
    summary.filesContainingSuspicious += 1;
    summary.suspiciousOccurrences += totalDetected;
  }

  let reviewResult = {
    text: workingText,
    stopAll: false,
    skippedFile: false,
    manualReplacements: 0,
    deletedCharacters: 0,
  };
  if (suspiciousBeforeReview.length > 0) {
    reviewResult = await reviewSuspiciousCharacters(filePath, workingText, rl);
    workingText = reviewResult.text;
  }

  // Skip and quit discard every in-memory change made to the current file.
  const discarded = reviewResult.skippedFile || reviewResult.stopAll;
  if (discarded) {
    workingText = originalText;
  } else {
    summary.automaticReplacements += automaticCount;
    summary.manualReplacements += reviewResult.manualReplacements;
    summary.deletedCharacters += reviewResult.deletedCharacters;
  }

  const unresolved = findSuspiciousCharacters(workingText).length;
  summary.unresolvedOccurrences += unresolved;

  const changed = workingText !== originalText;
  if (changed) {
    summary.plannedModifiedFiles += 1;
  }

  if (changed && !options.dryRun) {
    try {
      await createBackup(filePath);
      summary.backupsCreated += 1;
      await writeFileAtomically(filePath, encodeUtf8(workingText, loaded.hasBom));
      summary.modifiedFiles += 1;
    } catch (error) {
      summary.errors.push(`${filePath}: ${error.message}`);
    }
  }

  return { stopAll: reviewResult.stopAll };
}

function formatSummary(summary, dryRun = false) {
  const lines = [
    '',
    'Scan summary',
    `  Scanned files:                    ${summary.scannedFiles}`,
    `  Ignored files:                    ${summary.ignoredFiles}`,
    `  Files with suspicious characters:${summary.filesContainingSuspicious}`,
    `  Suspicious occurrences:          ${summary.suspiciousOccurrences}`,
    `  Automatic replacements:          ${summary.automaticReplacements}`,
    `  Manual replacements:             ${summary.manualReplacements}`,
    `  Deleted characters:              ${summary.deletedCharacters}`,
    `  Modified files:                  ${summary.modifiedFiles}`,
    `  Backup files created:            ${summary.backupsCreated}`,
    `  Unresolved occurrences:          ${summary.unresolvedOccurrences}`,
  ];

  if (dryRun) {
    lines.push(`  Files that would be modified:    ${summary.plannedModifiedFiles}`);
  }
  lines.push(`  Errors:                          ${summary.errors.length}`);

  if (summary.stoppedEarly) {
    lines.push('  Status:                          stopped by user');
  }
  if (summary.errors.length > 0) {
    lines.push('', 'Errors:');
    for (const error of summary.errors) lines.push(`  - ${error}`);
  }

  return lines.join('\n');
}

async function run(options, dependencies = {}) {
  const summary = createSummary();
  const rl = dependencies.rl || createQuestionInterface();
  const ownsRl = !dependencies.rl;

  try {
    const { resolved } = await validateTargetPath(options.targetPath);
    const files = await collectFiles(resolved, options, summary);

    for (const filePath of files) {
      const result = await processFile(filePath, options, rl, summary);
      if (result.stopAll) {
        summary.stoppedEarly = true;
        break;
      }
    }
  } finally {
    if (ownsRl) rl.close();
  }

  return summary;
}

async function main() {
  try {
    const options = parseArguments(process.argv.slice(2));
    if (options.help) {
      printHelp();
      return;
    }

    const summary = await run(options);
    console.log(formatSummary(summary, options.dryRun));
    process.exitCode = summary.errors.length > 0 ? 1 : 0;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    printHelp();
    process.exitCode = 1;
  }
}

module.exports = {
  DEFAULT_EXTENSIONS,
  IGNORED_DIRECTORIES,
  SAFE_REPLACEMENTS,
  createSummary,
  parseArguments,
  normalizeExtension,
  isSupportedFile,
  shouldIgnoreDirectory,
  isProbablyBinary,
  decodeUtf8,
  encodeUtf8,
  detectLineEnding,
  isAllowedCharacter,
  formatCodePoint,
  unicodeEscape,
  displayCharacter,
  indexToPosition,
  findLineBounds,
  buildContext,
  findSuspiciousCharacters,
  countOccurrences,
  applySafeReplacements,
  replaceOccurrence,
  replaceAllOccurrences,
  rewriteLine,
  isPathInside,
  validateTargetPath,
  collectFiles,
  readTextFile,
  nextBackupPath,
  createBackup,
  writeFileAtomically,
  reviewSuspiciousCharacters,
  processFile,
  formatSummary,
  run,
  main,
};

if (require.main === module) {
  main();
}
