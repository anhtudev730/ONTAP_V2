# U7_risk-register — Risk Register (≥6 Risks)

```
Mode: DRY-RUN
Source IDs + versions:
  METRIC-PACKET-07 (E01–E10; SL-01–SL-04)
  INCIDENT-PACKET-06 (INC-61–INC-64)
  CI-PACKET-05 (CI-51–CI-58; CI-RUN-A/B/C)
  GIT-PACKET-04 (candidate change, VC-41–VC-44)
  BENCH-PACKET-01 / OUTPUT-PACKET-01 (U1)
  CONTEXT-PACKET-02 / REG-PACKET-02 (U2)
  FLOW-PACKET-03 (U3)
  REQ-PACKET-AOCE v1 (AC-EMP-01/02, LAB-AOCE-03/04/05)
  POLICY-PACKET-AOCE v1
Assumptions / Not specified:
  - Tất cả risks dựa trên synthetic packet; không có live telemetry.
  - Likelihood và Impact: 1=low, 2=medium, 3=high.
  - Proposed owner là vai trò đề xuất; không gán trainer/team đã nhận việc.
Manual analysis (trước AI): xem bảng bên dưới.
```

---

## Risk Register

### Template mỗi risk

```
Risk ID | Cause/Event/Impact | Source | Flow | Likelihood | Impact
        | Control | Detection | Proposed Owner | Next Action / Date | Residual Risk | Status
```

---

### RISK-01 — False Pass từ Prompt Drift (U2)

| Field | Value |
|---|---|
| **Risk ID** | RISK-01 |
| **Cause** | Prompt v2 bỏ oracle clause (AC-EMP-02 department assertion), thay bằng heuristic "UI looks correct" / toast |
| **Event** | Controller report PASS khi department sai hoặc search row chưa có |
| **Impact** | False positive trong quality scoring; kết quả U1 benchmark misleading; UAT sign-off dựa trên oracle thiếu |
| **Source** | CONTEXT-PACKET-02 / v2 clause diff; OUTPUT-PACKET-01 hard gate; U2 phần 3 drift analysis |
| **Flow** | F01 (AC-EMP-02), F02 (LAB-AOCE-03) |
| **Likelihood** | 3 — Prompt drift đã được quan sát trong v2; dễ tái xuất nếu version control lỏng |
| **Impact** | 3 — False positive ảnh hưởng trực tiếp đến quality gate và downstream decisions |
| **Control** | Prompt v3 (U2) giữ explicit prohibitions và version tag; regression suite RG-04 (U4) |
| **Detection** | Regression fixtures RG-01/02/04 trong `tests/context-regression.spec.ts`; claim audit (U7 Phần 3) |
| **Proposed Owner** | Người tạo/review prompt (trainee) + QA reviewer |
| **Next Action / Date** | (1) Deploy prompt v3 với version tag trước mọi live run; (2) Confirm RG-04 trong test suite — đề xuất trước 2026-10-22 |
| **Residual Risk** | Medium — v3 giảm nguy cơ nhưng future prompt edits không có enforcement tự động nếu không có gate |
| **Status** | OPEN — v3 là design; chưa có live validation |

---

### RISK-02 — Unknown Write / Duplicate Write (U6, INC-62)

| Field | Value |
|---|---|
| **Risk ID** | RISK-02 |
| **Cause** | Client timeout sau Save click; server đã tạo record nhưng client không biết; planner đề xuất retry write |
| **Event** | Retry write với cùng employee ID → duplicate record hoặc data corruption |
| **Impact** | Owned record orphaned; search assertion có thể match wrong record; cleanup scope mở rộng ngoài owned |
| **Source** | INC-62 (INCIDENT-PACKET-06) timeline t+2400ms; LAB-AOCE-05; U6 recovery table |
| **Flow** | F01 (create step), F02 (edit step có write) |
| **Likelihood** | 2 — Timeout xảy ra (INC-62 observed); retry proposal đã bị reject nhưng cần enforcement |
| **Impact** | 3 — Duplicate write là data integrity violation; khó detect sau khi xảy ra |
| **Control** | Stop-on-unknown policy (LAB-AOCE-05); `lookup_owned_record` trước retry; prompt v3 "stop all mutating actions" clause |
| **Detection** | `lookup_owned_record` trả về record khi timeout → confirm write success, abort retry; `lab:reconcile` post-run |
| **Proposed Owner** | Controller developer (stop policy implementation) |
| **Next Action / Date** | (1) Implement lookup-before-retry gate trong controller; (2) Test với simulated timeout — đề xuất trước 2026-10-29 |
| **Residual Risk** | Low-Medium — nếu lookup cũng timeout thì state vẫn unknown; cần escalation path |
| **Status** | OPEN — design mitigation có trong U6 nhưng chưa được implement/validated |

---

### RISK-03 — Shared Data / Namespace Collision (U3)

| Field | Value |
|---|---|
| **Risk ID** | RISK-03 |
| **Cause** | Hai CI workers dispatch cùng flow/environment với cùng hardcoded run ID |
| **Event** | Cùng namespace `E2E-AOCE-r0X-a1-F01` được tạo bởi 2 workers → collision, search assertion nhầm record, cleanup xóa nhầm record của worker khác |
| **Impact** | False positive assertions; data corruption; orphaned records; flaky test intermittent từ race condition |
| **Source** | FLOW-PACKET-03; U3 collision scenario (Phần 4); CI-56 (CI-PACKET-05) concurrency gap |
| **Flow** | F01, F02 |
| **Likelihood** | 2 — Cần concurrent dispatch nhưng CI thường trigger nhiều jobs |
| **Impact** | 3 — Data integrity + false positive assertion + cleanup violation |
| **Control** | Run ID unique per dispatch (timestamp/job ID); concurrency group theo environment; preflight namespace check |
| **Detection** | Preflight `lookup_owned_record(namespace)` trước write; cleanup audit sau run |
| **Proposed Owner** | CI config maintainer + controller developer |
| **Next Action / Date** | (1) Enforce unique run ID generation trong CI config; (2) Concurrency group scope review — đề xuất trước 2026-10-29 |
| **Residual Risk** | Low — nếu uniqueness được enforce đúng; nhưng lock không thay thế ownership check |
| **Status** | OPEN — design proposal trong U3; CI config chưa được xác nhận |

---

### RISK-04 — Missing Evidence / Partial Evidence Gap (U1, U5, U7)

| Field | Value |
|---|---|
| **Risk ID** | RISK-04 |
| **Cause** | (a) CI artifact upload chỉ khi job success (CI-54); (b) E08 model usage missing; (c) C3 (U1) usage UNKNOWN |
| **Event** | Fail case không có trace artifact; cost total không tính được; quality score không đầy đủ |
| **Impact** | Không thể audit assertion failure; cost report misleading; metrics bị undercount |
| **Source** | CI-54 (CI-PACKET-05); E08 (METRIC-PACKET-07 usage missing); C3 (BENCH-PACKET-01 usage UNKNOWN); U1 Phần 3 |
| **Flow** | F01 (E08, C3); F02 (CI-54 scenario) |
| **Likelihood** | 3 — E08 và C3 missing đã xảy ra; CI-54 bug đã identify |
| **Impact** | 2 — Không block execution nhưng làm audit và cost analysis thiếu |
| **Control** | `if: always()` artifact upload (U5 design); require model usage logging trước run; reporter completeness check |
| **Detection** | Evidence-completeness check trong run manifest (U5 Phần 5); "evidence: partial/none" flag trong metric |
| **Proposed Owner** | CI config maintainer (artifact upload fix); model/tool owner (usage logging) |
| **Next Action / Date** | (1) Fix artifact upload step: `if: always()` — đề xuất trước 2026-10-22; (2) Yêu cầu model usage log mandatory trước live run |
| **Residual Risk** | Medium — nếu force-cancel, `always()` có thể không đủ; cần durable artifact store |
| **Status** | OPEN — CI-54 fix trong U5 design; E08/C3 chưa có resolution |

---

### RISK-05 — Schedule Gap / Missing Dispatch (U5, U7)

| Field | Value |
|---|---|
| **Risk ID** | RISK-05 |
| **Cause** | Workflow file không trên default branch; runner quota hết; cron event không fire; workflow bị disable |
| **Event** | Scheduled run không xảy ra (SL-04); coverage gap không được detect kịp thời |
| **Impact** | Regression không được phát hiện trong window mong đợi; SLA monitoring miss; silent coverage gap |
| **Source** | SL-04 (METRIC-PACKET-07 — no dispatch); CI-57 (CI-PACKET-05 — workflow only on feature branch); U5 Phần 2 |
| **Flow** | All flows (schedule chạy smoke suite F01/F02/F03) |
| **Likelihood** | 2 — SL-04 đã xảy ra trong cohort; CI-57 pattern là common mistake |
| **Impact** | 2 — Không gây data corruption nhưng làm coverage monitoring unreliable |
| **Control** | Verify workflow file trên default branch trước khi enable schedule; schedule alerting khi không có run trong window |
| **Detection** | Schedule monitoring: nếu không có run sau X phút từ expected time → alert. SL-04 checklist (U5 run-review). |
| **Proposed Owner** | Workflow maintainer |
| **Next Action / Date** | (1) SL-04 investigation theo checklist U5 — đề xuất trước 2026-10-20; (2) Setup schedule-miss alert |
| **Residual Risk** | Medium — cause SL-04 còn unknown; chưa biết nguyên nhân để fix |
| **Status** | OPEN — SL-04 uninvestigated; cause unknown |

---

### RISK-06 — Cleanup Failure / Unresolved Owned Record (U7, E04)

| Field | Value |
|---|---|
| **Risk ID** | RISK-06 |
| **Cause** | E04 cleanup failed sau khi test failed; owned record `E2E-AOCE-r_D72-a_-F01` vẫn tồn tại trong environment |
| **Event** | Record unresolved → tiếp tục tồn tại; tiếp theo run có thể thấy orphaned record và fail preflight; hoặc record pollute search results |
| **Impact** | (a) Preflight block run tiếp theo; (b) Search assertion của run mới có thể match orphaned record → false positive; (c) Data integrity violation |
| **Source** | E04 (METRIC-PACKET-07 cleanup: failed); LAB-AOCE-05; CI-55 (CI-PACKET-05 force-cancel scenario); U5 Phần 3 CI-55 |
| **Flow** | F01 (E04) |
| **Likelihood** | 2 — E04 cleanup failure đã observed trong cohort |
| **Impact** | 3 — Unresolved owned record vi phạm policy; có thể pollute future runs |
| **Control** | `lab:reconcile` post-run (U5); preflight check unresolved records trước run mới; escalate nếu không cleanup được |
| **Detection** | `lab:reconcile` exit non-zero + list unresolved records; preflight block nếu ledger có unresolved |
| **Proposed Owner** | Run maintainer (E04 owner) + trainer (nếu escalate) |
| **Next Action / Date** | (1) Chạy `lab:reconcile` cho E04; xác định owned record ID và cleanup — đề xuất trước 2026-10-20; (2) Block future runs cho đến khi resolved |
| **Residual Risk** | High until resolved — E04 unresolved record là immediate action item |
| **Status** | OPEN — unresolved record chưa được cleanup |

---

### RISK-07 — Usage Blind Spot / Cost Undercount (U1, U7)

| Field | Value |
|---|---|
| **Risk ID** | RISK-07 |
| **Cause** | E08 model usage missing; C3 (U1) usage UNKNOWN; không có model/provider price thực tế |
| **Event** | Tổng cost của cohort thấp hơn actual; budget forecast dựa trên incomplete data; cost-per-accepted output không đại diện config C đầy đủ |
| **Impact** | Budget violation không được detect; cost decision (pilot/scale) dựa trên lower bound không phải actual |
| **Source** | E08 (METRIC-PACKET-07 usage missing); C3 (BENCH-PACKET-01 UNKNOWN); U1 Phần 3; RATE-SYN-01 |
| **Flow** | F02 (E08), F01 benchmark (C3) |
| **Likelihood** | 2 — E08 và C3 missing đã xảy ra; sẽ tái diễn nếu usage logging không mandatory |
| **Impact** | 2 — Không crash execution nhưng làm financial/capacity planning unreliable |
| **Control** | Mandatory model usage logging trước live run; rate card version phải được ghi kèm cost report |
| **Detection** | "usage: missing" flag trong metric; cost report với tổng "lower bound" notation; evidence-completeness check |
| **Proposed Owner** | Model/tool owner (logging); QA (cost report review) |
| **Next Action / Date** | (1) Require model usage log mandatory — implement trước next cohort run; (2) Lock rate card version khi collect actual cost |
| **Residual Risk** | Medium — nếu provider thay rate, past measurements sẽ không so sánh được; cần version anchor |
| **Status** | OPEN — E08 và C3 missing chưa được resolved |

---

### RISK-08 — Environment Exception Misclassified as App Failure (U6, INC-64)

| Field | Value |
|---|---|
| **Risk ID** | RISK-08 |
| **Cause** | Browser startup permission exception trên CI runner; wrapper đề xuất classify là "app flaky" và retry 10 lần |
| **Event** | (a) Retry 10 lần mà không fix được vì là env issue; (b) Nếu một retry start được browser rồi fail trong write step → orphaned owned record |
| **Impact** | Budget wasted (10 retries vi phạm policy); potential orphaned records; root cause không được investigate; confuse "app flaky" với env failure trong metrics |
| **Source** | INC-64 (INCIDENT-PACKET-06); CI-RUN-C (CI-PACKET-05 browser startup failure); POLICY-PACKET-AOCE max 1 retry |
| **Flow** | F01, F02, F03 (CI smoke suite) |
| **Likelihood** | 2 — INC-64 đã observed; CI-RUN-C là packet evidence |
| **Impact** | 2 — Không trực tiếp corrupt data nhưng wastes budget và masks real root cause |
| **Control** | Phân biệt environment exception vs. app assertion failure trong reporter; `lab:preflight` browser readiness check; không retry env failure |
| **Detection** | Exception trước test body → classify BLOCKED/environment; không dùng "app flaky" label khi exception ngoài test scope |
| **Proposed Owner** | CI config maintainer + trainer (runner fix) |
| **Next Action / Date** | (1) Fix runner environment (Playwright install, sandbox flags) — trainer action trước live run; (2) Add `lab:preflight` browser readiness step |
| **Residual Risk** | Low after env fix; medium nếu chưa fix và retry policy không được enforce |
| **Status** | OPEN — environment fix pending (trainer) |

---

## Summary Table

| Risk ID | Title | Likelihood | Impact | Status | Priority |
|---|---|---|---|---|---|
| RISK-01 | False pass / prompt drift | 3 | 3 | OPEN | 🔴 High |
| RISK-02 | Unknown write / duplicate write | 2 | 3 | OPEN | 🔴 High |
| RISK-03 | Shared data / namespace collision | 2 | 3 | OPEN | 🔴 High |
| RISK-04 | Missing evidence / partial evidence | 3 | 2 | OPEN | 🟡 Medium |
| RISK-05 | Schedule gap / missing dispatch | 2 | 2 | OPEN | 🟡 Medium |
| RISK-06 | Cleanup failure / unresolved record (E04) | 2 | 3 | OPEN — **immediate** | 🔴 High |
| RISK-07 | Usage blind spot / cost undercount | 2 | 2 | OPEN | 🟡 Medium |
| RISK-08 | Environment exception misclassified | 2 | 2 | OPEN | 🟡 Medium |

> **8 risks tổng cộng** — vượt yêu cầu tối thiểu ≥6. Tất cả OPEN (DRY-RUN; không có live resolution).
