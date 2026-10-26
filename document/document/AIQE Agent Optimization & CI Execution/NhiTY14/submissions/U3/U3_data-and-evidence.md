# U3_data-and-evidence — Namespace, Seed/Cleanup Ownership & Evidence Design

```
Mode: DRY-RUN
Source IDs + versions:
  FLOW-PACKET-03 (OBS-31 → OBS-34)
  REQ-PACKET-AOCE v1 (AC-EMP-01/02, LAB-AOCE-03/04/05)
  POLICY-PACKET-AOCE v1
Assumptions / Not specified:
  - Tool endpoints chưa được cấp; design này là synthetic / DESIGN-REVIEWED.
  - Namespace format và max length cần trainer xác nhận trước live run.
  - Concurrency strategy là design proposal; chưa được kiểm chứng bằng live run.
Manual analysis (trước AI): xem Phần 1 – Namespace Design bên dưới.
```

---

## Phần 1 — Namespace Design

### Format

```
E2E-AOCE-<run>-<attempt>-<flow>
```

| Component | Mô tả | Ví dụ | Ràng buộc |
|---|---|---|---|
| `E2E-AOCE` | Prefix cố định; phân biệt với run khác | `E2E-AOCE` | Bất biến |
| `<run>` | Run identifier (alphanumeric, ngắn) | `r03`, `r04` | Duy nhất trong session; trainer xác nhận format |
| `<attempt>` | Attempt number trong run (bắt đầu từ `a1`) | `a1`, `a2` | Reset mỗi run; max 2 attempts (policy: max 1 retry) |
| `<flow>` | Flow ID | `F01`, `F02`, `F03` | Chỉ F01/F02/F03 trong allowlist |

**Ví dụ đầy đủ:**
- `E2E-AOCE-r03-a1-F01` — Run r03, attempt 1, flow F01
- `E2E-AOCE-r03-a1-F02` — Run r03, attempt 1, flow F02 (seed độc lập)
- `E2E-AOCE-r04-a2-F01` — Run r04, attempt 2 (retry), flow F01

**Unknowns cần trainer confirm trước live run:**
- Độ dài tối đa của namespace string trong ứng dụng
- Ký tự hợp lệ (có dùng dấu `-` được không?)
- Format `<run>` cụ thể (r01, run-01, hay khác?)

---

## Phần 2 — Seed / Cleanup Ownership Ledger

### Ownership Rules (per LAB-AOCE-05)

1. Mỗi flow chỉ được cleanup record do chính flow đó tạo trong run hiện tại.
2. F02 cần seed độc lập — không dùng F01 record làm seed.
3. F03 không tạo record; không cần cleanup.
4. Nếu write outcome unknown → stop mutating, reconcile trước.

### Seed/Cleanup Ledger Table (Per-Flow, Per-Run)

| Flow | Record Type | Namespace | Created By | Owned By | Cleanup Timing | Cleanup Method | Cleanup Owner |
|---|---|---|---|---|---|---|---|
| F01 | Employee record | `E2E-AOCE-<run>-<attempt>-F01` | F01 create step | Run/attempt của F01 | Sau runner assertion hoàn thành (pass hoặc fail) | `cleanup_owned_record(id)` — owned ID only | F01 controller/teardown |
| F02 | Employee seed (pre-seeded) | `E2E-AOCE-<run>-<attempt>-F02` | Seed setup (độc lập, trước F02) | Run/attempt của F02 | Sau F02 assertion hoàn thành | `cleanup_owned_record(seedId)` — owned seed only | F02 controller/teardown |
| F03 | Không tạo record | — | — | — | Not applicable | Not applicable | — |

### Ledger State Tracking (Per Run)

```text
Ledger Entry Format:
  run_id      : r03
  flow        : F01
  attempt     : a1
  namespace   : E2E-AOCE-r03-a1-F01
  write_status: created | unknown | not-written
  cleanup_status: pending | success | failed | not-applicable
  notes       : [any reconcile findings]
```

**Cleanup Decision Tree:**

```
write_status = created?
  ├── YES → Run cleanup_owned_record(id)
  │         → If success: mark cleanup_status = success
  │         → If fail: mark cleanup_status = failed; escalate to trainer
  └── NO (unknown)?
        → Stop; call lookup_owned_record(id)
        → If found: treat as created → cleanup
        → If not-found: mark cleanup_status = not-applicable
        → If lookup inconclusive: mark cleanup_status = failed; escalate
```

---

## Phần 3 — Concurrency Strategy

### Vấn đề

Nhiều workers có thể dispatch cùng lúc, dùng cùng environment `isolated-lab`. Nếu namespace không đủ phân biệt thì records có thể collide.

### Strategy

| Layer | Cơ chế | Mô tả |
|---|---|---|
| **Namespace isolation** | `<run>` + `<attempt>` duy nhất | Mỗi worker dùng `run_id` riêng (r03 vs r04); namespace tự phân biệt |
| **Seed independence** | F02 seed không phụ thuộc F01 | Tránh cross-flow collision khi F01 và F02 chạy song song |
| **Concurrency group** (CI) | Theo flow+environment, không chỉ branch | Nếu dùng CI, concurrency group phải bao gồm flow ID để tránh hai F01 cùng environment cùng chạy |
| **Preflight check** | Kiểm tra namespace unique trước khi write | Nếu `E2E-AOCE-<run>-<attempt>-<flow>` đã tồn tại → abort, generate mới hoặc escalate |
| **Cleanup guard** | Chỉ cleanup owned namespace | Worker A không thể cleanup record của Worker B vì namespace khác nhau |

---

## Phần 4 — Collision Scenario (Case Study)

### Scenario: Hai workers dispatch F01 cùng environment, cùng run ID

**Setup:**
- Worker A: run `r03`, attempt `a1`, flow F01 → namespace `E2E-AOCE-r03-a1-F01`
- Worker B: run `r03`, attempt `a1`, flow F01 → namespace `E2E-AOCE-r03-a1-F01` (**trùng!**)

**Vì sao xảy ra:** CI dispatch hai jobs song song không đủ phân biệt `run_id`. Cả hai cùng dùng `r03-a1`.

**Timeline collision:**

```
T+0ms   Worker A: Create employee E2E-AOCE-r03-a1-F01 → Save
T+50ms  Worker B: Create employee E2E-AOCE-r03-a1-F01 → Save
T+200ms Server: Nếu ID unique enforced → Worker B fails với duplicate error
         Nếu KHÔNG enforced → tạo 2 records cùng ID (data corruption)
T+500ms Worker A: Search → thấy row, assertion pass
T+600ms Worker B: Search → thấy row (có thể của A!), assertion có thể pass giả
T+700ms Worker A: Cleanup E2E-AOCE-r03-a1-F01 → xóa record
T+800ms Worker B: Cleanup E2E-AOCE-r03-a1-F01 → record đã xóa → cleanup "success" nhưng không thực sự là của B
```

**Cách phát hiện:**

| Detection Mechanism | Mô tả |
|---|---|
| **Preflight namespace check** | Trước khi write, gọi `lookup_owned_record(namespace)`. Nếu đã tồn tại → collision detected; abort và generate run ID mới |
| **Unique run_id per dispatch** | CI job phải generate run ID duy nhất (ví dụ: `r<timestamp>` hoặc `r<job_id>`) thay vì hardcode |
| **Concurrent run log** | Controller log mọi active run IDs; reject dispatch nếu run ID đã đang dùng |
| **Cleanup audit** | Sau cleanup, verify record không còn tồn tại; nếu cleanup "success" nhưng record vẫn thấy trong search → flag collision |

**Resolution:**
- Dùng run ID từ CI job ID hoặc timestamp để đảm bảo uniqueness
- Concurrency group trong CI theo `flow + environment` (không chỉ branch) để serialise cùng flow
- Không hardcode `r03` trong CI config

---

## Phần 5 — Per-Flow Run Manifest Schema (Mẫu)

```yaml
# Per-Flow Run Manifest — DESIGN-REVIEWED (DRY-RUN)
# Schema version: v1

run_manifest:
  run_id: "r03"                          # Unique per dispatch
  attempt: "a1"                           # a1 = first attempt; a2 = retry (max 1)
  flow: "F01"                             # F01 | F02 | F03
  namespace: "E2E-AOCE-r03-a1-F01"      # Generated from run_id + attempt + flow
  actor: "HR Admin"                       # HR Admin | Viewer
  environment: "isolated-lab"
  build: "ui-12"                          # App build tag at time of run
  timestamp_dispatch: "2026-10-03T01:20:00+07:00"
  timestamp_start: "2026-10-03T01:22:00+07:00"

  seed:
    required: false                       # true for F02 only
    seed_namespace: null                  # E2E-AOCE-<run>-<attempt>-F02 for F02
    seed_status: "not-applicable"         # created | not-applicable

  assertion:
    oracle_refs:
      - "AC-EMP-01"
      - "AC-EMP-02"
    runner_result_ref: null               # Populated when runner completes
    assertion_status: "pending"           # pending | passed | failed | blocked

  write_outcome:
    status: "created"                     # created | unknown | not-written
    record_ref: "E2E-AOCE-r03-a1-F01"
    lookup_reconcile_ref: null            # Populated if reconcile needed

  cleanup:
    required: true                        # false for F03
    owned_id: "E2E-AOCE-r03-a1-F01"
    cleanup_status: "pending"             # pending | success | failed | not-applicable
    cleanup_ref: null                     # Populated after cleanup

  evidence:
    runner_fixture_ref: null
    ui_observation_refs:
      - "OBS-31"                          # List relevant observation IDs
    artifact_refs: []

  budget:
    wall_time_limit_min: 20
    wall_time_elapsed_min: null
    retry_used: 0                         # 0 or 1 (max 1)
    tool_read_recovery_used: 0            # 0 or 1

  status: "in-progress"                  # in-progress | completed | blocked | stopped
  label: "SIMULATED"                     # SIMULATED | DESIGN-REVIEWED | RUN-PASSED (live only)
```

**F02 Manifest Differences:**
```yaml
  seed:
    required: true
    seed_namespace: "E2E-AOCE-r03-a1-F02"
    seed_status: "created"               # Must be verified before F02 starts
  assertion:
    oracle_refs:
      - "LAB-AOCE-03"
```

**F03 Manifest Differences:**
```yaml
  seed:
    required: false
    seed_status: "not-applicable"
  write_outcome:
    status: "not-written"                # F03 should never create a record
  cleanup:
    required: false
    cleanup_status: "not-applicable"
  assertion:
    oracle_refs:
      - "LAB-AOCE-04"
```

---

## Phần 6 — Completion Checklist

- [x] **3 flow contracts**: F01 (AC-EMP-01/02), F02 (LAB-AOCE-03), F03 (LAB-AOCE-04) — trong `U3_multi-flow-design.md`
- [x] **≥5 stop/reject scenarios**: 8 scenarios trong Flow Catalog (U3_multi-flow-design.md Phần 2)
- [x] **Mỗi flow có oracle và unknowns**: có trong Coverage Matrix và Manifest schema
- [x] **Namespace design**: Phần 1
- [x] **Seed/cleanup ownership**: Phần 2 với ledger và decision tree
- [x] **Collision scenario**: Phần 4 — 2 workers, F01, cùng run ID; cách phát hiện rõ
- [x] **Per-flow run manifest mẫu**: Phần 5 (F01, F02 diff, F03 diff)
- [x] **Không dùng F01 record làm seed bắt buộc cho F02**: Phần 2 ghi rõ "seed độc lập"
- [x] **F03 dùng browser/auth context riêng**: ghi trong Coverage Matrix và routing table
- [x] **Label DRY-RUN / DESIGN-REVIEWED**: không ghi "design coverage" là "runtime passed"

**Unresolved risks / next evidence / owner:**
- Namespace max length và valid characters: trainer xác nhận trước live run.
- Seed creation mechanism (tool endpoint cho F02 seed): chưa được cấp; cần trainer confirm.
- Concurrency group config thực tế trong CI: phụ thuộc CI provider; xem U5 design.
- Backend uniqueness enforcement: Not specified — không thể xác nhận từ handout; cần API-level evidence.
