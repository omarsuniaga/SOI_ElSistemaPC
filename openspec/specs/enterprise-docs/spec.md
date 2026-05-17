# Delta for Enterprise Documentation

> **Change**: actualizacion-portales | **Domain**: enterprise-docs | **Type**: NEW capability

## Requirements

### Requirement: DOC-01 — Enterprise Documentation Set

The system SHALL provide 6 operational docs at `docs/*.md` covering user guidance, developer setup, API reference, deployment, architecture, and security. Each doc MUST be self-contained with a table of contents and cross-references to sibling docs.

#### Scenario: All 6 docs exist and are parseable

- GIVEN the file system at `docs/`
- WHEN listing files matching `*.md`
- THEN the files `USER_GUIDE.md`, `DEVELOPER.md`, `API_REFERENCE.md`, `DEPLOYMENT.md`, `ARCHITECTURE.md`, `SECURITY.md`, AND `COMPLIANCE.md` SHALL exist
- AND each file SHALL be at least 150 lines with valid Markdown structure

#### Scenario: Cross-reference consistency

- GIVEN all docs in `docs/`
- WHEN scanning for internal links to other docs
- THEN every `[text](./FILENAME.md)` link SHALL resolve to an existing file in the same directory

### Requirement: DOC-02 — Enterprise Service Wiring Audit

The system SHALL verify that 6 back-end enterprise services (`errorReporter`, `analyticsService`, `gdprService`, `rateLimit`, `CSRF`, `Web Vitals`) are correctly imported and initialized in the main entry point `src/main-maestros.js`.

#### Scenario: All services wired at startup

- GIVEN the file `src/main-maestros.js`
- WHEN scanning import statements and initialization calls
- THEN each of `errorReporter`, `analyticsService`, `gdprService`, `rateLimit`, `CSRF`, AND `Web Vitals` SHALL appear as an import WITH an initialization call (e.g., `.init()`, `.setup()`, or equivalent)

#### Scenario: Missing service produces documented gap

- GIVEN an enterprise service that is NOT wired
- THEN the `SECURITY.md` or `DEPLOYMENT.md` SHALL document the gap under a "Known Limitations" section

### Requirement: DOC-03 — README Professional Format

The README SHALL contain a feature matrix, architecture summary, security summary, performance targets, and links to all 6 docs.

#### Scenario: README references all docs

- GIVEN `README.md`
- WHEN scanning for markdown links to `docs/`
- THEN ALL 7 doc files SHALL be referenced with relative paths

## Acceptance Criteria

| ID | Criterion | Verification |
|----|-----------|-------------|
| AC-01 | All 7 doc files exist and are ≥150 lines | `wc -l docs/*.md` |
| AC-02 | Internal links resolve within doc set | Manual link check |
| AC-03 | 6 enterprise services wired in entry point | `grep` imports in `main-maestros.js` |
| AC-04 | Unwired services documented as gaps | Check SECURITY.md / DEPLOYMENT.md |
| AC-05 | README links to all docs | `grep -c 'docs/' README.md` ≥ 7 |
