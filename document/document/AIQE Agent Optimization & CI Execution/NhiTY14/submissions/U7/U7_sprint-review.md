# U7_sprint-review — Sprint Review Memo

```
Mode: DRY-RUN
Source IDs + versions:
  METRIC-PACKET-07 (E01–E10; SL-01–SL-04; AI draft)
  U7_metrics-and-claims.md (calculations)
  U7_risk-register.md (RISK-01–RISK-08)
  REQ-PACKET-AOCE v1; POLICY-PACKET-AOCE v1
  U1–U6 submissions (design artifacts)
Assumptions / Not specified:
  - Memo này là DRY-RUN / DESIGN-REVIEWED.
  - Không có live execution, live model/provider hoặc live CI.
  - "Recommendation có điều kiện" — không production-ready claim từ packets.
  - Proposed due dates là đề xuất, không phải cam kết của trainer/team.
Manual analysis (trước AI): xem U7_metrics-and-claims.md.
```

---

## Sprint Review Memo

**To:** Trainer / QA Lead  
**From:** Trainee  
**Date:** 2026-10-15  
**Subject:** Sprint Review — Agent CI Cohort `lab-a7`, Runs D71–D73 (Synthetic)  
**Scope:** 10 logical case executions (E01–E10); code `lab-a7`; prompt/context `v3`; build `ui-12`; environment `isolated-lab`; 4 scheduled slots (SL-01–SL-04).

> **Quan trọng:** Toàn bộ memo này dựa trên synthetic/simulated packet data. Không có live telemetry. Mọi metric là fixture benchmark, không phải production evidence. Recommendation là có điều kiện và cần live validation trước khi áp dụng.

---

## 1. Scope & Changes

**Thay đổi trong sprint này (design artifacts, DRY-RUN):**

| Unit | Thay đổi | Status |
|---|---|---|
| U1 | Benchmark protocol, cost ledger, quality scoring | DESIGN-REVIEWED |
| U2 | Prompt v3 (QA-revised); compact context; regression matrix | DESIGN-REVIEWED |
| U3 | Multi-flow coverage design; namespace/seed/collision design | DESIGN-REVIEWED |
| U4 | PR scope review; conflict resolution; rollback plan | DESIGN-REVIEWED |
| U5 | CI lane design; workflow draft; scenario analysis | DESIGN-REVIEWED |
| U6 | Incident triage; recovery design; negative controls | DESIGN-REVIEWED |
| U7 | Metrics dictionary; risk register; sprint review | DESIGN-REVIEWED (this memo) |

**Không thay đổi trong sprint này:**
- Live oracle (AC-EMP-01/02, LAB-AOCE-03/04/05) — giữ nguyên xuyên suốt
- Cleanup policy (LAB-AOCE-05 owned records only) — giữ nguyên
- Budget constraint (max 1 retry, 20 min wall-time) — giữ nguyên

---

## 2. Sample Size & Cohort Limitations

| Giới hạn | Mô tả |
|---|---|
| **n=10 EIDs** | Quá nhỏ để suy luận reliability hay percentile tin cậy |
| **n=3 runs** | D71/D72/D73; 1 run/ngày trong 3 ngày — không đủ để phân tích trend |
| **n=4 slots** | 1 missing (SL-04) → 3 data points cho schedule analysis |
| **Synthetic data** | Không phải live telemetry; fixture outcomes không representative của production |
| **Single code revision** | `lab-a7` only — không có A/B comparison giữa revisions |

> Mọi metric bên dưới mang nhãn **SYNTHETIC / SIMULATED**. Không extrapolate sang production.

---

## 3. Metric Highlights

### 3.1 Execution Quality

| Metric | Value | Interpretation |
|---|---|---|
| Selected | 10 | Toàn bộ cohort |
| Executed | 8/10 (80%) | E06 blocked, E07 skipped — chưa execute |
| First-pass | 4/8 (50%) | E01, E03, E08, E10 |
| Eventual-pass | 6/8 (75%) | +E02, E05 (flaky-pass) |
| **Failed** | **2/8 (25%)** | **E04 (F01), E09 (F03) — cần root cause analysis** |
| Retry overhead | 3 retries / 8 executed = 37,5% | E02, E04, E05 cần retry; chưa có root cause |
| Evidence-complete pass | 5 EIDs | E01, E02, E03, E08, E10 |

**Điểm đáng lo ngại:**
- E04 (F01) failed sau 2 attempts → F01 có ≥1 failure trong cohort
- E09 (F03) failed → F03 chưa đạt 100% reliability kể cả trong synthetic run
- E06 (F03) blocked vì Viewer account chưa ready → operational readiness gap

### 3.2 Cleanup & Data Integrity

| Metric | Value |
|---|---|
| Cleanup success | 4/6 (67%) |
| Cleanup failed | 1/6 (E04) — **immediate action required** |
| Cleanup unknown | 1/6 (E08) |

> **E04 unresolved owned record là blocking item** cho run tiếp theo theo preflight policy.

### 3.3 Schedule Reliability

| Metric | Value |
|---|---|
| Slots với dispatch observed | 3/4 (75%) |
| SL-04 | ❌ MISSING — cause unknown |
| Dispatch delay (n=3) | Median 2 min, range 0–3 min |
| Queue delay (n=3) | Median 2 min, range 1–8 min |

> n=3 slots là quá nhỏ để phán đoán scheduling reliability. SL-04 cần investigation.

### 3.4 Cost (Đơn vị giả lập)

| Metric | Value |
|---|---|
| Budget | 1,20 |
| Total measured (lower bound) | 0,89 |
| E08 model usage | MISSING → actual total > 0,89 |
| Budget remaining (lower bound) | ≥ 0,31 |
| Cost / evidence-complete pass | 0,094 lower bound (E08 partial) |

> Không thể xác nhận "below budget" vì E08 usage missing. "Missing = zero" là sai.

---

## 4. Residual Risks (từ Risk Register)

| Risk | Mức độ | Blocking? |
|---|---|---|
| RISK-06: E04 unresolved owned record | 🔴 High | **YES — block next run** |
| RISK-01: Prompt drift (v2 → v3 chưa live) | 🔴 High | Partial — v3 design ready |
| RISK-02: Unknown write / duplicate write | 🔴 High | Partial — recovery design ready |
| RISK-03: Namespace collision | 🔴 High | Partial — design ready; CI config chưa confirm |
| RISK-04: Missing evidence (E08, CI-54) | 🟡 Medium | No — nhưng metrics incomplete |
| RISK-05: SL-04 schedule gap | 🟡 Medium | No — nhưng schedule monitoring broken |
| RISK-07: E08 cost unknown | 🟡 Medium | No — nhưng cost reporting incomplete |
| RISK-08: Env exception misclassified | 🟡 Medium | Partial — INC-64 fix pending trainer |

---

## 5. Next Evidence Required

| Gap | Evidence Needed | Proposed Owner | Proposed Date |
|---|---|---|---|
| E04 owned record unresolved | `lab:reconcile` output; confirm record removed | Run maintainer (trainee) | 2026-10-20 |
| E08 cleanup unknown | Server-side lookup result for E08 record | Trainer / lab admin | 2026-10-20 |
| E08 model usage missing | Actual model call log từ D73 run | CI config maintainer | 2026-10-22 |
| SL-04 missing dispatch | Investigation theo checklist (U5): workflow branch, runner quota, cron event | Workflow maintainer | 2026-10-20 |
| E09 (F03) failure root cause | Trace artifact từ E09; per-flow failure report | Trainee | 2026-10-25 |
| E04 (F01) failure root cause | Trace artifact từ E04; locator/flow analysis | Trainee | 2026-10-25 |
| E06 Viewer account blocked | Confirm Viewer account provisioned và preflight pass | Trainer | 2026-10-22 |
| Prompt v3 live validation | Run context regression suite trên post-v3 revision | Trainee | After env fix |
| Live smoke run (U5) | 1 successful manual smoke run với `lab:preflight` | Trainee + trainer | After env fix |

---

## 6. Decisions

### Decision 1 — Pilot Execution (Conditional)

| Field | Value |
|---|---|
| **Decision** | Không mở rộng sang pilot production trước khi có live validation |
| **Evidence** | 2/8 executed failed (E04, E09); E06 blocked; cleanup 67%; SL-04 missing; E08 cost unknown |
| **Remaining Gap** | Cần ≥1 successful live smoke run (F01/F02/F03); E04 cleanup resolved; Viewer account ready; prompt v3 on live revision |
| **Proposed Owner** | Trainee (implementation) + trainer (environment/approval) |
| **Next Proof** | Successful `lab:preflight` + all 3 flows pass + cleanup success + artifacts linked — trên live revision, không phải synthetic |
| **Review Condition** | Sau khi có live smoke evidence, hold sprint review lại để assess readiness |

### Decision 2 — Schedule (Conditional)

| Field | Value |
|---|---|
| **Decision** | Không enable live scheduled execution cho đến khi SL-04 investigated và workflow file confirmed trên default branch |
| **Evidence** | SL-04 missing; CI-57 pattern (workflow only on feature branch doesn't trigger schedule) |
| **Remaining Gap** | SL-04 cause; workflow file merge to main; manual smoke confirmation trước khi enable schedule |
| **Proposed Owner** | Workflow maintainer |
| **Next Proof** | ≥1 dispatch observed sau fix; run arrives within SLO (nếu được xác định) |
| **Review Condition** | Sau 3 consecutive successful scheduled slots |

### Decision 3 — Risk Mitigation Before Next Run

| Field | Value |
|---|---|
| **Decision** | Block next live run cho đến khi E04 unresolved record được cleanup (RISK-06) |
| **Evidence** | E04 cleanup failed; preflight policy block nếu ledger có unresolved |
| **Remaining Gap** | Confirmation record đã được xóa; reconcile report từ trainer/lab admin |
| **Proposed Owner** | Run maintainer (trainee) + trainer nếu escalate |
| **Next Proof** | `lab:reconcile` exit 0 sau cleanup; ledger mark resolved |
| **Review Condition** | Immediate — trước bất kỳ live run nào tiếp theo |

---

## 7. Review Log (AI/Peer Review)

| Finding | Source | Accept/Reject | QA Rationale |
|---|---|---|---|
| AI draft claim "all completed tests passed eventually" | METRIC-PACKET-07 E04, E09 | **REJECT** | E04 failed (2 attempts), E09 failed (1 attempt) — không phải "all". Mandatory gate: không gộp failed vào pass. |
| AI draft claim "missing usage is zero" | METRIC-PACKET-07 E08 | **REJECT** | E08 explicitly "missing" — mandatory gate: missing ≠ zero. Ghi UNKNOWN. |
| AI draft claim "cleanup is complete" | METRIC-PACKET-07 E04, E08 | **REJECT** | E04 cleanup failed; E08 unknown. 4/6 = 67% completion rate. |
| AI draft claim "production-ready" | Synthetic cohort n=10 | **REJECT** | n=10 synthetic không đủ để claim production-ready. Chưa có live validation. |
| Giữ "evidence-complete pass" gồm E08 (lower bound) | U7 Phần 1.4 | **ACCEPT** | E08 có full evidence; model usage missing → cost là lower bound nhưng EID vẫn là evidence-complete pass. Loại hẳn sẽ undercount. |
| E07 skipped → không thêm vào cost hay execution ledger | U7 Phần 1.1 | **ACCEPT** | E07 budget guard trước execution; không có actual execution; cost = 0,00 là observed, không phải điền vào. |

**Unresolved / Next Evidence / Owner:**
- E04 unresolved record: immediate action (trainee + trainer)
- E08 usage: cần model log từ CI (CI config maintainer)
- SL-04 cause: investigation (workflow maintainer)
- Live smoke run: prerequisite cho mọi pilot/schedule decision (trainer cấp env)
- Runtime objectives (live CI, scheduled execution, live model): tất cả ghi **PENDING** — không có live lab.
