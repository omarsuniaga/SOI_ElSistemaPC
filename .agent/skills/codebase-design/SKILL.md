---
name: codebase-design
description: Design deep modules, clean seams, and robust DataAdapters. Use when creating or refactoring module interfaces, adding data services, decoupling UI from persistence, or migrating direct Supabase calls to the DataAdapter pattern.
---

# Codebase Design & Deep Modules

Build **deep modules** (John Ousterhout, *A Philosophy of Software Design*) placed at **clean seams** (Michael Feathers, *Working Effectively with Legacy Code*).

## Core Principles

1. **Depth over Breadth (Deep Modules):**
   - A module is **deep** when it provides substantial behavior behind a narrow, simple interface.
   - A module is **shallow** (anti-pattern) when its interface is nearly as complex as its implementation (e.g. leaking raw SQL, Supabase filters, or raw query builders directly into UI components).
   - *Example:* The UI should call `clasesAdapter.obtenerCatalogoConMetricas()` rather than stitching together three different Supabase queries with custom joins and error handling inside a button click listener.

2. **The Seam: DataAdapter Pattern:**
   - A **seam** is a place where you can alter behavior without altering the callers.
   - In SOI, the seam is the **DataAdapter**.
   - Callers (views, components, modals) only know the DataAdapter interface.
   - Behind the seam, the DataAdapter delegates to:
     - Real Provider (`SupabaseClient`)
     - Demo Provider (`Mock JSON` from `src/assets/data/mocks/`)

3. **Locality of Change:**
   - When a database column is renamed or a table is partitioned, only the internal implementation of the DataAdapter changes; callers in the UI remain completely unaffected.

4. **Testability through the Seam:**
   - Every deep module must be testable through its interface using Vitest. If testing requires mocking 15 internal helpers, the interface is leaky and shallow.
