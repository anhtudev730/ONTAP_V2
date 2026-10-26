# U6_recovery-and-validation — Proposed Fix, Recovery & Validation Plan

```
Mode: DRY-RUN
Source IDs + versions:
  INCIDENT-PACKET-06 (INC-61 → INC-64)
  RET-PACKET-06
  REQ-PACKET-AOCE v1 (AC-EMP-01/02, LAB-AOCE-03/04/05)
  POLICY-PACKET-AOCE v1
  FLOW-PACKET-03 (F01, F02)
Assumptions / Not specified:
  - Tất cả pseudocode là DRY-RUN / DESIGN-REVIEWED; chưa được thực thi.
  - Search SLA và index lag SLA: Not specified.
  - Tool budget: max 1 tool-read recovery per run.
  - Browser/app behavior based on DOM cards only.
```

---

## Phần 1 — INC-61: Proposed Locator Fix (Strict-Mode Violation)

### Root Issue

Locator `page.getByRole('button', {name:'Save'})` match 2 elements: một trong dialog "Create employee", một trong overlay (visible 0–900ms). Playwright strict mode reject khi match >1.

### Proposed Fix (Pseudocode)

```typescript
// INC-61 Fix: Scope locator to dialog to isolate the correct Save button
// Source: DOM card — dialog "Create employee" has exactly 1 Save button inside

// Step 1: Wait for overlay to dismiss before interacting
// Rationale: overlay is visible 0–900ms; avoid interacting during overlay window
await expect(page.locator('[data-overlay="true"]')).toBeHidden({ timeout: 1500 });
// ^ Replace '[data-overlay="true"]' with actual overlay selector from DOM inspection

// Step 2: Scope locator to the dialog — NOT page-level
const dialog = page.getByRole('dialog', { name: 'Create employee' });
const saveButton = dialog.getByRole('button', { name: 'Save' });

// Step 3: Verify exactly 1 Save button exists in scoped context
await expect(saveButton).toHaveCount(1);  // Assertion before action

// Step 4: Click only after verified
await saveButton.click();
```

### Why AI Candidate Fixes Create False Positives

| AI Candidate | Problem |
|---|---|
| `.first()` | Selects first element by DOM order, not by semantic scope. May click overlay Save instead of dialog Save → wrong action, no write, but no error either → **false positive** |
| `force:true` | Bypasses visibility and enabled checks. If overlay Save is hidden/disabled, force-clicking it does nothing visibly but runner may not detect → **silent false positive** |
| `wait 5 seconds` | Hardcoded sleep; overlay may disappear in <900ms or persist longer. Does not guarantee correct element. **Brittle** — fails on slower/faster environments |

**Giữ đúng oracle:** Sau click Save đúng cú pháp:
- Vẫn phải verify: search row có exact employee ID (AC-EMP-01) và department QA (AC-EMP-02)
- Frame/scroll/click là actions — không tự là assertions

---

## Phần 2 — INC-63: Proposed Locator + Verification Fix (iframe + Virtualized List)

### Root Issue

1. Main-page locator không scope vào iframe → row không tìm thấy.
2. Virtualized list chỉ render 20 visible rows → target row chưa chắc đã render sau search.
3. Search textbox nằm trong iframe → cần frame vào iframe trước khi search.

### Proposed Fix (Pseudocode)

```typescript
// INC-63 Fix: Frame into iframe, search exact employee ID, verify row rendered
// Source: DOM card — iframe title "Employee directory"; search textbox inside iframe;
//         list renders 20 visible rows; UI contract allows search by exact employee ID

// Step 1: Frame into the Employee Directory iframe
const employeeIframe = page.frameLocator('[title="Employee directory"]');

// Step 2: Search by exact employee ID to trigger filter (reduces virtualized list)
const searchBox = employeeIframe.getByRole('textbox', { name: /search/i });
await searchBox.fill(ownedEmployeeId);  // Exact ID — not partial

// Step 3: Wait for search results to stabilize (no hardcoded sleep)
// Wait for the row with exact ID to appear — this also validates rendering
const targetRow = employeeIframe.getByRole('row').filter({
  hasText: ownedEmployeeId
});
await expect(targetRow).toBeVisible({ timeout: 5000 });
// ^ If row not visible after timeout → assertion FAILS → do not proceed

// Step 4: Verify department column in the visible row — LAB-AOCE-03 oracle
const departmentCell = targetRow.getByRole('cell', { name: 'Engineering' });
await expect(departmentCell).toBeVisible();

// Oracle assertions (from runner):
// - Exact employee ID visible in row (LAB-AOCE-03 clause 1)
// - Department "Engineering" visible (LAB-AOCE-03 clause 2)
```

### Why AI Candidate Creates False Positive

- "Ignore missing row; API says record exists so F02 passed."
- API/lookup confirms **data layer** existence; oracle LAB-AOCE-03 requires **UI layer** verification.
- Skipping row check = skipping UI oracle = false positive.
- The department value in UI could be wrong even if record exists in API.

**Frame + search + scroll = actions, NOT assertions.**
**Assertions must verify: row visible + correct department in UI.**

---

## Phần 3 — INC-62: State Recovery Table (Unknown Write Outcome)

### Known State at t+2600ms

- `lookup_owned_record` returned `record-ref-62`, dept QA → **record exists**.
- Runner assertion: pending.
- Search row: not yet appeared (index lag, SLA unknown).
- Cleanup: not started.
- Proposed retry (Planner): NOT executed (rejected).

### Recovery Decision Table

| State | Condition | Action | Tool Call | Budget | Owner |
|---|---|---|---|---|---|
| **Write unknown (pre-lookup)** | Client timeout at t+1500ms; write outcome not confirmed | STOP all mutating actions immediately | — | 0 tool calls used | Controller |
| **Reconcile** | Unknown write → must lookup before any action | Call `lookup_owned_record(record-ref-62)` | `lookup_owned_record` (1 read recovery) | 1 tool-read recovery | Controller |
| **Record found (t+2600ms)** | Lookup returns `record-ref-62`, dept QA | Confirm record exists; do NOT retry write | — | Budget: 1 recovery used | Controller |
| **Await runner assertion** | Record exists; search row not yet available (index lag) | Wait for runner assertion (poll read-only); do NOT click Save again | `read_run_result` (read-only) | Within existing budget | Controller |
| **If runner assertion available** | Assertion shows ID + dept QA pass | Report PASS with evidence linking runner result + lookup | — | — | Controller |
| **If runner assertion fail / timeout** | Search row still missing after max wait | Report FAIL; do not retry write; do not claim pass | — | — | Controller |
| **Cleanup** | Record confirmed owned | Call `cleanup_owned_record(record-ref-62)` owned only | `cleanup_owned_record` | Budget: cleanup allowed | Controller / Teardown |
| **Escalate** | Lookup inconclusive OR cleanup fails | Stop; escalate to trainer; record in incident log | — | — | Trainer |

### Tool Permissions in Recovery

| Tool | Allowed in Recovery | Notes |
|---|---|---|
| `lookup_owned_record` | ✅ Yes (1 time) | Read-only; confirm record state |
| `read_run_result` | ✅ Yes (read-only) | Poll for assertion; do not mutate |
| `run_reviewed_flow` (retry F01) | ❌ No | Record already exists; retry = duplicate write risk |
| `cleanup_owned_record` | ✅ Yes (after confirm) | Only after record confirmed; owned ID only |
| `cleanup_owned_record` (before confirm) | ❌ No | Cannot cleanup if uncertain record exists |

### Budget Tracking

| Item | Budget Used |
|---|---|
| `lookup_owned_record` (reconcile) | 1 / 1 tool-read recovery |
| Total budget remaining | 0 additional tool-read recovery; runner retry not used |
| Wall-time | Under 20 min (synthetic) |

**State/Evidence at closure:**
- Record: exists (confirmed by lookup)
- Runner assertion: pending → UNKNOWN until received
- Cleanup: pending → execute after assertion resolves
- Verdict: **UNKNOWN** until runner assertion arrives

---

## Phần 4 — INC-64: Missing Runtime Evidence Report

```
INCIDENT: INC-64
Layer: Infrastructure / Environment (NOT application)
Evidence missing:
  - No test body executed (browser startup failed before any step)
  - No click, no assertion performed
  - No write evidence → no data risk
  - Reporter incomplete → no full run summary

Report:
  Runner exit: INFRASTRUCTURE EXCEPTION — browser startup permission failure
  Application assertion result: NONE (not reached)
  Test classification: BLOCKED — environment failure
  Retry proposal (10x): REJECTED — environment issue; retry cannot fix permission/config problem.
                                    Violates budget policy (max 1 retry).
                                    Risk: if one retry starts browser but later fails in write step,
                                    may produce orphaned owned record.

Next steps (environment investigation, NOT retry):
  1. Check CI runner user permissions for launching Chromium (sandbox flags)
  2. Verify `playwright install --with-deps chromium` step ran and exited 0
  3. Check OS/container: does runner OS support Chromium headless?
  4. Check if --no-sandbox flag needed for CI (common on Linux CI runners)
  5. Fix environment → re-run with lab:preflight confirming browser readiness
  Owner: Trainer (runner config); Trainee (re-run after fix)
```

### RET-PACKET-06 Classification

| Run | Attempt 1 | Attempt 2 | Classification | Note |
|---|---|---|---|---|
| Run X | FAIL | PASS | **Pass-after-retry observed** | NOT "fixed" — no root cause evidence; retry succeeded but cause unknown |
| Run Y | FAIL | FAIL | **Consistent failure** | Points to systematic issue, but insufficient to conclude without root cause |
| Run Z | PASS | — | **First-pass** | No retry needed; cannot use to dismiss Run Y |

**Key rule:** Pass-after-retry ≠ root cause identified or fixed.
**Key rule:** Do NOT merge results across runs to claim current run passed.
**Key rule:** n=3 runs is too small to infer reliability or flakiness pattern.

---

## Phần 5 — Validation Plan Before/After Fix

### General Requirements

- **Same revision + config inputs** when comparing baseline vs. fixed.
- **Data isolation**: each run uses unique namespace per U3 design; no shared records.
- **Sample size**: ≥3 runs per config (acknowledging n=3 is insufficient for reliability; only trend signal).
- **Same environment / build**: don't mix `ui-11` and `ui-12` results.

### INC-61 Validation Plan

| Phase | Action | Expected |
|---|---|---|
| **Baseline** | Run F01 with original locator (no scope); revision lab-a6 | Strict-mode violation at t+150ms |
| **After fix** | Run F01 with scoped dialog locator; same revision | No strict-mode violation; Save click succeeds |
| **Oracle check** | Search row after Save | Exact employee ID + dept QA visible (AC-EMP-01/02) |
| **Negative control 1** | Overlay visible → attempt click without waiting | Should still fail or click wrong button → verify scoped locator prevents this |
| **Negative control 2** | Use `.first()` intentionally | Click overlay Save → search row should NOT appear → proves `.first()` causes false negative |

### INC-62 Validation Plan

| Phase | Action | Expected |
|---|---|---|
| **Baseline** | Reproduce timeout scenario (if lab allows simulated timeout) | Write outcome unknown; runner step fail |
| **After recovery** | Apply recovery flow: lookup → confirm → await assertion → cleanup | Record confirmed; no duplicate write; cleanup success |
| **Oracle check** | Runner assertion when available | ID + dept QA pass |
| **Negative control 1** | Retry write after lookup confirmed record exists | Should NOT create duplicate (or server rejects) → proves stop-on-unknown is necessary |
| **Negative control 2** | Cleanup before lookup | Should fail or cleanup wrong record → proves reconcile-before-cleanup rule |

### INC-63 Validation Plan

| Phase | Action | Expected |
|---|---|---|
| **Baseline** | Run F02 with main-page locator | Row not found; runner assertion missing |
| **After fix** | Run F02 with iframe-scoped locator + search + row wait | Target row visible in iframe after search |
| **Oracle check** | Department cell in row | "Engineering" visible (LAB-AOCE-03 clause 2) |
| **Negative control 1** | Search with different employee ID (wrong ID) | Row for wrong ID appears OR no row; assertion fails → proves ID scope |
| **Negative control 2** | Check department with old value "QA" instead of "Engineering" | Assertion fails → proves department clause is checked, not just row existence |

### INC-64 Validation Plan

| Phase | Action | Expected |
|---|---|---|
| **Before fix** | Document environment failure; do NOT retry | No assertion; report BLOCKED |
| **After environment fix** | Re-run with `lab:preflight` browser readiness check | Browser starts; tests execute; assertions available |
| **Oracle check** | Same as F01 oracle (AC-EMP-01/02) | No change to assertions after env fix |
| **Negative control 1** | Run in broken environment (no fix) → assert failure detected | Runner should report BLOCKED/environment error, not PASS |
| **Negative control 2** | Retry 10x without env fix | Some retries may accidentally start browser → uncontrolled write risk; proves why 10x retry is wrong approach |

---

## Phần 6 — Completion Checklist

- [x] **4 incidents**: INC-61/62/63/64 — facts, evidence gaps, hypotheses, layer, next check
- [x] **3 retry outcomes** (RET-PACKET-06): Run X/Y/Z classified with semantics
- [x] **INC-61/63 locator pseudocode**: scoped locator, wait condition, oracle check; false positive analysis
- [x] **INC-62 recovery table**: unknown write → lookup → confirm → await → cleanup → stop; tool permissions + budget
- [x] **INC-64 report**: missing runtime evidence; environment classification; retry rejection rationale
- [x] **≥2 negative controls per incident**: INC-61 (2), INC-62 (2), INC-63 (2), INC-64 (2)
- [x] **Oracle preserved throughout**: AC-EMP-01/02 (INC-61/62), LAB-AOCE-03 (INC-63)
- [x] **Verdict acknowledgment**: INC-62 verdict may remain UNKNOWN pending runner assertion
- [x] **Mode**: DRY-RUN; không ghi simulated walkthrough là "tests passed"

**Unresolved risks / next evidence / owner:**
- INC-61 overlay selector: cần DOM inspection để xác định actual overlay locator. Owner: trainee.
- INC-62 runner assertion: còn pending; verdict UNKNOWN cho đến khi nhận được. Owner: runner/trainer.
- INC-62 index lag: SLA không xác định; không biết bao lâu nên chờ. Owner: trainer / spec owner.
- INC-63 search textbox selector: cần actual DOM inspection trong iframe. Owner: trainee.
- INC-64 environment fix: cần trainer kiểm tra runner config. Owner: trainer.
