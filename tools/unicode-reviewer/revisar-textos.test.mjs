import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const require = createRequire(import.meta.url);
const reviewer = require('./revisar-textos.js');

const temporaryDirectories = [];

async function makeTempDirectory() {
  const directory = await fsp.mkdtemp(path.join(os.tmpdir(), 'unicode-reviewer-'));
  temporaryDirectories.push(directory);
  return directory;
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      fsp.rm(directory, { recursive: true, force: true }),
    ),
  );
});

describe('argument parsing and file filters', () => {
  it('parses the supported CLI options', () => {
    const options = reviewer.parseArguments([
      './src',
      '--dry-run',
      '--auto-fix',
      '--extensions=js,TS,.vue',
    ]);

    expect(options.targetPath).toBe('./src');
    expect(options.dryRun).toBe(true);
    expect(options.autoFix).toBe(true);
    expect([...options.extensions]).toEqual(['.js', '.ts', '.vue']);
  });


  it('keeps automatic normalization opt-in by default', () => {
    const options = reviewer.parseArguments(['./src']);
    expect(options.autoFix).toBe(false);
  });

  it('rejects unknown options and missing targets', () => {
    expect(() => reviewer.parseArguments(['--wat'])).toThrow(/Unknown option/);
    expect(() => reviewer.parseArguments([])).toThrow(/target file or directory/);
  });

  it('supports the documented extensions and excludes unsupported files', () => {
    expect(reviewer.isSupportedFile('component.VUE')).toBe(true);
    expect(reviewer.isSupportedFile('notes.md')).toBe(false);
  });

  it.each(['node_modules', 'dist', 'build', '.git'])(
    'ignores the %s directory',
    (name) => expect(reviewer.shouldIgnoreDirectory(name)).toBe(true),
  );
});

describe('Unicode validation and reporting', () => {
  it('allows normal English, Spanish, and common programming symbols', () => {
    const text = `const año = "pingüino";\n// ¡Árbol, canción, acción!\nif (a <= 10 && b !== null) { return true; }`;
    expect(reviewer.findSuspiciousCharacters(text)).toEqual([]);
  });

  it('allows decomposed Spanish acute accents and diaeresis', () => {
    const decomposed = 'cancio\u0301n pingu\u0308ino';
    expect(reviewer.findSuspiciousCharacters(decomposed)).toEqual([]);
  });

  it.each([
    ['Chinese', 'const value = "中文";'],
    ['Japanese', 'const value = "かな";'],
    ['Cyrillic', 'const value = "Привет";'],
    ['emoji', 'const value = "🙂";'],
    ['zero-width space', 'const\u200Bvalue = 1;'],
  ])('detects %s characters', (_label, text) => {
    expect(reviewer.findSuspiciousCharacters(text).length).toBeGreaterThan(0);
  });

  it('reports line, code-point column, code point, and context correctly', () => {
    const findings = reviewer.findSuspiciousCharacters('ok\nA🙂B');
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({
      character: '🙂',
      line: 2,
      column: 2,
      codePoint: 'U+1F642',
      unicode: '\\u{1F642}',
    });
    expect(findings[0].context).toContain('⟦🙂⟧');
  });

  it('detects multiple suspicious characters on one line', () => {
    const findings = reviewer.findSuspiciousCharacters('a中🙂я');
    expect(findings.map((item) => item.character)).toEqual(['中', '🙂', 'я']);
    expect(findings.map((item) => item.column)).toEqual([2, 3, 4]);
  });
});

describe('safe normalization', () => {
  it('normalizes quotation marks, dashes, ellipsis, and NBSP', () => {
    const input = '“Hola” ‘mundo’ — prueba – fin… A\u00A0B';
    const result = reviewer.applySafeReplacements(input);

    expect(result.text).toBe('"Hola" \'mundo\' - prueba - fin... A B');
    expect(result.count).toBe(8);
  });

  it('does not alter ordinary source code', () => {
    const input = 'const x = "hello";';
    expect(reviewer.applySafeReplacements(input)).toMatchObject({ text: input, count: 0 });
  });
});

describe('replacement helpers', () => {
  it('replaces only the selected occurrence', () => {
    expect(reviewer.replaceOccurrence('中 x 中', 0, '中', 'A')).toBe('A x 中');
  });

  it('refuses a stale or incorrect occurrence index', () => {
    expect(() => reviewer.replaceOccurrence('abc', 1, 'x', 'y')).toThrow(/no longer matches/);
  });

  it('replaces every selected character and no unrelated text', () => {
    const result = reviewer.replaceAllOccurrences('中 x 中 y', '中', 'A');
    expect(result).toEqual({ text: 'A x A y', count: 2 });
  });

  it('deletes a surrogate-pair character without corrupting adjacent text', () => {
    expect(reviewer.replaceOccurrence('A🙂B', 1, '🙂', '')).toBe('AB');
  });

  it('rewrites one line while preserving the rest and its line endings', () => {
    const input = 'first\r\nbad中line\r\nthird';
    const index = input.indexOf('中');
    expect(reviewer.rewriteLine(input, index, 'correct line')).toBe(
      'first\r\ncorrect line\r\nthird',
    );
  });
});

describe('encoding, line endings, and binary detection', () => {
  it('detects common line-ending styles', () => {
    expect(reviewer.detectLineEnding('a\r\nb\r\n')).toBe('\r\n');
    expect(reviewer.detectLineEnding('a\nb\n')).toBe('\n');
    expect(reviewer.detectLineEnding('a\rb\r')).toBe('\r');
    expect(reviewer.detectLineEnding('single line')).toBeNull();
  });

  it('round-trips UTF-8 BOM files', () => {
    const encoded = reviewer.encodeUtf8('á', true);
    const decoded = reviewer.decodeUtf8(encoded);
    expect(decoded).toEqual({ text: 'á', hasBom: true });
  });

  it('rejects invalid UTF-8 and detects obvious binary data', () => {
    expect(() => reviewer.decodeUtf8(Buffer.from([0xC3, 0x28]))).toThrow();
    expect(reviewer.isProbablyBinary(Buffer.from([0x41, 0x00, 0x42]))).toBe(true);
    expect(reviewer.isProbablyBinary(Buffer.from('const x = 1;'))).toBe(false);
  });
});

describe('filesystem safety', () => {
  it('creates a backup and never overwrites an existing backup', async () => {
    const directory = await makeTempDirectory();
    const file = path.join(directory, 'file.js');
    await fsp.writeFile(file, 'original');

    const first = await reviewer.createBackup(file);
    await fsp.writeFile(file, 'changed');
    const second = await reviewer.createBackup(file);

    expect(path.basename(first)).toBe('file.js.bak');
    expect(path.basename(second)).toBe('file.js.bak.1');
    expect(await fsp.readFile(first, 'utf8')).toBe('original');
    expect(await fsp.readFile(second, 'utf8')).toBe('changed');
  });

  it('writes atomically and preserves the file mode', async () => {
    const directory = await makeTempDirectory();
    const file = path.join(directory, 'file.js');
    await fsp.writeFile(file, 'old');
    await fsp.chmod(file, 0o640);

    await reviewer.writeFileAtomically(file, Buffer.from('new'));

    expect(await fsp.readFile(file, 'utf8')).toBe('new');
    if (process.platform !== 'win32') {
      expect((await fsp.stat(file)).mode & 0o777).toBe(0o640);
    }
    expect((await fsp.readdir(directory)).some((name) => name.endsWith('.tmp'))).toBe(false);
  });

  it('does not follow symbolic links during traversal', async () => {
    const directory = await makeTempDirectory();
    const real = path.join(directory, 'real');
    await fsp.mkdir(real);
    await fsp.writeFile(path.join(real, 'ok.js'), 'const x = 1;');

    const link = path.join(directory, 'loop');
    try {
      await fsp.symlink(directory, link, process.platform === 'win32' ? 'junction' : 'dir');
    } catch (error) {
      if (error.code === 'EPERM') return;
      throw error;
    }

    const summary = reviewer.createSummary();
    const files = await reviewer.collectFiles(directory, {
      extensions: reviewer.DEFAULT_EXTENSIONS,
    }, summary);

    expect(files).toEqual([path.join(real, 'ok.js')]);
    expect(summary.ignoredFiles).toBe(1);
  });

  it('skips ignored directories and unsupported files', async () => {
    const directory = await makeTempDirectory();
    await fsp.writeFile(path.join(directory, 'root.js'), 'ok');
    await fsp.writeFile(path.join(directory, 'readme.md'), 'ignored');

    for (const ignored of reviewer.IGNORED_DIRECTORIES) {
      const ignoredPath = path.join(directory, ignored);
      await fsp.mkdir(ignoredPath);
      await fsp.writeFile(path.join(ignoredPath, 'bad.js'), '中');
    }

    const summary = reviewer.createSummary();
    const files = await reviewer.collectFiles(directory, {
      extensions: reviewer.DEFAULT_EXTENSIONS,
    }, summary);

    expect(files).toEqual([path.join(directory, 'root.js')]);
    expect(summary.ignoredFiles).toBe(1);
  });

  it('does not create a backup when processFile produces no change', async () => {
    const directory = await makeTempDirectory();
    const file = path.join(directory, 'clean.js');
    await fsp.writeFile(file, 'const año = "ok";');

    const summary = reviewer.createSummary();
    const fakeRl = { question: async () => { throw new Error('should not prompt'); } };
    await reviewer.processFile(file, {
      autoFix: true,
      dryRun: false,
    }, fakeRl, summary);

    expect(summary.backupsCreated).toBe(0);
    expect(summary.modifiedFiles).toBe(0);
    expect(fs.existsSync(`${file}.bak`)).toBe(false);
  });

  it('creates a backup before an automatic change and preserves a BOM', async () => {
    const directory = await makeTempDirectory();
    const file = path.join(directory, 'curly.js');
    await fsp.writeFile(file, reviewer.encodeUtf8('const x = “ok”;', true));

    const summary = reviewer.createSummary();
    const fakeRl = { question: async () => { throw new Error('should not prompt'); } };
    await reviewer.processFile(file, {
      autoFix: true,
      dryRun: false,
    }, fakeRl, summary);

    expect(summary.backupsCreated).toBe(1);
    expect(summary.modifiedFiles).toBe(1);
    expect(reviewer.decodeUtf8(await fsp.readFile(file))).toEqual({
      text: 'const x = "ok";',
      hasBom: true,
    });
    expect(reviewer.decodeUtf8(await fsp.readFile(`${file}.bak`)).text).toBe('const x = “ok”;');
  });



  it('discards all current-file changes when the user quits', async () => {
    const directory = await makeTempDirectory();
    const file = path.join(directory, 'cancel.js');
    const original = 'const a = 中; const b = я;';
    await fsp.writeFile(file, original);

    const answers = ['r', 'value', 'q'];
    const fakeRl = { question: async () => answers.shift() };
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const summary = reviewer.createSummary();

    try {
      const result = await reviewer.processFile(file, {
        autoFix: false,
        dryRun: false,
      }, fakeRl, summary);

      expect(result.stopAll).toBe(true);
      expect(await fsp.readFile(file, 'utf8')).toBe(original);
      expect(summary.manualReplacements).toBe(0);
      expect(summary.modifiedFiles).toBe(0);
      expect(summary.backupsCreated).toBe(0);
    } finally {
      logSpy.mockRestore();
    }
  });
  it('dry-run simulates changes without modifying files or creating backups', async () => {
    const directory = await makeTempDirectory();
    const file = path.join(directory, 'curly.js');
    await fsp.writeFile(file, 'const x = “ok”;');

    const summary = reviewer.createSummary();
    const fakeRl = { question: async () => { throw new Error('should not prompt'); } };
    await reviewer.processFile(file, {
      autoFix: true,
      dryRun: true,
    }, fakeRl, summary);

    expect(await fsp.readFile(file, 'utf8')).toBe('const x = “ok”;');
    expect(summary.plannedModifiedFiles).toBe(1);
    expect(summary.modifiedFiles).toBe(0);
    expect(summary.backupsCreated).toBe(0);
  });
});

describe('summary output', () => {
  it('contains every required counter and error details', () => {
    const summary = reviewer.createSummary();
    summary.scannedFiles = 2;
    summary.errors.push('broken file');
    const output = reviewer.formatSummary(summary, true);

    expect(output).toContain('Scanned files:');
    expect(output).toContain('Ignored files:');
    expect(output).toContain('Suspicious occurrences:');
    expect(output).toContain('Files that would be modified:');
    expect(output).toContain('broken file');
  });
});
