# Unicode Source Reviewer — Design and Verification

## 1. SDD evaluation

### Resolved ambiguities and assumptions

- **Automatic normalization is opt-in.** Converting curly quotes to straight quotes can break an already quoted JavaScript, JSON, HTML, or CSS value. The script therefore defaults to manual review and only applies the documented normalization map when `--auto-fix` is supplied.
- **“Replace all” means all occurrences in the current file.** It does not silently modify other files.
- **Column numbers are one-based Unicode code-point columns.** A supplementary character such as an emoji counts as one column even though JavaScript stores it as two UTF-16 code units.
- **Encoding support is conservative.** UTF-8 with or without a BOM is supported. Invalid UTF-8 and obvious binary data are skipped with controlled reporting.
- **Line endings are preserved structurally.** The script does not globally split and rejoin file contents. Rewriting one line replaces only its content and leaves the existing delimiter intact.
- **Skip and quit discard the current file’s in-memory changes.** Files already completed remain completed.
- **Ignored-file counting excludes unseen contents of excluded directories.** Because those directories are not traversed, their internal file count is intentionally unknown.

### Risks addressed

- Symbolic links are not followed, preventing traversal loops.
- Existing backups are never overwritten; `.bak`, `.bak.1`, `.bak.2`, and so on are selected.
- A backup is created only when final content differs from the original and the run is not a dry run.
- Modified content is written to an exclusive temporary file, flushed, and renamed over the original.
- Invalid UTF-8, binary files, inaccessible entries, and per-file failures are reported without crashing the complete directory scan.
- A stale occurrence index is rejected instead of changing the wrong text.

### Remaining design limits

- The scanner is character-based, not parser-based. It cannot determine whether a character is inside a comment, string literal, regular expression, HTML text node, or CSS value.
- Files are loaded fully into memory.
- UTF-16, Latin-1, and other encodings are not rewritten.
- Unicode confusables made only from allowed ASCII characters, such as visually deceptive combinations, are outside this version’s scope.

## 2. TDD evaluation

The proposed plan covers the core behavior well. The implementation adds or clarifies tests for:

- decomposed Spanish accents and diaeresis;
- code-point-aware columns for emojis;
- stale replacement indexes;
- invalid UTF-8;
- preservation of UTF-8 BOMs;
- exclusive backup naming;
- file mode preservation where supported;
- symbolic-link traversal avoidance;
- dry-run behavior;
- discarding current-file edits when the user quits;
- automatic normalization being disabled by default.

The hardest cases to test as pure units are terminal behavior, permission failures, filesystem races, very large real projects, and platform-specific rename semantics. Those require integration tests on each target operating system.

## 3. Proposed architecture

The main file uses four layers:

1. **Configuration and CLI:** extensions, excluded directories, normalization map, and argument parsing.
2. **Pure Unicode/text logic:** allowed-character rules, detection, positions, context, normalization, replacement, and line rewriting.
3. **Filesystem safety:** traversal, binary/UTF-8 validation, backup naming, backup creation, and atomic replacement.
4. **Interactive orchestration:** prompts, per-file review, cancellation semantics, and final summary.

All important functions are exported from the CommonJS module so the `.mjs` Vitest suite can import them through `createRequire`.

## 4. Project structure

```text
unicode-reviewer/
├── revisar-textos.js
├── revisar-textos.test.mjs
├── package.json
├── README.md
└── DESIGN.md
```

## 5. Vitest tests

The suite is stored in `revisar-textos.test.mjs`. It exercises argument parsing, extension filtering, excluded directories, Unicode validation, Chinese/Japanese/Cyrillic/emoji/invisible detection, normalization, positions, replacements, line rewriting, BOMs, invalid UTF-8, binary detection, backups, atomic writes, symbolic links, dry run, cancellation, and summary output.

## 6. Final `revisar-textos.js` code

The complete implementation is stored in `revisar-textos.js`. It has no runtime dependencies outside Node.js built-ins.

## 7. Verification checklist

- [x] Scans HTML, JS, JSX, TS, TSX, Vue, CSS, and JSON.
- [x] Ignores `node_modules`, `dist`, `build`, and `.git`.
- [x] Allows ASCII programming text and normal Spanish characters.
- [x] Detects foreign scripts, emojis, invisible controls, and other non-allowed Unicode.
- [x] Reports file, line, column, character, code point, escape, and context.
- [x] Supports ignore, replace once, replace all in file, rewrite line, delete, skip file, and quit.
- [x] Supports optional automatic normalization.
- [x] Creates collision-safe backups only when writing a real change.
- [x] Uses temporary-file-plus-rename writing.
- [x] Preserves UTF-8 BOMs and existing line delimiters.
- [x] Avoids following symbolic links.
- [x] Supports dry run and custom extension lists.
- [x] Produces the required summary counters and error list.
- [x] Contains a Vitest suite focused primarily on pure functions.

## 8. Installation and execution instructions

Requirements for the included current Vitest configuration:

- Node.js 22.12 or newer.
- npm.

Install the development dependency:

```bash
npm install
```

Run the tests once:

```bash
npm test
```

Start with a non-writing manual review:

```bash
node revisar-textos.js ./src --dry-run
```

Perform an interactive review and write confirmed changes:

```bash
node revisar-textos.js ./src
```

Preview the optional normalization rules without writing:

```bash
node revisar-textos.js ./src --dry-run --auto-fix
```

Apply normalization rules and then interactively review what remains:

```bash
node revisar-textos.js ./src --auto-fix
```

Restrict the scan:

```bash
node revisar-textos.js ./src --extensions=.js,.ts,.vue
```

Backups are created beside the source file. For example, modifying `src/app.js` creates `src/app.js.bak`. If it already exists, the next backup becomes `src/app.js.bak.1`. Restore by checking the backup first and then copying it over the modified source file.

## 9. Known limitations

- Automatic quote conversion is lexical rather than syntax-aware, so it is opt-in and should be previewed with `--dry-run`.
- Only UTF-8 source files are rewritten.
- Huge files consume memory proportional to their full size.
- The allowed-character list is intentionally strict and may flag legitimate names, localized strings, mathematical notation, or currency symbols.
- The scanner detects disallowed characters but does not spell-check natural language.
- The script does not parse Git ignore rules.
- Atomic replacement behavior ultimately depends on the host filesystem and operating system.
