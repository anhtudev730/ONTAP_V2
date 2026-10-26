/**
 * U5_playwright-config.ts — Playwright Config Draft (DRY-RUN / DESIGN-REVIEWED)
 *
 * IMPORTANT: This is a DRAFT for submission only.
 * Do NOT deploy into the documentation repository.
 * Lab URL, accounts, and secrets have NOT been provisioned.
 * Current workspace is only a starter project: the three lab flows and
 * `lab:preflight` / `lab:reconcile` scripts do not exist here.
 * Do not treat this draft as runnable until those prerequisites are implemented.
 * `testDir` assumes this config is copied to the project root as playwright.config.ts.
 *
 * Source: CI-PACKET-05 (Node 22, package-lock.json, chromium, @smoke tags)
 * Mode: DRY-RUN
 */

import { defineConfig, devices } from "@playwright/test";

/**
 * Runtime contract synthetic (CI-PACKET-05):
 * - Node 22
 * - package-lock.json (use npm ci, not npm install)
 * - Project: chromium
 * - Flows: F01, F02, F03 — all tagged @smoke
 * - Environment alias: isolated-lab
 * - Base URL / accounts: Not yet provisioned (require secrets at runtime)
 */

export default defineConfig({
  // ── Test discovery ──────────────────────────────────────────────────────────
  testDir: "./tests/specs",

  // Tag-based filtering handled via CLI: --grep "@smoke"
  // Do NOT filter here to avoid silent 0-test discovery

  // ── Parallelism ─────────────────────────────────────────────────────────────
  // Workers: 1 to prevent namespace collision between F01/F02/F03 in shared environment.
  // Concurrency between flows must be controlled at CI level (concurrency group).
  // Do NOT increase workers without reviewing collision strategy (U3 data-and-evidence).
  workers: 1,
  fullyParallel: false,

  // ── Retry policy ────────────────────────────────────────────────────────────
  // Do not automatically replay write flows. A per-test retry requires
  // separately reviewed evidence that setup, write, and cleanup are safe.
  retries: 0,

  // ── Timeout ─────────────────────────────────────────────────────────────────
  // Per-test timeout: 60s. Adjust if SLA specified (currently Not specified).
  // Global timeout not set — wall-time budget (20 min) enforced at CI job level.
  timeout: 60_000,

  // ── Reporter ────────────────────────────────────────────────────────────────
  // list: human-readable per-test output in CI logs
  // json: machine-readable for evidence/manifest parsing
  // html: archive for artifact upload
  reporter: process.env.CI
    ? [["list"], ["json", { outputFile: "test-results/results.json" }]]
    : [["html", { open: "never" }], ["list"]],

  use: {
    // Base URL from environment — must not be hardcoded.
    // lab:preflight validates this URL against isolated-lab allowlist.
    baseURL: process.env.LAB_URL,

    // Retries are disabled, so capture traces on failed first attempts.
    trace: "retain-on-failure",

    // Screenshot on failure for additional evidence.
    screenshot: "only-on-failure",

    // Video: off by default; enable if trace alone insufficient.
    video: "off",
  },

  // ── Projects ────────────────────────────────────────────────────────────────
  // Only chromium per CI-PACKET-05 contract.
  // Do NOT add other browsers without trainer approval and contract update.
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // ── Output directory ────────────────────────────────────────────────────────
  outputDir: "test-results",

  // ── Forbid-only ─────────────────────────────────────────────────────────────
  // Prevent test.only from accidentally skipping tests in CI.
  forbidOnly: !!process.env.CI,

  // Lab preflight and reconciliation are separate workflow steps so reconciliation
  // can run with `if: always()` after successful preflight, including test failure.
});

/*
 * Design notes:
 *
 * 1. Automatic retries are disabled for all runs to avoid duplicate writes.
 *    Enable at most one retry only for a flow whose replay safety is established
 *    and reviewed; a timeout alone never proves that a write did not happen.
 *
 * 2. `workers: 1`:
 *    Prevents concurrent writes to isolated-lab from same job.
 *    Collision control across jobs is at workflow concurrency-group level.
 *
 * 3. No storageState in repo:
 *    Auth state (playwright/.auth/admin.json) must NOT be committed.
 *    Auth is performed at runtime using secrets from environment.
 *
 * 4. `forbidOnly: !!process.env.CI`:
 *    Prevents accidental test.only in CI from silently skipping tests (similar to CI-53).
 *
 * 5. Tag selection (@smoke) is done via CLI `--grep "@smoke"`, not in config.
 *    Discovery should use `--list`; an empty selection must fail the workflow.
 *
 * Unknowns / Not specified:
 * - Search SLA / assertion timeout: Not specified; 60s is a provisional default.
 * - `lab:preflight` / `lab:reconcile` integration: not implemented in this workspace.
 * - Viewer auth context setup: needs separate storageState file per actor (NOT committed).
 */
