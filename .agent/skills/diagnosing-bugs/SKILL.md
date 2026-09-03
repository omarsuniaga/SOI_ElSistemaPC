---
name: diagnosing-bugs
description: Disciplined debugging loop for regressions, UI defects, and logic failures. Use when investigating a bug report, unexpected behavior, focus loss, state corruption, or test failures.
---

# Disciplined Bug Diagnosis

Stop guessing. Follow a gated, scientific feedback loop before altering any production code.

## The 6-Phase Diagnostic Protocol

### 1. Build the Red Feedback Loop
* Before touching production code, create an automated test in Vitest or a reproducible script that consistently reproduces the failure (**RED**).
* If an automated test cannot capture the defect (e.g. physical device quirks), document the exact sequence of deterministic steps and observed vs expected behavior.

### 2. Minimize the Problem Surface
* Strip away irrelevant DOM wrappers, unrelated state properties, or third-party noise.
* Identify the exact boundary or seam where the failure occurs.

### 3. Formulate a Concrete Hypothesis
* Articulate the root cause in one technical sentence:
  * *Example:* "Focus is lost because `container.innerHTML = ...` destroys the active `<input>` DOM node on every keystroke."
* Do not apply "shotgun debugging" or multiple random changes at once.

### 4. Instrument and Verify Hypothesis
* Inspect the state or DOM lifecycle at the point of failure.
* Verify whether the hypothesis is true with hard evidence before editing.

### 5. Apply the Surgical Fix
* Make the smallest, cleanest change that addresses the root cause at the correct abstraction level.
* Avoid hacky workarounds (e.g. arbitrary `setTimeout` delays or silent `try/catch` suppression).

### 6. Verify Green & Prevent Regressions
* Run the test suite: verify the failing test now passes (**GREEN**).
* Run the broader test suite to ensure zero regressions across related modules.
